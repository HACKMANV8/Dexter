import { useState } from "react";
import Header from "@/components/Header";
import { Search, Shield, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

interface MonthlyData {
  month: string;
  score: number;
  return: number;
  volatility: number;
}

const mockMonthlyData: MonthlyData[] = [
  { month: "Jan", score: 72, return: 3.5, volatility: 12 },
  { month: "Feb", score: 68, return: -1.2, volatility: 15 },
  { month: "Mar", score: 75, return: 5.8, volatility: 10 },
  { month: "Apr", score: 82, return: 8.3, volatility: 8 },
  { month: "May", score: 78, return: 4.2, volatility: 11 },
  { month: "Jun", score: 85, return: 9.1, volatility: 7 },
  { month: "Jul", score: 88, return: 11.5, volatility: 6 },
  { month: "Aug", score: 84, return: 7.8, volatility: 9 },
  { month: "Sep", score: 79, return: 3.9, volatility: 13 },
  { month: "Oct", score: 86, return: 10.2, volatility: 8 },
  { month: "Nov", score: 91, return: 13.7, volatility: 5 },
  { month: "Dec", score: 89, return: 12.1, volatility: 6 },
];

export default function CredibilityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [stockSymbol] = useState("RELIANCE");

  const handleAnalyze = () => {
    if (searchTerm.trim()) {
      setAnalyzed(true);
    }
  };

  const avgScore = Math.round(
    mockMonthlyData.reduce((sum, d) => sum + d.score, 0) / mockMonthlyData.length
  );
  const avgReturn = (
    mockMonthlyData.reduce((sum, d) => sum + d.return, 0) / mockMonthlyData.length
  ).toFixed(2);
  const avgVolatility = (
    mockMonthlyData.reduce((sum, d) => sum + d.volatility, 0) / mockMonthlyData.length
  ).toFixed(1);

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />

      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-block p-4 rounded-2xl glass glow-violet">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Credibility Analysis</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Deep-dive into 12 months of historical performance and reliability metrics
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass rounded-2xl p-2 glow-violet">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter stock symbol (e.g., RELIANCE, TCS, INFY)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="w-full bg-transparent px-12 py-4 text-lg outline-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary font-semibold hover:scale-105 transition-all duration-300 glow-violet"
              >
                Analyze
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {analyzed && (
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 hover:glow-violet transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Avg Credibility Score</span>
                </div>
                <p className="text-4xl font-bold">{avgScore}</p>
                <p className="text-sm text-secondary mt-1">Strong Performance</p>
              </div>

              <div className="glass rounded-2xl p-6 hover:glow-green transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Avg Monthly Return</span>
                </div>
                <p className="text-4xl font-bold text-secondary">+{avgReturn}%</p>
                <p className="text-sm text-muted-foreground mt-1">Consistent Growth</p>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-chart-3" />
                  </div>
                  <span className="text-sm text-muted-foreground">Avg Volatility</span>
                </div>
                <p className="text-4xl font-bold">{avgVolatility}%</p>
                <p className="text-sm text-muted-foreground mt-1">Low Risk</p>
              </div>
            </div>

            {/* Credibility Score Chart */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">12-Month Credibility Trend</h3>
                    <p className="text-sm text-muted-foreground">{stockSymbol} - Historical Analysis</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl glass">
                  <span className="text-sm text-muted-foreground">Year: </span>
                  <span className="font-bold">2024</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockMonthlyData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.5}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Returns Chart */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-secondary" />
                Monthly Returns Analysis
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockMonthlyData}>
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.5}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar
                    dataKey="return"
                    radius={[8, 8, 0, 0]}
                    fill="hsl(var(--secondary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Details */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Month-by-Month Breakdown</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockMonthlyData.map((data, index) => (
                  <div
                    key={data.month}
                    className={cn(
                      "glass rounded-xl p-4 hover:scale-105 transition-all duration-300",
                      data.return >= 0 ? "hover:glow-green" : "hover:glow"
                    )}
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg">{data.month}</span>
                      <span className="text-2xl font-bold">{data.score}</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Return:</span>
                        <span className={cn(
                          "font-semibold",
                          data.return >= 0 ? "text-secondary" : "text-destructive"
                        )}>
                          {data.return >= 0 ? "+" : ""}{data.return}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Volatility:</span>
                        <span>{data.volatility}%</span>
                      </div>
                    </div>

                    <div className="mt-3 h-2 bg-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
