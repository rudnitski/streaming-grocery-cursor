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
  
  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
        </svg>
        Your Usual Groceries
      </h3>
      <div className="glass-strong p-6 mb-8">
        <p className="text-sm text-white/70 mb-4">
          Add items you frequently buy (one per line). This helps the assistant recognize your voice input more
          accurately.
        </p>
        
        <textarea
          value={usualGroceries}
          onChange={handleChange}
          placeholder="milk
eggs
bread
bananas
coffee"
          className="w-full h-40 p-4 glass border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200"
          aria-label="Your usual grocery items, one per line"
        />
      </div>
    </div>
  )
}