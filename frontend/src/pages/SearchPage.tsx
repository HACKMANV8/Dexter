import { useState } from "react";
import Header from "@/components/Header";
import { Search, Brain, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 50 mock stocks
const mockStocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2456.75, sentiment: 85, technical: 78, fundamental: 92, overall: 85, recommendation: 'buy' },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3678.5, sentiment: 88, technical: 82, fundamental: 89, overall: 86, recommendation: 'buy' },
  { symbol: "INFY", name: "Infosys Limited", price: 1543.2, sentiment: 72, technical: 75, fundamental: 81, overall: 76, recommendation: 'hold' },
  { symbol: "HDFC", name: "HDFC Bank", price: 1678.9, sentiment: 65, technical: 58, fundamental: 73, overall: 65, recommendation: 'hold' },
  { symbol: "ICICI", name: "ICICI Bank", price: 987.45, sentiment: 45, technical: 42, fundamental: 55, overall: 47, recommendation: 'sell' },
  { symbol: "WIPRO", name: "Wipro Limited", price: 445.6, sentiment: 78, technical: 74, fundamental: 70, overall: 74, recommendation: 'hold' },
  { symbol: "ITC", name: "ITC Limited", price: 425.9, sentiment: 79, technical: 69, fundamental: 86, overall: 78, recommendation: 'buy' },
  { symbol: "LT", name: "Larsen & Toubro", price: 3323.15, sentiment: 68, technical: 60, fundamental: 76, overall: 68, recommendation: 'hold' },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10450.3, sentiment: 60, technical: 62, fundamental: 67, overall: 63, recommendation: 'hold' },
  { symbol: "HCLTECH", name: "HCL Technologies", price: 1234.5, sentiment: 83, technical: 77, fundamental: 81, overall: 80, recommendation: 'buy' },
  { symbol: "BHARTI", name: "Bharti Airtel", price: 1320.45, sentiment: 80, technical: 68, fundamental: 90, overall: 79, recommendation: 'buy' },
  { symbol: "ASIAN", name: "Asian Paints", price: 2890.75, sentiment: 70, technical: 63, fundamental: 77, overall: 70, recommendation: 'hold' },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 785.6, sentiment: 55, technical: 52, fundamental: 60, overall: 56, recommendation: 'sell' },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1756.9, sentiment: 69, technical: 73, fundamental: 80, overall: 74, recommendation: 'buy' },
  { symbol: "SBIN", name: "State Bank of India", price: 625.4, sentiment: 76, technical: 65, fundamental: 71, overall: 71, recommendation: 'hold' },
  { symbol: "AXISBANK", name: "Axis Bank", price: 1045.8, sentiment: 62, technical: 59, fundamental: 64, overall: 62, recommendation: 'hold' },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp.", price: 206.8, sentiment: 78, technical: 72, fundamental: 69, overall: 73, recommendation: 'hold' },
  { symbol: "COALINDIA", name: "Coal India", price: 335.5, sentiment: 81, technical: 78, fundamental: 91, overall: 83, recommendation: 'buy' },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", price: 1689.1, sentiment: 75, technical: 69, fundamental: 73, overall: 72, recommendation: 'hold' },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", price: 1134.35, sentiment: 83, technical: 80, fundamental: 86, overall: 83, recommendation: 'buy' },
  { symbol: "POWERGRID", name: "Power Grid Corp.", price: 245.6, sentiment: 66, technical: 63, fundamental: 70, overall: 66, recommendation: 'hold' },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", price: 3480.2, sentiment: 77, technical: 72, fundamental: 79, overall: 76, recommendation: 'hold' },
  { symbol: "NTPC", name: "NTPC Ltd.", price: 236.95, sentiment: 73, technical: 76, fundamental: 70, overall: 73, recommendation: 'hold' },
  { symbol: "ADANIPORTS", name: "Adani Ports", price: 1234.6, sentiment: 68, technical: 62, fundamental: 65, overall: 65, recommendation: 'hold' },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", price: 9865, sentiment: 58, technical: 62, fundamental: 66, overall: 62, recommendation: 'hold' },
  { symbol: "GRASIM", name: "Grasim Industries", price: 1946.75, sentiment: 79, technical: 75, fundamental: 78, overall: 77, recommendation: 'buy' },
  { symbol: "BRITANNIA", name: "Britannia Industries", price: 4671.5, sentiment: 77, technical: 70, fundamental: 74, overall: 74, recommendation: 'hold' },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", price: 5721.55, sentiment: 74, technical: 77, fundamental: 79, overall: 77, recommendation: 'buy' },
  { symbol: "TITAN", name: "Titan Company", price: 3530.8, sentiment: 91, technical: 88, fundamental: 95, overall: 91, recommendation: 'buy' },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2544, sentiment: 90, technical: 86, fundamental: 80, overall: 85, recommendation: 'buy' },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", price: 3010.7, sentiment: 77, technical: 70, fundamental: 74, overall: 74, recommendation: 'hold' },
  { symbol: "SHREECEM", name: "Shree Cement", price: 26377.1, sentiment: 44, technical: 55, fundamental: 59, overall: 53, recommendation: 'sell' },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance", price: 562.5, sentiment: 68, technical: 71, fundamental: 76, overall: 72, recommendation: 'hold' },
  { symbol: "SBILIFE", name: "SBI Life Insurance", price: 1511.6, sentiment: 64, technical: 62, fundamental: 67, overall: 64, recommendation: 'hold' },
  { symbol: "ICICIGI", name: "ICICI Lombard", price: 1569.7, sentiment: 59, technical: 56, fundamental: 53, overall: 56, recommendation: 'sell' },
  { symbol: "EICHERMOT", name: "Eicher Motors", price: 4384.8, sentiment: 83, technical: 88, fundamental: 80, overall: 83, recommendation: 'buy' },
  { symbol: "ZEEL", name: "Zee Entertainment", price: 153.8, sentiment: 42, technical: 40, fundamental: 37, overall: 40, recommendation: 'sell' },
  { symbol: "DLF", name: "DLF Ltd.", price: 642.45, sentiment: 76, technical: 74, fundamental: 70, overall: 73, recommendation: 'hold' },
  { symbol: "M&M", name: "Mahindra & Mahindra", price: 1706.6, sentiment: 84, technical: 77, fundamental: 81, overall: 81, recommendation: 'buy' },
  { symbol: "GAIL", name: "GAIL India", price: 136.95, sentiment: 75, technical: 66, fundamental: 62, overall: 68, recommendation: 'hold' },
  { symbol: "PIDILITIND", name: "Pidilite Industries", price: 2750.7, sentiment: 64, technical: 65, fundamental: 63, overall: 64, recommendation: 'hold' },
  { symbol: "SIEMENS", name: "Siemens Ltd.", price: 4014.9, sentiment: 85, technical: 88, fundamental: 86, overall: 86, recommendation: 'buy' },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", price: 1442.2, sentiment: 51, technical: 59, fundamental: 53, overall: 54, recommendation: 'sell' },
  { symbol: "ADANIENT", name: "Adani Enterprises", price: 2405.75, sentiment: 70, technical: 72, fundamental: 71, overall: 71, recommendation: 'hold' },
  { symbol: "CIPLA", name: "Cipla Ltd.", price: 1237.85, sentiment: 80, technical: 75, fundamental: 78, overall: 77, recommendation: 'buy' },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", price: 6020.45, sentiment: 88, technical: 91, fundamental: 85, overall: 88, recommendation: 'buy' },
  { symbol: "TATASTEEL", name: "Tata Steel", price: 135.6, sentiment: 66, technical: 60, fundamental: 52, overall: 59, recommendation: 'sell' },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", price: 7305, sentiment: 70, technical: 76, fundamental: 74, overall: 73, recommendation: 'hold' },
  { symbol: "JIOFIN", name: "Jio Financial", price: 204.9, sentiment: 77, technical: 69, fundamental: 74, overall: 73, recommendation: 'hold' },
  { symbol: "HINDALCO", name: "Hindalco Industries", price: 482.95, sentiment: 86, technical: 81, fundamental: 90, overall: 86, recommendation: 'buy' },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStocks, setFilteredStocks] = useState(mockStocks);

  const handleSearch = (value) => {
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

  const getScoreColor = (score) => {
    if (score >= 75) return "text-secondary";
    if (score >= 50) return "text-chart-4";
    return "text-destructive";
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'buy') return "bg-secondary/20 text-secondary border-secondary/30";
    if (rec === 'hold') return "bg-chart-4/20 text-chart-4 border-chart-4/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-black animate-fade-in">
      <Header />
      <div className="p-8 space-y-8 max-w-screen-lg mx-auto">
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
              style={{ animationDelay: `${index * 0.03}s` }}
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
