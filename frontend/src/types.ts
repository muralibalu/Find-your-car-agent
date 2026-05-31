export type Role = 'bot' | 'user'

export interface Car {
  brand: string
  model: string
  fuel_type: string
  price: number
  mileage: number
  seating_capacity: number
  body_type: string
  transmission: string
  explanation: string
}

export interface Preferences {
  budget_min: number
  budget_max: number
  fuel_type: string[]
  seating: number
  body_type: string[]
  transmission?: string
  extra?: string
}

export interface CarResultsContent {
  cars: Car[]
  summary: string
  follow_ups: string[]
}

export type Message =
  | { id: string; role: Role; type: 'text'; content: string }
  | { id: string; role: 'bot'; type: 'option-picker'; content: { question: string; options: { label: string; value: string }[] } }
  | { id: string; role: 'bot'; type: 'preference-card' }
  | { id: string; role: 'bot'; type: 'car-results'; content: CarResultsContent }
