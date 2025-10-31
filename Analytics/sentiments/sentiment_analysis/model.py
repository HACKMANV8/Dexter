#!/usr/bin/env python3
"""
model.py — Load financial sentiment analysis model (FinBERT)

This module handles loading the Hugging Face pipeline,
auto-detecting and using a GPU (CUDA) if available.
"""

import logging
import sys
import torch
from transformers import pipeline, AutoConfig
from sentiments.config import MODEL_ID

# --- Module-level Configuration ---
logger = logging.getLogger(__name__)

def load_sentiment_pipeline(model_id: str = MODEL_ID) -> "pipeline":
    """
    Load the financial sentiment analysis pipeline.

    Optimized to auto-detect and use a CUDA-enabled GPU if available.
    Returns a HuggingFace pipeline object.
    """
    logger.info(f"Attempting to load sentiment model: {model_id}")

    # --- Optimization: Auto-detect GPU (CUDA) ---
    device_num = -1  # Default to CPU
    device_name = "CPU"
    if torch.cuda.is_available():
        device_num = 0  # Use first available GPU
        try:
            device_name = f"GPU ({torch.cuda.get_device_name(device_num)})"
            logger.info(f"Found CUDA-compatible GPU. Setting device to: {device_name}")
        except Exception:
            device_name = "GPU (Unknown)"
            logger.info("Found CUDA-compatible GPU, but couldn't get name. Using device 0.")
    else:
        logger.info("No CUDA-compatible GPU found. Defaulting to CPU.")
    # --- End of Optimization ---

    try:
        # Check if model exists before trying to load
        AutoConfig.from_pretrained(model_id)
        
        # Load the pipeline onto the detected device
        classifier = pipeline(
            "sentiment-analysis",
            model=model_id,
            device=device_num
        )
        logger.info(f"Sentiment model loaded successfully on {device_name}.")
        return classifier
        
    except OSError as e:
        logger.critical(f"OSError: Failed to load model '{model_id}'.")
        logger.critical(f"It's possible the model name is incorrect or you are offline.")
        logger.critical(f"Error details: {e}", exc_info=True)
    except Exception as e:
        logger.critical(f"An unexpected error occurred while loading the model: {e}", exc_info=True)

    # --- Production-Ready: Robust Error Handling ---
    logger.critical("This is a fatal error. The application cannot continue. Exiting.")
    sys.exit(1)  # Exit the entire program
