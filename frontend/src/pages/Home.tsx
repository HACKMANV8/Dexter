import { useState, useEffect } from "react";
// Import ScatterChart for the wick visualization, as it's the best component for plotting single points
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import { ArrowUpRight, Activity, TrendingUp, TrendingDown, DollarSign, Zap } from "lucide-react";

// --- Mock Data Generation ---

/**
 * Generates Candlestick data (open, close, high, low) from time-series value data.
 * NOTE: This function remains for potential future use, but the main chart now uses raw value data.
 */
const generateCandleData = (data) => {
    return data.map((d, i) => {
        // Use the previous day's close as today's open, with some slight variance
        const open = i > 0 ? data[i - 1].value + (Math.random() * 50 - 25) : d.value - 100;
        const close = d.value;
        
        // Calculate the range for high and low based on the open/close span
        const minVal = Math.min(open, close);
        const maxVal = Math.max(open, close);

        const high = maxVal + Math.random() * 80;
        const low = minVal - Math.random() * 80;

        // Determine if it's a green (up) or red (down) candle
        const isBullish = close >= open;
        
        return {
            date: d.date,
            fullDate: d.fullDate,
            volume: d.volume,
            low: Math.floor(low),
            high: Math.floor(high),
            open: Math.floor(open),
            close: Math.floor(close),
            wickBelow: Math.min(open, close) - Math.floor(low),
            bodySize: Math.abs(open - close),
            isBullish,
        };
    });
};


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

// Generate 1 year (365 days) worth of base data
const fullValueData = generateChartData(365, 20000, 500, 50);
const fullCandleData = generateCandleData(fullValueData); // This is kept but not used by main chart

// --- Static Data ---

const marketIndices = [
  { name: "NIFTY 50", symbol: "^NSEI", price: 21453.65, change: 234.5, changePercent: 1.1 },
  { name: "SENSEX", symbol: "^BSESN", price: 71431.43, change: 512.3, changePercent: 0.72 },
  { name: "NASDAQ", symbol: "^IXIC", price: 15643.12, change: -23.45, changePercent: -0.15 },
  { name: "DOW JONES", symbol: "^DJI", price: 37234.89, change: 156.78, changePercent: 0.42 },
  { name: "NIFTY BANK", symbol: "^NSEBANK", price: 45234.56, change: 389.23, changePercent: 0.87 },
  { name: "S&P 500", symbol: "^GSPC", price: 4783.23, change: 45.12, changePercent: 0.95 },
];

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

// Mock Component for Market Index Card
const StockCard = ({ name, symbol, price, change, changePercent }) => {
  const isPositive = changePercent >= 0;
  const colorClass = isPositive ? 'text-secondary' : 'text-destructive';
  const icon = isPositive ? ArrowUpRight : ArrowUpRight;

  return (
    <div className="group glass-sm rounded-2xl p-4 hover:ring-2 ring-primary/50 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold truncate">{name}</h3>
        <icon className={`w-5 h-5 ${colorClass} ${!isPositive ? 'rotate-180' : ''}`} />
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
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <Activity className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">
          U
        </button>
      </div>
    </div>
  </header>
);

// New component for the Line/Area Chart with points joined by a line
const PriceLineChart = ({ data }) => {
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
                    formatter={(value) => [`₹${Math.floor(value).toLocaleString()}`, 'Price']}
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

  // Live update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to filter data based on selected period and add mock SENSEX data
  const getFilteredDataSlice = (dataToSlice) => {
    let days;
    switch (selectedPeriod) {
      case '1D': days = 10; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '6M': days = 180; break;
      case '1Y': days = 365; break;
      case 'MAX': days = dataToSlice.length; break;
      default: days = 30; break;
    }
    const slicedData = dataToSlice.slice(-days);
    
    // Add mocked SENSEX data to the sliced NIFTY data
    return slicedData.map(d => ({
        ...d,
        // Mock SENSEX to be ~5% lower than NIFTY and slightly less volatile
        sensexValue: Math.floor(d.value * 0.95 + (Math.random() * 100))
    }));
  };

  // Use the simple value data for the main chart now
  const currentPriceData = getFilteredDataSlice(fullValueData);

  // Map the volume data from the same slice
  const currentVolumeData = currentPriceData.map(d => ({
    date: d.date,
    volume: d.volume,
  }));
  const chartXAxisKey = selectedPeriod === '1D' ? 'fullDate' : 'date';

  // Last price needs to come from the line chart data now.
  const lastClosePrice = currentPriceData.length > 0 ? currentPriceData[currentPriceData.length - 1].value : 0;
  
  // Tailwind Utility Classes for Card Look (Darker background)
  const GlassCardStyles = "bg-slate-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-xl";
  const GlassCardStylesSm = "bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-md";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Updated Styles for a Dark Theme */}
      <style>{`
        :root {
          --primary: 222.2 47.4% 100%; /* For headers, primary actions - White */
          --secondary: 142.1 70.6% 45.3%; /* Green for gains/bullish */
          --destructive: 0 72.2% 50.6%; /* Red for losses/bearish */
          --background: 222.2 47.4% 11.2%; /* Deep background */
          --card: 222.2 47.4% 14.2%; /* Card background */
          --border: 222.2 47.4% 20%;
          --muted-foreground: 222.2 47.4% 65%; /* Light gray text */
          --primary-foreground: 222.2 47.4% 10%; /* Dark text on primary */
        }
        .bg-gray-950 { background-color: hsl(222.2 47.4% 8%); }
        .glass { ${GlassCardStyles} }
        .glass-sm { ${GlassCardStylesSm} }
        /* Simple animation styles */
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

        {/* Market Indices */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Activity className="w-6 h-6 text-primary" />
            Market Overview
            <span className="ml-2 px-3 py-1 text-xs rounded-full bg-secondary/20 text-secondary font-semibold animate-pulse">LIVE</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {marketIndices.map((index) => (
              <StockCard key={index.symbol} {...index} />
            ))}
          </div>
        </section>

        {/* Main Price Line Chart with Volume */}
        <section className={`${GlassCardStyles} p-6 animate-slide-up`} style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">NIFTY 50 Price Action</h2>
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
          
          {/* Main Price Line Chart */}
          <PriceLineChart data={currentPriceData} />

          {/* Volume Chart Below */}
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

        {/* Sector Performance & Pie Chart (Omitted for brevity, using original content) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Sector Performance */}
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
          {/* Market Distribution */}
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

        {/* Top Gainers & Losers (Omitted for brevity, using original content) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {/* Top Gainers */}
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
          {/* Top Losers */}
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

        {/* Market Trend Comparison - UPDATED */}
        <section className={`${GlassCardStyles} p-6 animate-slide-up`} style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-primary" />
            Index Comparison (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentPriceData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" opacity={0.5} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                opacity={0.5}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => `₹${Math.floor(value).toLocaleString()}`}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  color: 'hsl(var(--primary-foreground))'
                }}
              />
              {/* NIFTY 50 - Primary (White/Light) and Thicker */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                activeDot={{ stroke: 'hsl(var(--primary)', strokeWidth: 2, r: 6 }}
                name="NIFTY 50"
              />
              {/* SENSEX - Secondary (Green) and Distinct */}
              <Line
                type="monotone"
                dataKey="sensexValue" 
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--secondary))', r: 3 }}
                activeDot={{ stroke: 'hsl(var(--secondary)', strokeWidth: 2, r: 6 }}
                name="SENSEX"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
