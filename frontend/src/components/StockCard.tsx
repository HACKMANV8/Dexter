import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  sparklineData?: number[];
}

export default function StockCard({ name, symbol, price, change, changePercent }: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="glass rounded-2xl p-4 hover:scale-105 transition-all duration-300 hover:glow-violet group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{symbol}</p>
        </div>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-secondary" />
        ) : (
          <TrendingDown className="w-5 h-5 text-destructive" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold">₹{price.toLocaleString()}</p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              isPositive ? "text-secondary" : "text-destructive"
            )}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}
          </span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-secondary/20 text-secondary"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Mini sparkline simulation */}
      <div className="mt-3 h-8 flex items-end gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t transition-all duration-300",
              isPositive ? "bg-secondary/30" : "bg-destructive/30"
            )}
            style={{
              height: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
