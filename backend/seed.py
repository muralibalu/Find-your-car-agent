import duckdb
import os

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "car_dataset_india.csv")
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "cars.db")

# Maps (Brand, Model) → body type since the dataset doesn't have this column
BODY_TYPE_MAP = {
    ("Honda", "Amaze"): "Sedan",
    ("Honda", "City"): "Sedan",
    ("Honda", "Civic"): "Sedan",
    ("Honda", "Jazz"): "Hatchback",
    ("Honda", "WR-V"): "SUV",
    ("Hyundai", "Creta"): "SUV",
    ("Hyundai", "i10"): "Hatchback",
    ("Hyundai", "i20"): "Hatchback",
    ("Hyundai", "Venue"): "SUV",
    ("Hyundai", "Verna"): "Sedan",
    ("Kia", "Carens"): "MUV",
    ("Kia", "Carnival"): "MUV",
    ("Kia", "EV6"): "SUV",
    ("Kia", "Seltos"): "SUV",
    ("Kia", "Sonet"): "SUV",
    ("Mahindra", "Bolero"): "SUV",
    ("Mahindra", "Scorpio"): "SUV",
    ("Mahindra", "Thar"): "SUV",
    ("Mahindra", "XUV300"): "SUV",
    ("Mahindra", "XUV700"): "SUV",
    ("Maruti Suzuki", "Baleno"): "Hatchback",
    ("Maruti Suzuki", "Dzire"): "Sedan",
    ("Maruti Suzuki", "Ertiga"): "MUV",
    ("Maruti Suzuki", "Swift"): "Hatchback",
    ("Maruti Suzuki", "WagonR"): "Hatchback",
    ("Renault", "Duster"): "SUV",
    ("Renault", "Kiger"): "SUV",
    ("Renault", "Kwid"): "Hatchback",
    ("Renault", "Lodgy"): "MUV",
    ("Renault", "Triber"): "MUV",
    ("Skoda", "Kushaq"): "SUV",
    ("Skoda", "Octavia"): "Sedan",
    ("Skoda", "Rapid"): "Sedan",
    ("Skoda", "Slavia"): "Sedan",
    ("Skoda", "Superb"): "Sedan",
    ("Tata Motors", "Altroz"): "Hatchback",
    ("Tata Motors", "Harrier"): "SUV",
    ("Tata Motors", "Nexon"): "SUV",
    ("Tata Motors", "Punch"): "SUV",
    ("Tata Motors", "Tiago"): "Hatchback",
    ("Toyota", "Camry"): "Sedan",
    ("Toyota", "Fortuner"): "SUV",
    ("Toyota", "Glanza"): "Hatchback",
    ("Toyota", "Innova"): "MUV",
    ("Toyota", "Urban Cruiser"): "SUV",
    ("Volkswagen", "Polo"): "Hatchback",
    ("Volkswagen", "Taigun"): "SUV",
    ("Volkswagen", "Tiguan"): "SUV",
    ("Volkswagen", "Vento"): "Sedan",
    ("Volkswagen", "Virtus"): "Sedan",
}


def build_body_type_case() -> str:
    branches = []
    for (brand, model), body_type in BODY_TYPE_MAP.items():
        branches.append(f"WHEN Brand = '{brand}' AND Model = '{model}' THEN '{body_type}'")
    return "CASE\n        " + "\n        ".join(branches) + "\n        ELSE 'SUV'\n    END"


def seed():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = duckdb.connect(DB_PATH)

    body_case = build_body_type_case()

    conn.execute(f"""
        CREATE OR REPLACE TABLE cars AS
        SELECT
            Car_ID,
            Brand,
            Model,
            Year,
            Fuel_Type,
            Transmission,
            Price,
            Mileage,
            Engine_CC,
            Seating_Capacity,
            Service_Cost,
            {body_case} AS body_type
        FROM read_csv_auto('{CSV_PATH.replace(chr(92), "/")}')
    """)

    count = conn.execute("SELECT COUNT(*) FROM cars").fetchone()[0]
    print(f"Seeded {count} cars into {DB_PATH}")

    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR PRIMARY KEY,
            username VARCHAR NOT NULL,
            messages JSON,
            created_at TIMESTAMP DEFAULT current_timestamp
        )
    """)

    conn.close()
    print("Done.")


if __name__ == "__main__":
    seed()
