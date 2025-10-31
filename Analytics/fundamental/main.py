import json
import pandas as pd
import numpy as np

# Use the __init__.py to import the main class
from stock_analyzer import FundamentalAnalyzer

# --- JSON Cleaning Helpers ---
def clean_value(v):
    """Converts numpy/pandas NaN to None, and numpy numbers to python numbers."""
    if pd.isna(v):
        return None
    if isinstance(v, (np.int64, np.int32)):
        return int(v)
    if isinstance(v, (np.float64, np.float32)):
        return float(v)
    return v

def clean_dict(d):
    """Recursively clean a dict of numpy types and NaNs."""
    if not isinstance(d, dict):
        return clean_value(d)
    
    new_dict = {}
    for k, v in d.items():
        if isinstance(v, dict):
            new_dict[k] = clean_dict(v)
        else:
            new_dict[k] = clean_value(v)
    return new_dict

# --- Main execution block ---
if __name__ == '__main__':
    
    # 1. Ask for stock name
    ticker_input = input("Enter stock name (e.g., RELIANCE.NS): ")
    
    if not ticker_input:
        print("No ticker provided. Exiting.")
    else:
        try:
            print(f"Analyzing {ticker_input}...")
            
            # 2. Run the analysis
            fa = FundamentalAnalyzer(ticker_input)
            all_metrics = fa.calculate_all_metrics() # For calculated ratios
            raw_data = fa.data                      # For raw historical data
            
            # 3. Build the specific dictionary you requested
            
            # Market Cap
            market_cap = raw_data['Stock_Price'] * raw_data['Shares_Outstanding']
            
            # Current Debt
            current_debt = raw_data['Total_Debt_Annual'].get('P0')
            
            # Current Assets
            current_assets = raw_data['Total_Assets_Annual'].get('P0')
            
            # Debt on Equity (D/E Ratio)
            debt_on_equity = all_metrics.get('Debt_to_Equity')
            
            # Debt on Assets (D/A Ratio)
            debt_on_assets = all_metrics.get('Debt_to_Asset_T')
            
            # Owner Equity (Total Stockholder Equity)
            owner_equity = raw_data['Shareholders_Equity_Annual'].get('P0')
            
            # 3-Year Debt Analysis
            debt_analysis_3y = {
                'Year_T': raw_data['Total_Debt_Annual'].get('P0'),
                'Year_T_1': raw_data['Total_Debt_Annual'].get('P1'),
                'Year_T_2': raw_data['Total_Debt_Annual'].get('P2')
            }
            
            # 3-Year Profit Analysis
            profit_analysis_3y = {
                'Year_T': raw_data['Net_Income_Annual'].get('P0'),
                'Year_T_1': raw_data['Net_Income_Annual'].get('P1'),
                'Year_T_2': raw_data['Net_Income_Annual'].get('P2')
            }
            
            # Assemble final JSON object
            json_output = {
                'Stock': ticker_input,
                'Market_Cap': market_cap,
                'Current_Debt': current_debt,
                'Current_Assets': current_assets,
                'Debt_on_Equity_Ratio': debt_on_equity,
                'Debt_on_Assets_Ratio': debt_on_assets,
                'Owner_Equity': owner_equity,
                'Debt_Analysis_Last_3_Years': debt_analysis_3y,
                'Profit_Analysis_Last_3_Years': profit_analysis_3y
            }
            
            # Clean the dict of np.nan and numpy types for clean JSON
            json_output_clean = clean_dict(json_output)
            
            # 4. Write to JSON file
            filename = f"{ticker_input.replace('.', '_')}.json"
            
            with open(filename, 'w') as f:
                json.dump(json_output_clean, f, indent=4)
                
            # 5. Output only the success message
            print(f"Success: JSON file created at {filename}")

        except Exception as e:
            # Output only the error message
            print(f"Error: Could not analyze {ticker_input}. Reason: {e}")