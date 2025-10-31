import { useState } from "react";
import Header from "@/components/Header";
import {
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BucketStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  sentiment: number; // 0-100
  technical: number; // 0-100
  fundamental: number; // 0-100
  status: "investable" | "risky";
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeFakeMetrics(typeHint?: string) {
  // Slightly bias metrics by typeHint to feel realistic
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

  return {
    sentiment,
    technical,
    fundamental,
  };
}

function computeStatus(sentiment: number, technical: number, fundamental: number) {
  // simple heuristic: average > 60 => investable, else risky
  const avg = (sentiment + technical + fundamental) / 3;
  return avg >= 60 ? "investable" : "risky";
}

export default function BucketPage() {
  // initial fake bucket — expanded list for demo + variety
  const [bucket, setBucket] = useState<BucketStock[]>(
    [
      {
        id: "1",
        symbol: "RELIANCE",
        name: "Reliance Industries",
        price: 2456.75,
        quantity: 10,
        ...makeFakeMetrics("energy"),
        status: "investable",
      },
      {
        id: "2",
        symbol: "TCS",
        name: "Tata Consultancy Services",
        price: 3678.5,
        quantity: 5,
        ...makeFakeMetrics("tech"),
        status: "investable",
      },
      {
        id: "3",
        symbol: "ICICI",
        name: "ICICI Bank",
        price: 987.45,
        quantity: 15,
        ...makeFakeMetrics("bank"),
        status: "risky",
      },
      {
        id: "4",
        symbol: "INFY",
        name: "Infosys Ltd",
        price: 1560.2,
        quantity: 12,
        ...makeFakeMetrics("tech"),
        status: "investable",
      },
      {
        id: "5",
        symbol: "HDFC",
        name: "HDFC Bank",
        price: 1520.4,
        quantity: 8,
        ...makeFakeMetrics("bank"),
        status: "investable",
      },
      {
        id: "6",
        symbol: "ITC",
        name: "ITC Ltd",
        price: 458.1,
        quantity: 30,
        ...makeFakeMetrics("fmcg"),
        status: "investable",
      },
      {
        id: "7",
        symbol: "ADANIPOWER",
        name: "Adani Power",
        price: 563.7,
        quantity: 20,
        ...makeFakeMetrics("energy"),
        status: "risky",
      },
      {
        id: "8",
        symbol: "MARUTI",
        name: "Maruti Suzuki",
        price: 8300.0,
        quantity: 2,
        ...makeFakeMetrics("auto"),
        status: "investable",
      },
      {
        id: "9",
        symbol: "BHARTI",
        name: "Bharti Airtel",
        price: 825.25,
        quantity: 7,
        ...makeFakeMetrics("telecom"),
        status: "investable",
      },
    ].map((s) => ({
      // ensure status matches generated metrics for realism
      ...s,
      status: computeStatus(s.sentiment, s.technical, s.fundamental),
    }))
  );

  // Add dialog state & form
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { symbol: string; name: string; hint?: string }[]
  >([]);
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    price: "",
    quantity: "1",
  });
  const [formError, setFormError] = useState("");

  const totalInvestment = bucket.reduce(
    (sum, stock) => sum + stock.price * stock.quantity,
    0
  );
  const investableCount = bucket.filter((s) => s.status === "investable").length;
  const riskyCount = bucket.filter((s) => s.status === "risky").length;

  function removeStock(id: string) {
    const stock = bucket.find((b) => b.id === id);
    const ok = window.confirm(
      `Delete ${stock?.symbol ?? "this stock"} from bucket? This cannot be undone.`
    );
    if (!ok) return;
    setBucket((prev) => prev.filter((s) => s.id !== id));
  }

  function openAddDialog() {
    setSearchQuery("");
    setSearchResults([]);
    setForm({ symbol: "", name: "", price: "", quantity: "1" });
    setFormError("");
    setShowAddDialog(true);
  }

  function onSearchMock(q: string) {
    // Fake "search" results (simulate lookup)
    const qUp = q.trim().toUpperCase();
    if (!qUp) {
      setSearchResults([]);
      return;
    }

    // Some canned suggestions, filter by query
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

    // If no matches, show a few suggestions anyway
    setSearchResults(matches.length > 0 ? matches : pool.slice(0, 6));
  }

  function pickSearchResult(r: { symbol: string; name: string; hint?: string }) {
    setForm({
      symbol: r.symbol,
      name: r.name,
      price: (randomInt(100, 5000) + Math.random() * 100).toFixed(2),
      quantity: "1",
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
    if (!Number.isInteger(qty) || qty <= 0) return "Enter a valid quantity";
    return "";
  }

  function addStockFromForm() {
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError("");

    // create stock with fake metrics
    const typeHint =
      form.name.toLowerCase().includes("bank")
        ? "bank"
        : form.name.toLowerCase().includes("tech")
        ? "tech"
        : form.name.toLowerCase().includes("unilever") || form.name.toLowerCase().includes("titan")
        ? "fmcg"
        : undefined;
    const metrics = makeFakeMetrics(typeHint);

    const price = Number(Number(form.price).toFixed(2));
    const quantity = Math.max(1, Math.floor(Number(form.quantity)));

    const status = computeStatus(metrics.sentiment, metrics.technical, metrics.fundamental);
    const newStock: BucketStock = {
      id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      symbol: form.symbol.toUpperCase(),
      name: form.name,
      price,
      quantity,
      sentiment: metrics.sentiment,
      technical: metrics.technical,
      fundamental: metrics.fundamental,
      status,
    };

    setBucket((prev) => [newStock, ...prev]);
    setShowAddDialog(false);
  }

  return (
    <div className="min-h-screen animate-fade-in bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <Header />

      <div className="p-8 space-y-10">
        {/* Header Section */}
        <div className="flex items-start justify-between animate-slide-up">
          <div>
            <h1 className="text-5xl font-extrabold gradient-text mb-3">
              My Smart Bucket
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered insights on your portfolio’s performance (simulated data)
            </p>
          </div>
          <button
            onClick={openAddDialog}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 glow-violet"
          >
            <Plus className="w-5 h-5" />
            Add Stock
          </button>
        </div>

        {/* Stats Overview */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="glass rounded-2xl p-6 hover:scale-[1.02] transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Total Investment
              </span>
            </div>
            <p className="text-3xl font-bold text-primary">
              ₹{totalInvestment.toLocaleString()}
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:glow-green transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Investable Stocks
              </span>
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
              <span className="text-sm text-muted-foreground">
                Risky Stocks
              </span>
            </div>
            <p className="text-3xl font-bold text-destructive">{riskyCount}</p>
          </div>
        </div>

        {/* Stocks List */}
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
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
                    <p className="text-2xl font-bold">₹{stock.price.toLocaleString()}</p>
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
                    <div className="w-16 h-2 bg-card rounded-full overflow-hidden">
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
                    <div className="w-16 h-2 bg-card rounded-full overflow-hidden">
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
                    <div className="w-16 h-2 bg-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${stock.fundamental}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Tag */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddDialog(false)}
          />
          <div className="relative w-full max-w-2xl p-6 bg-white dark:bg-gray-900 rounded-2xl glass shadow-2xl z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add a Stock to Bucket</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Fake search */}
            <div className="mb-3">
              <label className="text-sm text-muted-foreground">Search symbol or company</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearchMock(e.target.value);
                  }}
                  className="w-full input"
                  placeholder="e.g. HCLTECH, Axis Bank, Titan..."
                />
                <button
                  onClick={() => onSearchMock(searchQuery)}
                  className="px-4 rounded-xl bg-primary/10 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {searchResults.map((r) => (
                    <button
                      key={r.symbol}
                      onClick={() => pickSearchResult(r)}
                      className="p-2 rounded-lg text-left hover:bg-muted/20 transition"
                    >
                      <div className="font-semibold">{r.symbol}</div>
                      <div className="text-xs text-muted-foreground">{r.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Symbol</label>
                <input
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  className="w-full input mt-2"
                  placeholder="RELIANCE"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Company name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full input mt-2"
                  placeholder="Reliance Industries"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Price (₹)</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full input mt-2"
                  placeholder="e.g. 1500.00"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Quantity</label>
                <input
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full input mt-2"
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-destructive mt-3">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={addStockFromForm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold"
              >
                Add to Bucket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
