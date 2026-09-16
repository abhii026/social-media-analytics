import os
import duckdb
import pyarrow.parquet as pq

PARQUET_FILE = "data/x/processed/nexus_x_100k.parquet"

def inspect_schema():
    print("=" * 80)
    print("INSPECTING PARQUET SCHEMA & SAMPLE RECORDS")
    print("=" * 80)
    
    if not os.path.exists(PARQUET_FILE):
        print(f"File not found: {PARQUET_FILE}")
        return

    # PyArrow inspection
    table = pq.read_table(PARQUET_FILE)
    print(f"Total Rows (PyArrow): {table.num_rows:,}")
    print(f"Total Columns: {len(table.schema)}")
    print("\nPyArrow Schema:")
    for field in table.schema:
        print(f"  {field.name:20s}: {field.type}")

    # DuckDB inspection test
    print("\n" + "=" * 80)
    print("TESTING DUCKDB READ")
    print("=" * 80)
    con = duckdb.connect()
    try:
        df_describe = con.execute(f"DESCRIBE SELECT * FROM read_parquet('{PARQUET_FILE}')").fetchall()
        print("DuckDB DESCRIBE succeeded:")
        for row in df_describe:
            print(f"  {row[0]:20s}: {row[1]}")
    except Exception as e:
        print("DuckDB DESCRIBE failed with error:")
        print(e)

    try:
        count = con.execute(f"SELECT COUNT(*) FROM read_parquet('{PARQUET_FILE}')").fetchone()[0]
        print(f"DuckDB COUNT(*) succeeded: {count:,}")
    except Exception as e:
        print("DuckDB COUNT(*) failed with error:")
        print(e)

    # Detailed column-by-column inspection with sample values & null count
    print("\n" + "=" * 80)
    print("COLUMN ANALYSIS (COLUMN | TYPE | NULL COUNT | SAMPLE VALUE)")
    print("=" * 80)
    
    for col_name in table.column_names:
        col = table.column(col_name)
        null_count = col.null_count
        # Find first non-null sample value
        sample_val = None
        for val in col:
            v = val.as_py()
            if v is not None:
                sample_val = v
                break
        
        sample_repr = repr(sample_val)
        if len(sample_repr) > 50:
            sample_repr = sample_repr[:47] + "..."
            
        print(f"{col_name:20s} | {str(col.type):25s} | Nulls: {null_count:6d} | Sample: {sample_repr}")

    con.close()

if __name__ == "__main__":
    inspect_schema()
