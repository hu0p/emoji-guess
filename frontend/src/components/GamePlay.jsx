import React, { useRef, useEffect, useState } from 'react'
import { RotateCcw, Command, Keyboard, X, Check } from 'lucide-react'
import { useGameContext } from '../context/GameContext'
import HUD from './HUD'
import RestartModal from './RestartModal'

function isMac() {
  return (
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
  )
}

function isMobile() {
  return (
    typeof window !== "undefined" &&
    /Mobi|Android/i.test(window.navigator.userAgent)
  )
}

export default function GamePlay() {
  const {
    currentEmoji,
    answer,
    hint,
    input,
    setInput,
    submitted,
    isCorrect,
    isExactMatch,
    isPartial,
    timer,
    displayScore,
    current,
    NUM_EMOJIS,
    emojiKey,
    handleSubmit,
    handleSkip,
    startGame,
  } = useGameContext()

  const inputRef = useRef(null)
  const [isMacPlatform, setIsMacPlatform] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showRestartModal, setShowRestartModal] = useState(false)
  const [animatingIcon, setAnimatingIcon] = useState(null)

  useEffect(() => {
    setIsMacPlatform(isMac())
    setIsMobileDevice(isMobile())
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [current])

  // Global skip shortcut
  useEffect(() => {
    if (isMobileDevice) return
    function onGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        // Only allow skip during active gameplay
        if (!submitted) {
          handleSkip()
        }
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [isMobileDevice, submitted, handleSkip])

  const handleInputSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || submitted) return

    // Only submit if the answer is correct (like the original Game.jsx)
    if (isCorrect) {
      // Set the animating icon
      const iconType = isExactMatch ? 'perfect' : 'partial'
      setAnimatingIcon(iconType)

      // Clear animation after it completes
      setTimeout(() => {
        setAnimatingIcon(null)
      }, 1000)

      handleSubmit(input.trim())
    }
    // If incorrect, do nothing - let the user keep typing
  }

  const handleInputChange = (e) => {
    if (!submitted) {
      setInput(e.target.value)
    }
  }

  return (
    <main className="w-full max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl px-6 pt-10 pb-0 flex flex-col items-center border border-gray-100 relative">
      <div
        key={emojiKey}
        className="text-8xl mb-6 emoji-transition"
        role="img"
        aria-label={`Current emoji: ${currentEmoji.name || 'Loading'}`}
      >
        {currentEmoji.emoji || '❓'}
      </div>

      {/* Hint display */}
      <section className="w-full mb-4 text-center" aria-labelledby="hint-label">
        <span id="hint-label" className="sr-only">Hint area</span>
        {hint ? (
          <div className="font-mono text-lg text-gray-600" aria-live="polite" aria-label={`Hint: ${hint}`}>
            {hint}
          </div>
        ) : (
          <div className="font-mono text-lg text-gray-400" aria-label={`Word length: ${Math.max(1, answer.length)} characters`}>
            {"_".repeat(Math.max(1, answer.length))}
          </div>
        )}
      </section>

      <div className="w-full relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleInputSubmit(e)
            }
          }}
          placeholder="Type the emoji name and press Enter..."
          autoFocus
          aria-label="Emoji name input"
          aria-describedby="input-help"
          className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg pr-12 bg-white shadow-sm transition-all duration-200"
          disabled={submitted}
        />
        <span id="input-help" className="sr-only">Type the name of the emoji shown above and press Enter to submit your answer</span>

        {/* Status indicators */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          {/* Show indicator while typing */}
          {input.length > 0 && !submitted && !animatingIcon && (
            <div className="flex items-center">
              {isExactMatch ? (
                <span className="text-2xl" aria-label="Perfect match">💯</span>
              ) : isPartial ? (
                <Check className="w-6 h-6 text-green-500" aria-label="Partial match" />
              ) : (
                <X className="w-6 h-6 text-red-500" aria-label="Incorrect" />
              )}
            </div>
          )}

          {/* Animating icon that persists during animation */}
          {animatingIcon && (
            <div
              className="flex items-center animate-rise-fade"
            >
              {animatingIcon === 'perfect' ? (
                <span className="text-2xl" aria-label="Perfect match submitted">💯</span>
              ) : (
                <Check className="w-6 h-6 text-green-500" aria-label="Partial match submitted" />
              )}
            </div>
          )}

          {/* Show X for expired/incorrect submissions */}
          {submitted && !isCorrect && input.trim() && !animatingIcon && (
            <div className="flex items-center">
              <X className="w-6 h-6 text-red-500" aria-label="Incorrect answer" />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mb-4 mt-4">
        <button
          onClick={handleSkip}
          aria-label={`Pass this emoji${!isMobileDevice ? ` (${isMacPlatform ? 'Cmd' : 'Ctrl'}+K)` : ''}`}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer overflow-hidden"
          disabled={submitted}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
          <span className="relative z-10 flex items-center gap-2">
            Pass
            {!isMobileDevice && (
              <span className="ml-2 flex items-center text-xs text-white/80">
                {isMacPlatform ? (
                  <>
                    <Command className="w-4 h-4 inline-block mr-0.5" />K
                  </>
                ) : (
                  <>
                    <Keyboard className="w-4 h-4 inline-block mr-0.5" />
                    Ctrl+K
                  </>
                )}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setShowRestartModal(true)}
          aria-label="Restart game (current score will be lost)"
          className="group relative px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
          <span className="relative z-10 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart
          </span>
        </button>
      </div>

      <HUD
        timer={timer}
        displayScore={displayScore}
        current={current}
        totalEmojis={NUM_EMOJIS}
      />

      <RestartModal
        show={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        onConfirm={() => {
          setShowRestartModal(false)
          startGame()
        }}
      />
    </main>
  )
}