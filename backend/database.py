import duckdb
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "cars.db")


def get_conn() -> duckdb.DuckDBPyConnection:
    return duckdb.connect(DB_PATH)
