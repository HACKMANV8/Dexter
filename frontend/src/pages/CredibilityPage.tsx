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

// Sample stock database with 15 stocks
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
    status: "investable"
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
    status: "investable"
  }
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-screen-md mx-auto py-8 px-2">
        <h1 className="text-2xl font-bold mb-4">My Stock Bucket</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowAddDialog(true)}>Add Stock</button>
        <div className="my-6 grid gap-4">
          {bucket.map(stock => (
            <div key={stock.id} className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold">{stock.symbol} - {stock.name}</div>
                <div>₹{stock.price} x {stock.quantity}</div>
                <div>Sentiment: {stock.sentiment} | Tech: {stock.technical} | Fund: {stock.fundamental} | Status: <b>{stock.status}</b></div>
              </div>
              <button onClick={() => removeStock(stock.id)} className="ml-4 px-2 py-1 bg-red-500 text-white rounded">Remove</button>
            </div>
          ))}
        </div>

        {/* Add Stock Dialog with Search */}
        {showAddDialog && (
          <div className="fixed z-10 left-0 top-0 w-full h-full flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl min-w-[400px] max-h-[80vh] overflow-y-auto">
              <h2 className="mb-4 font-bold text-xl">Add Stock to Bucket</h2>
              
              {/* Search Box */}
              <input 
                type="text" 
                placeholder="Search by symbol or name..." 
                className="border px-3 py-2 mb-3 w-full rounded" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />

              {/* Stock List */}
              <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedStock?.symbol === stock.symbol
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{stock.symbol}</p>
                          <p className="text-sm text-gray-600">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{stock.price.toLocaleString()}</p>
                          <div className="flex gap-2 text-xs mt-1">
                            <span className={stock.sentiment >= 70 ? "text-green-600" : "text-red-600"}>
                              S: {stock.sentiment}%
                            </span>
                            <span className={stock.technical >= 70 ? "text-green-600" : "text-red-600"}>
                              T: {stock.technical}%
                            </span>
                            <span className={stock.fundamental >= 70 ? "text-green-600" : "text-red-600"}>
                              F: {stock.fundamental}%
                            </span>
                          </div>
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
                    className="border px-3 py-2 w-full rounded" 
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)} 
                    min="1"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={addStock}
                  disabled={!selectedStock || !quantity}
                >
                  Add to Bucket
                </button>
                <button 
                  className="bg-gray-300 px-4 py-2 rounded" 
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