import { useState } from 'react'
import { Preferences } from '../types'

interface Props {
  onSubmit: (prefs: Preferences) => void
}

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'CNG']
const BODY_OPTIONS = ['Hatchback', 'Sedan', 'SUV', 'MUV']
const SEATING_OPTIONS = [4, 5, 6, 7]
const TRANSMISSION_OPTIONS = ['Any', 'Manual', 'Automatic']

function toggle(list: string[], val: string): string[] {
  return list.includes(val) ? list.filter(x => x !== val) : [...list, val]
}

export default function PreferenceCard({ onSubmit }: Props) {
  const [budgetMin, setBudgetMin] = useState(400000)
  const [budgetMax, setBudgetMax] = useState(1500000)
  const [fuels, setFuels] = useState<string[]>(['Petrol'])
  const [bodies, setBodies] = useState<string[]>([])
  const [seating, setSeating] = useState(5)
  const [transmission, setTransmission] = useState('Any')
  const [extra, setExtra] = useState('')

  const handleSubmit = () => {
    const minB = Math.min(budgetMin, budgetMax)
    const maxB = Math.max(budgetMin, budgetMax)
    onSubmit({
      budget_min: minB,
      budget_max: maxB,
      fuel_type: fuels.length ? fuels : FUEL_OPTIONS,
      seating,
      body_type: bodies,
      transmission: transmission === 'Any' ? undefined : transmission,
      extra,
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 w-full max-w-lg">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">Tell me what you're looking for</h3>

      {/* Budget */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-6">Min</span>
            <input
              type="range"
              min={400000}
              max={3500000}
              step={100000}
              value={budgetMin}
              onChange={e => setBudgetMin(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700 w-14 text-right">
              ₹{(budgetMin / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-6">Max</span>
            <input
              type="range"
              min={400000}
              max={3500000}
              step={100000}
              value={budgetMax}
              onChange={e => setBudgetMax(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700 w-14 text-right">
              ₹{(budgetMax / 100000).toFixed(1)}L
            </span>
          </div>
        </div>
      </div>

      {/* Fuel type */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fuel Type</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {FUEL_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setFuels(toggle(fuels, f))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                fuels.includes(f)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Body type */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Body Type <span className="text-gray-400 normal-case font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {BODY_OPTIONS.map(b => (
            <button
              key={b}
              onClick={() => setBodies(toggle(bodies, b))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                bodies.includes(b)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Seating */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min Seating</label>
        <div className="flex gap-2 mt-2">
          {SEATING_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSeating(s)}
              className={`w-10 h-10 rounded-lg text-sm font-medium border transition ${
                seating === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transmission</label>
        <div className="flex gap-2 mt-2">
          {TRANSMISSION_OPTIONS.map(t => (
            <button
              key={t}
              onClick={() => setTransmission(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                transmission === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Extra */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Anything else?</label>
        <textarea
          className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          placeholder="e.g. mostly highway driving, need large boot space, prefer automatic..."
          value={extra}
          onChange={e => setExtra(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={fuels.length === 0}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
      >
        Find My Car →
      </button>
    </div>
  )
}
