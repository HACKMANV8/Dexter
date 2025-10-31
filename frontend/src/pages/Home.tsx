import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import StockCard from "@/components/StockCard";
import Header from "@/components/Header";
import { ArrowUpRight, Activity } from "lucide-react";

const marketIndices = [
  { name: "NIFTY 50", symbol: "^NSEI", price: 21453.65, change: 234.5, changePercent: 1.1 },
  { name: "SENSEX", symbol: "^BSESN", price: 71431.43, change: 512.3, changePercent: 0.72 },
  { name: "NASDAQ", symbol: "^IXIC", price: 15643.12, change: -23.45, changePercent: -0.15 },
  { name: "DOW JONES", symbol: "^DJI", price: 37234.89, change: 156.78, changePercent: 0.42 },
  { name: "NIFTY BANK", symbol: "^NSEBANK", price: 45234.56, change: 389.23, changePercent: 0.87 },
  { name: "S&P 500", symbol: "^GSPC", price: 4783.23, change: 45.12, changePercent: 0.95 },
];

const chartData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  value: 20000 + Math.random() * 2000 + i * 50,
}));

const topGainers = [
  { symbol: "RELIANCE", price: 2456.75, change: 3.24 },
  { symbol: "TCS", price: 3678.50, change: 2.87 },
  { symbol: "INFY", price: 1543.20, change: 2.45 },
];

const topLosers = [
  { symbol: "HDFC", price: 2789.30, change: -1.89 },
  { symbol: "ICICI", price: 987.45, change: -1.23 },
  { symbol: "AXIS", price: 1123.78, change: -0.98 },
];

export default function Home() {
  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      
      <div className="p-8 space-y-8">
        {/* Market Indices */}
        <section className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Market Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {marketIndices.map((index) => (
              <StockCard key={index.symbol} {...index} />
            ))}
          </div>
        </section>

        {/* Main Chart */}
        <section className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">NIFTY 50</h2>
              <p className="text-sm text-muted-foreground mt-1">Real-time market data</p>
            </div>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '3M', '6M', '1Y', 'MAX'].map((period) => (
                <button
                  key={period}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-primary/20 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  data-active={period === '1M'}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" opacity={0.5} />
              <YAxis stroke="hsl(var(--muted-foreground))" opacity={0.5} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* Top Gainers & Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Top Gainers */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-secondary" />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {topGainers.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/10 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground">₹{stock.price.toLocaleString()}</p>
                  </div>
                  <span className="text-secondary font-bold">+{stock.change}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-destructive rotate-180" />
              Top Losers
            </h3>
            <div className="space-y-3">
              {topLosers.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground">₹{stock.price.toLocaleString()}</p>
                  </div>
                  <span className="text-destructive font-bold">{stock.change}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
