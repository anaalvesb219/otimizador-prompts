import React, { useState } from 'react'
import { optimizePrompt } from './PromptEngine'

export default function App() {
  const [story, setStory] = useState('')
  const [characters, setCharacters] = useState('')
  const [prompts, setPrompts] = useState([''])
  const [optimized, setOptimized] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addPromptField = () => {
    setPrompts([...prompts, ''])
  }

  const removePromptField = (index: number) => {
    const updated = [...prompts]
    updated.splice(index, 1)
    setPrompts(updated)
  }

  const handlePromptChange = (index: number, value: string) => {
    const updated = [...prompts]
    updated[index] = value
    setPrompts(updated)
  }

  const handleOptimize = async () => {
    setLoading(true)
    const context = `${story}\n\n${characters}`
    const results = await Promise.all(
      prompts.map((prompt) => optimizePrompt(prompt, context))
    )
    setOptimized(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          🚀 Otimizador de Prompts com OpenAI (GPT-4)
        </h1>

        {/* Enredo */}
        <div>
          <label className="block font-semibold mb-2">🧾 Enredo</label>
          <textarea
            rows={6}
            className="w-full p-3 bg-gray-800 rounded border border-gray-700"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Cole aqui o enredo da história..."
          />
        </div>

        {/* Personagens */}
        <div>
          <label className="block font-semibold mb-2">👤 Características dos Personagens</label>
          <textarea
            rows={6}
            className="w-full p-3 bg-gray-800 rounded border border-gray-700"
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            placeholder="Cole aqui as descrições dos personagens (em inglês)..."
          />
        </div>

        {/* Prompts */}
        <div>
          <label className="block font-semibold mb-2">🎯 Prompts</label>
          {prompts.map((p, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-start space-x-2">
                <textarea
                  rows={3}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700"
                  value={p}
                  onChange={(e) => handlePromptChange(i, e.target.value)}
                  placeholder={`Prompt ${i + 1}`}
                />
                <button
                  onClick={() => removePromptField(i)}
                  className="text-red-500 hover:text-red-400 font-bold text-xl"
                  title="Remover este prompt"
                >
                  ❌
                </button>
              </div>
              <div className="text-right mt-2">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
                  onClick={async () => {
                    const context = `${story}\n\n${characters}`
                    const result = await optimizePrompt(p, context)
                    setOptimized((prev) => [...prev, result])
                  }}
                >
                  ⚙️ Otimizar apenas este prompt
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addPromptField}
            className="mt-2 px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
          >
            ➕ Adicionar mais um prompt
          </button>
        </div>

        {/* Otimizar */}
        <div className="text-center">
          <button
            onClick={handleOptimize}
            className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            disabled={loading}
          >
            {loading ? 'Otimizando...' : '⚙️ Otimizar Prompts'}
          </button>
        </div>

        {/* Resultado */}
        {optimized.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">✨ Prompts Otimizados</h2>
              <button
                onClick={() => {
                  const allPrompts = optimized.join('\n\n')
                  navigator.clipboard.writeText(allPrompts)
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-semibold"
              >
                📤 Copiar todos os prompts
              </button>
            </div>

            {optimized.map((opt, idx) => (
              <div
                key={idx}
                className="relative bg-gray-800 p-4 rounded border border-gray-700 mb-4"
              >
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(opt)
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                    title="Copiar este prompt"
                  >
                    📋 Copiar
                  </button>
                  <button
                    onClick={() => {
                      const updated = [...optimized]
                      updated.splice(idx, 1)
                      setOptimized(updated)
                    }}
                    className="text-red-500 hover:text-red-400 text-sm font-semibold"
                    title="Remover este prompt"
                  >
                    ❌ Remover
                  </button>
                </div>

                <p className="whitespace-pre-wrap mt-8">{opt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
