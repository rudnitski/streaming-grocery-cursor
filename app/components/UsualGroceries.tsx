"use client"

import { useEffect } from 'react'

interface UsualGroceriesProps {
  onUsualGroceriesChange?: (groceries: string) => void
}

// Predefined grocery list in Russian (extracted from grocery-voice-assistant-2), reorganized by categories
const DEFAULT_GROCERY_LIST = 
`капуста
морковь
огурец
кабачок
шпинат
редиска
лук
грибы
банан
груша
яблоки
манго
голубика
петрушка
укроп
салат листовой

гранола Sante
зеленый чай
Батончики «Барни»
печенье овсяное «Новое»
шоколад Ritter Sport
чай Ахмат ройбуш
арахисовая паста
хлебцы 
отруби ржаные

яйца 
капуста квашеная
тунец консервированный

масло сливочное
творог
творожок «Савушкин»
зернёный творог «Савушкин» без джема
сметана
молоко
молоко миндальное
глазированные сырки «Бискотти»
чудо ваниль
экспонента
пюрешки Fruits

гречка
макароны
рис
овсянка мелкая
сахар

филе куриное
фарш индейки
филе индейки
колбаски индейка
треска


сок персиковый-виноградный Дон Симон
сок «Сочный» ягода/мята


сыр твёрдый брусок
моцарелла мини
сыр творожный
сыр сливочный
колбаски для бутербродов

паста томатная
брокколи замороженные
овощи замороженные ассорти
фасоль стручковая замороженная
пельмени из индейки
блинчики с ветчиной и сыром
блинчики с яблоком и корицей

горчица
Намазка
сосиски «Натура» тонкие

зубная паста
бумага туалетная
гель для душа
средство для посудомойки
Калгон
салфетки

чернослив без косточки
хлеб
`

export default function UsualGroceries({ onUsualGroceriesChange }: UsualGroceriesProps) {
  // Initialize with default list and notify parent when component mounts
  useEffect(() => {
    // Notify parent if needed
    if (onUsualGroceriesChange) {
      onUsualGroceriesChange(DEFAULT_GROCERY_LIST)
    }
  }, [onUsualGroceriesChange])

  // Parse groceries into array for display
  const groceryItems = DEFAULT_GROCERY_LIST.split('\n').filter(item => item.trim().length > 0)
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-sm text-white/70">
          Browse your frequent items below. Say them out loud to add to your cart.
        </p>
      </div>

      <div className="max-h-48 overflow-y-auto">
          <div className="space-y-1">
            {groceryItems.map((item, index) => (
              <div
                key={index}
                className="glass-subtle px-3 py-2 rounded-lg text-sm text-white/90 hover:text-white hover:glass transition-all duration-200 cursor-default"
              >
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">•</span>
                  <span title={item.trim()}>
                    {item.trim()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}