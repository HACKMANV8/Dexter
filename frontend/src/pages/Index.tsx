import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex items-center justify-center p-4">
      
      {/* Custom Styles from StockBucketApp.jsx for consistent theming */}
      <style>{`
        /* Define color variables used in the main app */
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
      `}</style>
      
      <div className="text-center p-8 rounded-xl">
        <h1 className="mb-4 text-5xl font-extrabold gradient-text">
          Fusion Dashboard Ready
        </h1>
        <p className="text-xl text-gray-400">
          Analytics are loaded. Navigate to the main application view to begin.
        </p>
      </div>
    </div>
  );
};

export default Index;
