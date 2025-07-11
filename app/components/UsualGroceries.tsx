"use client"

import { useState, useEffect } from 'react'

interface UsualGroceriesProps {
  onUsualGroceriesChange?: (groceries: string) => void
}

// Predefined grocery list in Russian (extracted from grocery-voice-assistant-2)
const DEFAULT_GROCERY_LIST = `сок персиковый-виноградный Дон Симон
отруби ржаные
печенье овсяное «Новое»
масло сливочное
сыр твёрдый брусок
петрушка
авокадо
филе куриное
фарш индейки
колбаски индейка
филе индейки
экспонента
хлеб с томатами
сосиски «Натура» тонкие
чай Ахмат ройбуш
молоко
творог
грибы
горчица
голубика
макароны
груша
моцарелла мини
морковь
огурец
сметана
арахисовая паста
кабачок
банан
бумага туалетная
колбаска
яблоки
сыр сливочный
йогурт «Чудо» ваниль
перец
шпинат
помидоры черри
яйца
фасоль
творожок «Савушкин»
зернёный творог «Савушкин» без джема
сыр творожный
Батончики «Барни»
Намазка
овсянка мелкая
треска
пельмени из индейки
блинчики с ветчиной и сыром
блинчики с яблоком и корицей
капуста белокочанная
капуста квашеная
зубная паста
лук репчатый
пюрешки Fruits
фасоль стручковая (зам.)
сок «Сочный» ягода/мята
сахар
гранола Sante
шоколад Ritter Sport
масло подсолнечное
масло оливковое
тунец консервированный
укроп
гречка
средство для посуды
овощи замороженные ассорти
брокколи замороженные
глазированные сырки «Бискотти»
паста томатная
салат листовой
Калгон (средство для стиральных машин)
хлебцы плоские
молоко миндальное
манго
редиска
картофель
джем`

export default function UsualGroceries({ onUsualGroceriesChange }: UsualGroceriesProps) {
  const [usualGroceries, setUsualGroceries] = useState(DEFAULT_GROCERY_LIST)
  const [isEditing, setIsEditing] = useState(false)
  
  // Initialize with default list and notify parent when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if localStorage already has a value, otherwise use the default list
      const savedGroceries = localStorage.getItem('usualGroceries') || DEFAULT_GROCERY_LIST
      
      // Set the groceries (either from localStorage or default)
      setUsualGroceries(savedGroceries)
      
      // Save default list to localStorage if nothing was there
      if (!localStorage.getItem('usualGroceries')) {
        localStorage.setItem('usualGroceries', DEFAULT_GROCERY_LIST)
      }
      
      // Notify parent if needed
      if (onUsualGroceriesChange) {
        onUsualGroceriesChange(savedGroceries)
      }
    }
  }, [onUsualGroceriesChange])
  
  // Save groceries to localStorage and notify parent when changed
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setUsualGroceries(newValue)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('usualGroceries', newValue)
    }
    
    // Notify parent if needed
    if (onUsualGroceriesChange) {
      onUsualGroceriesChange(newValue)
    }
  }

  // Parse groceries into array for display
  const groceryItems = usualGroceries.split('\n').filter(item => item.trim().length > 0)
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/70">
          Browse your frequent items below. Say them out loud to add to your cart.
        </p>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="glass px-3 py-1 rounded-lg text-white/80 hover:text-white transition-all duration-200 hover:scale-105 flex items-center text-xs font-medium"
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className="glass p-4 rounded-lg">
          <textarea
            value={usualGroceries}
            onChange={handleChange}
            placeholder="milk
eggs
bread
bananas
coffee"
            className="w-full h-32 p-3 glass border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200"
            aria-label="Your usual grocery items, one per line"
          />
          <p className="text-xs text-white/50 mt-2">
            Add one item per line. This helps voice recognition accuracy.
          </p>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {groceryItems.map((item, index) => (
              <div
                key={index}
                className="glass-subtle px-3 py-2 rounded-lg text-sm text-white/90 hover:text-white hover:glass transition-all duration-200 cursor-default"
              >
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">•</span>
                  <span className="truncate" title={item.trim()}>
                    {item.trim()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {groceryItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60 text-sm">No items yet</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-400 hover:text-blue-300 text-sm underline mt-2"
              >
                Add some groceries
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}