export type StockCard = {
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  sparkline: number[];
  whySummary: string;
  sources: { label: string; url: string }[];
  updatedSecondsAgo: number;
  isQuiet: boolean;
};

function genSparkline(base: number, pct: number, points = 30): number[] {
  const result: number[] = [];
  let val = base - (base * pct) / 100;
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.48) * base * 0.008;
    val = val + noise + (base * pct) / 100 / points;
    result.push(parseFloat(val.toFixed(2)));
  }
  return result;
}

export const mockStocks: StockCard[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp",
    price: 487.21,
    changePct: 3.42,
    sparkline: genSparkline(487.21, 3.42),
    whySummary:
      "Up 3.4% after Morgan Stanley raised its price target to $750 citing accelerating data-center demand. Blackwell GPU allocation reportedly sold out through Q3.",
    sources: [
      { label: "Morgan Stanley", url: "https://www.morganstanley.com" },
      { label: "Reuters", url: "https://www.reuters.com" },
    ],
    updatedSecondsAgo: 14,
    isQuiet: false,
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc",
    price: 248.93,
    changePct: -4.17,
    sparkline: genSparkline(248.93, -4.17),
    whySummary:
      "Down 4.2% after Q1 deliveries missed consensus estimates by ~6%, with 386K units vs. 408K expected. CEO Musk's continued political involvement cited as brand headwind.",
    sources: [
      { label: "Tesla IR", url: "https://ir.tesla.com" },
      { label: "Bloomberg", url: "https://www.bloomberg.com" },
      { label: "r/wallstreetbets", url: "https://www.reddit.com/r/wallstreetbets" },
    ],
    updatedSecondsAgo: 22,
    isQuiet: false,
  },
  {
    ticker: "COIN",
    name: "Coinbase Global",
    price: 218.45,
    changePct: 7.83,
    sparkline: genSparkline(218.45, 7.83),
    whySummary:
      "Surging 7.8% as Bitcoin broke above $72K, driving crypto exchange volume to highest levels since November 2021. Options traders positioning heavily bullish.",
    sources: [
      { label: "CoinDesk", url: "https://www.coindesk.com" },
      { label: "SEC 8-K", url: "https://www.sec.gov" },
    ],
    updatedSecondsAgo: 8,
    isQuiet: false,
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies",
    price: 24.87,
    changePct: 5.21,
    sparkline: genSparkline(24.87, 5.21),
    whySummary:
      "Up 5.2% on a new $480M US Army contract for AI-powered battlefield intelligence software. Analysts upgraded the stock citing strong government pipeline.",
    sources: [
      { label: "DoD Press Release", url: "https://www.defense.gov" },
      { label: "Barron's", url: "https://www.barrons.com" },
    ],
    updatedSecondsAgo: 31,
    isQuiet: false,
  },
  {
    ticker: "GME",
    name: "GameStop Corp",
    price: 14.22,
    changePct: 12.44,
    sparkline: genSparkline(14.22, 12.44),
    whySummary:
      "Spiking 12.4% after Keith Gill (Roaring Kitty) posted a new cryptic image on X, reigniting meme-stock activity. No fundamental catalyst; driven entirely by retail momentum.",
    sources: [
      { label: "r/Superstonk", url: "https://www.reddit.com/r/Superstonk" },
      { label: "X / Roaring Kitty", url: "https://x.com" },
    ],
    updatedSecondsAgo: 5,
    isQuiet: false,
  },
  {
    ticker: "SMCI",
    name: "Super Micro Computer",
    price: 876.33,
    changePct: -6.02,
    sparkline: genSparkline(876.33, -6.02),
    whySummary:
      "Down 6% after the company delayed filing its 10-K with the SEC for the second consecutive quarter, stoking accounting-irregularity fears among institutional holders.",
    sources: [
      { label: "SEC Filing", url: "https://www.sec.gov" },
      { label: "WSJ", url: "https://www.wsj.com" },
    ],
    updatedSecondsAgo: 18,
    isQuiet: false,
  },
  {
    ticker: "RIVN",
    name: "Rivian Automotive",
    price: 11.84,
    changePct: 4.68,
    sparkline: genSparkline(11.84, 4.68),
    whySummary:
      "Up 4.7% after Volkswagen Group confirmed it will invest an additional $1.5B in the Rivian joint venture, signaling confidence in the EV maker's software stack.",
    sources: [
      { label: "Rivian IR", url: "https://rivian.com/investors" },
      { label: "Reuters", url: "https://www.reuters.com" },
    ],
    updatedSecondsAgo: 41,
    isQuiet: false,
  },
  {
    ticker: "AAPL",
    name: "Apple Inc",
    price: 189.42,
    changePct: 0.31,
    sparkline: genSparkline(189.42, 0.31),
    whySummary: "",
    sources: [],
    updatedSecondsAgo: 60,
    isQuiet: true,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp",
    price: 412.17,
    changePct: 1.14,
    sparkline: genSparkline(412.17, 1.14),
    whySummary:
      "Up 1.1% as Azure cloud revenue run-rate estimates ticked higher following positive channel checks from three sell-side firms ahead of next week's earnings.",
    sources: [
      { label: "Jefferies Note", url: "https://www.jefferies.com" },
    ],
    updatedSecondsAgo: 25,
    isQuiet: false,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc",
    price: 171.88,
    changePct: -1.22,
    sparkline: genSparkline(171.88, -1.22),
    whySummary:
      "Sliding 1.2% after DOJ prosecutors argued in closing statements that Google must be broken up, separating Chrome and Android from its search business.",
    sources: [
      { label: "DOJ vs. Google", url: "https://www.justice.gov" },
      { label: "NYT", url: "https://www.nytimes.com" },
    ],
    updatedSecondsAgo: 37,
    isQuiet: false,
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc",
    price: 192.61,
    changePct: 2.07,
    sparkline: genSparkline(192.61, 2.07),
    whySummary:
      "Up 2.1% as AWS reaccelerated to 19% YoY growth in preliminary checks, and analysts raised price targets ahead of the Q1 earnings release next Thursday.",
    sources: [
      { label: "Piper Sandler", url: "https://www.pipersandler.com" },
      { label: "CNBC", url: "https://www.cnbc.com" },
    ],
    updatedSecondsAgo: 12,
    isQuiet: false,
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    price: 514.29,
    changePct: 1.89,
    sparkline: genSparkline(514.29, 1.89),
    whySummary:
      "Gaining 1.9% after Threads surpassed 175M daily active users and ad revenue from Reels was reported to be on pace to exceed $10B annualized.",
    sources: [
      { label: "Meta Newsroom", url: "https://about.fb.com" },
      { label: "The Information", url: "https://www.theinformation.com" },
    ],
    updatedSecondsAgo: 19,
    isQuiet: false,
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    price: 162.44,
    changePct: 2.88,
    sparkline: genSparkline(162.44, 2.88),
    whySummary:
      "Rising 2.9% as NVIDIA's supply constraints push hyperscalers toward MI300X GPUs. Microsoft confirmed AMD chips will power a new Azure AI cluster.",
    sources: [
      { label: "AMD Press Release", url: "https://www.amd.com" },
      { label: "Bloomberg", url: "https://www.bloomberg.com" },
    ],
    updatedSecondsAgo: 44,
    isQuiet: false,
  },
  {
    ticker: "NFLX",
    name: "Netflix Inc",
    price: 628.71,
    changePct: 0.52,
    sparkline: genSparkline(628.71, 0.52),
    whySummary: "",
    sources: [],
    updatedSecondsAgo: 88,
    isQuiet: true,
  },
  {
    ticker: "AVGO",
    name: "Broadcom Inc",
    price: 1411.55,
    changePct: 1.63,
    sparkline: genSparkline(1411.55, 1.63),
    whySummary:
      "Up 1.6% as custom AI chip (XPU) demand from Google and Meta continues to ramp, with Broadcom guiding for AI revenue to reach $11B in FY2024.",
    sources: [
      { label: "Broadcom IR", url: "https://investors.broadcom.com" },
      { label: "Reuters", url: "https://www.reuters.com" },
    ],
    updatedSecondsAgo: 53,
    isQuiet: false,
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    price: 198.83,
    changePct: -0.44,
    sparkline: genSparkline(198.83, -0.44),
    whySummary: "",
    sources: [],
    updatedSecondsAgo: 70,
    isQuiet: true,
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hathaway B",
    price: 413.27,
    changePct: 0.28,
    sparkline: genSparkline(413.27, 0.28),
    whySummary: "",
    sources: [],
    updatedSecondsAgo: 120,
    isQuiet: true,
  },
  {
    ticker: "V",
    name: "Visa Inc",
    price: 278.14,
    changePct: 0.91,
    sparkline: genSparkline(278.14, 0.91),
    whySummary:
      "Nudging up 0.9% after cross-border payment volume data for March came in above expectations, with international travel spending 14% above pre-pandemic levels.",
    sources: [
      { label: "Visa IR", url: "https://investor.visa.com" },
    ],
    updatedSecondsAgo: 33,
    isQuiet: false,
  },
  {
    ticker: "WMT",
    name: "Walmart Inc",
    price: 66.88,
    changePct: -0.62,
    sparkline: genSparkline(66.88, -0.62),
    whySummary: "",
    sources: [],
    updatedSecondsAgo: 95,
    isQuiet: true,
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil Corp",
    price: 117.42,
    changePct: 1.31,
    sparkline: genSparkline(117.42, 1.31),
    whySummary:
      "Up 1.3% as crude oil climbed above $89/barrel on OPEC+ output cut reaffirmation and fresh Middle East supply-risk premium after Houthi attacks disrupted Red Sea shipping.",
    sources: [
      { label: "Reuters Energy", url: "https://www.reuters.com" },
      { label: "EIA Data", url: "https://www.eia.gov" },
    ],
    updatedSecondsAgo: 28,
    isQuiet: false,
  },
];
