"""
NEXUS - Master Execution Script for X Data Pipeline
Executes inspection -> cleaning -> validation -> automated test verification
with one single command.

Usage:
    python scripts/run_x_pipeline.py
"""

import os
import sys
import subprocess

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.inspect_x_schema import inspect_schema
from src.data_pipeline.cleaning import run_pipeline
from scripts.validate_x_data import run_validation


def main():
    print("\n>>> STEP 1: Inspecting Schema and Source Data")
    inspect_schema()

    print("\n>>> STEP 2: Running Cleaning, Normalization, and Anonymization Pipeline")
    run_pipeline()

    print("\n>>> STEP 3: Running Comprehensive Validation & Verification")
    passed = run_validation()

    if not passed:
        print("\nPipeline failed validation checks.")
        sys.exit(1)
    else:
        print("\nAll pipeline stages and automated verification completed successfully.")
        sys.exit(0)


if __name__ == "__main__":
    main()
