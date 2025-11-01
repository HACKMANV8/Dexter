import React from "react";
import { TrendingUp, Newspaper, BarChart3, Sparkles, DollarSign } from "lucide-react";

// Placeholder for the Header component (copied from SearchPage.jsx)
const Header = () => (
  <header className="sticky top-0 z-10 w-full backdrop-blur-md bg-gray-950/70 border-b border-gray-800/50">
    <div className="max-w-screen-2xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-white flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">α</div>
        Fusion Analysis
      </div>
      {/* Removed the user icon div here to match the request */}
    </div>
  </header>
);

// Helper component to draw a simple line chart using SVG with area fill and current price marker
const TrendLineChart = ({ data }) => {
  if (!data || data.length < 2) return null;
  
  const width = 200;
  const height = 80;
  const padding = 10;
  
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal;
  
  // Use a safe range to prevent division by zero if all data points are the same
  const safeRange = range === 0 ? 1 : range;
  
  const getX = (index) => (index / (data.length - 1)) * (width - 2 * padding) + padding;
  // Invert Y axis for SVG (higher value = lower Y coordinate)
  const getY = (value) => height - padding - ((value - minVal) / safeRange) * (height - 2 * padding);
  
  const linePoints = data.map((value, index) => `${getX(index)},${getY(value)}`).join(' ');
  
  // Create points for the area fill
  const areaPoints = [
    `${getX(0)},${height - padding}`, 
    linePoints,                     
    `${getX(data.length - 1)},${height - padding}`, 
    `${getX(0)},${height - padding}` 
  ].join(' ');
  
  const lastX = getX(data.length - 1);
  const lastY = getY(data[data.length - 1]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Define Gradient for the Area Fill */}
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#60a5fa", stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: "#60a5fa", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* Area Fill */}
      <polyline 
        fill="url(#chartGradient)"
        points={areaPoints}
      />
      
      {/* Line Stroke */}
      <polyline 
        fill="none"
        stroke="#60a5fa" 
        strokeWidth="2"
        points={linePoints}
      />
      
      {/* Current Price Marker */}
      <circle cx={lastX} cy={lastY} r="3" fill="#60a5fa" stroke="#080a13" strokeWidth="1" />
    </svg>
  );
};


// 10 trending stocks (expanded slightly for better visualization)
const trendingStocks = [
  {
    symbol: "ADANIENT",
    name: "Adani Enterprises",
    price: 2789.45,
    change: 156.23,
    changePercent: 5.94,
    trendScore: 94,
    analysis: "Strong upward momentum with positive news sentiment. Institutional buying detected.",
    newsCount: 28,
    chartData: [2500, 2520, 2580, 2650, 2700, 2750, 2789],
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance",
    price: 6543.20,
    change: 234.10,
    changePercent: 3.71,
    trendScore: 89,
    analysis: "Quarterly results exceeded expectations. Analyst upgrades driving momentum.",
    newsCount: 15,
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
    analysis: "Record sales numbers. Expansion plans announced for electric vehicles.",
    newsCount: 19,
    chartData: [11000, 11100, 11200, 11300, 11400, 11500, 11544],
  },
  {
    symbol: "LTIM",
    name: "LTIMindtree",
    price: 5234.60,
    change: 312.45,
    changePercent: 6.35,
    trendScore: 83,
    analysis: "AI and cloud computing deals showing strong pipeline growth.",
    newsCount: 17,
    chartData: [4800, 4900, 5000, 5100, 5150, 5200, 5235],
  },
  {
    symbol: "TCS", name: "Tata Consultancy", price: 3678.50, change: 88.1, changePercent: 2.45, trendScore: 82, analysis: "Strong quarterly results, new major contracts.", newsCount: 18, chartData: [3500,3520,3590,3610,3630,3650,3678],
  },
  {
    symbol: "INFY", name: "Infosys Limited", price: 1543.20, change: 65.02, changePercent: 2.5, trendScore: 80, analysis: "International expansion. Analyst buy ratings.", newsCount: 14, chartData: [1500,1510,1515,1530,1532,1536,1543],
  },
  {
    symbol: "ICICI", name: "ICICI Bank", price: 987.45, change: 49.12, changePercent: 3.8, trendScore: 78, analysis: "Record profit margins. FII inflows strong.", newsCount: 12, chartData: [900,925,940,950,963,980,987],
  },
  {
    symbol: "HDFC", name: "HDFC Bank", price: 1678.90, change: 77.46, changePercent: 4.8, trendScore: 85, analysis: "Merger benefits drive up confidence.", newsCount: 27, chartData: [1600,1620,1635,1652,1660,1670,1678],
  },
  {
    symbol: "ITC", name: "ITC Limited", price: 425.90, change: 16.7, changePercent: 1.6, trendScore: 79, analysis: "FMCG division expansion. Dividend increases.", newsCount: 21, chartData: [400,405,410,413,420,423,426],
  },
];

export default function TrendsPage() {
  const getTrendColor = (score) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };
  
  const getTrendBarColor = (score) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-yellow-600";
    return "bg-red-600";
  };


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
        
      {/* Custom Styles from SearchPage.jsx for consistency */}
      <style>{`
        /* Define color variables */
        :root {
            --primary-light: 217 91% 60%; /* Blue */
            --secondary-light: 271 70% 60%; /* Purple */
        }
        /* Match the deep background color */
        .bg-gray-950 { background-color: #080a13; }
        
        /* Match the main title gradient */
        .gradient-text {
          background-image: linear-gradient(90deg, hsl(var(--primary-light)), hsl(var(--secondary-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        /* Match the glass effect from the main app's modal/cards */
        .glass { 
            background: rgba(30, 41, 59, 0.4); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(71, 85, 105, 0.3);
            transition: all 0.3s ease;
        }
        /* Use the violet glow from SearchPage */
        .glow-violet:hover {
            box-shadow: 0 0 15px rgba(124, 58, 237, 0.7), 0 0 30px rgba(124, 58, 237, 0.4);
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        .bg-card { background-color: rgba(30, 41, 59, 0.7); } /* Custom background for score bars */
        .text-muted-foreground { color: #9ca3af; } /* Gray-400 equivalent */
        .text-primary { color: #60a5fa; } /* Blue-400 equivalent */
      `}</style>

      {/* Placeholder Header */}
      <Header /> 
      
      <div className="p-8 space-y-8 max-w-screen-lg mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-block p-4 rounded-2xl glass glow-violet">
            <Sparkles className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Market Intelligence & Trends</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated investment opportunities based on real-time market trends, news sentiment, and technical analysis.
          </p>
        </div>
        
        {/* Trend Strength Indicator (Card 1) */}
        <div className="glass rounded-2xl p-6 animate-slide-up hover:glow-violet" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Overall Market Trend Strength</h3>
                <p className="text-sm text-gray-400">Analysis indicates sustained bullish momentum.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-600/10 border border-blue-600/30">
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-400">Strong</p>
                <p className="text-xs text-gray-400">86% Confidence</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-600/50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Trending Stocks (List) */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <DollarSign className="w-6 h-6 text-blue-400" />
            Top Investment Opportunities
          </h2>
          <div className="space-y-4">
            {trendingStocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 hover:glow-violet cursor-pointer border-l-4 border-blue-500"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Main Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                  
                  {/* Col 1: Stock Info */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">{stock.symbol}</h3>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      <Newspaper className="w-4 h-4" />
                      <span>{stock.newsCount} articles</span>
                    </div>
                  </div>
                  
                  {/* Col 2: Price & Change */}
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-blue-400">₹{stock.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-green-400 font-bold text-lg">
                        +{stock.change.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-green-600/20 text-green-400 text-xs font-semibold">
                        +{stock.changePercent}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Col 3: Chart */}
                  <div className="h-20 w-full flex items-center justify-center">
                      <TrendLineChart data={stock.chartData} />
                  </div>
                  
                  {/* Col 4: Trend Score */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-300">Trend Score</span>
                        <span className={`text-2xl font-bold ${getTrendColor(stock.trendScore)}`}>
                          {stock.trendScore}
                        </span>
                      </div>
                      <div className="h-2 bg-card rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${getTrendBarColor(stock.trendScore)}`}
                          style={{ width: `${stock.trendScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stock Analysis Text (The "down text" - AI Key Insight title removed) */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {stock.analysis}
                    </p>
                </div>

              </div>
            ))}
          </div>
        </div>
        
        {/* Market Analysis Summary (Optional Extra Card) */}
        <div className="glass rounded-2xl p-6 mt-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-yellow-400" />
            Sector Hotspots
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Technology and Financial Services are showing the highest cluster of positive sentiment and buying pressure this week, driven by strong Q3 earnings and global contract wins. The current market momentum suggests prioritizing large-cap stocks with low debt ratios.
          </p>
        </div>
        
      </div>
    </div>
  );
}
