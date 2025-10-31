import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import { fetchAnalytics } from "../lib/api";
import { formatINR } from "../lib/utils";

const TREND_SYMBOLS = ["ADANIENT", "BAJFINANCE", "TECHM", "MARUTI", "LTIM"];

export default function TrendsPage() {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    (async () => {
      const fetched = await Promise.all(
        TREND_SYMBOLS.map(async symbol => {
          const technical = await fetchAnalytics("technical", symbol);
          const sentiment = await fetchAnalytics("sentiment", symbol);
          return {
            symbol,
            price: technical.price,
            change: technical.change,
            trendScore: sentiment.score,
            newsCount: sentiment.newsCount,
            analysis: sentiment.analysis,
          };
        })
      );
      setTrends(fetched);
    })();
  }, []);

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      <section>
        <h2>Hot Investment Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map(stock => (
            <div key={stock.symbol} className="glass rounded-2xl p-6">
              <h3>{stock.symbol}</h3>
              <p>{formatINR(stock.price)} ({stock.change})</p>
              <p>Trend Score: {stock.trendScore}</p>
              <p>News Articles: {stock.newsCount}</p>
              <p>Analysis: {stock.analysis}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
