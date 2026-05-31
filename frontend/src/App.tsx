import { useState } from 'react'
import Chat from './components/Chat'

export default function App() {
  const [username, setUsername] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [input, setInput] = useState('')

  const login = () => {
    const name = input.trim()
    if (!name) return
    setUsername(name)
    setLoggedIn(true)
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">CarDekho AI</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your AI-powered car buying advisor. From confused to confident in minutes.
          </p>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="What's your name?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            autoFocus
          />
          <button
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            disabled={!input.trim()}
            onClick={login}
          >
            Get Started →
          </button>
        </div>
      </div>
    )
  }

  return <Chat username={username} />
}
