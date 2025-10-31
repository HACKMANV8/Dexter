import React, { useState, useEffect } from "react";
import Header from "../components/ui/Header";
import { fetchAnalytics } from "../lib/api";
import { formatINR, getScoreColor, getRecommendationColor } from "../lib/utils";

const STOCK_SYMBOLS = ["RELIANCE", "TCS", "INFY", "HDFC", "ICICI"];

export default function SearchPage() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.all(
        STOCK_SYMBOLS.map(async symbol => {
          const sentiment = await fetchAnalytics("sentiment", symbol);
          const technical = await fetchAnalytics("technical", symbol);
          const fundamental = await fetchAnalytics("fundamental", symbol);
          const overall = Math.round((sentiment.score + technical.score + fundamental.score) / 3);
          const recommendation = overall > 70 ? "buy" : overall > 50 ? "hold" : "sell";
          return {
            symbol,
            name: sentiment.name || symbol,
            price: technical.price || fundamental.price,
            sentiment: sentiment.score,
            technical: technical.score,
            fundamental: fundamental.score,
            overall,
            recommendation,
          };
        })
      );
      setStocks(results);
    }
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map(stock => (
          <div key={stock.symbol} className={`glass rounded-xl p-6 border ${getRecommendationColor(stock.recommendation)}`}>
            <h3>{stock.symbol}</h3>
            <p>{stock.name}</p>
            <p>{formatINR(stock.price)}</p>
            <p className={getScoreColor(stock.sentiment)}>Sentiment: <b>{stock.sentiment}</b></p>
            <p className={getScoreColor(stock.technical)}>Technical: <b>{stock.technical}</b></p>
            <p className={getScoreColor(stock.fundamental)}>Fundamental: <b>{stock.fundamental}</b></p>
            <p className={getScoreColor(stock.overall)}>Overall: <b>{stock.overall}</b></p>
            <span>{stock.recommendation.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
