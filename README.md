<<<<<<< HEAD
# Dexter
# AlphaFusion — AI-Driven Investment Intelligence Platform

AlphaFusion is a comprehensive AI-powered investment intelligence system that aggregates and intelligently scores market data from multiple sources to improve stock trading decisions.  
It provides investors with consolidated Buy / Hold / Exit signals, helping them avoid information overload while managing portfolio risk through predictive insights.

---

## Overview

AlphaFusion unifies three major analyses into a single composite weighted score, offering a clear and holistic view of stock performance:

| Analysis Type | Weight | Description |
|----------------|---------|-------------|
| Technical Analysis | 50% | Evaluates trend strength, momentum, and volatility. |
| Fundamental Analysis | 30% | Assesses company financials, growth, and intrinsic value. |
| Sentiment Analysis | 20% | Captures investor mood from financial news and social media. |

This composite score provides an intelligent and easily interpretable signal for investors.

---

## Smart Stop System

AlphaFusion introduces a proprietary Smart Stop System — an advanced intelligent stop-loss mechanism that combines rule-based and anomaly-detection machine learning logic.

It continuously monitors market patterns to:
- Detect early bearish signals before they lead to major losses  
- Issue proactive Exit or Tighten Stop alerts  
- Reduce emotional bias in trade decisions  

---

## Technical Stack

| Component | Technologies |
|------------|---------------|
| Backend / ML Engine | Python, Pandas, NumPy, XGBoost |
| Visualization & Dashboard | Streamlit, Plotly |
| Configuration / Modularity | JSON, YAML |
| Version Control / Testing | GitHub, Pytest, Historical Backtesting |

---

## Modularity and Validation

- Configurable architecture using external JSON/YAML files  
- Users can adjust score weights, thresholds, and alert limits  
- Tested extensively on historical market data  
- Targeting over 70% accuracy in predictive performance  

---

## Impact

| Impact Area | Expected Improvement |
|--------------|----------------------|
| Risk Detection | 70%+ Accuracy |
| Portfolio Loss Reduction | 20–30% Lower Losses |
| Decision Confidence | Improved clarity through unified signals |

AlphaFusion aims to deliver institutional-grade intelligence to retail investors, automating risk detection and improving decision-making efficiency.

---

## Repository Structure

=======
Stock Fundamental Analyzer

This project analyzes a list of stocks from the NIFTY 50, NIFTY NEXT 50, and SENSEX 30, providing a fundamental analysis score and a Buy/Hold/Sell recommendation for each.

Setup

Ensure you have Python 3 installed.

Install the required packages:

pip install -r requirements.txt


How to Run

Simply run the main.py script from your terminal:

python main.py


The script will take several minutes to run as it fetches data for over 100 stocks. It will print a clean report to your console. You can stop it at any time by pressing Ctrl+C.
>>>>>>> 8d5986b (Initial commit of stock analysis tool)
