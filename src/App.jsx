import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Moon, Sun, Search, ChevronDown } from 'lucide-react'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentView, setCurrentView] = useState('Semana')

  // Dados dos blocos com cores
  const blocks = [
    { id: 'autocuidado', name: 'Autocuidado', count: 9, color: 'rgb(139, 92, 246)' },
    { id: 'cuidados_bebe', name: 'Cuidados com bebê', count: 8, color: 'rgb(236, 72, 153)' },
    { id: 'rotinas_casa', name: 'Rotinas de Casa', count: 6, color: 'rgb(234, 179, 8)' },
    { id: 'casal', name: 'Casal', count: 3, color: 'rgb(239, 68, 68)' },
    { id: 'familia', name: 'Família', count: 2, color: 'rgb(168, 85, 247)' },
    { id: 'profissional', name: 'Profissional', count: 4, color: 'rgb(59, 130, 246)' }
  ]

  // Gerar horários estendidos até 23:59
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const period = hour < 12 ? 'Manhã' : hour < 18 ? 'Tarde' : 'Noite'
        const periodColor = period === 'Manhã' ? 'rgb(251, 191, 36)' : 
                           period === 'Tarde' ? 'rgb(34, 197, 94)' : 
                           'rgb(99, 102, 241)'
        slots.push({ time: timeString, period, periodColor })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Dias da semana
  const weekDays = [
    { short: 'dom.', day: '21' },
    { short: 'seg.', day: '22' },
    { short: 'ter.', day: '23' },
    { short: 'qua.', day: '24' },
    { short: 'qui.', day: '25' },
    { short: 'sex.', day: '26' },
    { short: 'sáb.', day: '27' }
  ]

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Blocos (arraste para a agenda)
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            <Button
              variant="ghost"
              className="px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
            >
              Blocos
            </Button>
            <Button
              variant="ghost"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Relatório
            </Button>
          </div>
        </div>

        {/* Focus Block Selection */}
        <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-md">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Qual bloco precisa de foco esta semana?
          </p>
          <Select value={selectedBlock} onValueChange={setSelectedBlock}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-yellow-300 dark:border-yellow-700">
              <SelectValue placeholder="Selecione um bloco" />
            </SelectTrigger>
            <SelectContent>
              {blocks.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-full justify-between"
            >
              <span>Todos os blocos</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Block List - Melhorado para 3 linhas */}
        <div className="space-y-1">
          {blocks.map((block) => (
            <div key={block.id} className="mb-1">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors h-auto"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                    style={{ backgroundColor: block.color }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {block.name}
                    </div>
                    {/* Linha adicional para subcategorias */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Subcategorias disponíveis
                    </div>
                    {/* Terceira linha para mais detalhes */}
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {block.count} atividades cadastradas
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {block.count}
                </span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* View Selector */}
        <div className="mb-4 flex justify-center space-x-2">
          {['Dia', 'Semana', 'Mes', 'Ano'].map((view) => (
            <Button
              key={view}
              variant={currentView === view ? 'default' : 'secondary'}
              onClick={() => setCurrentView(view)}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {view}
            </Button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Horário</div>
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{day.short}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{day.day}</div>
              </div>
            ))}
          </div>

          {/* Time Slots - Estendido até 23:30 */}
          <div className="max-h-[600px] overflow-y-auto">
            {timeSlots.map((slot, index) => (
              <div key={index} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-600">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      title={slot.period}
                      style={{ backgroundColor: slot.periodColor }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{slot.time}</span>
                  </div>
                </div>
                {weekDays.map((_, dayIndex) => (
                  <div 
                    key={dayIndex} 
                    className="p-1 border-r border-gray-100 dark:border-gray-600 min-h-[40px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
