# signals.py
# Contains functions for generating final signals and stop-loss.

import pandas as pd
from config import ANOMALY_Z_THRESHOLD

def recommend_signal(score, confidence, latest, breakdown):
    if score < 30:
        signal = "EXIT"
    elif score < 45:
        signal = "TIGHTEN_STOP"
    elif score < 60:
        signal = "HOLD"
    else:
        signal = "BUY"
    
    ret_z = latest.get("RET_Z", 0)
    vol_z = latest.get("VOL_Z", 0)
    if abs(ret_z) > ANOMALY_Z_THRESHOLD or abs(vol_z) > ANOMALY_Z_THRESHOLD:
        if signal == "BUY":
            signal = "TIGHTEN_STOP"
        elif signal == "HOLD":
            signal = "VIGILANCE_HIGH_VOL"
        elif signal == "TIGHTEN_STOP" or signal == "EXIT":
            signal = "EXIT_ANOMALY"
    
    if confidence < 0.35 and signal == "BUY":
        signal = "HOLD"
    return signal


def smart_stop(latest, signal):
    # <-- FIX: Ensure price is accessed safely as a float
    price = latest.get("Close", 0.0) 
    if price <= 0: # If price is 0 or negative, stop is 0
        return 0.0

    # FIX: Default ATR if it's missing or zero (prevent division/subtraction errors)
    atr = latest.get("ATR", price * 0.01) 
    if atr <= 0 or pd.isna(atr):
        atr = price * 0.01

    if signal == "BUY":
        stop = price - 3.0 * atr
    elif signal == "HOLD":
        stop = price - 2.0 * atr
    elif signal == "TIGHTEN_STOP" or signal == "VIGILANCE_HIGH_VOL":
        stop = price - 1.0 * atr
    else: # EXIT or EXIT_ANOMALY
        stop = price - 0.5 * atr
        
    stop = min(stop, price * 0.995) 
    return max(0.0, stop)