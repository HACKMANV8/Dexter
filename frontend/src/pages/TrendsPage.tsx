import Header from "@/components/Header";
import { TrendingUp, Newspaper, BarChart3, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface TrendStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trendScore: number;
  newsCount: number;
  analysis: string;
  chartData: number[];
}

const trendingStocks: TrendStock[] = [
  {
    symbol: "ADANIENT",
    name: "Adani Enterprises",
    price: 2789.45,
    change: 156.23,
    changePercent: 5.94,
    trendScore: 94,
    newsCount: 28,
    analysis: "Strong upward momentum with positive news sentiment. Institutional buying detected.",
    chartData: [2500, 2520, 2580, 2650, 2700, 2750, 2789],
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance",
    price: 6543.20,
    change: 234.10,
    changePercent: 3.71,
    trendScore: 89,
    newsCount: 15,
    analysis: "Quarterly results exceeded expectations. Analyst upgrades driving momentum.",
    chartData: [6200, 6250, 6300, 6400, 6450, 6500, 6543],
  },
  {
    symbol: "TECHM",
    name: "Tech Mahindra",
    price: 1234.75,
    change: 89.50,
    changePercent: 7.82,
    trendScore: 87,
    analysis: "Major contract wins announced. Strong technical breakout patterns observed.",
    newsCount: 22,
    chartData: [1100, 1120, 1150, 1180, 1200, 1220, 1235],
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    price: 11543.90,
    change: 445.30,
    changePercent: 4.01,
    trendScore: 85,
    newsCount: 19,
    analysis: "Record sales numbers. Expansion plans announced for electric vehicles.",
    chartData: [11000, 11100, 11200, 11300, 11400, 11500, 11544],
  },
  {
    symbol: "LTIM",
    name: "LTIMindtree",
    price: 5234.60,
    change: 312.45,
    changePercent: 6.35,
    trendScore: 83,
    newsCount: 17,
    analysis: "AI and cloud computing deals showing strong pipeline growth.",
    chartData: [4800, 4900, 5000, 5100, 5150, 5200, 5235],
  },
];

export default function TrendsPage() {
  return (
    <div className="min-h-screen animate-fade-in">
      <Header />

      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-block p-4 rounded-2xl glass glow-green">
            <Sparkles className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Tips & Trends</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-curated investment opportunities based on real-time market trends, news sentiment, and technical analysis
          </p>
        </div>

        {/* Trend Strength Indicator */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-secondary" />
              <div>
                <h3 className="font-bold">Market Trend Strength</h3>
                <p className="text-sm text-muted-foreground">Overall bullish momentum detected</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-secondary">Strong</p>
                <p className="text-xs text-muted-foreground">86% Confidence</p>
              </div>
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Stocks */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-secondary" />
            Hot Investment Opportunities
          </h2>

          <div className="space-y-4">
            {trendingStocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 hover:glow-green cursor-pointer border-l-4 border-secondary"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stock Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold">{stock.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>

                    <div>
                      <p className="text-3xl font-bold">₹{stock.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-secondary font-bold text-lg">
                          +{stock.change.toFixed(2)}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
                          +{stock.changePercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Newspaper className="w-4 h-4" />
                      <span>{stock.newsCount} news articles today</span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={stock.chartData.map((value, i) => ({ value, index: i }))}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Trend Score</span>
                        <span className="text-2xl font-bold text-secondary">{stock.trendScore}</span>
                      </div>
                      <div className="h-3 bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-secondary/50 transition-all duration-500"
                          style={{ width: `${stock.trendScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4 bg-secondary/5">
                      <p className="text-sm leading-relaxed">{stock.analysis}</p>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 font-semibold hover:scale-105 transition-all duration-300 glow-green">
                      View Detailed Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
