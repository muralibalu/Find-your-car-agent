import { Car } from '../types'

interface Props {
  car: Car
  rank: number
}

export default function CarCard({ car, rank }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-blue-500">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              #{rank}
            </span>
            <h3 className="font-semibold text-gray-800">
              {car.brand} {car.model}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Tag>{car.fuel_type}</Tag>
            <Tag>{car.body_type}</Tag>
            <Tag>{car.transmission}</Tag>
            <Tag>{car.seating_capacity} seats</Tag>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-gray-800">
            ₹{(car.price / 100000).toFixed(1)}L
          </div>
          <div className="text-xs text-gray-500">{car.mileage} kmpl</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{car.explanation}</p>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
      {children}
    </span>
  )
}
