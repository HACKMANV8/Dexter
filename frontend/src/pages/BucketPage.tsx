import { useState } from "react";
import Header from "@/components/Header";
import { Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BucketStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  sentiment: number;
  technical: number;
  fundamental: number;
  status: 'investable' | 'risky';
}

export default function BucketPage() {
  const [bucket, setBucket] = useState<BucketStock[]>([
    {
      id: "1",
      symbol: "RELIANCE",
      name: "Reliance Industries",
      price: 2456.75,
      quantity: 10,
      sentiment: 85,
      technical: 78,
      fundamental: 92,
      status: 'investable',
    },
    {
      id: "2",
      symbol: "TCS",
      name: "Tata Consultancy Services",
      price: 3678.50,
      quantity: 5,
      sentiment: 88,
      technical: 82,
      fundamental: 89,
      status: 'investable',
    },
    {
      id: "3",
      symbol: "ICICI",
      name: "ICICI Bank",
      price: 987.45,
      quantity: 15,
      sentiment: 45,
      technical: 42,
      fundamental: 55,
      status: 'risky',
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);

  const removeStock = (id: string) => {
    setBucket(bucket.filter((stock) => stock.id !== id));
  };

  const totalInvestment = bucket.reduce((sum, stock) => sum + stock.price * stock.quantity, 0);
  const investableCount = bucket.filter((s) => s.status === 'investable').length;
  const riskyCount = bucket.filter((s) => s.status === 'risky').length;

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />

      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-start justify-between animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">My Bucket</h1>
            <p className="text-muted-foreground">Track and analyze your stock portfolio</p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 glow-violet"
          >
            <Plus className="w-5 h-5" />
            Add Stock
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Investment</span>
            </div>
            <p className="text-3xl font-bold">₹{totalInvestment.toLocaleString()}</p>
          </div>

          <div className="glass rounded-2xl p-6 hover:glow-green transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Investable Stocks</span>
            </div>
            <p className="text-3xl font-bold text-secondary">{investableCount}</p>
          </div>

          <div className="glass rounded-2xl p-6">
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
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {bucket.map((stock, index) => (
            <div
              key={stock.id}
              className={cn(
                "glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]",
                stock.status === 'investable' ? "hover:glow-green border-l-4 border-secondary" : "hover:glow border-l-4 border-destructive"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl",
                    stock.status === 'investable' ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
                  )}>
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{stock.symbol}</h3>
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
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Analysis Scores */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="glass rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{stock.sentiment}%</span>
                    <div className="w-12 h-2 bg-card rounded-full overflow-hidden">
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
                    <div className="w-12 h-2 bg-card rounded-full overflow-hidden">
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
                    <div className="w-12 h-2 bg-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${stock.fundamental}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold",
                stock.status === 'investable'
                  ? "bg-secondary/20 text-secondary"
                  : "bg-destructive/20 text-destructive"
              )}>
                {stock.status === 'investable' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Strong Investment Candidate
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    High Risk - Consider Reviewing
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
