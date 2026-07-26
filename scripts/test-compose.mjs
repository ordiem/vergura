#!/usr/bin/env node --experimental-strip-types --no-warnings
/*
 * Sanity checks for the control layer: locked presets, budget-relevant
 * estimation, and defensive result parsing.
 *
 *   npm test
 *
 * Deliberately dependency-free — no test runner, no DB, no network.
 */
import assert from "node:assert/strict";
import { compose, estimateCredits, ComposeError } from "../lib/domain/compose.ts";
import { extractUrls } from "../lib/kie/parse.ts";

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
};

const preset = {
  id: "p1",
  name: "Brand A",
  description: "",
  kind: "image",
  model: "bytedance/seedream-v4-text-to-image",
  locked_prefix: "Studio product photograph,",
  locked_suffix: "shot on 85mm, no text overlays.",
  negative_prompt: "watermarks, logos",
  locked_params: { image_resolution: "2K", image_size: "square_hd" },
  editable_params: ["max_images"],
  archived: false,
  created_at: "",
};

console.log("\ncompose — brand locking");

test("locked prefix and suffix bracket the operator prompt", () => {
  const r = compose({
    preset,
    modelSlug: "",
    operatorPrompt: "a navy ceramic mug",
    operatorParams: {},
  });
  assert.equal(
    r.resolvedPrompt,
    "Studio product photograph, a navy ceramic mug shot on 85mm, no text overlays. Avoid: watermarks, logos"
  );
});

test("operator cannot override a locked param", () => {
  const r = compose({
    preset,
    modelSlug: "",
    operatorPrompt: "a mug",
    operatorParams: { image_resolution: "4K", max_images: "3" },
  });
  assert.equal(r.input.image_resolution, "2K", "locked value must win");
  assert.equal(r.input.max_images, 3, "whitelisted param must pass through, coerced to number");
});

test("non-whitelisted params are rejected and reported", () => {
  const r = compose({
    preset,
    modelSlug: "",
    operatorPrompt: "a mug",
    operatorParams: { seed: "42" },
  });
  assert.equal(r.input.seed, undefined);
  assert.deepEqual(r.rejectedKeys, ["seed"]);
});

test("operator cannot switch models away from the preset", () => {
  const r = compose({
    preset,
    modelSlug: "nano-banana-2",
    operatorPrompt: "a mug",
    operatorParams: {},
  });
  assert.equal(r.model.slug, "bytedance/seedream-v4-text-to-image");
});

test("without a preset every declared field is operator-controlled", () => {
  const r = compose({
    preset: null,
    modelSlug: "bytedance/seedream-v4-text-to-image",
    operatorPrompt: "a mug",
    operatorParams: { image_resolution: "4K", seed: "7" },
  });
  assert.equal(r.input.image_resolution, "4K");
  assert.equal(r.input.seed, 7);
  assert.deepEqual(r.rejectedKeys, []);
});

console.log("\ncompose — product reference images");

const REF_A = "https://cdn.example.com/product-a.jpg";
const REF_B = "https://cdn.example.com/product-b.jpg";

test("product images land on the model's reference field", () => {
  const r = compose({
    preset: null,
    modelSlug: "nano-banana-2",
    operatorPrompt: "the product on a stone plinth",
    operatorParams: {},
    referenceImages: [REF_A, REF_B],
  });
  assert.deepEqual(r.input.image_input, [REF_A, REF_B]);
});

test("reference images survive a preset that whitelists nothing", () => {
  // The whole point: product identity is not an operator preference, so the
  // editable_params gate must not be able to strip it.
  const r = compose({
    preset: { ...preset, model: "nano-banana-2", locked_params: {}, editable_params: [] },
    modelSlug: "",
    operatorPrompt: "the product on a stone plinth",
    operatorParams: { seed: "9" },
    referenceImages: [REF_A],
  });
  assert.deepEqual(r.input.image_input, [REF_A]);
  assert.deepEqual(r.rejectedKeys, ["seed"]);
});

test("a locked reference list still outranks the product's own images", () => {
  const r = compose({
    preset: {
      ...preset,
      model: "nano-banana-2",
      locked_params: { image_input: ["https://cdn.example.com/locked.jpg"] },
      editable_params: [],
    },
    modelSlug: "",
    operatorPrompt: "the product on a stone plinth",
    operatorParams: {},
    referenceImages: [REF_A],
  });
  assert.deepEqual(r.input.image_input, ["https://cdn.example.com/locked.jpg"]);
});

test("duplicates and non-http entries are dropped", () => {
  const r = compose({
    preset: null,
    modelSlug: "nano-banana-2",
    operatorPrompt: "the product on a stone plinth",
    operatorParams: {},
    referenceImages: [REF_A, REF_A, "not-a-url", ""],
  });
  assert.deepEqual(r.input.image_input, [REF_A]);
});

test("a text-only model refuses product images instead of inventing one", () => {
  assert.throws(
    () =>
      compose({
        preset: null,
        modelSlug: "bytedance/seedream-v4-text-to-image",
        operatorPrompt: "the product on a stone plinth",
        operatorParams: {},
        referenceImages: [REF_A],
      }),
    ComposeError
  );
});

test("no product images is not an error", () => {
  const r = compose({
    preset: null,
    modelSlug: "nano-banana-2",
    operatorPrompt: "an empty stone plinth",
    operatorParams: {},
    referenceImages: [],
  });
  assert.equal(r.input.image_input, undefined);
});

console.log("\ncompose — validation");

test("empty prompt is rejected", () => {
  assert.throws(
    () =>
      compose({
        preset: null,
        modelSlug: "bytedance/seedream-v4-text-to-image",
        operatorPrompt: "   ",
        operatorParams: {},
      }),
    ComposeError
  );
});

test("out-of-range value is rejected", () => {
  assert.throws(
    () =>
      compose({
        preset: null,
        modelSlug: "bytedance/seedream-v4-text-to-image",
        operatorPrompt: "a mug",
        operatorParams: { max_images: "99" },
      }),
    /Variations must be ≤ 6/
  );
});

test("invalid select value is rejected", () => {
  assert.throws(
    () =>
      compose({
        preset: null,
        modelSlug: "nano-banana-2",
        operatorPrompt: "a mug",
        operatorParams: { aspect_ratio: "7:3" },
      }),
    /Aspect must be one of/
  );
});

test("unknown model is rejected", () => {
  assert.throws(
    () => compose({ preset: null, modelSlug: "nope", operatorPrompt: "x", operatorParams: {} }),
    /Unknown model/
  );
});

console.log("\nestimateCredits — budget pre-check");

test("scales with variations and resolution", () => {
  const model = { estCredits: 1 };
  assert.equal(estimateCredits(model, { max_images: 3, image_resolution: "1K" }), 3);
  assert.equal(estimateCredits(model, { max_images: 2, image_resolution: "4K" }), 8);
  assert.equal(estimateCredits(model, {}), 1);
});

console.log("\nextractUrls — undocumented resultJson shapes");

test("parses {resultUrls:[...]} as a JSON string", () => {
  assert.deepEqual(extractUrls('{"resultUrls":["https://a/1.png","https://a/2.png"]}'), [
    "https://a/1.png",
    "https://a/2.png",
  ]);
});

test("parses a bare JSON array string", () => {
  assert.deepEqual(extractUrls('["https://a/1.png"]'), ["https://a/1.png"]);
});

test("parses nested objects with url keys", () => {
  assert.deepEqual(extractUrls({ resultObject: [{ url: "https://a/1.png" }] }), [
    "https://a/1.png",
  ]);
});

test("parses a doubly-encoded inner JSON string", () => {
  assert.deepEqual(extractUrls({ resultJson: '{"resultUrls":["https://a/1.png"]}' }), [
    "https://a/1.png",
  ]);
});

test("accepts a bare url string", () => {
  assert.deepEqual(extractUrls("https://a/1.png"), ["https://a/1.png"]);
});

test("de-duplicates repeats", () => {
  assert.deepEqual(extractUrls('["https://a/1.png","https://a/1.png"]'), ["https://a/1.png"]);
});

test("returns empty for junk rather than throwing", () => {
  assert.deepEqual(extractUrls(""), []);
  assert.deepEqual(extractUrls("not json"), []);
  assert.deepEqual(extractUrls(null), []);
});

console.log(`\n${passed} passed${process.exitCode ? " — WITH FAILURES" : ""}\n`);
