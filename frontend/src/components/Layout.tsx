import { Home, Search, FolderOpen, TrendingUp, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: FolderOpen, label: "My Bucket", path: "/bucket" },
  { icon: TrendingUp, label: "Tips & Trends", path: "/trends" },
  { icon: Shield, label: "Credibility", path: "/credibility" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-20 glass border-r border-white/5 flex flex-col items-center py-8 gap-8 fixed left-0 top-0 h-screen z-50">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-xl glow-violet">
            α
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  "hover:bg-primary/20 hover:scale-110 group relative",
                  isActive && "bg-primary/30 glow-violet"
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-20 px-3 py-1.5 glass rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20">
        {children}
      </main>
    </div>
  );
}
