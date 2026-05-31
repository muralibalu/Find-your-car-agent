from pydantic import BaseModel
from typing import Optional, List


class Preferences(BaseModel):
    budget_min: int
    budget_max: int
    fuel_type: List[str]
    seating: int
    body_type: List[str]
    transmission: Optional[str] = None
    extra: Optional[str] = ""


class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = ""


class Car(BaseModel):
    brand: str
    model: str
    fuel_type: str
    price: float
    mileage: float
    seating_capacity: int
    body_type: str
    transmission: str
    explanation: str


class PreferencesResponse(BaseModel):
    cars: List[Car]
    summary: str
    follow_ups: List[str]


class ChatResponse(BaseModel):
    message: str
    follow_ups: Optional[List[str]] = []
