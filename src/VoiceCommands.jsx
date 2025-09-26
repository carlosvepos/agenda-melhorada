import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Mic, MicOff, Volume2 } from 'lucide-react'

const VoiceCommands = ({ 
  onAddActivity, 
  onRemoveActivity, 
  onNavigate, 
  onViewChange, 
  onToggleDarkMode,
  onShowReport,
  onExportData,
  blocksData 
}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Verificar se o navegador suporta Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      // Configurações do reconhecimento
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'pt-BR'
      recognitionRef.current.maxAlternatives = 1

      // Event listeners
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript.toLowerCase()
        setTranscript(result)
        setLastCommand(result)
        processVoiceCommand(result)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error)
        setIsListening(false)
        speakResponse('Desculpe, não consegui entender. Tente novamente.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Função para síntese de voz (resposta)
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  // Processar comandos de voz
  const processVoiceCommand = (command) => {
    console.log('Comando recebido:', command)

    // Comandos de adição
    if (command.includes('adicionar') || command.includes('agendar') || command.includes('criar')) {
      handleAddCommand(command)
    }
    // Comandos de remoção
    else if (command.includes('remover') || command.includes('cancelar') || command.includes('deletar')) {
      handleRemoveCommand(command)
    }
    // Comandos de navegação
    else if (command.includes('próxima semana') || command.includes('proxima semana')) {
      onNavigate('next')
      speakResponse('Indo para a próxima semana')
    }
    else if (command.includes('semana anterior') || command.includes('voltar semana')) {
      onNavigate('prev')
      speakResponse('Voltando para a semana anterior')
    }
    else if (command.includes('hoje')) {
      onNavigate('today')
      speakResponse('Voltando para hoje')
    }
    // Comandos de visualização
    else if (command.includes('visualização dia') || command.includes('mostrar dia')) {
      onViewChange('Dia')
      speakResponse('Mudando para visualização do dia')
    }
    else if (command.includes('visualização semana') || command.includes('mostrar semana')) {
      onViewChange('Semana')
      speakResponse('Mudando para visualização da semana')
    }
    else if (command.includes('visualização mês') || command.includes('mostrar mês')) {
      onViewChange('Mes')
      speakResponse('Mudando para visualização do mês')
    }
    else if (command.includes('visualização ano') || command.includes('mostrar ano')) {
      onViewChange('Ano')
      speakResponse('Mudando para visualização do ano')
    }
    // Comandos de configuração
    else if (command.includes('modo escuro')) {
      onToggleDarkMode()
      speakResponse('Alternando para modo escuro')
    }
    else if (command.includes('modo claro')) {
      onToggleDarkMode()
      speakResponse('Alternando para modo claro')
    }
    else if (command.includes('mostrar relatório') || command.includes('relatório')) {
      onShowReport()
      speakResponse('Mostrando relatório')
    }
    else if (command.includes('exportar') || command.includes('baixar dados')) {
      onExportData()
      speakResponse('Exportando dados')
    }
    // Comando não reconhecido
    else {
      speakResponse('Comando não reconhecido. Tente: adicionar atividade, remover evento, próxima semana, ou mostrar relatório.')
    }
  }

  // Processar comandos de adição
  const handleAddCommand = (command) => {
    try {
      // Extrair atividade e horário do comando
      let activity = ''
      let time = ''
      let category = ''

      // Padrões de comando para adicionar
      const patterns = [
        /adicionar (.+) às (\d{1,2}):?(\d{0,2})/,
        /agendar (.+) para (\d{1,2}):?(\d{0,2})/,
        /criar (.+) às (\d{1,2}):?(\d{0,2})/,
        /adicionar (.+) na categoria (.+) às (\d{1,2}):?(\d{0,2})/
      ]

      for (const pattern of patterns) {
        const match = command.match(pattern)
        if (match) {
          if (pattern.source.includes('categoria')) {
            activity = match[1].trim()
            category = match[2].trim()
            time = `${match[3].padStart(2, '0')}:${(match[4] || '00').padStart(2, '0')}`
          } else {
            activity = match[1].trim()
            time = `${match[2].padStart(2, '0')}:${(match[3] || '00').padStart(2, '0')}`
          }
          break
        }
      }

      if (activity && time) {
        // Encontrar categoria baseada na atividade se não especificada
        if (!category) {
          category = findBestCategory(activity)
        }

        onAddActivity({
          item: activity,
          timeSlot: time,
          category: category,
          duration: 30
        })

        speakResponse(`${activity} adicionado às ${time}`)
      } else {
        speakResponse('Não consegui entender a atividade ou horário. Tente: adicionar meditação às 8 horas')
      }
    } catch (error) {
      console.error('Erro ao processar comando de adição:', error)
      speakResponse('Erro ao adicionar atividade')
    }
  }

  // Processar comandos de remoção
  const handleRemoveCommand = (command) => {
    try {
      // Extrair atividade ou horário para remover
      let target = ''

      const patterns = [
        /remover (.+)/,
        /cancelar (.+)/,
        /deletar (.+)/
      ]

      for (const pattern of patterns) {
        const match = command.match(pattern)
        if (match) {
          target = match[1].trim()
          break
        }
      }

      if (target) {
        onRemoveActivity(target)
        speakResponse(`${target} removido da agenda`)
      } else {
        speakResponse('Não consegui entender o que remover. Tente: remover meditação')
      }
    } catch (error) {
      console.error('Erro ao processar comando de remoção:', error)
      speakResponse('Erro ao remover atividade')
    }
  }

  // Encontrar melhor categoria baseada na atividade
  const findBestCategory = (activity) => {
    const activityLower = activity.toLowerCase()
    
    // Mapeamento de palavras-chave para categorias
    const categoryKeywords = {
      'autocuidado': ['meditação', 'oração', 'exercício', 'banho', 'skincare', 'relaxar', 'descansar'],
      'cuidados_bebe': ['amamentação', 'fralda', 'banho bebê', 'mamadeira', 'soneca bebê'],
      'rotinas_casa': ['limpeza', 'cozinhar', 'compras', 'organizar', 'lavar'],
      'casal': ['conversa', 'intimidade', 'encontro', 'jantar romântico'],
      'familia': ['família', 'filhos', 'brincadeira', 'passeio família'],
      'profissional': ['trabalho', 'reunião', 'estudo', 'curso', 'projeto']
    }

    for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => activityLower.includes(keyword))) {
        return categoryId
      }
    }

    return 'autocuidado' // categoria padrão
  }

  // Iniciar/parar reconhecimento de voz
  const toggleListening = () => {
    if (!isSupported) {
      speakResponse('Reconhecimento de voz não suportado neste navegador')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="voice-commands">
      {/* Botão de Voz */}
      <Button
        onClick={toggleListening}
        className={`fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
        title={isListening ? 'Parar gravação' : 'Iniciar comando de voz'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Indicador de Status */}
      {isListening && (
        <div className="fixed bottom-36 right-6 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Escutando...</span>
          </div>
        </div>
      )}

      {/* Último Comando */}
      {lastCommand && !isListening && (
        <div className="fixed bottom-36 right-6 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-w-xs">
          <div className="flex items-start space-x-2">
            <Volume2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Último comando:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{lastCommand}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ajuda de Comandos */}
      <div className="fixed bottom-6 left-6 z-40 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-w-sm opacity-80 hover:opacity-100 transition-opacity">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comandos de Voz:</h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• "Adicionar [atividade] às [hora]"</li>
          <li>• "Remover [atividade]"</li>
          <li>• "Próxima semana"</li>
          <li>• "Mostrar relatório"</li>
          <li>• "Modo escuro/claro"</li>
        </ul>
      </div>
    </div>
  )
}

export default VoiceCommands
