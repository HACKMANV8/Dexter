import React, { useState, useMemo } from "react";
import { Zap, X, Clock, TrendingUp, TrendingDown } from "lucide-react"; 

// Placeholder for the Header component (since external imports are not allowed in a single file)
const Header = () => (
  <header className="sticky top-0 z-10 w-full backdrop-blur-md bg-gray-950/70 border-b border-gray-800/50">
    <div className="max-w-screen-2xl mx-auto px-4 py-4 flex justify-between items-center">
      {/* Updated: Only the logo remains, the text "AlphaBucket" is removed */}
      <div className="text-2xl font-bold text-white flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">α</div>
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center">
        U
      </div>
    </div>
  </header>
);


// Helper function to get color class based on score
const getScoreClass = (score) => {
  if (score >= 80) return "bg-green-700/80 text-green-100 ring-green-500";
  if (score >= 65) return "bg-yellow-600/80 text-yellow-100 ring-yellow-400";
  return "bg-red-700/80 text-red-100 ring-red-500";
};

// Helper function to get class based on the historical recommendation
const getRecommendationColor = (rec) => {
    switch (rec) {
        case 'BUY':
            return {
                badge: "bg-green-600 text-white",
                border: "border-green-500",
                hover: "hover-investable",
            };
        case 'HOLD':
            return {
                badge: "bg-yellow-600 text-white",
                border: "border-yellow-500",
                hover: "hover-hold",
            };
        case 'SELL':
        default:
            return {
                badge: "bg-red-600 text-white",
                border: "border-red-500",
                hover: "hover-risky",
            };
    }
};

// Helper function to get return class
const getReturnColor = (ret) => {
    if (ret > 0) return "text-green-400";
    if (ret < 0) return "text-red-400";
    return "text-gray-400";
};


// Mock Data - Stock Database with historical context (Expanded to 50 stocks)
const stockDatabase = [
  // --- BUY Recommendations (Avg >= 80) ---
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2456.75, sentiment: 85, technical: 78, fundamental: 92, analysisDate: "Oct 2024", oneMonthReturn: 4.5, recommendation: "BUY" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3678.50, sentiment: 88, technical: 82, fundamental: 89, analysisDate: "Oct 2024", oneMonthReturn: 6.2, recommendation: "BUY" },
  { symbol: "HDFC", name: "HDFC Bank", price: 1650.80, sentiment: 90, technical: 85, fundamental: 92, analysisDate: "Oct 2024", oneMonthReturn: 5.8, recommendation: "BUY" },
  { symbol: "HCLTECH", name: "HCL Technologies", price: 1234.50, sentiment: 80, technical: 78, fundamental: 83, analysisDate: "Oct 2024", oneMonthReturn: 5.0, recommendation: "BUY" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1756.90, sentiment: 85, technical: 88, fundamental: 90, analysisDate: "Oct 2024", oneMonthReturn: 7.0, recommendation: "BUY" },
  { symbol: "TITAN", name: "Titan Company", price: 3200.50, sentiment: 78, technical: 85, fundamental: 82, analysisDate: "Oct 2024", oneMonthReturn: 4.9, recommendation: "BUY" },
  { symbol: "TATACONSUM", name: "Tata Consumer", price: 1100.20, sentiment: 90, technical: 85, fundamental: 95, analysisDate: "Oct 2024", oneMonthReturn: 7.1, recommendation: "BUY" },
  { symbol: "M&M", name: "Mahindra & Mahindra", price: 1650.00, sentiment: 82, technical: 80, fundamental: 79, analysisDate: "Oct 2024", oneMonthReturn: 5.5, recommendation: "BUY" },
  { symbol: "DLF", name: "DLF Limited", price: 750.30, sentiment: 85, technical: 90, fundamental: 78, analysisDate: "Oct 2024", oneMonthReturn: 6.8, recommendation: "BUY" },
  { symbol: "BPCL", name: "Bharat Petroleum", price: 470.10, sentiment: 80, technical: 79, fundamental: 81, analysisDate: "Oct 2024", oneMonthReturn: 3.2, recommendation: "BUY" },
  
  // --- NEW BUY STOCKS ---
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 7800.00, sentiment: 85, technical: 87, fundamental: 88, analysisDate: "Oct 2024", oneMonthReturn: 6.5, recommendation: "BUY" },
  { symbol: "L&T", name: "Larsen & Toubro", price: 3400.00, sentiment: 82, technical: 80, fundamental: 85, analysisDate: "Oct 2024", oneMonthReturn: 5.2, recommendation: "BUY" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", price: 1600.00, sentiment: 90, technical: 85, fundamental: 90, analysisDate: "Oct 2024", oneMonthReturn: 7.8, recommendation: "BUY" },
  { symbol: "ONGC", name: "Oil and Natural Gas Corp", price: 280.00, sentiment: 80, technical: 83, fundamental: 80, analysisDate: "Oct 2024", oneMonthReturn: 4.1, recommendation: "BUY" },
  { symbol: "HINDALCO", name: "Hindalco Industries", price: 650.00, sentiment: 85, technical: 88, fundamental: 79, analysisDate: "Oct 2024", oneMonthReturn: 5.9, recommendation: "BUY" },
  { symbol: "DIVISLAB", name: "Divis Laboratories", price: 4500.00, sentiment: 80, technical: 85, fundamental: 82, analysisDate: "Oct 2024", oneMonthReturn: 4.7, recommendation: "BUY" },
  { symbol: "SHREECEM", name: "Shree Cement", price: 29000.00, sentiment: 88, technical: 92, fundamental: 85, analysisDate: "Oct 2024", oneMonthReturn: 6.9, recommendation: "BUY" },
  { symbol: "ADANIPORTS", name: "Adani Ports", price: 1400.00, sentiment: 84, technical: 80, fundamental: 83, analysisDate: "Oct 2024", oneMonthReturn: 5.5, recommendation: "BUY" },


  // --- HOLD Recommendations (60 <= Avg < 80) ---
  { symbol: "INFY", name: "Infosys Limited", price: 1456.30, sentiment: 75, technical: 75, fundamental: 75, analysisDate: "Oct 2024", oneMonthReturn: 3.1, recommendation: "HOLD" },
  { symbol: "WIPRO", name: "Wipro Limited", price: 445.60, sentiment: 70, technical: 68, fundamental: 72, analysisDate: "Oct 2024", oneMonthReturn: 0.9, recommendation: "HOLD" },
  { symbol: "ITC", name: "ITC Limited", price: 425.90, sentiment: 78, technical: 75, fundamental: 75, analysisDate: "Oct 2024", oneMonthReturn: 2.1, recommendation: "HOLD" }, // Adjusted fundamental score to keep avg below 80
  { symbol: "BHARTI", name: "Bharti Airtel", price: 1320.45, sentiment: 60, technical: 62, fundamental: 58, analysisDate: "Oct 2024", oneMonthReturn: -1.8, recommendation: "HOLD" },
  { symbol: "ASIAN", name: "Asian Paints", price: 2890.75, sentiment: 75, technical: 72, fundamental: 80, analysisDate: "Oct 2024", oneMonthReturn: 1.5, recommendation: "HOLD" },
  { symbol: "SBIN", name: "State Bank of India", price: 625.40, sentiment: 72, technical: 70, fundamental: 75, analysisDate: "Oct 2024", oneMonthReturn: 0.5, recommendation: "HOLD" },
  { symbol: "AXISBANK", name: "Axis Bank", price: 1045.80, sentiment: 68, technical: 65, fundamental: 72, analysisDate: "Oct 2024", oneMonthReturn: 1.1, recommendation: "HOLD" },
  { symbol: "NESTLEIND", name: "Nestle India", price: 24000.00, sentiment: 70, technical: 65, fundamental: 72, analysisDate: "Oct 2024", oneMonthReturn: 0.8, recommendation: "HOLD" },
  { symbol: "NTPC", name: "NTPC Limited", price: 350.50, sentiment: 62, technical: 68, fundamental: 65, analysisDate: "Oct 2024", oneMonthReturn: 1.2, recommendation: "HOLD" },
  { symbol: "CIBA", name: "Ciba Speciality", price: 2500.00, sentiment: 75, technical: 70, fundamental: 68, analysisDate: "Oct 2024", oneMonthReturn: 1.5, recommendation: "HOLD" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance", price: 650.00, sentiment: 68, technical: 62, fundamental: 59, analysisDate: "Oct 2024", oneMonthReturn: -0.5, recommendation: "HOLD" },

  // --- NEW HOLD STOCKS ---
  { symbol: "TECHM", name: "Tech Mahindra", price: 1350.00, sentiment: 70, technical: 68, fundamental: 75, analysisDate: "Oct 2024", oneMonthReturn: 1.5, recommendation: "HOLD" },
  { symbol: "TATASTEEL", name: "Tata Steel", price: 150.00, sentiment: 65, technical: 70, fundamental: 72, analysisDate: "Oct 2024", oneMonthReturn: 0.8, recommendation: "HOLD" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", price: 1600.00, sentiment: 75, technical: 70, fundamental: 78, analysisDate: "Oct 2024", oneMonthReturn: 2.2, recommendation: "HOLD" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", price: 9000.00, sentiment: 68, technical: 65, fundamental: 70, analysisDate: "Oct 2024", oneMonthReturn: 1.9, recommendation: "HOLD" },
  { symbol: "GRASIM", name: "Grasim Industries", price: 2300.00, sentiment: 72, technical: 75, fundamental: 68, analysisDate: "Oct 2024", oneMonthReturn: 1.4, recommendation: "HOLD" },
  { symbol: "BRITANNIA", name: "Britannia Industries", price: 5200.00, sentiment: 60, technical: 65, fundamental: 60, analysisDate: "Oct 2024", oneMonthReturn: 0.3, recommendation: "HOLD" },
  { symbol: "CIPLA", name: "Cipla Ltd", price: 1550.00, sentiment: 78, technical: 70, fundamental: 75, analysisDate: "Oct 2024", oneMonthReturn: 2.5, recommendation: "HOLD" },
  { symbol: "DRREDDY", name: "Dr Reddy's Labs", price: 6100.00, sentiment: 65, technical: 68, fundamental: 62, analysisDate: "Oct 2024", oneMonthReturn: 0.9, recommendation: "HOLD" },


  // --- SELL Recommendations (Avg < 60) ---
  { symbol: "ICICI", name: "ICICI Bank", price: 987.45, sentiment: 55, technical: 42, fundamental: 55, analysisDate: "Oct 2024", oneMonthReturn: -2.5, recommendation: "SELL" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10450.30, sentiment: 45, technical: 52, fundamental: 50, analysisDate: "Oct 2024", oneMonthReturn: -4.1, recommendation: "SELL" },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 785.60, sentiment: 55, technical: 52, fundamental: 60, analysisDate: "Oct 2024", oneMonthReturn: -3.5, recommendation: "SELL" }, 
  { symbol: "POWERGRID", name: "Power Grid Corp", price: 250.00, sentiment: 55, technical: 60, fundamental: 58, analysisDate: "Oct 2024", oneMonthReturn: -2.1, recommendation: "SELL" },

  // --- NEW SELL STOCKS ---
  { symbol: "ADANIENT", name: "Adani Enterprises", price: 3200.00, sentiment: 50, technical: 40, fundamental: 55, analysisDate: "Oct 2024", oneMonthReturn: -5.5, recommendation: "SELL" },
  { symbol: "VEDANTA", name: "Vedanta Limited", price: 400.00, sentiment: 45, technical: 50, fundamental: 40, analysisDate: "Oct 2024", oneMonthReturn: -4.8, recommendation: "SELL" },
  { symbol: "ZEEL", name: "Zee Entertainment", price: 180.00, sentiment: 35, technical: 30, fundamental: 40, analysisDate: "Oct 2024", oneMonthReturn: -7.2, recommendation: "SELL" },
  { symbol: "IDEA", name: "Vodafone Idea", price: 14.50, sentiment: 25, technical: 20, fundamental: 15, analysisDate: "Oct 2024", oneMonthReturn: -9.9, recommendation: "SELL" },
  { symbol: "PNB", name: "Punjab National Bank", price: 110.00, sentiment: 55, technical: 50, fundamental: 52, analysisDate: "Oct 2024", oneMonthReturn: -3.1, recommendation: "SELL" },
  { symbol: "YESBANK", name: "YES Bank", price: 25.00, sentiment: 40, technical: 35, fundamental: 45, analysisDate: "Oct 2024", oneMonthReturn: -6.0, recommendation: "SELL" },
  { symbol: "GMRINFRA", name: "GMR Infra", price: 95.00, sentiment: 58, technical: 55, fundamental: 50, analysisDate: "Oct 2024", oneMonthReturn: -2.8, recommendation: "SELL" },
  { symbol: "BHEL", name: "Bharat Heavy Electricals", price: 280.00, sentiment: 48, technical: 52, fundamental: 45, analysisDate: "Oct 2024", oneMonthReturn: -4.0, recommendation: "SELL" },
  { symbol: "SAIL", name: "Steel Authority of India", price: 140.00, sentiment: 52, technical: 48, fundamental: 50, analysisDate: "Oct 2024", oneMonthReturn: -3.5, recommendation: "SELL" },
  { symbol: "INDIGO", name: "InterGlobe Aviation", price: 4300.00, sentiment: 55, technical: 50, fundamental: 52, analysisDate: "Oct 2024", oneMonthReturn: -1.5, recommendation: "SELL" },
  { symbol: "JIOFIN", name: "Jio Financial Services", price: 340.00, sentiment: 50, technical: 45, fundamental: 58, analysisDate: "Oct 2024", oneMonthReturn: -2.0, recommendation: "SELL" },
  { symbol: "IRFC", name: "Indian Railway Finance", price: 160.00, sentiment: 40, technical: 50, fundamental: 42, analysisDate: "Oct 2024", oneMonthReturn: -3.2, recommendation: "SELL" },
  { symbol: "BEL", name: "Bharat Electronics", price: 240.00, sentiment: 55, technical: 58, fundamental: 50, analysisDate: "Oct 2024", oneMonthReturn: -0.9, recommendation: "SELL" },
  { symbol: "PFC", name: "Power Finance Corp", price: 480.00, sentiment: 50, technical: 55, fundamental: 48, analysisDate: "Oct 2024", oneMonthReturn: -1.8, recommendation: "SELL" },
];

const INITIAL_BUCKET = [
  {
    id: "1",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 2456.75,
    quantity: 2,
    sentiment: 80,
    technical: 75,
    fundamental: 78,
    analysisDate: "Oct 2024",
    recommendation: "HOLD", 
    oneMonthReturn: 4.5, // Nov 2024 return
  },
  {
    id: "2",
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3678.5,
    quantity: 1,
    sentiment: 88,
    technical: 82,
    fundamental: 89,
    analysisDate: "Oct 2024",
    recommendation: "BUY", 
    oneMonthReturn: 6.2, // Nov 2024 return
  },
  {
    id: "3",
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    price: 10450.30,
    quantity: 1,
    sentiment: 45, 
    technical: 52, 
    fundamental: 50, 
    analysisDate: "Oct 2024", 
    recommendation: "SELL", 
    oneMonthReturn: -4.1,
  },
];


export default function StockBucketApp() {
  const [bucket, setBucket] = useState(INITIAL_BUCKET);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState('');

  // Calculate Total Value
  const { totalValue, totalStocks } = useMemo(() => {
    // Note: Total Value is calculated based on the historical price * current quantity
    const value = bucket.reduce((acc, stock) => acc + stock.price * stock.quantity, 0);
    const stocks = bucket.length;
    return { totalValue: value, totalStocks: stocks };
  }, [bucket]);

  const removeStock = (id) => {
    // Cannot use window.confirm, logging action and removing directly
    console.log(`[ACTION] Directly removing stock with ID: ${id}`);
    setBucket(bucket.filter((stock) => stock.id !== id));
  };

  const addStock = () => {
    const q = parseInt(quantity);
    if (!selectedStock || q <= 0 || isNaN(q)) {
      console.error('Please select a stock and enter a valid quantity');
      return;
    }

    const symbol = selectedStock.symbol;
    
    // Check if the stock already exists in the bucket
    const existingStock = bucket.find(s => s.symbol === symbol);
    
    if (existingStock) {
        // Update existing stock (just quantity for simplicity)
        setBucket(bucket.map(s => 
            s.symbol === symbol 
            ? { ...s, quantity: s.quantity + q } 
            : s
        ));
    } else {
        // Add new stock, inheriting all historical properties from the database
        const newStock = {
            id: Date.now().toString(),
            ...selectedStock, // Includes symbol, name, price, scores, date, rec, return
            quantity: q,
        };
        setBucket([...bucket, newStock]);
    }

    // Reset state and close modal
    resetModal();
  };

  const filteredStocks = stockDatabase.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetModal = () => {
    setShowAddDialog(false);
    setSelectedStock(null);
    setQuantity('');
    setSearchQuery('');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      
      {/* Custom Styles (Glass and Glow Effects) */}
      <style>{`
        /* Define the overall dark theme aesthetics */
        :root {
            --primary-light: 217 91% 60%; /* Blue */
            --secondary-light: 271 70% 60%; /* Purple */
            --buy: 142.1 70.6% 45.3%; /* Green */
            --hold: 48 96% 60%; /* Yellow */
            --sell: 0 72.2% 50.6%; /* Red */
        }
        .bg-gray-950 { background-color: #080a13; }
        .glass { 
            background: rgba(30, 41, 59, 0.4); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(71, 85, 105, 0.3);
            transition: all 0.3s ease;
        }
        .gradient-text {
          background-image: linear-gradient(90deg, hsl(var(--primary-light)), hsl(var(--secondary-light)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .glow-violet:hover {
            box-shadow: 0 0 15px rgba(124, 58, 237, 0.7), 0 0 30px rgba(124, 58, 237, 0.4);
        }
        /* Custom hover glows for recommendations */
        .hover-investable:hover {
            border-color: hsl(var(--buy));
            box-shadow: 0 0 10px hsla(var(--buy), 0.5), 0 0 20px hsla(var(--buy), 0.3);
        }
        .hover-hold:hover {
            border-color: hsl(var(--hold));
            box-shadow: 0 0 10px hsla(var(--hold), 0.5), 0 0 20px hsla(var(--hold), 0.3);
        }
        .hover-risky:hover {
            border-color: hsl(var(--sell));
            box-shadow: 0 0 10px hsla(var(--sell), 0.5), 0 0 20px hsla(var(--sell), 0.3);
        }
        .score-badge {
            border-width: 2px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        /* Animation utility for modal */
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes zoom-in { 0% { transform: scale(0.9); } 100% { transform: scale(1); } }
        .animate-in { animation: fade-in 0.3s ease-out forwards, zoom-in 0.3s ease-out forwards; }
      `}</style>
      
      <Header />
      <div className="max-w-screen-xl mx-auto py-10 px-4">
        
        {/* Header/Call to Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            {/* Updated Title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">Historical Backtest Dashboard</h1>
            <p className="text-lg text-gray-400">
                Simulating **{totalStocks}** historical holding(s) based on **October 2024** data.
            </p>
          </div>
          <button 
            className="mt-4 sm:mt-0 px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-white shadow-xl hover:scale-[1.03] transition glow-violet"
            onClick={() => setShowAddDialog(true)}
          >
            <span className="flex items-center gap-2"><Zap className="w-5 h-5"/> Add Historical Stock</span>
          </button>
        </div>

        {/* Stocks List */}
        <h2 className="text-3xl font-bold text-white mb-6">Historical Holdings ({bucket.length})</h2>
        <div className="my-6 grid gap-6">
          {bucket.length > 0 ? (
            bucket.map(stock => {
              const totalCost = stock.price * stock.quantity;
              const { badge, border, hover } = getRecommendationColor(stock.recommendation);
              
              // Calculate Alpha Fusion Score
              const alphaFusionScore = ((stock.sentiment + stock.technical + stock.fundamental) / 3).toFixed(1);
              const fusionClass = getScoreClass(alphaFusionScore);
              const returnColor = getReturnColor(stock.oneMonthReturn);


              return (
                <div 
                  key={stock.id} 
                  className={`glass rounded-2xl p-6 flex flex-col justify-between border-l-4 ${border} ${hover}`}
                >
                  
                  {/* Row 1: Stock Info & Recommendation */}
                  <div className="flex justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-700/50">
                    <div className="flex-grow space-y-2">
                        <div className="font-extrabold text-2xl text-blue-400 flex items-center gap-3">
                        {stock.symbol} <span className="text-gray-400 text-base font-medium">- {stock.name}</span>
                        </div>
                        {/* Recommendation Badge */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" /> Analysis Date: {stock.analysisDate}
                            </span>
                            <span className={`text-xl px-4 py-1 rounded-full font-bold shadow ${badge} ring-4 ring-opacity-50`}>
                                RECOMMENDATION: {stock.recommendation}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                      onClick={() => removeStock(stock.id)}
                      className="ml-6 p-2 rounded-full bg-red-600 text-white shadow-lg hover:scale-110 transition hover:bg-red-700"
                      aria-label="Remove Stock"
                    >
                      <X className="w-5 h-5"/>
                    </button>
                  </div>
                  
                  {/* Row 2: Scores and Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-4">
                      {/* Alpha Fusion Score */}
                      <div className="col-span-2 md:col-span-1 border-r border-gray-700/50 pr-4">
                        <p className="text-gray-400 text-sm mb-1">Fusion Score</p>
                        <p className={`text-3xl font-extrabold ${fusionClass.includes('green') ? 'text-green-400' : fusionClass.includes('yellow') ? 'text-yellow-400' : 'text-red-400'}`}>
                            {alphaFusionScore}%
                        </p>
                      </div>

                      {/* Individual Metrics Breakdown */}
                      <div className="col-span-2 md:col-span-3 flex flex-wrap items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">Historical Breakdown ({stock.analysisDate}):</span>
                          <span className={`score-badge text-xs px-3 py-1 rounded-full font-semibold ring-2 ${getScoreClass(stock.sentiment)}`}>
                              Sentiment: {stock.sentiment}%
                          </span>
                          <span className={`score-badge text-xs px-3 py-1 rounded-full font-semibold ring-2 ${getScoreClass(stock.technical)}`}>
                              Technical: {stock.technical}%
                          </span>
                          <span className={`score-badge text-xs px-3 py-1 rounded-full font-semibold ring-2 ${getScoreClass(stock.fundamental)}`}>
                              Fundamental: {stock.fundamental}%
                          </span>
                      </div>
                      
                      {/* Quantity and Value */}
                      <div className="col-span-1 md:col-span-1 text-right">
                          <p className="text-gray-400 text-sm">Holding Value</p>
                          <p className="text-xl font-bold text-white">
                              ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-gray-500 text-xs">@ {stock.quantity} units</p>
                      </div>
                  </div>
                  
                  {/* Row 3: Validation/Proof (One-Month Return) */}
                  <div className="mt-2 pt-4 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <p className="text-sm font-semibold text-gray-300 mb-2 sm:mb-0 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        Validation Data: Actual **November 2024** Performance
                    </p>
                    <div className="flex items-center gap-2">
                        {stock.oneMonthReturn > 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-xl font-bold ${returnColor}`}>
                            {stock.oneMonthReturn.toFixed(2)}% Return
                        </span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
             <div className="glass p-8 text-center rounded-2xl text-gray-400 border-dashed border-2 border-gray-700">
                <p className="text-lg font-semibold">Your backtest bucket is empty. Add a stock to start simulating historical results!</p>
             </div>
          )}
        </div>

        {/* Add Stock Modal */}
        {showAddDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg p-7 glass rounded-3xl shadow-2xl border border-blue-500/30 animate-in">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h2 className="font-bold text-2xl text-white">Add Historical Stock for Backtesting</h2>
                <button 
                    className="p-2 text-gray-400 rounded-full hover:bg-gray-700 transition" 
                    onClick={resetModal}
                    aria-label="Close"
                >
                    <X className="w-6 h-6"/>
                </button>
              </div>

              {/* Search Box */}
              <input
                type="text"
                placeholder="Search by symbol or name (50 results available)..."
                className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none mb-4 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              {/* Stock List */}
              <div className="max-h-64 overflow-y-auto mb-6 space-y-3 p-1">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`border rounded-xl px-4 py-3 cursor-pointer transition-all flex justify-between items-center 
                        ${selectedStock?.symbol === stock.symbol ? 'border-blue-600 bg-blue-900/40 shadow-lg' : 'border-gray-700 hover:border-blue-400 hover:bg-gray-800/50'}`}
                    >
                      <div>
                        <p className="font-bold text-lg">{stock.symbol}</p>
                        <p className="text-sm text-gray-400">{stock.name}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-blue-400">Price ({stock.analysisDate}): ₹{stock.price.toLocaleString('en-IN')}</p>
                        <div className="flex gap-3 text-xs justify-end">
                            <span className="font-bold text-lg text-yellow-400">
                                {stock.recommendation}
                            </span>
                            <span className={stock.oneMonthReturn >= 0 ? "text-green-400" : "text-red-400"}>
                                +1M: {stock.oneMonthReturn.toFixed(1)}%
                            </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No stocks found matching your search.</p>
                )}
              </div>

              {/* Quantity Input */}
              {selectedStock && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Quantity of {selectedStock.symbol} (Historical Price: ₹{selectedStock.price.toLocaleString('en-IN')})</label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none focus:border-blue-500 transition-all"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  className="bg-gray-700/80 px-5 py-2 rounded-full shadow text-white hover:bg-gray-600 transition"
                  onClick={resetModal}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg hover:scale-[1.03] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={addStock}
                  disabled={!selectedStock || !quantity || parseInt(quantity) <= 0}
                >
                  Confirm & Add to Backtest
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
