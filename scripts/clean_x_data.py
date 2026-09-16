"""
NEXUS - AI-Driven Social Media Analytics Framework
Data Cleaning & Normalization Pipeline Entry Point

Usage:
    python scripts/clean_x_data.py
"""

import sys
import os

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_pipeline.cleaning import run_pipeline

if __name__ == "__main__":
    run_pipeline()