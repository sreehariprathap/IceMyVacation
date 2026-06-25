import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TRAVEL_WORDS = [
  'Temples',
  'Sunsets',
  'Adventures',
  'Hidden gems',
  'Local cuisine',
  'Cobblestones',
  'Horizons',
  'Memories',
]

export function LoadingState() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % TRAVEL_WORDS.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 px-4">
      {/* Dot pulse */}
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-[#C9956A]"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Heading + cycling word */}
      <div className="text-center space-y-3">
        <h2 className="font-playfair italic text-3xl md:text-4xl text-foreground">
          Crafting your journey…
        </h2>

        <div className="h-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
              className="text-lg text-[#C9956A] font-light tracking-wide"
            >
              {TRAVEL_WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          AI is weaving your personalised itinerary. This may take 15–30 seconds.
        </p>
      </div>
    </div>
  )
}
