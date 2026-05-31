import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import get_conn
from models import Preferences
from logger import get_logger

log = get_logger("filter")


def filter_cars(prefs: Preferences) -> list[dict]:
    log.info(
        f"Filtering cars | budget=₹{prefs.budget_min:,}–₹{prefs.budget_max:,} "
        f"fuel={prefs.fuel_type} seating>={prefs.seating} "
        f"body={prefs.body_type or 'any'} transmission={prefs.transmission or 'any'}"
    )

    conn = get_conn()

    fuels_sql = ", ".join(f"'{f}'" for f in prefs.fuel_type)

    body_clause = ""
    if prefs.body_type:
        bodies_sql = ", ".join(f"'{b}'" for b in prefs.body_type)
        body_clause = f"AND body_type IN ({bodies_sql})"

    transmission_clause = ""
    if prefs.transmission:
        transmission_clause = f"AND Transmission = '{prefs.transmission}'"

    query = f"""
        SELECT
            Brand, Model, Fuel_Type, Price, Mileage,
            Seating_Capacity, body_type, Transmission, Engine_CC
        FROM cars
        WHERE Price BETWEEN {prefs.budget_min} AND {prefs.budget_max}
          AND Fuel_Type IN ({fuels_sql})
          AND Seating_Capacity >= {prefs.seating}
          {body_clause}
          {transmission_clause}
        ORDER BY Mileage DESC
        LIMIT 15
    """

    log.debug(f"SQL query:\n{query.strip()}")

    df = conn.execute(query).fetchdf()
    conn.close()

    df = df.rename(columns={
        "Brand": "brand",
        "Model": "model",
        "Fuel_Type": "fuel_type",
        "Price": "price",
        "Mileage": "mileage",
        "Seating_Capacity": "seating_capacity",
        "Transmission": "transmission",
        "Engine_CC": "engine_cc",
    })

    results = df.to_dict(orient="records")
    count = len(results)

    if count == 0:
        log.warning("DuckDB returned 0 cars — filters may be too strict")
    else:
        log.info(f"DuckDB returned {count} cars:")
        for i, car in enumerate(results, 1):
            log.info(
                f"  [{i:>2}] {car['brand']} {car['model']} | "
                f"{car['fuel_type']} | {car['body_type']} | "
                f"₹{car['price']:,.0f} | {car['mileage']} kmpl | "
                f"{car['seating_capacity']} seats | {car['transmission']}"
            )

    return results
