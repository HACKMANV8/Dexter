import { useState } from "react";
import Header from "@/components/Header";
import { Search, Brain, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockRecommendation {
  symbol: string;
  name: string;
  price: number;
  sentiment: number;
  technical: number;
  fundamental: number;
  overall: number;
  recommendation: 'buy' | 'hold' | 'sell';
}

const mockStocks: StockRecommendation[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 2456.75,
    sentiment: 85,
    technical: 78,
    fundamental: 92,
    overall: 85,
    recommendation: 'buy',
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3678.50,
    sentiment: 88,
    technical: 82,
    fundamental: 89,
    overall: 86,
    recommendation: 'buy',
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    price: 1543.20,
    sentiment: 72,
    technical: 75,
    fundamental: 81,
    overall: 76,
    recommendation: 'hold',
  },
  {
    symbol: "HDFC",
    name: "HDFC Bank",
    price: 1678.90,
    sentiment: 65,
    technical: 58,
    fundamental: 73,
    overall: 65,
    recommendation: 'hold',
  },
  {
    symbol: "ICICI",
    name: "ICICI Bank",
    price: 987.45,
    sentiment: 45,
    technical: 42,
    fundamental: 55,
    overall: 47,
    recommendation: 'sell',
  },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStocks, setFilteredStocks] = useState(mockStocks);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredStocks(mockStocks);
    } else {
      const filtered = mockStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
          stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-secondary";
    if (score >= 50) return "text-chart-4";
    return "text-destructive";
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === 'buy') return "bg-secondary/20 text-secondary border-secondary/30";
    if (rec === 'hold') return "bg-chart-4/20 text-chart-4 border-chart-4/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />

      <div className="p-8 space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-block p-4 rounded-2xl glass glow-violet">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">AI-Powered Stock Search</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover investment opportunities analyzed through sentiment, technical, and fundamental metrics
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative glass rounded-2xl p-2 glow-violet">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-transparent px-14 py-4 text-lg outline-none"
            />
          </div>
        </div>

        {/* Stock Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {filteredStocks.map((stock, index) => (
            <div
              key={stock.symbol}
              className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 hover:glow-violet group cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{stock.price.toLocaleString()}</p>
                  <span
                    className={cn(
                      "inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border uppercase",
                      getRecommendationColor(stock.recommendation)
                    )}
                  >
                    {stock.recommendation}
                  </span>
                </div>
              </div>

              {/* Score Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Sentiment Score</span>
                    </div>
                    <span className={cn("font-bold", getScoreColor(stock.sentiment))}>
                      {stock.sentiment}%
                    </span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        stock.sentiment >= 75 ? "bg-secondary" :
                        stock.sentiment >= 50 ? "bg-chart-4" : "bg-destructive"
                      )}
                      style={{ width: `${stock.sentiment}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Technical Score</span>
                    </div>
                    <span className={cn("font-bold", getScoreColor(stock.technical))}>
                      {stock.technical}%
                    </span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        stock.technical >= 75 ? "bg-secondary" :
                        stock.technical >= 50 ? "bg-chart-4" : "bg-destructive"
                      )}
                      style={{ width: `${stock.technical}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>Fundamental Score</span>
                    </div>
                    <span className={cn("font-bold", getScoreColor(stock.fundamental))}>
                      {stock.fundamental}%
                    </span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        stock.fundamental >= 75 ? "bg-secondary" :
                        stock.fundamental >= 50 ? "bg-chart-4" : "bg-destructive"
                      )}
                      style={{ width: `${stock.fundamental}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Overall Investment Score</span>
                  <span className={cn("text-3xl font-bold", getScoreColor(stock.overall))}>
                    {stock.overall}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
