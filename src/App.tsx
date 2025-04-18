import React, { useState, useEffect } from 'react'
import { optimizePrompt } from './PromptEngine'

export default function App() {
  const [story, setStory] = useState('')
  const [characters, setCharacters] = useState('')
  const [prompts, setPrompts] = useState([''])
  const [optimized, setOptimized] = useState<string[]>([])
  const [optimizedSourceIndex, setOptimizedSourceIndex] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkPromptsText, setBulkPromptsText] = useState('')
  const [detectedPrompts, setDetectedPrompts] = useState<string[]>([])
  const [compactMode, setCompactMode] = useState(false)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [clearTarget, setClearTarget] = useState<'all' | 'prompts' | 'optimized'>('all')
  
  // Estados para controlar a visibilidade das seções
  const [showStorySection, setShowStorySection] = useState(true)
  const [showCharactersSection, setShowCharactersSection] = useState(true)
  
  // Estados para controlar validação dos campos obrigatórios
  const [storyError, setStoryError] = useState(false)
  const [charactersError, setCharactersError] = useState(false)

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

  // Validar campos obrigatórios
  const validateRequiredFields = (): boolean => {
    let isValid = true;
    
    // Valida o campo de enredo
    if (!story.trim()) {
      setStoryError(true);
      setShowStorySection(true); // Expande a seção para mostrar o erro
      isValid = false;
    } else {
      setStoryError(false);
    }
    
    // Valida o campo de características dos personagens
    if (!characters.trim()) {
      setCharactersError(true);
      setShowCharactersSection(true); // Expande a seção para mostrar o erro
      isValid = false;
    } else {
      setCharactersError(false);
    }
    
    // Se algum campo estiver inválido, mostra um alerta
    if (!isValid) {
      alert('Por favor, preencha os campos obrigatórios: Enredo e Características dos Personagens.');
    }
    
    return isValid;
  }

  const handleOptimize = async () => {
    // Validar campos obrigatórios antes de continuar
    if (!validateRequiredFields()) {
      return;
    }
    
    setLoading(true)
    const context = `${story}\n\n${characters}`
    const filteredPrompts = prompts.filter(p => p.trim() !== '')
    
    if (filteredPrompts.length === 0) {
      alert('Por favor, adicione pelo menos um prompt para otimizar.')
      setLoading(false)
      return
    }
    
    const results = await Promise.all(
      filteredPrompts.map((prompt) => optimizePrompt(prompt, context))
    )
    
    // Mapear os índices das prompts originais para seus respectivos resultados
    const sourceIndices = prompts
      .map((p, index) => p.trim() !== '' ? index : -1)
      .filter(index => index !== -1)
    
    setOptimized(results)
    setOptimizedSourceIndex(sourceIndices)
    setLoading(false)
  }

  // Analisar os prompts conforme o usuário digita no campo de importação em massa
  useEffect(() => {
    if (bulkPromptsText.trim()) {
      setDetectedPrompts(detectPrompts(bulkPromptsText))
    } else {
      setDetectedPrompts([])
    }
  }, [bulkPromptsText])

  // Função para detectar prompts a partir do texto - apenas por quebras de linha
  const detectPrompts = (text: string): string[] => {
    if (!text.trim()) return []
    
    // Divide apenas por quebras de linha
    const lineBreakSplit = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== '')
    
    if (lineBreakSplit.length > 0) {
      return lineBreakSplit
    }
    
    // Se não tiver quebras de linha, retorna o texto como um único prompt
    return [text.trim()]
  }

  // Função para processar a importação em massa de prompts
  const processBulkImport = () => {
    if (detectedPrompts.length > 0) {
      setPrompts(detectedPrompts)
      setBulkPromptsText('')
      setDetectedPrompts([])
      setShowBulkImport(false)
    } else if (bulkPromptsText.trim()) {
      // Se não detectou prompts mas há texto, usa como um único prompt
      setPrompts([bulkPromptsText.trim()])
      setBulkPromptsText('')
      setShowBulkImport(false)
    } else {
      setShowBulkImport(false)
    }
  }

  // Função para tentar colar da área de transferência
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setBulkPromptsText(text)
    } catch (error) {
      alert('Não foi possível acessar a área de transferência. Por favor, cole o texto manualmente.')
      console.error('Erro ao acessar a área de transferência:', error)
    }
  }

  // Função auxiliar que retorna a classe CSS para o contador de caracteres
  const getCharCountClass = (length: number): string => {
    // Limites comuns para geradores de imagem
    if (length === 0) return "text-gray-400" // Vazio
    if (length > 500) return "text-red-500" // Muito longo
    if (length > 380) return "text-yellow-500" // Próximo do limite
    return "text-green-500" // Tamanho bom
  }

  // Função que retorna um preview do texto limitado a um certo número de caracteres
  const getTextPreview = (text: string, maxLength: number = 100): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    // Pega apenas a primeira linha, se houver quebras de linha
    const firstLine = text.split('\n')[0].trim();
    
    // Se a primeira linha for maior que o tamanho máximo, trunca
    if (firstLine.length > maxLength) {
      return firstLine.substring(0, maxLength) + '...';
    }
    
    return firstLine + '...';
  }

  // Função para otimizar um único prompt e manter o rastreamento do prompt original
  const optimizeSinglePrompt = async (promptText: string, promptIndex: number) => {
    // Validar campos obrigatórios antes de continuar
    if (!validateRequiredFields()) {
      return;
    }
    
    if (!promptText.trim()) {
      alert('Por favor, adicione um texto ao prompt antes de otimizar.')
      return
    }
    
    const context = `${story}\n\n${characters}`
    const result = await optimizePrompt(promptText, context)
    
    setOptimized(prev => [...prev, result])
    setOptimizedSourceIndex(prev => [...prev, promptIndex])
  }

  // Função para obter uma cor consistente baseada no índice
  const getColorForIndex = (index: number): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  }

  // Função para obter uma cor de texto consistente baseada no índice
  const getTextColorForIndex = (index: number): string => {
    const colors = [
      'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-red-500', 
      'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500'
    ];
    return colors[index % colors.length];
  }

  // Função para limpar todos os campos (novo projeto)
  const clearAll = () => {
    setStory('')
    setCharacters('')
    setPrompts([''])
    setOptimized([])
    setOptimizedSourceIndex([])
    setShowClearConfirmation(false)
  }
  
  // Função para limpar apenas os prompts
  const clearPrompts = () => {
    setPrompts([''])
    setShowClearConfirmation(false)
  }
  
  // Função para limpar apenas os resultados otimizados
  const clearOptimized = () => {
    setOptimized([])
    setOptimizedSourceIndex([])
    setShowClearConfirmation(false)
  }
  
  // Função para mostrar o diálogo de confirmação
  const showClearConfirmationDialog = (target: 'all' | 'prompts' | 'optimized') => {
    setClearTarget(target)
    setShowClearConfirmation(true)
  }

  // Verificar se o botão de otimizar deve estar desabilitado
  const isOptimizeDisabled = (): boolean => {
    return loading || !story.trim() || !characters.trim() || prompts.every(p => !p.trim());
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          🚀 Otimizador de Prompts com OpenAI (GPT-4)
        </h1>

        {/* Enredo */}
        <div className={`bg-gray-800 rounded border ${storyError ? 'border-red-500' : 'border-gray-700'} overflow-hidden`}>
          <div 
            className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => setShowStorySection(!showStorySection)}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">🧾 Enredo <span className="text-red-500">*</span></span>
              {!showStorySection && story.trim() && (
                <span className="text-xs text-gray-400">
                  ({story.length} caracteres)
                </span>
              )}
              {storyError && <span className="text-xs text-red-500 ml-2">Campo obrigatório</span>}
            </div>
            <button className="text-gray-400 hover:text-white">
              {showStorySection ? '🔼' : '🔽'}
            </button>
          </div>
          
          {showStorySection && (
            <div className="p-3 pt-0">
              <textarea
                rows={6}
                className={`w-full p-3 bg-gray-900 rounded ${storyError ? 'border-red-500' : 'border-gray-700'} mt-2`}
                value={story}
                onChange={(e) => {
                  setStory(e.target.value);
                  if (e.target.value.trim()) setStoryError(false);
                }}
                placeholder="Cole aqui o enredo da história... (Obrigatório)"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">
                  {story.length} caracteres
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Personagens */}
        <div className={`bg-gray-800 rounded border ${charactersError ? 'border-red-500' : 'border-gray-700'} overflow-hidden`}>
          <div 
            className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => setShowCharactersSection(!showCharactersSection)}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">👤 Características dos Personagens <span className="text-red-500">*</span></span>
              {!showCharactersSection && characters.trim() && (
                <span className="text-xs text-gray-400">
                  ({characters.length} caracteres)
                </span>
              )}
              {charactersError && <span className="text-xs text-red-500 ml-2">Campo obrigatório</span>}
            </div>
            <button className="text-gray-400 hover:text-white">
              {showCharactersSection ? '🔼' : '🔽'}
            </button>
          </div>
          
          {showCharactersSection && (
            <div className="p-3 pt-0">
              <textarea
                rows={6}
                className={`w-full p-3 bg-gray-900 rounded ${charactersError ? 'border-red-500' : 'border-gray-700'} mt-2`}
                value={characters}
                onChange={(e) => {
                  setCharacters(e.target.value);
                  if (e.target.value.trim()) setCharactersError(false);
                }}
                placeholder="Cole aqui as descrições dos personagens (em inglês)... (Obrigatório)"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">
                  {characters.length} caracteres
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botões para expandir/colapsar todas as seções */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setShowStorySection(true);
              setShowCharactersSection(true);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
          >
            🔽 Expandir todas as seções
          </button>
          <button
            onClick={() => {
              setShowStorySection(false);
              setShowCharactersSection(false);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
          >
            🔼 Colapsar todas as seções
          </button>
        </div>

        {/* Prompts */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <label className="font-semibold">🎯 Prompts</label>
              <div className="flex items-center">
                <label className="text-sm mr-2">Modo compacto</label>
                <button 
                  onClick={() => setCompactMode(!compactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${compactMode ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => showClearConfirmationDialog('prompts')}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-sm font-semibold"
                title="Limpar todos os prompts"
              >
                🗑️ Limpar prompts
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
              >
                📥 Importar múltiplos prompts
              </button>
            </div>
          </div>
          
          {prompts.length === 0 ? (
            <div className="text-center p-4 bg-gray-800 rounded border border-gray-700 mb-4">
              <p className="text-gray-400">Nenhum prompt adicionado. Adicione um prompt ou importe múltiplos prompts.</p>
            </div>
          ) : (
            prompts.map((p, i) => (
              <div key={i} className="mb-4">
                <div className={`flex items-start space-x-2 ${compactMode ? 'bg-gray-800 rounded border border-gray-700 p-2' : ''}`}>
                  <div className={`${getColorForIndex(i)} text-white font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="w-full">
                    {compactMode ? (
                      <div className="flex justify-between items-center w-full">
                        <div className="font-medium truncate flex-1">
                          {getTextPreview(p) || <span className="text-gray-500 italic">Prompt vazio</span>}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className={`text-xs ${getCharCountClass(p.length)}`}>
                            {p.length} caracteres
                          </span>
                          <button
                            onClick={() => setCompactMode(false)}
                            className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-gray-700 rounded"
                            title="Expandir este prompt"
                          >
                            Editar
                          </button>
                          <button
                            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded"
                            onClick={() => optimizeSinglePrompt(p, i)}
                          >
                            ⚙️ Otimizar
                          </button>
                          <button
                            onClick={() => removePromptField(i)}
                            className="text-red-500 hover:text-red-400 font-bold"
                            title="Remover este prompt"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <textarea
                          rows={3}
                          className="w-full p-3 bg-gray-800 rounded border border-gray-700"
                          value={p}
                          onChange={(e) => handlePromptChange(i, e.target.value)}
                          placeholder={`Prompt ${i + 1}`}
                        />
                        <div className="flex justify-between mt-1">
                          <div className="text-xs">
                            <span className={getCharCountClass(p.length)}>
                              {p.length} caracteres
                              {p.length > 380 && p.length <= 500 && " (próximo do limite)"}
                              {p.length > 500 && " (muito longo)"}
                            </span>
                          </div>
                          <div className="text-right">
                            <button
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
                              onClick={() => optimizeSinglePrompt(p, i)}
                            >
                              ⚙️ Otimizar apenas este prompt
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {!compactMode && (
                    <button
                      onClick={() => removePromptField(i)}
                      className="text-red-500 hover:text-red-400 font-bold text-xl"
                      title="Remover este prompt"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          
          <button
            onClick={addPromptField}
            className="mt-2 px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
          >
            ➕ Adicionar mais um prompt
          </button>
        </div>

        {/* Otimizar */}
        <div className="text-center">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => showClearConfirmationDialog('all')}
              className="px-6 py-3 rounded bg-red-600 hover:bg-red-500 text-white font-semibold"
            >
              🗑️ Limpar tudo
            </button>
            <button
              onClick={handleOptimize}
              className={`px-6 py-3 rounded ${isOptimizeDisabled() ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-semibold`}
              disabled={isOptimizeDisabled()}
              title={isOptimizeDisabled() ? 'Preencha os campos obrigatórios para otimizar' : ''}
            >
              {loading ? 'Otimizando...' : '⚙️ Otimizar Prompts'}
            </button>
          </div>
          {(!story.trim() || !characters.trim()) && (
            <p className="text-sm text-red-400 mt-2">
              ⚠️ Os campos Enredo e Características dos Personagens são obrigatórios para a otimização.
            </p>
          )}
        </div>

        {/* Resultado */}
        {optimized.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">✨ Prompts Otimizados</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => showClearConfirmationDialog('optimized')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold"
                >
                  🗑️ Limpar resultados
                </button>
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
            </div>

            {optimized.map((opt, idx) => {
              const sourceIndex = optimizedSourceIndex[idx];
              return (
                <div
                  key={idx}
                  className="relative bg-gray-800 p-4 rounded border border-gray-700 mb-4"
                >
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <div className={`${getColorForIndex(sourceIndex)} text-white font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
                      {sourceIndex + 1}
                    </div>
                    <span className="text-xs text-gray-400">
                      Otimizado do prompt #{sourceIndex + 1}
                    </span>
                  </div>
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
                        const updatedOptimized = [...optimized];
                        const updatedSourceIndices = [...optimizedSourceIndex];
                        updatedOptimized.splice(idx, 1);
                        updatedSourceIndices.splice(idx, 1);
                        setOptimized(updatedOptimized);
                        setOptimizedSourceIndex(updatedSourceIndices);
                      }}
                      className="text-red-500 hover:text-red-400 text-sm font-semibold"
                      title="Remover este prompt"
                    >
                      ❌ Remover
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap mt-10">{opt}</p>
                  <div className="mt-2 text-xs text-gray-400 text-right">
                    {opt.length} caracteres
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Modal de Importação em Massa */}
        {showBulkImport && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Importar Múltiplos Prompts</h3>
              <p className="mb-4 text-gray-300 text-sm">
                Cole seus prompts abaixo, um por linha. Cada linha será considerada como um prompt separado.
              </p>
              
              <div className="relative">
                <textarea 
                  rows={10}
                  className="w-full p-3 bg-gray-900 rounded border border-gray-700 mb-4"
                  value={bulkPromptsText}
                  onChange={(e) => setBulkPromptsText(e.target.value)}
                  placeholder="Cole seus prompts aqui, um por linha..."
                />
                <button
                  onClick={handlePasteFromClipboard}
                  className="absolute right-2 top-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                  title="Colar da área de transferência"
                >
                  📋 Colar
                </button>
              </div>
              
              {detectedPrompts.length > 0 && (
                <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
                  <p className="text-sm font-semibold mb-2">
                    ✅ {detectedPrompts.length} prompt{detectedPrompts.length !== 1 ? 's' : ''} detectado{detectedPrompts.length !== 1 ? 's' : ''}:
                  </p>
                  <ul className="text-xs text-gray-400 max-h-32 overflow-y-auto">
                    {detectedPrompts.map((p, i) => (
                      <li key={i} className="mb-1 truncate">
                        {i+1}. {p.length > 60 ? p.substring(0, 60) + '...' : p} 
                        <span className={getCharCountClass(p.length)}>
                          ({p.length} caracteres)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setBulkPromptsText('')
                    setDetectedPrompts([])
                    setShowBulkImport(false)
                  }}
                  className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={processBulkImport}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
                  disabled={detectedPrompts.length === 0 && !bulkPromptsText.trim()}
                >
                  Importar {detectedPrompts.length > 0 ? `(${detectedPrompts.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Confirmação para Limpar */}
        {showClearConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Confirmar limpeza</h3>
              <p className="mb-6 text-gray-300">
                {clearTarget === 'all' && 'Tem certeza que deseja limpar todos os campos? Esta ação não pode ser desfeita.'}
                {clearTarget === 'prompts' && 'Tem certeza que deseja limpar todos os prompts? Esta ação não pode ser desfeita.'}
                {clearTarget === 'optimized' && 'Tem certeza que deseja limpar todos os resultados otimizados? Esta ação não pode ser desfeita.'}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirmation(false)}
                  className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (clearTarget === 'all') clearAll();
                    else if (clearTarget === 'prompts') clearPrompts();
                    else if (clearTarget === 'optimized') clearOptimized();
                  }}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
