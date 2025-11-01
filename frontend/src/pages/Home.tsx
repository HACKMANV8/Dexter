import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, Activity, TrendingUp, DollarSign, Zap } from "lucide-react";

// --- Mock Data Generation ---

const generateChartData = (days, baseValue, volatility = 500, trendFactor = 50) =>
  Array.from({ length: days }, (_, i) => {
    const trend = (i / days) * trendFactor * baseValue;
    const noise = (Math.sin(i / 5) * volatility) + (Math.random() - 0.5) * volatility * 0.5;
    const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(10000, baseValue + trend + noise),
      volume: Math.floor(Math.random() * 800000) + 200000,
      fullDate: date.toISOString(),
    };
  });

// Generate 1 year (365 days) worth of base data (NIFTY 50 baseline)
const fullValueData = generateChartData(365, 20000, 500, 50);

// --- Static Data & Factors ---

// UPDATED: Removed NASDAQ, S&P 500, and DOW JONES
const marketIndices = [
  { name: "NIFTY 50", symbol: "^NSEI", price: 21453.65, change: 234.5, changePercent: 1.1 },
  { name: "SENSEX", symbol: "^BSESN", price: 71431.43, change: 512.3, changePercent: 0.72 },
  { name: "NIFTY BANK", symbol: "^NSEBANK", price: 45234.56, change: 389.23, changePercent: 0.87 },
];

// UPDATED: Removed factors for the removed international indices
const symbolFactors = {
    '^NSEI': { factor: 1.0, volatility: 300, trendOffset: 0 },
    '^BSESN': { factor: 0.95, volatility: 250, trendOffset: 500 },
    '^NSEBANK': { factor: 1.2, volatility: 500, trendOffset: -2000 },
};

const sectorData = [
  { sector: "IT", performance: 2.5, value: 25 },
  { sector: "Banking", performance: 1.8, value: 30 },
  { sector: "Auto", performance: -0.5, value: 15 },
  { sector: "Pharma", performance: 1.2, value: 12 },
  { sector: "Energy", performance: 0.8, value: 18 },
];

const COLORS = ['#38bdf8', '#34d399', '#facc15', '#c084fc', '#fb923c'];

const marketStats = [
  { label: "Market Cap", value: "₹245.8T", change: "+2.3%", icon: DollarSign },
  { label: "Total Volume", value: "156.2M", change: "+5.1%", icon: Activity },
  { label: "Active Stocks", value: "1,847", change: "+12", icon: TrendingUp },
  { label: "52W High", value: "892", change: "+23", icon: Zap },
];

const topGainers = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2456.75, change: 3.24, volume: "2.5M" },
  { symbol: "TCS", name: "Tata Consultancy", price: 3678.50, change: 2.87, volume: "1.8M" },
  { symbol: "INFY", name: "Infosys Limited", price: 1543.20, change: 2.45, volume: "3.1M" },
  { symbol: "HDFC", name: "HDFC Bank", price: 1650.80, change: 2.15, volume: "2.2M" },
  { symbol: "ITC", name: "ITC Limited", price: 425.90, change: 1.89, volume: "4.5M" },
];

const topLosers = [
  { symbol: "ICICI", name: "ICICI Bank", price: 987.45, change: -1.89, volume: "1.9M" },
  { symbol: "AXIS", name: "Axis Bank", price: 1123.78, change: -1.45, volume: "1.5M" },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 785.60, change: -1.23, volume: "3.2M" },
  { symbol: "WIPRO", name: "Wipro Limited", price: 445.60, change: -0.98, volume: "2.1M" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10450.30, change: -0.75, volume: "0.8M" },
];

// --- Sub-Components ---

/**
 * Mock Component for Market Index Card
 * UPDATED: Uses the new selectedPrimaryIndex state
 */
const StockCard = ({ name, symbol, price, change, changePercent, onSelect, isSelected }) => {
  const isPositive = changePercent >= 0;
  const colorClass = isPositive ? 'text-secondary' : 'text-destructive';
  const IconComponent = ArrowUpRight; 

  return (
    <div 
      className={`group glass-sm rounded-2xl p-4 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer 
        ${isSelected ? 'ring-2 ring-primary/80' : 'hover:ring-2 ring-primary/50'}`}
      onClick={() => onSelect(symbol)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold truncate">{name}</h3>
        <IconComponent className={`w-5 h-5 ${colorClass} ${!isPositive ? 'rotate-180' : ''}`} />
      </div>
      <p className="text-2xl font-bold mt-1">₹{price.toLocaleString()}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-sm font-semibold ${colorClass}`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
        <span className="text-sm text-muted-foreground">
          ({isPositive ? '+' : ''}{change.toFixed(2)})
        </span>
      </div>
      {/* Mini Chart Placeholder */}
      <div className="h-12 w-full mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullValueData.slice(-30).map(d => ({ value: d.value + (isPositive ? 0 : -2000) }))}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Mock Component for Header
const Header = () => (
  <header className="sticky top-0 z-10 w-full backdrop-blur-md bg-background/50 border-b border-border/50">
    <div className="max-w-screen-2xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-primary flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">α</div>
        AlphaFusion
      </div>
      <div className="flex items-center gap-4">
        {/* Empty on the right */}
      </div>
    </div>
  </header>
);

// New component for the Line/Area Chart with points joined by a line
const PriceLineChart = ({ data, mainIndexName }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.6}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.6}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    domain={['auto', 'auto']}
                />
                <Tooltip
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value) => [`₹${Math.floor(value).toLocaleString()}`, mainIndexName]}
                    contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--primary-foreground))'
                    }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, opacity: 0.5 }}
                />
                <defs>
                    {/* Gradient for the shaded area */}
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorValue)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }} // Show dots at data points
                    activeDot={{ stroke: 'hsl(var(--primary)', strokeWidth: 2, r: 6 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};


// --- Main App Component ---

export default function App() {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [liveUpdate, setLiveUpdate] = useState(0);
  // Tracks the currently selected index for the primary chart and comparison chart
  const [selectedPrimaryIndex, setSelectedPrimaryIndex] = useState('^NSEI'); // Default to NIFTY 50

  // Live update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate the number of days for the selected period
  const getDaysForPeriod = (period) => {
    switch (period) {
      case '1D': return 10;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      case 'MAX': return fullValueData.length;
      default: return 30;
    }
  };


  // Centralized data calculation using useMemo
  const currentMainData = useMemo(() => {
    const days = getDaysForPeriod(selectedPeriod);
    const slicedData = fullValueData.slice(-days);
    
    // Ensure the selected index still exists after filtering. If not, default to NIFTY 50.
    const validPrimaryIndex = marketIndices.find(i => i.symbol === selectedPrimaryIndex) ? selectedPrimaryIndex : '^NSEI';
    
    const selectedFactor = symbolFactors[validPrimaryIndex] || symbolFactors['^NSEI'];
    const selectedIndexInfo = marketIndices.find(i => i.symbol === validPrimaryIndex) || marketIndices[0];

    // UPDATED LOGIC: If primary index is SENSEX, compare against NIFTY 50. Otherwise, compare against SENSEX.
    const comparisonSymbol = validPrimaryIndex === '^BSESN' ? '^NSEI' : '^BSESN'; 
    const comparisonFactor = symbolFactors[comparisonSymbol];
    const comparisonIndexInfo = marketIndices.find(i => i.symbol === comparisonSymbol);


    const getPrice = (factor, d) => {
         const baseValue = d.value * factor.factor;
         const noise = (Math.random() - 0.5) * (factor.volatility || 0);
         const trendOffset = factor.trendOffset || 0;
         return Math.floor(baseValue + noise + trendOffset);
    };

    return slicedData.map((d) => {
        return {
            date: d.date,
            fullDate: d.fullDate,
            volume: d.volume,
            // Data for the main Area Chart (uses the selected index)
            mainPrice: getPrice(selectedFactor, d),
            mainName: selectedIndexInfo.name,
            
            // Data for the comparison chart
            comparisonPrice: getPrice(comparisonFactor, d),
            comparisonName: comparisonIndexInfo.name,

            // NIFTY 50 reference data (used in comparison chart if selectedPrimaryIndex is not NIFTY 50)
            niftyValue: getPrice(symbolFactors['^NSEI'], d),
        };
    });
  }, [selectedPeriod, selectedPrimaryIndex, liveUpdate]); // Rerun when period or selected index changes

  // Data structure for the Area Chart (Main Chart)
  const mainAreaChartData = currentMainData.map(d => ({
    date: d.date,
    value: d.mainPrice, // Dynamically selected index price
  }));
  
  // Data structure for the Volume Chart (using volume from the base NIFTY data slice)
  const currentVolumeData = currentMainData.map(d => ({ 
    date: d.date, 
    fullDate: d.fullDate, 
    volume: d.volume 
  }));
  
  // Dynamic labels for display
  const mainIndexName = currentMainData.length > 0 ? currentMainData[0].mainName : 'NIFTY 50';
  const comparisonIndexName = currentMainData.length > 0 ? currentMainData[0].comparisonName : 'SENSEX';

  const lastClosePrice = currentMainData.length > 0 ? currentMainData[currentMainData.length - 1].mainPrice : 0;
  const chartXAxisKey = selectedPeriod === '1D' ? 'fullDate' : 'date';

  // Tailwind Utility Classes for Card Look (Darker background)
  const GlassCardStyles = "bg-slate-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-xl";
  const GlassCardStylesSm = "bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-md";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <style>{`
        :root {
          --primary: 222.2 47.4% 100%; /* White */
          --secondary: 142.1 70.6% 45.3%; /* Green */
          --destructive: 0 72.2% 50.6%; /* Red */
          --background: 222.2 47.4% 11.2%; /* Deep background */
          --card: 222.2 47.4% 14.2%; /* Card background */
          --border: 222.2 47.4% 20%;
          --muted-foreground: 222.2 47.4% 65%;
          --primary-foreground: 222.2 47.4% 10%;
        }
        .bg-gray-950 { background-color: hsl(222.2 47.4% 8%); }
        .glass { ${GlassCardStyles} }
        .glass-sm { ${GlassCardStylesSm} }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
      `}</style>

      <Header />
      <div className="max-w-screen-2xl mx-auto py-8 px-4 space-y-8">

        {/* Market Stats Overview */}
        <section className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`${GlassCardStylesSm} p-6 hover:scale-[1.03] transition-all duration-300 transform`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold mb-1 text-white">{stat.value}</p>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-secondary' : 'text-destructive'}`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Market Indices (The Interactive Cards) */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Activity className="w-6 h-6 text-primary" />
            Market Overview
            <span className="ml-2 px-3 py-1 text-xs rounded-full bg-secondary/20 text-secondary font-semibold animate-pulse">LIVE</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {marketIndices.map((index) => (
              <StockCard 
                key={index.symbol} 
                {...index} 
                onSelect={setSelectedPrimaryIndex}
                isSelected={index.symbol === selectedPrimaryIndex}
              />
            ))}
          </div>
        </section>

        {/* Main Price Area Chart with Volume (DYNAMICALLY SELECTED INDEX) */}
        <section className={`${GlassCardStyles} p-6 animate-slide-up`} style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{mainIndexName} Price Action</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Data Period: {selectedPeriod} • Last Close: ₹{Math.floor(lastClosePrice).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0 p-1 bg-gray-900 rounded-xl">
              {['1D', '1W', '1M', '3M', '6M', '1Y', 'MAX'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    hover:bg-primary/20
                    data-[active=true]:bg-primary data-[active=true]:text-primary-foreground text-gray-300"
                  data-active={period === selectedPeriod}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          {/* Main Price Area Chart (Uses the selected index data) */}
          <PriceLineChart data={mainAreaChartData} mainIndexName={mainIndexName} />

          {/* Volume Chart Below (Uses NIFTY 50 volume as proxy) */}
          <div className="mt-6 pt-6 border-t border-border/70">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Trading Volume ({selectedPeriod})</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={currentVolumeData}>
                <XAxis dataKey={chartXAxisKey} hide />
                <YAxis hide />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    color: 'hsl(var(--primary-foreground))'
                  }}
                />
                <Bar dataKey="volume" fill="hsl(var(--secondary))" radius={[3, 3, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Sector Performance & Pie Chart (Unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className={`${GlassCardStyles} p-6`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sector Performance
            </h3>
            <div className="space-y-4">
              {sectorData.map((sector) => (
                <div key={sector.sector} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200">{sector.sector}</span>
                    <span className={`font-bold text-sm ${sector.performance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${sector.performance >= 0 ? 'bg-secondary' : 'bg-destructive'}`}
                      style={{ width: `${Math.abs(sector.performance) * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${GlassCardStyles} p-6`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-primary" />
              Market Distribution
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    fill="#8884d8"
                    labelLine={false}
                    label={({ sector, value, cx, cy, midAngle, outerRadius, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = 25 + outerRadius + (outerRadius - 20) * 0.2;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-semibold text-xs">
                            {`${sector} ${value}%`}
                          </text>
                        );
                      }}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${value}%`, props.payload.sector]}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      color: 'hsl(var(--primary-foreground))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Gainers & Losers (Unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className={`${GlassCardStyles} p-6`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <ArrowUpRight className="w-5 h-5 text-secondary" />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {topGainers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center font-bold text-secondary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-200">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-200">₹{stock.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-secondary font-bold text-sm">+{stock.change}%</span>
                      <span className="text-xs text-muted-foreground">{stock.volume}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${GlassCardStyles} p-6`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <ArrowUpRight className="w-5 h-5 text-destructive rotate-180" />
              Top Losers
            </h3>
            <div className="space-y-3">
              {topLosers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-destructive/20 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/30 flex items-center justify-center font-bold text-destructive">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-200">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-200">₹{stock.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-destructive font-bold text-sm">{stock.change}%</span>
                      <span className="text-xs text-muted-foreground">{stock.volume}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Trend Comparison (DYNAMICALLY SELECTED INDEX vs COMPARISON INDEX) */}
        <section className={`${GlassCardStyles} p-6 animate-slide-up`} style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-primary" />
            Index Comparison ({mainIndexName} vs {comparisonIndexName})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentMainData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" opacity={0.5} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                opacity={0.5}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value, name) => [`₹${Math.floor(value).toLocaleString()}`, name]}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  color: 'hsl(var(--primary-foreground))'
                }}
              />
              {/* Main Selected Index */}
              <Line
                type="monotone"
                dataKey="mainPrice"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                activeDot={{ stroke: 'hsl(var(--primary)', strokeWidth: 2, r: 6 }}
                name={mainIndexName}
              />
              {/* Comparison Index */}
              <Line
                type="monotone"
                dataKey="comparisonPrice" 
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ stroke: 'hsl(var(--secondary)', strokeWidth: 2, r: 6 }}
                name={comparisonIndexName}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
