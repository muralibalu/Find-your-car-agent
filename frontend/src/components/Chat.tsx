import { useRef, useEffect, useState } from 'react'
import { Message, Preferences } from '../types'
import PreferenceCard from './PreferenceCard'
import CarCard from './CarCard'
import FollowUpChips from './FollowUpChips'

interface Props {
  username: string
}

function uid() {
  return Math.random().toString(36).slice(2)
}

export default function Chat({ username }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'bot',
      type: 'text',
      content: `Hey ${username}! I'm your CarDekho AI advisor. I'll help you find the right car.`,
    },
    {
      id: uid(),
      role: 'bot',
      type: 'option-picker',
      content: {
        question: "Where do you want to start?",
        options: [
          { label: '🔍 Start from Scratch', value: 'scratch' },
          { label: '🚗 I have cars in mind', value: 'known' },
        ],
      },
    },
  ])

  const [loading, setLoading] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [optionUsed, setOptionUsed] = useState(false)
  const [lastContext, setLastContext] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const push = (msg: Message) => setMessages(prev => [...prev, msg])

  const handleOption = (value: string) => {
    if (optionUsed) return
    setOptionUsed(true)

    if (value === 'scratch') {
      push({ id: uid(), role: 'user', type: 'text', content: 'Start from Scratch' })
      push({ id: uid(), role: 'bot', type: 'text', content: "Great! Fill in your preferences below and I'll find the best matches." })
      push({ id: uid(), role: 'bot', type: 'preference-card' })
    } else {
      push({ id: uid(), role: 'user', type: 'text', content: 'I have cars in mind' })
      push({
        id: uid(),
        role: 'bot',
        type: 'text',
        content: "Which cars are you considering? Name them and I'll help you compare and decide.",
      })
      setShowInput(true)
    }
  }

  const handlePreferences = async (prefs: Preferences) => {
    push({
      id: uid(),
      role: 'user',
      type: 'text',
      content: `Budget ₹${(prefs.budget_min / 100000).toFixed(1)}L–₹${(prefs.budget_max / 100000).toFixed(1)}L · ${prefs.fuel_type.join(', ')} · ${prefs.seating}+ seats${prefs.body_type.length ? ' · ' + prefs.body_type.join(', ') : ''}`,
    })
    setLoading(true)
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      push({ id: uid(), role: 'bot', type: 'car-results', content: data })
      setShowInput(true)
      if (data.cars?.length) {
        const carSummary = data.cars
          .map((c: any, i: number) => `${i + 1}. ${c.brand} ${c.model} — ₹${(c.price / 100000).toFixed(1)}L, ${c.fuel_type}, ${c.body_type}, ${c.mileage} kmpl`)
          .join('\n')
        setLastContext(`The user was shown these recommended cars:\n${carSummary}\n\nSummary: ${data.summary}`)
      }
    } catch {
      push({ id: uid(), role: 'bot', type: 'text', content: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUp = async (question: string) => {
    push({ id: uid(), role: 'user', type: 'text', content: question })
    setUserInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, context: lastContext }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      push({ id: uid(), role: 'bot', type: 'text', content: data.message })
      if (data.follow_ups?.length) {
        push({ id: uid(), role: 'bot', type: 'car-results', content: { cars: [], summary: '', follow_ups: data.follow_ups } })
      }
    } catch {
      push({ id: uid(), role: 'bot', type: 'text', content: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          C
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-sm">CarDekho AI</div>
          <div className="text-xs text-green-500">Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {msg.type === 'text' && (
              <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            )}

            {msg.type === 'option-picker' && (
              <div className="bg-white rounded-2xl shadow-sm p-4 max-w-sm w-full">
                <p className="text-sm text-gray-800 mb-3 font-medium">{msg.content.question}</p>
                <div className="flex gap-2">
                  {msg.content.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleOption(opt.value)}
                      disabled={optionUsed}
                      className="flex-1 border border-blue-200 text-blue-600 rounded-xl py-2.5 text-sm font-medium hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msg.type === 'preference-card' && (
              <PreferenceCard onSubmit={handlePreferences} />
            )}

            {msg.type === 'car-results' && (
              <div className="w-full space-y-3">
                {msg.content.summary && (
                  <div className="bg-blue-50 text-blue-800 text-sm px-4 py-3 rounded-xl">
                    {msg.content.summary}
                  </div>
                )}
                {msg.content.cars.map((car, i) => (
                  <CarCard key={i} car={car} rank={i + 1} />
                ))}
                {msg.content.follow_ups?.length > 0 && (
                  <FollowUpChips chips={msg.content.follow_ups} onSelect={handleFollowUp} />
                )}
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl shadow-sm px-5 py-3 text-sm text-gray-400 flex gap-1 items-center">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-75">●</span>
              <span className="animate-bounce delay-150">●</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {showInput && (
        <div className="bg-white border-t px-4 py-3 sticky bottom-0">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask a follow-up question..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && userInput.trim() && !loading) {
                  handleFollowUp(userInput.trim())
                }
              }}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition"
              disabled={!userInput.trim() || loading}
              onClick={() => userInput.trim() && handleFollowUp(userInput.trim())}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
