import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import { fetchAnalytics } from "../lib/api";
import { formatINR } from "../lib/utils";

const INDICES = [
  { name: "NIFTY 50", symbol: "NSEI" },
  { name: "SENSEX", symbol: "BSESN" },
  { name: "NASDAQ", symbol: "IXIC" },
  { name: "DOW JONES", symbol: "DJI" },
  { name: "NIFTY BANK", symbol: "NSEBANK" },
  { name: "S&P 500", symbol: "GSPC" },
];

export default function Home() {
  const [indices, setIndices] = useState([]);

  useEffect(() => {
    (async () => {
      const fetched = await Promise.all(
        INDICES.map(async idx => {
          const fundamental = await fetchAnalytics("fundamental", idx.symbol);
          return {
            ...idx,
            price: fundamental.price,
            change: fundamental.change,
            changePercent: fundamental.changePercent,
          };
        })
      );
      setIndices(fetched);
    })();
  }, []);

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      <section>
        <h2>Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indices.map(idx => (
            <div key={idx.symbol} className="glass p-4 rounded-xl">
              <h3>{idx.name}</h3>
              <p>{formatINR(idx.price)} ({idx.change} / {idx.changePercent}%)</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
