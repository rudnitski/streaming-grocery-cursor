"use client"

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

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
черри

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
кешью
семечки тыквенные
хлеб
`

export default function UsualGroceries({ onUsualGroceriesChange }: UsualGroceriesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isColorTransitioning, setIsColorTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [initialRect, setInitialRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Initialize with default list and notify parent when component mounts
  useEffect(() => {
    setMounted(true)
    // Notify parent if needed
    if (onUsualGroceriesChange) {
      onUsualGroceriesChange(DEFAULT_GROCERY_LIST)
    }
  }, [onUsualGroceriesChange])

  // Parse groceries into array for display
  const groceryItems = DEFAULT_GROCERY_LIST.split('\n').filter(item => item.trim().length > 0)
  
  // Show first 3 items in vertical carousel
  const displayItems = groceryItems.slice(0, 3)
  
  const handleExpandClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Store the exact button position and size for the animation
      setInitialRect(rect)
      setIsAnimating(true)
      
      // Small delay to allow state to update
      setTimeout(() => {
        setIsExpanded(true)
        setIsColorTransitioning(true)
      }, 10)
    }
  }

  const handleCollapse = () => {
    // Recalculate the target position when closing to ensure accuracy
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setInitialRect(rect)
    }
    
    setIsExpanded(false)
    // Keep isAnimating true during collapse animation
    
    // Delay color transition change to sync with size animation
    setTimeout(() => {
      setIsColorTransitioning(false)
    }, 150) // Start color transition halfway through size animation
    
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false)
      setInitialRect(null)
    }, 350) // Slightly longer to ensure smooth completion
  }

  useEffect(() => {
    // Disable body scroll when expanded
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isExpanded])
  
  return (
    <>
      <div className="w-full" ref={containerRef}>
        <div className="mb-4">
          <p className="text-sm text-white/70">
            Browse your frequent items below. Say them out loud to add to your cart.
          </p>
        </div>

        {/* Vertical carousel view (3 items) */}
        <div className="space-y-2">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="glass-subtle px-4 py-3 rounded-lg text-sm text-white/90 hover:text-white hover:glass transition-all duration-200 cursor-default"
            >
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">•</span>
                <span title={item.trim()}>
                  {item.trim()}
                </span>
              </div>
            </div>
          ))}
          
          <button
            ref={buttonRef}
            onClick={handleExpandClick}
            className="glass-subtle px-4 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:glass transition-all duration-200 w-full flex items-center justify-center"
          >
            <span>Show all ({groceryItems.length})</span>
          </button>
        </div>
      </div>

      {/* iOS-style expansion overlay - rendered as portal */}
      {mounted && (isExpanded || isAnimating) && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Background overlay */}
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleCollapse}
          />
          
          {/* Expanding content */}
          <div 
            className={`absolute backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl`}
            style={{
              left: isExpanded ? '50%' : `${initialRect?.left || 0}px`,
              top: isExpanded ? '50%' : `${initialRect?.top || 0}px`,
              width: isExpanded ? '90vw' : `${initialRect?.width || 0}px`,
              height: isExpanded ? '80vh' : `${initialRect?.height || 0}px`,
              maxWidth: isExpanded ? '500px' : `${initialRect?.width || 0}px`,
              maxHeight: isExpanded ? '600px' : `${initialRect?.height || 0}px`,
              transform: isExpanded ? 'translate(-50%, -50%)' : 'none',
              opacity: isAnimating && !isExpanded ? 0.8 : 1,
              background: isColorTransitioning 
                ? 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.95), rgba(59, 130, 246, 0.95))' 
                : 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease-in-out',
              backdropFilter: 'blur(16px)',
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Expanded content */}
            <div className={`h-full flex flex-col ${isExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ${isExpanded ? 'delay-150' : 'delay-0'}`}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Your Usual Groceries</h2>
                  <button
                    onClick={handleCollapse}
                    className="text-white/70 hover:text-white transition-colors text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-white/70 mt-1">
                  {groceryItems.length} items • Say them out loud to add to your cart
                </p>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  {groceryItems.map((item, index) => (
                    <div
                      key={index}
                      className="glass-subtle px-4 py-3 rounded-lg text-sm text-white/90 hover:text-white hover:glass transition-all duration-200 cursor-default"
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
          </div>
        </div>,
        document.body
      )}
    </>
  )
}