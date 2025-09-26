import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Moon, Sun, Search, ChevronDown, X, Download, ChevronLeft, ChevronRight, Edit, Plus, Trash2, Menu } from 'lucide-react'
import VoiceCommands from './VoiceCommands.jsx'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState('autocuidado')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBlock, setFilterBlock] = useState('todos')
  const [currentView, setCurrentView] = useState('Semana')
  const [currentTab, setCurrentTab] = useState('Blocos')
  const [expandedBlocks, setExpandedBlocks] = useState(['autocuidado'])
  const [draggedItem, setDraggedItem] = useState(null)
  const [scheduledItems, setScheduledItems] = useState({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingItem, setEditingItem] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editCategoryModal, setEditCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Novos estados para adição rápida mobile
  const [quickAddModal, setQuickAddModal] = useState(false)
  const [quickAddData, setQuickAddData] = useState({
    category: '',
    subcategory: '',
    timeSlot: '',
    duration: 30,
    dayIndex: 0,
    fullDate: null
  })

  // Estado inicial dos blocos (agora editável)
  const [blocksData, setBlocksData] = useState({
    autocuidado: {
      id: 'autocuidado',
      name: 'Autocuidado',
      color: 'rgb(139, 92, 246)',
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50',
      subcategories: [
        'Meditação',
        'Tempo p/ mim',
        'Dieta',
        'Depilação',
        'Cabelo',
        'Unhas',
        'Hidratação',
        'Acordar'
      ]
    },
    cuidados_bebe: {
      id: 'cuidados_bebe',
      name: 'Cuidados com bebê',
      color: 'rgb(236, 72, 153)',
      borderColor: 'border-pink-300',
      bgColor: 'bg-pink-50',
      subcategories: [
        'Amamentação',
        'Alimentação',
        'Banho',
        'Passeio',
        'Brincadeiras',
        'Despertar',
        'Sono',
        'Maternidade'
      ]
    },
    rotinas_casa: {
      id: 'rotinas_casa',
      name: 'Rotinas de Casa',
      color: 'rgb(234, 179, 8)',
      borderColor: 'border-yellow-300',
      bgColor: 'bg-yellow-50',
      subcategories: [
        'Limpeza',
        'Organização',
        'Cozinhar',
        'Compras',
        'Lavanderia',
        'Jardinagem'
      ]
    },
    casal: {
      id: 'casal',
      name: 'Casal',
      color: 'rgb(239, 68, 68)',
      borderColor: 'border-red-300',
      bgColor: 'bg-red-50',
      subcategories: [
        'Conversa',
        'Intimidade',
        'Atividades juntos'
      ]
    },
    familia: {
      id: 'familia',
      name: 'Família',
      color: 'rgb(168, 85, 247)',
      borderColor: 'border-violet-300',
      bgColor: 'bg-violet-50',
      subcategories: [
        'Tempo em família',
        'Atividades com filhos'
      ]
    },
    profissional: {
      id: 'profissional',
      name: 'Profissional',
      color: 'rgb(59, 130, 246)',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      subcategories: [
        'Trabalho',
        'Estudos',
        'Networking',
        'Desenvolvimento'
      ]
    }
  })

  // Detectar se é dispositivo móvel
  const isMobile = () => {
    return window.innerWidth < 768
  }

  // Gerar horários para visualização
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 23 && minute > 30) break
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

  // Gerar dias da semana baseado na data atual
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push({
        short: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'][i],
        day: day.getDate().toString(),
        fullDate: day
      })
    }
    return days
  }

  // Gerar calendário mensal baseado na data atual
  const generateMonthCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const calendar = []
    const current = new Date(startDate)
    
    for (let week = 0; week < 6; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = current.getMonth() === month
        weekDays.push({
          date: current.getDate(),
          isCurrentMonth,
          fullDate: new Date(current)
        })
        current.setDate(current.getDate() + 1)
      }
      calendar.push(weekDays)
      if (current > lastDay && current.getDay() === 0) break
    }
    
    return calendar
  }

  // Gerar meses do ano baseado na data atual
  const generateYearMonths = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril',
      'Maio', 'Junho', 'Julho', 'Agosto',
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    
    return months.map((month, index) => {
      // Contar atividades do mês
      const monthActivities = Object.values(scheduledItems).filter(item => {
        if (item.fullDate) {
          return item.fullDate.getMonth() === index && item.fullDate.getFullYear() === currentDate.getFullYear()
        }
        return false
      }).length

      return {
        name: month,
        activities: monthActivities,
        monthIndex: index
      }
    })
  }

  // Calcular estatísticas do relatório
  const calculateStats = () => {
    const stats = {
      totalTime: 0,
      totalActivities: 0,
      byCategory: {},
      byPeriod: { morning: 0, afternoon: 0, night: 0 }
    }

    // Inicializar categorias
    Object.values(blocksData).forEach(block => {
      stats.byCategory[block.id] = {
        name: block.name,
        color: block.color,
        time: 0,
        count: 0
      }
    })

    // Calcular estatísticas dos itens agendados
    Object.values(scheduledItems).forEach(item => {
      const duration = item.duration || 30
      stats.totalTime += duration
      stats.totalActivities += 1
      
      if (stats.byCategory[item.blockId]) {
        stats.byCategory[item.blockId].time += duration
        stats.byCategory[item.blockId].count += 1
      }

      // Calcular por período
      if (item.timeSlot) {
        const hour = parseInt(item.timeSlot.split(':')[0])
        if (hour < 12) stats.byPeriod.morning += 1
        else if (hour < 18) stats.byPeriod.afternoon += 1
        else stats.byPeriod.night += 1
      }
    })

    return stats
  }

  const timeSlots = generateTimeSlots()
  const weekDays = generateWeekDays()
  const monthCalendar = generateMonthCalendar()
  const yearMonths = generateYearMonths()
  const stats = calculateStats()

  // Navegação temporal
  const navigateTime = (direction) => {
    const newDate = new Date(currentDate)
    
    if (currentView === 'Dia') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (currentView === 'Semana') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (currentView === 'Mes') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (currentView === 'Ano') {
      newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  // Formatar data para exibição
  const formatCurrentPeriod = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    
    if (currentView === 'Dia') {
      return currentDate.toLocaleDateString('pt-BR', options)
    } else if (currentView === 'Semana') {
      const startWeek = new Date(currentDate)
      startWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endWeek = new Date(startWeek)
      endWeek.setDate(startWeek.getDate() + 6)
      return `${startWeek.getDate()} - ${endWeek.getDate()} de ${startWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    } else if (currentView === 'Mes') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    } else if (currentView === 'Ano') {
      return currentDate.getFullYear().toString()
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Toggle sidebar (mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Toggle block expansion
  const toggleBlockExpansion = (blockId) => {
    setExpandedBlocks(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    )
  }

  // Filtrar blocos baseado na busca e filtro
  const filteredBlocks = Object.values(blocksData).filter(block => {
    const matchesSearch = searchTerm === '' || 
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterBlock === 'todos' || filterBlock === block.id
    
    return matchesSearch && matchesFilter
  })

  // Atualizar foco da semana baseado na busca
  useEffect(() => {
    if (searchTerm) {
      const foundBlock = Object.values(blocksData).find(block => 
        block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      if (foundBlock) {
        setSelectedBlock(foundBlock.id)
      }
    }
  }, [searchTerm, blocksData])

  // Quick Add handlers
  const handleSlotClick = (timeSlot, dayIndex, fullDate = null) => {
    // Se for mobile, abrir modal de adição rápida
    if (isMobile()) {
      setQuickAddData({
        category: '',
        subcategory: '',
        timeSlot,
        duration: 30,
        dayIndex,
        fullDate: fullDate || weekDays[dayIndex]?.fullDate
      })
      setQuickAddModal(true)
    }
  }

  const handleQuickAdd = () => {
    if (quickAddData.category && quickAddData.subcategory) {
      const key = quickAddData.fullDate ? 
        `${quickAddData.timeSlot}-${quickAddData.fullDate.toISOString().split('T')[0]}` : 
        `${quickAddData.timeSlot}-${quickAddData.dayIndex}`
      
      const blockData = blocksData[quickAddData.category]
      
      setScheduledItems(prev => ({
        ...prev,
        [key]: {
          item: quickAddData.subcategory,
          blockId: quickAddData.category,
          color: blockData.color,
          duration: quickAddData.duration,
          timeSlot: quickAddData.timeSlot,
          dayIndex: quickAddData.dayIndex,
          fullDate: quickAddData.fullDate,
          id: key
        }
      }))
      
      setQuickAddModal(false)
      setQuickAddData({
        category: '',
        subcategory: '',
        timeSlot: '',
        duration: 30,
        dayIndex: 0,
        fullDate: null
      })
    }
  }

  const openQuickAddModal = () => {
    setQuickAddData({
      category: '',
      subcategory: '',
      timeSlot: '08:00',
      duration: 30,
      dayIndex: 0,
      fullDate: new Date()
    })
    setQuickAddModal(true)
  }

  // Drag and drop handlers
  const handleDragStart = (e, item, blockId) => {
    setDraggedItem({ item, blockId, color: blocksData[blockId].color, duration: 30 })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, timeSlot, dayIndex, fullDate = null) => {
    e.preventDefault()
    if (draggedItem) {
      const key = fullDate ? 
        `${timeSlot}-${fullDate.toISOString().split('T')[0]}` : 
        `${timeSlot}-${dayIndex}`
      
      setScheduledItems(prev => ({
        ...prev,
        [key]: { 
          ...draggedItem, 
          timeSlot, 
          dayIndex, 
          fullDate: fullDate || weekDays[dayIndex]?.fullDate,
          id: key 
        }
      }))
      setDraggedItem(null)
      // Fechar sidebar no mobile após drop
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
  }

  const removeScheduledItem = (key) => {
    setScheduledItems(prev => {
      const newItems = { ...prev }
      delete newItems[key]
      return newItems
    })
  }

  // Edit item handlers
  const handleEditItem = (item) => {
    setEditingItem({ ...item })
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingItem) {
      setScheduledItems(prev => ({
        ...prev,
        [editingItem.id]: editingItem
      }))
      setEditModalOpen(false)
      setEditingItem(null)
    }
  }

  const handleDeleteItem = () => {
    if (editingItem) {
      removeScheduledItem(editingItem.id)
      setEditModalOpen(false)
      setEditingItem(null)
    }
  }

  // Category management
  const handleEditCategory = (category) => {
    setEditingCategory({ ...category })
    setEditCategoryModal(true)
  }

  const handleSaveCategory = () => {
    if (editingCategory) {
      setBlocksData(prev => ({
        ...prev,
        [editingCategory.id]: editingCategory
      }))
      setEditCategoryModal(false)
      setEditingCategory(null)
    }
  }

  const addSubcategory = () => {
    if (editingCategory) {
      setEditingCategory(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, 'Nova subcategoria']
      }))
    }
  }

  const removeSubcategory = (index) => {
    if (editingCategory) {
      setEditingCategory(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter((_, i) => i !== index)
      }))
    }
  }

  const updateSubcategory = (index, value) => {
    if (editingCategory) {
      setEditingCategory(prev => ({
        ...prev,
        subcategories: prev.subcategories.map((sub, i) => i === index ? value : sub)
      }))
    }
  }

  // Export CSV
  const exportCSV = () => {
    const csvData = [
      ['Categoria', 'Tempo (min)', 'Atividades'],
      ...Object.values(stats.byCategory).map(cat => [
        cat.name,
        cat.time,
        cat.count
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio-semanal.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Voice command handlers
  const handleVoiceAddActivity = (activityData) => {
    const { item, timeSlot, category, duration } = activityData
    const blockData = blocksData[category] || blocksData['autocuidado']
    
    // Usar data atual para comando de voz
    const today = new Date()
    const key = `${timeSlot}-${today.toISOString().split('T')[0]}`
    
    setScheduledItems(prev => ({
      ...prev,
      [key]: {
        item,
        blockId: category,
        color: blockData.color,
        duration,
        timeSlot,
        dayIndex: today.getDay(),
        fullDate: today,
        id: key
      }
    }))
  }

  const handleVoiceRemoveActivity = (target) => {
    // Remover por nome da atividade ou horário
    const itemsToRemove = Object.entries(scheduledItems).filter(([key, item]) => {
      return item.item.toLowerCase().includes(target.toLowerCase()) ||
             item.timeSlot.includes(target)
    })

    if (itemsToRemove.length > 0) {
      setScheduledItems(prev => {
        const newItems = { ...prev }
        itemsToRemove.forEach(([key]) => {
          delete newItems[key]
        })
        return newItems
      })
    }
  }

  const handleVoiceNavigate = (direction) => {
    if (direction === 'today') {
      setCurrentDate(new Date())
    } else {
      navigateTime(direction)
    }
  }

  const handleVoiceViewChange = (view) => {
    setCurrentView(view)
  }

  const handleVoiceToggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleVoiceShowReport = () => {
    setCurrentTab('Relatório')
  }

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar')
        if (sidebar && !sidebar.contains(event.target) && !event.target.closest('#menu-button')) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  // Render Day View
  const renderDayView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{formatCurrentPeriod()}</h2>
      </div>
      
      <div className="max-h-[400px] md:max-h-[600px] overflow-y-auto">
        {timeSlots.map((slot, index) => {
          const key = `${slot.time}-${currentDate.toISOString().split('T')[0]}`
          const scheduledItem = scheduledItems[key]
          
          return (
            <div key={index} className="flex border-b border-gray-100 dark:border-gray-600">
              <div className="w-16 md:w-20 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex items-center">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    title={slot.period}
                    style={{ backgroundColor: slot.periodColor }}
                  />
                  <span className="text-xs md:text-sm text-gray-900 dark:text-white">{slot.time}</span>
                </div>
              </div>
              <div 
                className="flex-1 p-2 md:p-3 min-h-[40px] md:min-h-[50px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slot.time, 0, currentDate)}
                onClick={() => handleSlotClick(slot.time, 0, currentDate)}
              >
                {scheduledItem ? (
                  <div 
                    className="w-full h-full rounded text-xs md:text-sm p-1 md:p-2 text-white font-medium flex items-center justify-between scheduled-item cursor-pointer"
                    style={{ backgroundColor: scheduledItem.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditItem(scheduledItem)
                    }}
                  >
                    <span className="truncate">{scheduledItem.item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeScheduledItem(key)
                      }}
                      className="p-0 h-4 w-4 md:h-5 md:w-5 text-white hover:bg-white/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Render Year View
  const renderYearView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {yearMonths.map((month, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white mb-1 md:mb-2">{month.name}</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{month.activities} atividades</p>
          </div>
        ))}
      </div>
    </div>
  )

  // Render Month View
  const renderMonthView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-600">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
          <div key={index} className="p-2 md:p-3 bg-gray-50 dark:bg-gray-700 text-center font-medium text-xs md:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendário */}
      {monthCalendar.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
          {week.map((day, dayIndex) => {
            // Buscar atividades do dia
            const dayActivities = Object.values(scheduledItems).filter(item => {
              if (item.fullDate) {
                return item.fullDate.toDateString() === day.fullDate.toDateString()
              }
              return false
            })

            return (
              <div 
                key={dayIndex} 
                className={`p-1 md:p-2 h-16 md:h-24 border-r border-gray-100 dark:border-gray-600 last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                  !day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, '12:00', dayIndex, day.fullDate)}
                onClick={() => handleSlotClick('12:00', dayIndex, day.fullDate)}
              >
                <div className="font-medium mb-1 text-xs md:text-sm">{day.date}</div>
                <div className="space-y-1">
                  {dayActivities.slice(0, 1).map((activity, actIndex) => (
                    <div 
                      key={actIndex}
                      className="text-xs p-1 rounded text-white truncate cursor-pointer"
                      style={{ backgroundColor: activity.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditItem(activity)
                      }}
                    >
                      {activity.item}
                    </div>
                  ))}
                  {dayActivities.length > 1 && (
                    <div className="text-xs text-gray-500">+{dayActivities.length - 1}</div>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  // Render Week View
  const renderWeekView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
          <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">Horário</div>
        </div>
        {weekDays.map((day, index) => (
          <div key={index} className="p-1 md:p-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 text-center last:border-r-0">
            <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">{day.short}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{day.day}</div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="max-h-[400px] md:max-h-[600px] overflow-y-auto">
        {timeSlots.map((slot, index) => (
          <div key={index} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-600">
            <div className="p-1 md:p-2 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex items-center">
              <div className="flex items-center space-x-1 md:space-x-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  title={slot.period}
                  style={{ backgroundColor: slot.periodColor }}
                />
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{slot.time}</span>
              </div>
            </div>
            {weekDays.map((day, dayIndex) => {
              const key = `${slot.time}-${day.fullDate.toISOString().split('T')[0]}`
              const scheduledItem = scheduledItems[key]
              
              return (
                <div 
                  key={dayIndex} 
                  className="p-1 border-r border-gray-100 dark:border-gray-600 min-h-[32px] md:min-h-[40px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative last:border-r-0 cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slot.time, dayIndex, day.fullDate)}
                  onClick={() => handleSlotClick(slot.time, dayIndex, day.fullDate)}
                >
                  {scheduledItem ? (
                    <div 
                      className="w-full h-full rounded text-xs p-1 text-white font-medium flex items-center justify-between scheduled-item cursor-pointer"
                      style={{ backgroundColor: scheduledItem.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditItem(scheduledItem)
                      }}
                    >
                      <span className="truncate">{scheduledItem.item}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeScheduledItem(key)
                        }}
                        className="p-0 h-3 w-3 md:h-4 md:w-4 text-white hover:bg-white/20"
                      >
                        <X className="w-2 h-2 md:w-3 md:h-3" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  // Render Relatório Tab
  const renderRelatorioTab = () => (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Relatório Semanal</h2>
      
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 md:p-6 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTime}min</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tempo Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 md:p-6 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalActividades}</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Atividades</div>
        </div>
      </div>

      {/* Por Categoria */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Por Categoria</h3>
        <div className="space-y-2 md:space-y-3">
          {Object.values(stats.byCategory).map((category, index) => (
            <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{category.time}min ({category.count})</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exportar */}
      <Button onClick={exportCSV} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        <Download className="w-4 h-4 mr-2" />
        Exportar CSV
      </Button>
    </div>
  )

  // Render Stats Tab
  const renderStatsTab = () => (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Estatísticas</h2>
      
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Distribuição por Período */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Distribuição por Período</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manhã (6h-12h)</span>
              <span className="font-semibold text-yellow-600">{stats.byPeriod.morning} atividades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Tarde (12h-18h)</span>
              <span className="font-semibold text-green-600">{stats.byPeriod.afternoon} atividades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Noite (18h-24h)</span>
              <span className="font-semibold text-indigo-600">{stats.byPeriod.night} atividades</span>
            </div>
          </div>
        </div>

        {/* Produtividade */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Produtividade</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Média diária</span>
              <span className="font-semibold text-blue-600">{Math.round(stats.totalTime / 7)}min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Categoria mais ativa</span>
              <span className="font-semibold text-purple-600">
                {Object.values(stats.byCategory).reduce((max, cat) => 
                  cat.time > max.time ? cat : max, { name: 'Nenhuma', time: 0 }
                ).name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          id="menu-button"
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Floating Add Button (Mobile) */}
      {isMobile() && currentTab === 'Blocos' && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={openQuickAddModal}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed md:relative z-40 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-full md:h-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
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
            {['Blocos', 'Relatório', 'Stats'].map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setCurrentTab(tab)}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium ${
                  currentTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {currentTab === 'Blocos' && (
          <>
            {/* Focus Block Selection */}
            {selectedBlock && (
              <div className="mb-4 p-3 md:p-4 bg-green-100 dark:bg-green-900 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs md:text-sm font-semibold text-green-800 dark:text-green-200">
                    Foco da Semana: {blocksData[selectedBlock]?.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBlock('')}
                    className="text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 p-1"
                  >
                    Limpar Foco
                  </Button>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-4 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              
              {/* Filter Dropdown */}
              <Select value={filterBlock} onValueChange={setFilterBlock}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Todos os blocos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os blocos</SelectItem>
                  {Object.values(blocksData).map((block) => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Block List with Subcategories */}
            <div className="space-y-3 md:space-y-4">
              {filteredBlocks.map((block) => (
                <div key={block.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      onClick={() => toggleBlockExpansion(block.id)}
                      className="flex-1 flex items-center justify-between p-2 md:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: block.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white text-xs md:text-sm">
                          {block.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {block.subcategories.length}
                        </span>
                        <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${
                          expandedBlocks.includes(block.id) ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(block)}
                      className="p-1 md:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>

                  {/* Subcategories Grid - 3 colunas com padding reduzido */}
                  {expandedBlocks.includes(block.id) && (
                    <div className={`p-2 ${block.bgColor} dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600`}>
                      <div className="grid grid-cols-3 gap-1">
                        {block.subcategories.map((subcategory, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, subcategory, block.id)}
                            className={`p-1 bg-white dark:bg-gray-600 rounded border border-dashed ${block.borderColor} 
                                      cursor-move hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors
                                      text-xs text-center text-gray-700 dark:text-gray-200 subcategory-item
                                      min-h-[24px] md:min-h-[28px] flex items-center justify-center`}
                          >
                            <span className="leading-tight">{subcategory}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {currentTab === 'Relatório' && renderRelatorioTab()}
        {currentTab === 'Stats' && renderStatsTab()}
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-4 pt-16 md:pt-4">
        {/* View Selector and Navigation - only show for Blocos tab */}
        {currentTab === 'Blocos' && (
          <div className="mb-3 md:mb-4 space-y-3 md:space-y-4">
            {/* View Selector */}
            <div className="flex justify-center space-x-1 md:space-x-2">
              {['Dia', 'Semana', 'Mes', 'Ano'].map((view) => (
                <Button
                  key={view}
                  variant={currentView === view ? 'default' : 'secondary'}
                  onClick={() => setCurrentView(view)}
                  className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg font-medium transition-colors"
                >
                  {view}
                </Button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigateTime('prev')}
                className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span>Anterior</span>
              </Button>
              
              <h2 className="text-sm md:text-xl font-semibold text-gray-900 dark:text-white text-center px-2">
                {formatCurrentPeriod()}
              </h2>
              
              <Button
                variant="outline"
                onClick={() => navigateTime('next')}
                className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
              >
                <span>Próximo</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Render appropriate view */}
        {currentTab === 'Blocos' && (
          <>
            {currentView === 'Dia' && renderDayView()}
            {currentView === 'Ano' && renderYearView()}
            {currentView === 'Mes' && renderMonthView()}
            {currentView === 'Semana' && renderWeekView()}
          </>
        )}
      </div>

      {/* Quick Add Modal */}
      <Dialog open={quickAddModal} onOpenChange={setQuickAddModal}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Adicionar Atividade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <Select 
                value={quickAddData.category} 
                onValueChange={(value) => setQuickAddData(prev => ({ ...prev, category: value, subcategory: '' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(blocksData).map((block) => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {quickAddData.category && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategoria</label>
                <Select 
                  value={quickAddData.subcategory} 
                  onValueChange={(value) => setQuickAddData(prev => ({ ...prev, subcategory: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocksData[quickAddData.category]?.subcategories.map((sub, index) => (
                      <SelectItem key={index} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Horário</label>
              <Select 
                value={quickAddData.timeSlot} 
                onValueChange={(value) => setQuickAddData(prev => ({ ...prev, timeSlot: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duração (minutos)</label>
              <Input
                type="number"
                value={quickAddData.duration}
                onChange={(e) => setQuickAddData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={() => setQuickAddModal(false)} variant="outline" className="flex-1 text-sm">
                Cancelar
              </Button>
              <Button 
                onClick={handleQuickAdd} 
                className="flex-1 text-sm"
                disabled={!quickAddData.category || !quickAddData.subcategory}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <Input
                  value={editingItem.item}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, item: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Horário</label>
                <Select 
                  value={editingItem.timeSlot} 
                  onValueChange={(value) => setEditingItem(prev => ({ ...prev, timeSlot: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.time} value={slot.time}>
                        {slot.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duração (minutos)</label>
                <Input
                  type="number"
                  value={editingItem.duration || 30}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
                <div 
                  className="mt-1 w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: editingItem.color }}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleDeleteItem} variant="destructive" className="flex-1 text-sm">
                  Excluir
                </Button>
                <Button onClick={() => setEditModalOpen(false)} variant="outline" className="flex-1 text-sm">
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1 text-sm">
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={editCategoryModal} onOpenChange={setEditCategoryModal}>
        <DialogContent className="sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Categoria</label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategorias</label>
                  <Button onClick={addSubcategory} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {editingCategory.subcategories.map((sub, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={sub}
                        onChange={(e) => updateSubcategory(index, e.target.value)}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={() => removeSubcategory(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={() => setEditCategoryModal(false)} variant="outline" className="flex-1 text-sm">
                  Cancelar
                </Button>
                <Button onClick={handleSaveCategory} className="flex-1 text-sm">
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voice Commands */}
      <VoiceCommands
        onAddActivity={handleVoiceAddActivity}
        onRemoveActivity={handleVoiceRemoveActivity}
        onNavigate={handleVoiceNavigate}
        onViewChange={handleVoiceViewChange}
        onToggleDarkMode={handleVoiceToggleDarkMode}
        onShowReport={handleVoiceShowReport}
        onExportData={exportCSV}
        blocksData={blocksData}
      />
    </div>
  )
}

export default App
