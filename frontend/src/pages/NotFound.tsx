import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-black animate-fade-in">
      <div className="glass rounded-2xl px-12 py-16 text-center shadow-xl">
        <h1 className="mb-6 text-6xl font-extrabold gradient-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold hover:bg-blue-700 transition">
          Return to Home
        </a>
        <div className="mt-8 text-sm text-muted-foreground">
          <span className="bg-secondary/20 text-secondary px-5 py-2 rounded-full font-semibold shadow">Tried: {location.pathname}</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
