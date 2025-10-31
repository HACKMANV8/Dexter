import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="glass border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold gradient-text">AlphaFusion</h1>
        <span className="text-xs text-muted-foreground px-3 py-1 rounded-full glass">
          v1.0 Beta
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl glass hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
        </button>
        <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-all duration-300 hover:scale-110 glow-violet">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
