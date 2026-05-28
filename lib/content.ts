export type Status = "Released" | "Draft" | "Scheduled" | "Archived";

export type AssetClass =
  | "Macro"
  | "Digital Assets"
  | "Equities"
  | "Private Markets"
  | "Fixed Income"
  | "Commodities";

export type Confidence =
  | "High Conviction"
  | "Constructive"
  | "Balanced"
  | "Cautious";

export type ChartKind =
  | "line"
  | "yield"
  | "allocation"
  | "risk"
  | "distribution"
  | "bands";

export interface Author {
  id: string;
  name: string;
  role: string;
  desk: string;
  initials: string;
  bio: string;
}

export interface BodySection {
  heading: string;
  paragraphs: string[];
  pullQuote?: string;
}

export interface Figure {
  label: string;
  caption: string;
  kind: ChartKind;
}

export interface Report {
  slug: string;
  code: string;
  title: string;
  summary: string;
  assetClass: AssetClass;
  category: string;
  date: string;
  readingMinutes: number;
  authorId: string;
  confidence: Confidence;
  status: Status;
  featured?: boolean;
  visibility: "Public" | "Private";
  chart: ChartKind;
  tags: string[];
  views: number;
  executiveSummary: string[];
  keyTakeaways: string[];
  body: BodySection[];
  figures: Figure[];
  riskDisclosure: string;
}

export const assetClasses: AssetClass[] = [
  "Macro",
  "Digital Assets",
  "Equities",
  "Private Markets",
  "Fixed Income",
  "Commodities",
];

export const authors: Author[] = [
  {
    id: "vergura",
    name: "Adrian Vergura",
    role: "Chief Investment Strategist",
    desk: "Macro Strategy Desk",
    initials: "AV",
    bio: "Adrian leads Vergura's macro framework, translating monetary regime shifts into cross-asset positioning. Two decades across rates, FX, and global allocation.",
  },
  {
    id: "roth",
    name: "Helena Roth",
    role: "Head of Digital Assets",
    desk: "Digital Assets Desk",
    initials: "HR",
    bio: "Helena covers the structural and cyclical drivers of digital asset markets, with a focus on liquidity, market structure, and volatility regimes.",
  },
  {
    id: "feld",
    name: "Marcus Feld",
    role: "Director, Public Markets",
    desk: "Public Markets Desk",
    initials: "MF",
    bio: "Marcus researches platform economics, capital intensity, and the equity implications of compute and energy infrastructure.",
  },
  {
    id: "lindqvist",
    name: "Sofia Lindqvist",
    role: "Head of Private Markets",
    desk: "Private Markets Desk",
    initials: "SL",
    bio: "Sofia studies private credit, secondaries, and the slow transmission of public-market stress into private valuations.",
  },
  {
    id: "brandt",
    name: "Jonas Brandt",
    role: "Senior Macro Analyst",
    desk: "Macro Strategy Desk",
    initials: "JB",
    bio: "Jonas focuses on fiscal dynamics, term premium, and the long-duration consequences of sovereign balance-sheet expansion.",
  },
];

export function authorById(id: string): Author {
  return authors.find((a) => a.id === id) ?? authors[0];
}

export const reports: Report[] = [
  {
    slug: "liquidity-rotation-repricing-of-risk",
    code: "VR-2605",
    title: "Liquidity Rotation and the Repricing of Risk",
    summary:
      "As the marginal supply of liquidity rotates from public balance sheets to private intermediaries, the market is mispricing the second-order effects on risk premia.",
    assetClass: "Macro",
    category: "Quarterly Outlook",
    date: "2026-05-18",
    readingMinutes: 14,
    authorId: "vergura",
    confidence: "High Conviction",
    status: "Released",
    featured: true,
    visibility: "Public",
    chart: "line",
    tags: ["Liquidity", "Risk Premia", "Cross-Asset", "Positioning"],
    views: 4821,
    executiveSummary: [
      "The dominant liquidity impulse of the last cycle was public: central-bank balance sheets set the price of duration and, by extension, the discount rate on every risk asset. That impulse is now fading at the margin, and a private one is taking its place.",
      "We argue the rotation is not merely a change in who supplies liquidity, but in how it is priced. Private intermediation reintroduces credit discrimination, term structure, and counterparty discipline that a decade of administered rates suppressed.",
      "For allocators, the implication is a widening dispersion in cross-asset risk premia. The beta trade is over; the relative-value trade is beginning.",
    ],
    keyTakeaways: [
      "The marginal liquidity provider is shifting from central banks to private credit and dealer balance sheets.",
      "Compressed risk premia are unlikely to persist as intermediation reprices term and credit.",
      "Dispersion, not direction, is the dominant opportunity set for the next four quarters.",
      "We favour quality duration, senior private credit, and convex equity hedges over broad beta.",
    ],
    body: [
      {
        heading: "The end of the administered discount rate",
        paragraphs: [
          "For most of the prior cycle, the discount rate applied to risk assets was not discovered by markets so much as it was administered. Large-scale asset purchases and forward guidance held the term premium near zero and, in several episodes, below it. The consequence was a market in which the cost of duration was set exogenously and risk premia compressed mechanically toward that anchor.",
          "That regime is ending — not abruptly, but at the margin, where prices are actually set. As balance-sheet normalisation proceeds and fiscal issuance crowds the long end, the marginal buyer of duration is increasingly a price-sensitive private actor rather than a price-insensitive public one. The discount rate is being rediscovered.",
        ],
        pullQuote:
          "The beta trade rewarded exposure. The regime now forming rewards discrimination.",
      },
      {
        heading: "Who supplies the marginal dollar",
        paragraphs: [
          "Liquidity is best understood not as a stock but as a flow at the margin. The relevant question is never how much liquidity exists, but who supplies the next unit and on what terms. When that supplier is a central bank, terms are uniform and credit-blind. When it is a private intermediary, terms carry a spread for credit, term, and counterparty risk.",
          "This is the substance of the rotation. As private credit, dealer balance sheets, and non-bank intermediaries become the marginal supplier, the price of liquidity reacquires a structure it lost. Spreads that were administered toward zero begin to reflect underwriting again.",
        ],
      },
      {
        heading: "Positioning for dispersion",
        paragraphs: [
          "If our framework is correct, the next four quarters will be defined less by the direction of the index and more by the dispersion beneath it. We would rather own the curve than the level, the senior tranche than the broad spread, and convexity than carry.",
          "Concretely, we favour quality duration as a hedge against growth disappointment, senior positions in private credit where underwriting discipline is visible, and convex equity hedges funded by selling richly priced short-dated volatility. The common thread is a preference for instruments whose payoff improves as dispersion widens.",
        ],
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Marginal liquidity supplier, public vs. private share (indexed)",
        kind: "line",
      },
      {
        label: "Fig. 2",
        caption: "Cross-asset risk premia dispersion, rolling 12-month",
        kind: "bands",
      },
    ],
    riskDisclosure:
      "This document is research and intelligence, not investment advice. Positioning views are illustrative of the Vergura framework and do not constitute a recommendation to transact. Forward-looking statements are subject to material revision.",
  },
  {
    slug: "bitcoin-as-a-macro-volatility-instrument",
    code: "VR-2604",
    title: "Bitcoin as a Macro Volatility Instrument",
    summary:
      "Bitcoin is increasingly traded less as a monetary alternative and more as a high-beta expression of global liquidity and real-rate volatility. We reframe the asset accordingly.",
    assetClass: "Digital Assets",
    category: "Asset Thesis",
    date: "2026-05-11",
    readingMinutes: 11,
    authorId: "roth",
    confidence: "Constructive",
    status: "Released",
    featured: true,
    visibility: "Public",
    chart: "bands",
    tags: ["Bitcoin", "Volatility", "Liquidity", "Real Rates"],
    views: 3960,
    executiveSummary: [
      "The monetary-alternative narrative explains bitcoin's existence but not its price behaviour. Empirically, the asset trades as a leveraged claim on global liquidity and the volatility of real rates.",
      "Reframing bitcoin as a macro volatility instrument clarifies both its drawdowns and its convexity, and suggests a more disciplined approach to sizing it within a multi-asset book.",
    ],
    keyTakeaways: [
      "Bitcoin's return correlates more tightly with real-rate volatility than with inflation prints.",
      "Treating the asset as convex liquidity beta improves position sizing and hedging.",
      "Spot-driven market structure has lowered, but not removed, reflexive liquidation risk.",
      "We hold a constructive but volatility-budgeted position rather than a directional one.",
    ],
    body: [
      {
        heading: "What bitcoin actually tracks",
        paragraphs: [
          "The popular framing of bitcoin as digital gold implies a hedge against monetary debasement. Yet across the last several cycles the asset has behaved less like a debasement hedge and more like a high-beta claim on the global liquidity impulse. Its largest drawdowns coincide with real-rate shocks, not inflation surprises.",
          "We take this behaviour at face value. If the market trades bitcoin as convex liquidity beta, then that is what it is, regardless of the founding narrative. The investment question becomes one of sizing convexity, not of defending a monetary thesis.",
        ],
        pullQuote:
          "Price the asset the market actually trades, not the one the whitepaper describes.",
      },
      {
        heading: "Convexity and the cost of being early",
        paragraphs: [
          "Convex assets reward patience and punish leverage. Bitcoin's distribution of outcomes is fat-tailed in both directions, which makes naive volatility-targeting unstable and makes fixed-fraction sizing prone to ruin during liquidation cascades.",
          "Our preference is to budget bitcoin by its contribution to portfolio volatility rather than by notional, and to express upside through structures that cap the cost of being early. The asset earns a place in the book; it does not earn the right to dominate its risk.",
        ],
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Bitcoin drawdowns vs. real-rate volatility regimes",
        kind: "bands",
      },
    ],
    riskDisclosure:
      "Digital assets are subject to extreme volatility and idiosyncratic operational risk. This note is research only and does not constitute a recommendation. Sizing illustrations are framework-based and not advice.",
  },
  {
    slug: "ai-infrastructure-capex-power-platform-control",
    code: "VR-2603",
    title: "AI Infrastructure: Capex, Power, and Platform Control",
    summary:
      "The AI build-out is a capital and energy story before it is a software story. We map where the returns to capex actually accrue — and where they merely pass through.",
    assetClass: "Equities",
    category: "Sector Intelligence",
    date: "2026-05-04",
    readingMinutes: 16,
    authorId: "feld",
    confidence: "Balanced",
    status: "Released",
    featured: false,
    visibility: "Public",
    chart: "distribution",
    tags: ["AI", "Capex", "Power", "Platforms", "Semiconductors"],
    views: 5210,
    executiveSummary: [
      "The market is pricing AI as a software margin story. The binding constraints, however, are physical: capital intensity, power availability, and the control of distribution platforms.",
      "Returns to the build-out will be highly uneven. We separate the layers where pricing power is durable from those where capex is merely a pass-through cost.",
    ],
    keyTakeaways: [
      "Power and grid interconnection are emerging as the true bottleneck, not silicon alone.",
      "Platform control over distribution captures more durable rent than model performance.",
      "Capital intensity compresses returns at the infrastructure layer absent scarcity.",
      "We are balanced: long the bottleneck, selective on the build, cautious on commoditised compute.",
    ],
    body: [
      {
        heading: "A physical problem wearing a software costume",
        paragraphs: [
          "Investor attention fixates on model capability, but the marginal constraint on the AI build-out is increasingly physical. Power generation, grid interconnection, and the multi-year lead times on transmission are doing more to shape the trajectory of deployment than any single architecture.",
          "This reframing matters for where returns accrue. A constraint that is physical and slow to relieve confers scarcity rent on whoever controls it. We would rather own the bottleneck than the build that depends on it.",
        ],
        pullQuote:
          "Scarcity, not capability, decides where the rent accrues.",
      },
      {
        heading: "The layers of the stack",
        paragraphs: [
          "We decompose the build-out into four layers: energy and grid, data-centre real assets, compute and silicon, and the platforms that control distribution. Pricing power is strongest at the ends — scarce power and entrenched distribution — and weakest in the capital-intensive middle, where competition and capex compress returns.",
          "The investable conclusion is not a single trade but a map. Concentrate exposure where scarcity is structural; treat the commoditising middle as a pass-through to be rented, not owned, until valuations reflect its capital intensity.",
        ],
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Return on invested capital by stack layer (illustrative distribution)",
        kind: "distribution",
      },
    ],
    riskDisclosure:
      "Sector views are research and may not reflect current positioning. Estimates of capital intensity and returns are illustrative. Nothing herein is a recommendation to buy or sell any security.",
  },
  {
    slug: "private-credit-stress-beneath-surface-stability",
    code: "VR-2602",
    title: "Private Credit Stress Beneath Surface Stability",
    summary:
      "Marked valuations in private credit remain calm while the underlying cash-flow picture deteriorates. We examine the lag between economic stress and reported stress.",
    assetClass: "Private Markets",
    category: "Strategic Note",
    date: "2026-04-27",
    readingMinutes: 12,
    authorId: "lindqvist",
    confidence: "Cautious",
    status: "Released",
    featured: false,
    visibility: "Public",
    chart: "distribution",
    tags: ["Private Credit", "Valuations", "Default", "Liquidity"],
    views: 3110,
    executiveSummary: [
      "Reported private-credit marks have remained stable even as interest-coverage ratios and free-cash-flow conversion have weakened across the underlying book.",
      "The gap is a function of marking convention and the absence of a forced clearing price, not of underlying resilience. We expect convergence, and we expect it to be one-directional.",
    ],
    keyTakeaways: [
      "Stable marks reflect convention and illiquidity, not necessarily underlying health.",
      "Interest-coverage erosion is the leading indicator that reported metrics lag.",
      "PIK toggles and amend-and-extend defer, but do not resolve, cash-flow stress.",
      "We are cautious and favour seniority, documentation quality, and sponsor discipline.",
    ],
    body: [
      {
        heading: "The comfort of an absent clearing price",
        paragraphs: [
          "Private credit's defining feature is the absence of a continuous clearing price. That absence is often experienced as stability. In a deteriorating environment, however, it is better understood as latency: stress accumulates in cash flows long before it is permitted to appear in marks.",
          "We track the divergence between fundamental indicators — interest coverage, free-cash-flow conversion, covenant headroom — and reported valuations. The two are drifting apart. History suggests the convergence, when it comes, is abrupt and one-directional.",
        ],
        pullQuote:
          "Illiquidity does not remove risk; it defers its recognition.",
      },
      {
        heading: "Where to stand when marks converge",
        paragraphs: [
          "The defensive posture is not to avoid the asset class but to climb the structure within it. Seniority, tight documentation, and disciplined sponsors materially change the distribution of recoveries when stress is finally recognised.",
          "We would rather accept lower headline yield for a position whose recovery is protected than reach for spread in a structure whose comfort is merely a function of how rarely it is priced.",
        ],
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Interest-coverage distribution vs. reported mark stability",
        kind: "distribution",
      },
    ],
    riskDisclosure:
      "Private-market valuations are estimates and may not reflect realisable value. This note is research only. Recovery and default illustrations are framework-based and not advice.",
  },
  {
    slug: "gold-duration-return-of-monetary-hedging",
    code: "VR-2601",
    title: "Gold, Duration, and the Return of Monetary Hedging",
    summary:
      "With fiscal dominance constraining the policy reaction function, gold is reasserting its role as the hedge of last resort against monetary, not merely inflationary, risk.",
    assetClass: "Commodities",
    category: "Asset Thesis",
    date: "2026-04-20",
    readingMinutes: 10,
    authorId: "brandt",
    confidence: "Constructive",
    status: "Released",
    featured: false,
    visibility: "Public",
    chart: "line",
    tags: ["Gold", "Duration", "Monetary Hedge", "Fiscal Dominance"],
    views: 2740,
    executiveSummary: [
      "Gold's relationship with real rates has loosened as official-sector demand and fiscal-dominance concerns reassert a monetary, rather than purely inflationary, bid.",
      "We treat gold as a hedge against the constraint on the policy reaction function — the risk that authorities cannot tighten as much as conditions require.",
    ],
    keyTakeaways: [
      "Official-sector accumulation has structurally raised gold's price floor.",
      "The asset hedges constrained policy, not just realised inflation.",
      "Gold and quality duration are complements, not substitutes, in this regime.",
      "We hold a constructive strategic allocation, sized for regime persistence.",
    ],
    body: [
      {
        heading: "A hedge against constrained policy",
        paragraphs: [
          "The textbook driver of gold is the real rate: as real yields rise, the opportunity cost of holding a zero-coupon asset rises, and gold should fall. That relationship has weakened. The reason, we argue, is that the market is increasingly pricing a different risk — that fiscal dominance will prevent policy from responding as forcefully as conditions warrant.",
          "Gold is, in this framing, a hedge against the constraint itself. When the reaction function is impaired, the asset that benefits is the one with no counterparty and no coupon to be inflated away.",
        ],
        pullQuote:
          "Gold hedges the policy that cannot be delivered, not merely the inflation that is.",
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Gold vs. real rates, regime-conditional sensitivity",
        kind: "line",
      },
    ],
    riskDisclosure:
      "Commodity views are research and subject to revision. Strategic allocation illustrations are framework-based and do not constitute advice.",
  },
  {
    slug: "term-premium-awakening",
    code: "VR-2559",
    title: "The Term Premium Awakening",
    summary:
      "After a decade of suppression, the term premium is re-entering price discovery. We size the consequences for duration, equities, and the cost of fiscal expansion.",
    assetClass: "Fixed Income",
    category: "Strategic Note",
    date: "2026-04-06",
    readingMinutes: 13,
    authorId: "brandt",
    confidence: "High Conviction",
    status: "Released",
    featured: false,
    visibility: "Public",
    chart: "yield",
    tags: ["Term Premium", "Duration", "Curve", "Fiscal"],
    views: 3580,
    executiveSummary: [
      "The term premium — the compensation investors demand for holding duration — was administratively suppressed for a decade. It is now being rediscovered, with consequences across the curve.",
      "A positive and volatile term premium re-rates the cost of fiscal expansion and changes the hedging properties of long bonds.",
    ],
    keyTakeaways: [
      "A reawakening term premium steepens the curve independent of policy expectations.",
      "Long bonds become a less reliable equity hedge as the premium turns volatile.",
      "Fiscal expansion faces a rising and market-set financing cost.",
      "We favour the belly of the curve and barbell duration against convexity.",
    ],
    body: [
      {
        heading: "Compensation, rediscovered",
        paragraphs: [
          "The term premium is the part of long yields not explained by expected future short rates. For much of the prior decade it was negative — investors effectively paid for the privilege of holding duration, a direct artefact of official purchases. As that bid recedes, the premium is being rediscovered, and with it the genuine market cost of borrowing long.",
          "This has consequences beyond the bond market. A positive, volatile term premium changes the correlation between bonds and equities, undermining the reflexive assumption that duration always hedges risk assets.",
        ],
        pullQuote:
          "When the term premium awakens, duration stops being a free hedge.",
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Decomposed yield: expectations vs. term premium",
        kind: "yield",
      },
    ],
    riskDisclosure:
      "Rates research is subject to rapid revision around policy events. This note does not constitute a recommendation to transact in any instrument.",
  },
  {
    slug: "sovereign-balance-sheets-fiscal-dominance",
    code: "VR-2607",
    title: "Sovereign Balance Sheets and the Fiscal Dominance Regime",
    summary:
      "A working framework for the regime in which fiscal needs constrain monetary policy. Scheduled for release alongside our mid-year cross-asset update.",
    assetClass: "Macro",
    category: "Quarterly Outlook",
    date: "2026-06-08",
    readingMinutes: 18,
    authorId: "vergura",
    confidence: "High Conviction",
    status: "Scheduled",
    featured: false,
    visibility: "Public",
    chart: "line",
    tags: ["Fiscal Dominance", "Sovereign", "Regime", "Cross-Asset"],
    views: 0,
    executiveSummary: [
      "Fiscal dominance is the regime in which the level of public debt constrains the central bank's willingness and ability to keep policy restrictive. We formalise the signals that mark its onset.",
    ],
    keyTakeaways: [
      "Fiscal dominance is identified by behaviour, not by debt ratios alone.",
      "The regime caps real rates and structurally supports real assets.",
      "Cross-asset hedging must adapt to an impaired policy reaction function.",
    ],
    body: [
      {
        heading: "Defining the regime",
        paragraphs: [
          "This report is scheduled for release. The framework defines fiscal dominance operationally — through the observed reaction function of policy under fiscal stress — rather than through any single threshold of indebtedness.",
        ],
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Policy reaction function under fiscal stress (schematic)",
        kind: "line",
      },
    ],
    riskDisclosure:
      "Pre-release draft. Content is subject to change prior to publication. Not for distribution.",
  },
  {
    slug: "energy-transition-capex-supercycle",
    code: "VR-2608",
    title: "Energy Transition Capex and the Commodity Supercycle Debate",
    summary:
      "Draft framework assessing whether transition capital expenditure is sufficient to sustain a multi-year commodity supercycle, or merely a series of cyclical squeezes.",
    assetClass: "Commodities",
    category: "Sector Intelligence",
    date: "2026-05-25",
    readingMinutes: 15,
    authorId: "feld",
    confidence: "Balanced",
    status: "Draft",
    featured: false,
    visibility: "Private",
    chart: "bands",
    tags: ["Energy", "Transition", "Commodities", "Capex", "Supercycle"],
    views: 0,
    executiveSummary: [
      "Internal working draft. Assesses whether structural transition demand and chronic under-investment in supply combine into a genuine supercycle or a sequence of squeezes.",
    ],
    keyTakeaways: [
      "Supply discipline may matter more than demand for the supercycle thesis.",
      "Permitting and capital allocation are the binding constraints on new supply.",
      "We distinguish structural demand from cyclical restocking.",
    ],
    body: [
      {
        heading: "Working notes",
        paragraphs: [
          "This is an internal draft maintained on the Vergura research desk. The completed thesis will separate the structural transition-demand argument from the supply-discipline argument, which we believe is doing more of the work.",
        ],
      },
    ],
    figures: [
      {
        label: "Fig. 1",
        caption: "Supply growth vs. transition demand scenarios",
        kind: "bands",
      },
    ],
    riskDisclosure:
      "Internal draft. Not for external distribution. Content incomplete and subject to substantial revision.",
  },
];

export function publishedReports(): Report[] {
  return reports
    .filter((r) => r.status === "Released")
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function featuredReport(): Report {
  return reports.find((r) => r.featured) ?? publishedReports()[0];
}

export function reportBySlug(slug: string): Report | undefined {
  return reports.find((r) => r.slug === slug);
}

export function relatedReports(report: Report, limit = 3): Report[] {
  return publishedReports()
    .filter((r) => r.slug !== report.slug)
    .sort((a, b) => {
      const aScore = a.assetClass === report.assetClass ? 0 : 1;
      const bScore = b.assetClass === report.assetClass ? 0 : 1;
      return aScore - bScore;
    })
    .slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
