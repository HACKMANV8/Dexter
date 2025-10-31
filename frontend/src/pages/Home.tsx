import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import StockCard from "@/components/StockCard";
import Header from "@/components/Header";
import { ArrowUpRight, Activity, TrendingUp, TrendingDown, DollarSign, Users, Eye, Zap } from "lucide-react";

const marketIndices = [
  { name: "NIFTY 50", symbol: "^NSEI", price: 21453.65, change: 234.5, changePercent: 1.1 },
  { name: "SENSEX", symbol: "^BSESN", price: 71431.43, change: 512.3, changePercent: 0.72 },
  { name: "NASDAQ", symbol: "^IXIC", price: 15643.12, change: -23.45, changePercent: -0.15 },
  { name: "DOW JONES", symbol: "^DJI", price: 37234.89, change: 156.78, changePercent: 0.42 },
  { name: "NIFTY BANK", symbol: "^NSEBANK", price: 45234.56, change: 389.23, changePercent: 0.87 },
  { name: "S&P 500", symbol: "^GSPC", price: 4783.23, change: 45.12, changePercent: 0.95 },
];

// Extended chart data for better visualization
const generateChartData = (days: number, baseValue: number) => {
  return Array.from({ length: days }, (_, i) => {
    const trend = i * 15;
    const noise = Math.sin(i / 3) * 300 + Math.random() * 200;
    return {
      time: i,
      value: baseValue + trend + noise,
      volume: Math.floor(Math.random() * 1000000) + 500000,
    };
  });
};

const chartData = generateChartData(90, 20000);

const topGainers = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2456.75, change: 3.24, volume: "2.5M" },
  { symbol: "TCS", name: "Tata Consultancy", price: 3678.50, change: 2.87, volume: "1.8M" },
  { symbol: "INFY", name: "Infosys Limited", price: 1543.20, change: 2.45, volume: "3.1M" },
  { symbol: "HDFC", name: "HDFC Bank", price: 1650.80, change: 2.15, volume: "2.2M" },
  { symbol: "ITC", name: "ITC Limited", price: 425.90, change: 1.89, volume: "4.5M" },
];

const topLosers = [
  { symbol: "ICICI", name: "ICICI Bank", price: 987.45, change: -1.89, volume: "1.9M" },
  { symbol: "AXIS", name: "Axis Bank", price: 1123.78, change: -1.45, volume: "1.5M" },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 785.60, change: -1.23, volume: "3.2M" },
  { symbol: "WIPRO", name: "Wipro Limited", price: 445.60, change: -0.98, volume: "2.1M" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10450.30, change: -0.75, volume: "0.8M" },
];

// Sector performance data
const sectorData = [
  { sector: "IT", performance: 2.5, value: 25 },
  { sector: "Banking", performance: 1.8, value: 30 },
  { sector: "Auto", performance: -0.5, value: 15 },
  { sector: "Pharma", performance: 1.2, value: 12 },
  { sector: "Energy", performance: 0.8, value: 18 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Volume data for bar chart
const volumeData = chartData.slice(-30).map((d, i) => ({
  time: i,
  volume: d.volume,
}));

// Market stats
const marketStats = [
  { label: "Market Cap", value: "₹245.8T", change: "+2.3%", icon: DollarSign },
  { label: "Total Volume", value: "156.2M", change: "+5.1%", icon: Activity },
  { label: "Active Stocks", value: "1,847", change: "+12", icon: TrendingUp },
  { label: "52W High", value: "892", change: "+23", icon: Zap },
];

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [liveUpdate, setLiveUpdate] = useState(0);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      
      <div className="p-8 space-y-8">
        {/* Market Stats Overview */}
        <section className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketStats.map((stat, index) => (
              <div key={stat.label} className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-secondary' : 'text-destructive'}`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Market Indices */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Market Overview
            <span className="ml-2 px-3 py-1 text-xs rounded-full bg-secondary/20 text-secondary font-semibold animate-pulse">LIVE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {marketIndices.map((index) => (
              <StockCard key={index.symbol} {...index} />
            ))}
          </div>
        </section>

        {/* Main Chart with Volume */}
        <section className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">NIFTY 50</h2>
              <p className="text-sm text-muted-foreground mt-1">Real-time market data • Last updated: now</p>
            </div>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '3M', '6M', '1Y', 'MAX'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-primary/20 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  data-active={period === selectedPeriod}
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

          {/* Volume Chart Below */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Trading Volume</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={volumeData}>
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" opacity={0.3} hide />
                <YAxis stroke="hsl(var(--muted-foreground))" opacity={0.3} hide />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="volume" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Sector Performance & Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Sector Performance */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sector Performance
            </h3>
            <div className="space-y-4">
              {sectorData.map((sector) => (
                <div key={sector.sector} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{sector.sector}</span>
                    <span className={`font-bold ${sector.performance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                    </span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${sector.performance >= 0 ? 'bg-secondary' : 'bg-destructive'}`}
                      style={{ width: `${Math.abs(sector.performance) * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Distribution */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Market Distribution
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => `${entry.sector}: ${entry.value}%`}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Top Gainers */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-secondary" />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {topGainers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/10 transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center font-bold text-secondary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stock.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-secondary font-bold text-sm">+{stock.change}%</span>
                      <span className="text-xs text-muted-foreground">{stock.volume}</span>
                    </div>
                  </div>
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
              {topLosers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-destructive/10 transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center font-bold text-destructive">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stock.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-destructive font-bold text-sm">{stock.change}%</span>
                      <span className="text-xs text-muted-foreground">{stock.volume}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Trend Comparison */}
        <section className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Index Comparison (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.slice(-30)}>
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" opacity={0.5} />
              <YAxis stroke="hsl(var(--muted-foreground))" opacity={0.5} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                name="NIFTY 50"
              />
              <Line
                type="monotone"
                dataKey={(d) => d.value * 0.95}
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={false}
                name="SENSEX"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}