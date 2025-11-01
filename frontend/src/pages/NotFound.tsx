import React from "react";
// Removed useLocation and useEffect imports as they rely on external context (React Router)

const NotFound = () => {
  // Use a static mock object for location since React Router context is missing.
  const location = { pathname: "/non-existent-route-example" };

  // Log the error directly (no longer inside useEffect) for standalone demonstration
  console.error("404 Error: User attempted to access non-existent route:", location.pathname);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex items-center justify-center p-4">
      
      {/* Custom Styles from the main theme for consistency */}
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
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
      
      <div className="glass rounded-2xl px-12 py-16 text-center shadow-2xl border border-red-500/30 animate-fade-in">
        <h1 className="mb-6 text-7xl font-extrabold gradient-text">404</h1>
        <p className="mb-8 text-xl text-gray-400">Oops! The requested page was not found.</p>
        
        {/* Themed Button matching the main app's CTA */}
        <a 
            href="/" 
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg font-bold hover:scale-[1.03] transition"
        >
          Return to Dashboard
        </a>
        
        {/* Themed path display */}
        <div className="mt-8 text-sm text-gray-500">
          <span className="bg-gray-800/50 text-gray-300 px-5 py-2 rounded-full font-semibold shadow border border-gray-700">
            Tried: {location.pathname}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
