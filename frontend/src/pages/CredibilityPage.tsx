import React, { useState } from "react";
import Header from "../components/ui/Header";

interface BucketStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  sentiment: number;
  technical: number;
  fundamental: number;
  status: string;
}

const stockDatabase = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2456.75, sentiment: 85, technical: 78, fundamental: 92 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3678.50, sentiment: 88, technical: 82, fundamental: 89 },
  { symbol: "INFY", name: "Infosys Limited", price: 1456.30, sentiment: 82, technical: 75, fundamental: 88 },
  { symbol: "HDFC", name: "HDFC Bank", price: 1650.80, sentiment: 90, technical: 85, fundamental: 92 },
  { symbol: "ICICI", name: "ICICI Bank", price: 987.45, sentiment: 45, technical: 42, fundamental: 55 },
  { symbol: "WIPRO", name: "Wipro Limited", price: 445.60, sentiment: 70, technical: 68, fundamental: 72 },
  { symbol: "ITC", name: "ITC Limited", price: 425.90, sentiment: 78, technical: 80, fundamental: 85 },
  { symbol: "BHARTI", name: "Bharti Airtel", price: 1320.45, sentiment: 88, technical: 82, fundamental: 86 },
  { symbol: "ASIAN", name: "Asian Paints", price: 2890.75, sentiment: 75, technical: 72, fundamental: 80 },
  { symbol: "HCLTECH", name: "HCL Technologies", price: 1234.50, sentiment: 80, technical: 78, fundamental: 83 },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10450.30, sentiment: 65, technical: 62, fundamental: 70 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1756.90, sentiment: 85, technical: 88, fundamental: 90 },
  { symbol: "SBIN", name: "State Bank of India", price: 625.40, sentiment: 72, technical: 70, fundamental: 75 },
  { symbol: "AXISBANK", name: "Axis Bank", price: 1045.80, sentiment: 68, technical: 65, fundamental: 72 },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 785.60, sentiment: 55, technical: 52, fundamental: 60 },
];

const INITIAL_BUCKET: BucketStock[] = [
  {
    id: "1",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 2456.75,
    quantity: 2,
    sentiment: 80,
    technical: 75,
    fundamental: 78,
    status: "investable",
  },
  {
    id: "2",
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3678.5,
    quantity: 1,
    sentiment: 65,
    technical: 68,
    fundamental: 64,
    status: "investable",
  },
];

export default function BucketPage() {
  const [bucket, setBucket] = useState<BucketStock[]>(INITIAL_BUCKET);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<typeof stockDatabase[0] | null>(null);
  const [quantity, setQuantity] = useState('');

  const removeStock = (id: string) => {
    setBucket(bucket.filter((stock) => stock.id !== id));
  };

  const addStock = () => {
    if (!selectedStock || !quantity) {
      alert('Please select a stock and enter quantity');
      return;
    }
    const avgScore = (selectedStock.sentiment + selectedStock.technical + selectedStock.fundamental) / 3;
    const stock: BucketStock = {
      id: Date.now().toString(),
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      price: selectedStock.price,
      quantity: parseInt(quantity),
      sentiment: selectedStock.sentiment,
      technical: selectedStock.technical,
      fundamental: selectedStock.fundamental,
      status: avgScore >= 65 ? 'investable' : 'risky',
    };
    setBucket([...bucket, stock]);
    setSelectedStock(null);
    setQuantity('');
    setSearchQuery('');
    setShowAddDialog(false);
  };

  const filteredStocks = stockDatabase.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <Header />
      <div className="max-w-screen-lg mx-auto py-8 px-4">
        {/* Header/Stats */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold gradient-text mb-3">My Stock Bucket</h1>
          <button 
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-white shadow-lg hover:scale-105 transition glow-violet"
            onClick={() => setShowAddDialog(true)}
          >
            Add Stock
          </button>
        </div>

        {/* Stocks */}
        <div className="my-6 grid gap-6">
          {bucket.map(stock => (
            <div 
              key={stock.id} 
              className={`glass rounded-2xl p-6 flex justify-between items-center border-l-4 ${stock.status === "investable"
                ? "border-green-500 hover:glow-green"
                : "border-red-500 hover:glow"}`}
            >
              <div>
                <div className="font-semibold text-xl">
                  {stock.symbol} <span className="text-slate-400 text-base">- {stock.name}</span>
                </div>
                <div className="text-lg font-bold mt-2 text-blue-700 dark:text-blue-300">₹{stock.price} × {stock.quantity}</div>
                <div className="flex gap-4 text-sm mt-2">
                  <span className={stock.sentiment >= 70 ? "text-green-600" : "text-red-600"}>Sent: {stock.sentiment}%</span>
                  <span className={stock.technical >= 70 ? "text-green-600" : "text-red-600"}>Tech: {stock.technical}%</span>
                  <span className={stock.fundamental >= 70 ? "text-green-600" : "text-red-600"}>Fund: {stock.fundamental}%</span>
                  <span className={stock.status === "investable" ? "bg-green-50 text-green-600 px-3 py-1 rounded-full font-semibold" : "bg-red-50 text-red-600 px-3 py-1 rounded-full font-semibold"}>{stock.status}</span>
                </div>
              </div>
              <button 
                onClick={() => removeStock(stock.id)}
                className="ml-6 px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:scale-110 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add Stock Modal */}
        {showAddDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-md p-7 bg-white dark:bg-gray-900 rounded-2xl glass shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl">Add Stock to Bucket</h2>
                <button className="text-xl" onClick={() => {
                  setShowAddDialog(false);
                  setSelectedStock(null);
                  setQuantity('');
                  setSearchQuery('');
                }}>✕</button>
              </div>
              {/* Search Box */}
              <input
                type="text"
                placeholder="Search by symbol or name..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white dark:bg-gray-800 text-slate-900 dark:text-white outline-none mb-4 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {/* Stock List */}
              <div className="max-h-56 overflow-y-auto mb-4 space-y-2">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`border rounded-xl px-4 py-3 cursor-pointer transition-all flex justify-between items-center ${selectedStock?.symbol === stock.symbol ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 hover:border-blue-400'}`}
                    >
                      <div>
                        <p className="font-bold text-base">{stock.symbol}</p>
                        <p className="text-xs text-slate-500">{stock.name}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-blue-600 dark:text-blue-300">₹{stock.price.toLocaleString()}</p>
                        <div className="flex gap-2 text-xs">
                          <span className={stock.sentiment >= 70 ? "text-green-700" : "text-red-700"}>S: {stock.sentiment}%</span>
                          <span className={stock.technical >= 70 ? "text-green-700" : "text-red-700"}>T: {stock.technical}%</span>
                          <span className={stock.fundamental >= 70 ? "text-green-700" : "text-red-700"}>F: {stock.fundamental}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No stocks found</p>
                )}
              </div>
              {/* Quantity Input */}
              {selectedStock && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={addStock}
                  disabled={!selectedStock || !quantity}
                >
                  Add to Bucket
                </button>
                <button
                  className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl shadow"
                  onClick={() => {
                    setShowAddDialog(false);
                    setSelectedStock(null);
                    setQuantity('');
                    setSearchQuery('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
