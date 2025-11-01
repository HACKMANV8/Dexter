import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Search,
} from "lucide-react";

// Utility function (formerly imported as cn)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Placeholder for the Header component (formerly imported)
const Header = () => (
  <header className="sticky top-0 z-10 w-full backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-slate-200 dark:border-gray-800/50">
    <div className="max-w-screen-2xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">α</div>
        AlphaBucket
      </div>
      {/* The 'U' initial container has been removed from here */}
    </div>
  </header>
);

// --- Mock Data and Metric Generation Functions ---

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeFakeMetrics(typeHint) {
  const bias =
    typeHint === "bank"
      ? { s: -10, t: -5, f: -5 }
      : typeHint === "tech"
      ? { s: 5, t: 7, f: 3 }
      : typeHint === "fmcg"
      ? { s: 8, t: 3, f: 6 }
      : { s: 0, t: 0, f: 0 };

  const sentiment = Math.max(12, Math.min(98, 50 + randomInt(-30, 35) + bias.s));
  const technical = Math.max(8, Math.min(96, 50 + randomInt(-40, 40) + bias.t));
  const fundamental = Math.max(10, Math.min(99, 50 + randomInt(-35, 45) + bias.f));
  return { sentiment, technical, fundamental };
}

function computeStatus(sentiment, technical, fundamental) {
  const avg = (sentiment + technical + fundamental) / 3;
  return avg >= 60 ? "investable" : "risky";
}

// Initial bucket data generation
const INITIAL_BUCKET = [
    {
        id: "1",
        symbol: "RELIANCE",
        name: "Reliance Industries",
        price: 2456.75,
        quantity: 10,
        ...makeFakeMetrics("energy"),
    },
    {
        id: "2",
        symbol: "TCS",
        name: "Tata Consultancy Services",
        price: 3678.5,
        quantity: 5,
        ...makeFakeMetrics("tech"),
    },
    {
        id: "3",
        symbol: "ICICI",
        name: "ICICI Bank",
        price: 987.45,
        quantity: 15,
        ...makeFakeMetrics("bank"),
    },
    {
        id: "4",
        symbol: "INFY",
        name: "Infosys Ltd",
        price: 1560.2,
        quantity: 12,
        ...makeFakeMetrics("tech"),
    },
    {
        id: "5",
        symbol: "HDFC",
        name: "HDFC Bank",
        price: 1520.4,
        quantity: 8,
        ...makeFakeMetrics("bank"),
    },
    {
        id: "6",
        symbol: "ITC",
        name: "ITC Ltd",
        price: 458.1,
        quantity: 30,
        ...makeFakeMetrics("fmcg"),
    },
    {
        id: "7",
        symbol: "ADANIPOWER",
        name: "Adani Power",
        price: 563.7,
        quantity: 20,
        ...makeFakeMetrics("energy"),
    },
    {
        id: "8",
        symbol: "MARUTI",
        name: "Maruti Suzuki",
        price: 8300.0,
        quantity: 2,
        ...makeFakeMetrics("auto"),
    },
    {
        id: "9",
        symbol: "BHARTI",
        name: "Bharti Airtel",
        price: 825.25,
        quantity: 7,
        ...makeFakeMetrics("telecom"),
    },
].map((s) => ({
    ...s,
    status: computeStatus(s.sentiment, s.technical, s.fundamental),
}));

// --- Main Application Component ---

export default function App() {
  const [bucket, setBucket] = useState(INITIAL_BUCKET);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    price: "",
    quantity: "1",
  });
  const [formError, setFormError] = useState("");

  // Memoized calculations for stats overview
  const { totalInvestment, investableCount, riskyCount } = useMemo(() => {
    const total = bucket.reduce(
        (sum, stock) => sum + stock.price * stock.quantity,
        0
    );
    const investable = bucket.filter((s) => s.status === "investable").length;
    const risky = bucket.filter((s) => s.status === "risky").length;
    return {
        totalInvestment: total,
        investableCount: investable,
        riskyCount: risky,
    };
  }, [bucket]);

  function removeStock(id) {
    const stock = bucket.find((b) => b.id === id);
    // Cannot use window.confirm, removing directly and logging action
    console.log(`[ACTION] Directly removing stock: ${stock?.symbol} (ID: ${id})`);
    setBucket((prev) => prev.filter((s) => s.id !== id));
  }

  function openAddDialog() {
    setSearchQuery("");
    setSearchResults([]);
    setForm({ symbol: "", name: "", price: "", quantity: "1" });
    setFormError("");
    setShowAddDialog(true);
  }

  function onSearchMock(q) {
    const qUp = q.trim().toUpperCase();
    if (!qUp) {
      setSearchResults([]);
      return;
    }
    // Mock database for search
    const pool = [
      { symbol: "HCLTECH", name: "HCL Technologies", hint: "tech" },
      { symbol: "WIPRO", name: "Wipro Ltd", hint: "tech" },
      { symbol: "AXISBANK", name: "Axis Bank", hint: "bank" },
      { symbol: "SBIN", name: "State Bank of India", hint: "bank" },
      { symbol: "ONGC", name: "Oil & Natural Gas Corporation", hint: "energy" },
      { symbol: "LT", name: "Larsen & Toubro", hint: "infra" },
      { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", hint: "pharma" },
      { symbol: "TITAN", name: "Titan Company", hint: "fmcg" },
      { symbol: "HINDUNILVR", name: "Hindustan Unilever", hint: "fmcg" },
      { symbol: "ZEEL", name: "Zee Entertainment", hint: "media" },
    ];
    const matches = pool.filter(
      (p) => p.symbol.includes(qUp) || p.name.toUpperCase().includes(qUp)
    );
    // Show matches, or a few suggestions if no direct match
    setSearchResults(matches.length > 0 ? matches : pool.slice(0, 6));
  }

  function pickSearchResult(r) {
    // Check if the stock already exists in the bucket
    const existingStock = bucket.find(s => s.symbol === r.symbol);
    
    setForm({
      symbol: r.symbol,
      name: r.name,
      price: (randomInt(100, 5000) + Math.random() * 100).toFixed(2),
      // If stock exists, pre-fill with existing quantity for update flow
      quantity: existingStock ? existingStock.quantity.toString() : "1", 
    });
    setSearchResults([]);
    setSearchQuery("");
  }

  function validateForm() {
    if (!form.symbol.trim()) return "Symbol is required";
    if (!form.name.trim()) return "Name is required";
    const price = Number(form.price);
    const qty = Number(form.quantity);
    if (Number.isNaN(price) || price <= 0) return "Enter a valid price";
    if (!Number.isInteger(qty) || qty <= 0) return "Enter a valid quantity (must be a positive integer)";
    return "";
  }

  function addStockFromForm() {
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError("");

    const price = Number(Number(form.price).toFixed(2));
    const quantity = Math.max(1, Math.floor(Number(form.quantity)));
    const symbol = form.symbol.toUpperCase();
    
    // Check if the stock already exists
    const existingIndex = bucket.findIndex(s => s.symbol === symbol);
    
    if (existingIndex !== -1) {
        // Update existing stock quantity/price
        setBucket(prev => prev.map((s, index) => 
            index === existingIndex 
            ? { ...s, quantity: quantity, price: price } 
            : s
        ));
    } else {
        // Create new stock with fake metrics
        const typeHint =
        form.name.toLowerCase().includes("bank")
            ? "bank"
            : form.name.toLowerCase().includes("tech")
            ? "tech"
            : form.name.toLowerCase().includes("unilever") || form.name.toLowerCase().includes("titan")
            ? "fmcg"
            : undefined;
        const metrics = makeFakeMetrics(typeHint);
        const status = computeStatus(metrics.sentiment, metrics.technical, metrics.fundamental);

        const newStock = {
            id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            symbol: symbol,
            name: form.name,
            price,
            quantity,
            sentiment: metrics.sentiment,
            technical: metrics.technical,
            fundamental: metrics.fundamental,
            status,
        };
        setBucket((prev) => [newStock, ...prev]);
    }
    
    setShowAddDialog(false);
  }


  return (
    <div className="min-h-screen font-sans">
      {/* --- Custom CSS and Theme Variables --- */}
      <style>{`
        /* Dark Theme Colors and Utilities */
        :root {
            /* Shadcn-like dark theme variables */
            --primary-light: 217 91% 60%; /* Blue/Primary */
            --secondary-light: 142.1 70.6% 45.3%; /* Green/Investable */
            
            --primary: 217 91% 60%; 
            --secondary: 142.1 70.6% 45.3%; 
            --destructive: 0 72.2% 50.6%;
            
            --foreground: 210 40% 98%;
            --muted-foreground: 215 16.4% 56.4%;
            --card-bg: 210 30% 8%; /* Dark Card Background */
        }
        
        .dark {
            --background: 222.2 84% 4.9%;
            --card: 222.2 84% 7%; /* Lighter than background for cards */
            --foreground: 210 40% 98%;
            --muted-foreground: 215 16.4% 56.4%;
            --primary: 217 91% 60%; 
            --secondary: 142.1 70.6% 45.3%; 
            --destructive: 0 72.2% 50.6%;
        }

        /* Utility classes matching the provided JSX structure */
        .gradient-text {
            background-image: linear-gradient(90deg, hsl(var(--primary-light)), hsl(271 70% 60%));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
        }

        .text-primary { color: hsl(var(--primary)); }
        .text-secondary { color: hsl(var(--secondary)); }
        .text-destructive { color: hsl(var(--destructive)); }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .bg-primary\\/10 { background-color: hsla(var(--primary), 0.1); }
        .bg-secondary\\/20 { background-color: hsla(var(--secondary), 0.2); }
        .bg-destructive\\/20 { background-color: hsla(var(--destructive), 0.2); }
        .bg-card { background-color: hsl(var(--card)); }
        .bg-muted\\/20 { background-color: hsla(var(--muted-foreground), 0.1); }
        
        .glow-violet:hover {
            box-shadow: 0 0 15px hsla(var(--primary), 0.7), 0 0 30px hsla(var(--primary), 0.4);
        }

        .hover\\:glow-green:hover {
            box-shadow: 0 0 15px hsla(var(--secondary), 0.7), 0 0 30px hsla(var(--secondary), 0.4);
        }
        
        .hover\\:glow:hover { /* This is for risky/destructive glow */
            box-shadow: 0 0 15px hsla(var(--destructive), 0.7), 0 0 30px hsla(var(--destructive), 0.4);
        }

        .glass { 
            background: rgba(255, 255, 255, 0.4); 
            backdrop-filter: blur(8px); 
            border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .dark .glass { 
            background: rgba(30, 41, 59, 0.4); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        /* Animation keyframes (matching the user's JSX usage) */
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

      `}</style>
      
      <div className="dark"> {/* Enforce dark theme */}
        <div className="min-h-screen animate-fade-in bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-50">
          <Header />
          <div className="p-4 sm:p-8 max-w-screen-xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start justify-between animate-slide-up">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text mb-3">
                  My Smart Bucket
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg">
                  AI-powered insights on your portfolio’s performance (simulated data)
                </p>
              </div>
              <button
                onClick={openAddDialog}
                className="mt-4 sm:mt-0 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 font-semibold text-white flex items-center gap-2 hover:scale-105 transition-all duration-300 glow-violet shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Stock
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="glass rounded-2xl p-6 hover:scale-[1.02] transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Investment</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  ₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="glass rounded-2xl p-6 hover:glow-green transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Investable Stocks</span>
                </div>
                <p className="text-3xl font-bold text-secondary">
                  {investableCount}
                </p>
              </div>
              <div className="glass rounded-2xl p-6 hover:scale-[1.02] transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-sm text-muted-foreground">Risky Stocks</span>
                </div>
                <p className="text-3xl font-bold text-destructive">{riskyCount}</p>
              </div>
            </div>

            {/* Stocks List */}
            <div className="space-y-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-3xl font-bold text-foreground">Holdings ({bucket.length})</h2>
              {bucket.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center text-muted-foreground border-dashed border-2 border-gray-700">
                    <p className="text-lg font-semibold">Your bucket is empty. Click "Add Stock" to start analyzing!</p>
                </div>
              )}
              {bucket.map((stock, index) => (
                <div
                  key={stock.id}
                  className={cn(
                    "glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] border-l-4",
                    stock.status === "investable"
                      ? "hover:glow-green border-secondary"
                      : "hover:glow border-destructive"
                  )}
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner",
                          stock.status === "investable"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold">{stock.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{(stock.price * stock.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-muted-foreground">Qty: {stock.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="w-10 h-10 rounded-xl glass hover:bg-destructive/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title={`Remove ${stock.symbol}`}
                      >
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </button>
                    </div>
                  </div>
                  {/* Analysis Bars */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{stock.sentiment}%</span>
                        <div className="w-16 h-2 bg-card rounded-full overflow-hidden border border-gray-700/50">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${stock.sentiment}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Technical</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{stock.technical}%</span>
                        <div className="w-16 h-2 bg-card rounded-full overflow-hidden border border-gray-700/50">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${stock.technical}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Fundamental</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{stock.fundamental}%</span>
                        <div className="w-16 h-2 bg-card rounded-full overflow-hidden border border-gray-700/50">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${stock.fundamental}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm",
                      stock.status === "investable"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-destructive/20 text-destructive"
                    )}
                  >
                    {stock.status === "investable" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Strong Investment Candidate
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        High Risk - Review Needed
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Portfolio Footer */}
            <div className="flex justify-center items-center gap-3 text-muted-foreground pt-6">
              <BarChart3 className="w-4 h-4" />
              <p className="text-sm">
                Data shown is simulated for UI purposes • Updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* -------------------- Add Stock Dialog (simple modal) -------------------- */}
          {showAddDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowAddDialog(false)}
              />
              <div className="relative w-full max-w-2xl p-6 dark:bg-gray-900 rounded-2xl glass shadow-2xl z-10 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
                  <h3 className="text-xl font-bold">Add or Update Stock Holding</h3>
                  <button
                    onClick={() => setShowAddDialog(false)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-gray-700 rounded-full transition"
                  >
                    ✕
                  </button>
                </div>
                {/* Fake search */}
                <div className="mb-3">
                  <label className="text-sm text-muted-foreground block mb-1">Search symbol or company</label>
                  <div className="flex gap-2">
                    <input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        onSearchMock(e.target.value);
                      }}
                      className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. HCLTECH, Axis Bank, Titan..."
                    />
                    <button
                      onClick={() => onSearchMock(searchQuery)}
                      className="px-4 rounded-xl bg-primary/10 text-primary font-semibold flex items-center gap-2 hover:bg-primary/20 transition"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {searchResults.map((r) => (
                        <button
                          key={r.symbol}
                          onClick={() => pickSearchResult(r)}
                          className="p-2 rounded-lg text-left hover:bg-muted/20 transition border border-transparent hover:border-primary/50"
                        >
                          <div className="font-semibold text-foreground">{r.symbol}</div>
                          <div className="text-xs text-muted-foreground">{r.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Symbol</label>
                    <input
                      value={form.symbol}
                      onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="RELIANCE"
                      readOnly={!!form.symbol}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Company name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Reliance Industries"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. 1500.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Quantity (Units)</label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                {formError && <p className="text-sm text-destructive mt-3 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {formError}</p>}
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAddDialog(false)}
                    className="px-5 py-2 rounded-xl border border-gray-700 text-white hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addStockFromForm}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold hover:scale-[1.03] transition shadow-lg"
                  >
                    {bucket.some(s => s.symbol === form.symbol.toUpperCase()) ? 'Update Holding' : 'Add to Bucket'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
