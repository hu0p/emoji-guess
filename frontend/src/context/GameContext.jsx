import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const GameContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useGameContext = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}

// Constants
const MAX_TIME = 20
const NUM_EMOJIS = 10
const MAX_SCORE_PER_EMOJI = 1000
const LEADERBOARD_KEY = 'emoji-game-leaderboard'
const LEADERBOARD_SIZE = 10

function isPartialMatch(input, answer, keywords = []) {
  const normalizedInput = input.toLowerCase().trim()
  const normalizedAnswer = answer.toLowerCase().trim()

  const commonWords = ["face", "with", "the", "a", "an"]
  const answerWords = normalizedAnswer.split(" ").filter(w => !commonWords.includes(w))

  const matchesAnswerWord = answerWords.some(word => word === normalizedInput)
  const matchesKeyword = keywords.some(keyword => keyword.toLowerCase() === normalizedInput)
  const answerWithoutCommon = answerWords.join(" ")
  const matchesSimplified = answerWithoutCommon === normalizedInput

  return matchesAnswerWord || matchesKeyword || matchesSimplified
}

function getHint(answer, timer) {
  const words = answer.split(" ")

  if (timer > 15) {
    return null
  }

  let hintLevel
  if (timer > 10) {
    hintLevel = 1
  } else if (timer > 5) {
    hintLevel = 2
  } else {
    hintLevel = 3
  }

  if (hintLevel === 1) {
    return words.filter(w => w.length > 0).map(w => w[0] + "_".repeat(Math.max(0, w.length - 1))).join(" ")
  } else if (hintLevel === 2) {
    return words.filter(w => w.length > 0).map(w => {
      if (w.length === 1) return w
      if (w.length === 2) return w
      return w.slice(0, 2) + "_".repeat(Math.max(0, w.length - 2))
    }).join(" ")
  } else if (hintLevel >= 3) {
    const extraLetters = Math.min(2, hintLevel - 2)
    return words.filter(w => w.length > 0).map(w => {
      const lettersToShow = Math.min(w.length, 2 + extraLetters)
      if (lettersToShow >= w.length) return w
      return w.slice(0, lettersToShow) + "_".repeat(w.length - lettersToShow)
    }).join(" ")
  }

  return null
}

function getRandomEmojis(emojis, count) {
  const shuffled = [...emojis].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function getLeaderboard() {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading leaderboard:', error)
    return []
  }
}

function saveLeaderboard(scores) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores))
  } catch (error) {
    console.error('Error saving leaderboard:', error)
  }
}

export function GameProvider({ children }) {
  // Core game state
  const [allEmojis, setAllEmojis] = useState([])
  const [emojis, setEmojis] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [timer, setTimer] = useState(MAX_TIME)
  const [score, setScore] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [isScoreAnimating, setIsScoreAnimating] = useState(false)
  const [roundOver, setRoundOver] = useState(false)

  // Game flow state
  const [gameStarted, setGameStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Input and submission state
  const [input, setInput] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Results and UI state
  const [results, setResults] = useState([])
  const [resultsFilter, setResultsFilter] = useState("all")
  const [expandedResults, setExpandedResults] = useState(new Set())
  const [leaderboard, setLeaderboard] = useState([])
  const [emojiKey, setEmojiKey] = useState(0)
  const [bmcWidgetLoaded] = useState(false)

  // Refs for timer and animation
  const timerRef = useRef(null)
  const scoreAnimationRef = useRef(null)
  const inputRef = useRef("")

  // Computed values
  const currentEmoji = emojis[current] || {}
  const answer = currentEmoji.name?.toLowerCase().trim() || ""
  const isExactMatch = input.toLowerCase().trim() === answer
  const isPartial = !isExactMatch && isPartialMatch(input, answer, currentEmoji.keywords || [])
  const isCorrect = isExactMatch || isPartial
  const hint = getHint(answer, timer)

  // Keep input ref in sync with input state
  inputRef.current = input

  // Game logic functions
  const handleGuessResult = useCallback((isCorrect, isExact, guess, isExpired = false) => {
    console.log('handleGuessResult called with:', { isCorrect, isExact, guess: `"${guess}"`, isExpired })

    setSubmitted(true)

    const pointsEarned = isCorrect ? Math.floor((timer / MAX_TIME) * MAX_SCORE_PER_EMOJI) : 0
    const newResult = {
      emoji: emojis[current],
      correct: isCorrect,
      exact: isCorrect ? isExact : false,
      guess: guess,
      points: pointsEarned,
      timeLeft: timer,
      isExpired: isExpired
    }

    console.log('Created result:', newResult)
    setResults(prev => [...prev, newResult])

    if (isCorrect) {
      setScore(prev => prev + pointsEarned)
      setIsScoreAnimating(true)
    }

    setTimeout(() => {
      if (current >= NUM_EMOJIS - 1) {
        // End game inline to avoid circular dependencies
        setRoundOver(true)
        setGameStarted(false)
        setShowResults(true)

        const finalScoreValue = score + (isCorrect ? pointsEarned : 0)

        // Only add to leaderboard if score is greater than 0
        if (finalScoreValue > 0) {
          const finalScore = {
            score: finalScoreValue,
            date: new Date().toISOString(),
            correct: [...results, newResult].filter(r => r.correct).length,
            partial: [...results, newResult].filter(r => r.partial && !r.correct).length,
            total: NUM_EMOJIS
          }

          const newLeaderboard = [...leaderboard, finalScore]
            .sort((a, b) => b.score - a.score)
            .slice(0, LEADERBOARD_SIZE)

          setLeaderboard(newLeaderboard)
          saveLeaderboard(newLeaderboard)
        }
      } else {
        // Next emoji inline
        setCurrent(prev => prev + 1)
        setTimer(MAX_TIME)
        setInput("")
        setSubmitted(false)
        setEmojiKey(prev => prev + 1)
      }
    }, 100)
  }, [timer, emojis, current, score, results, leaderboard])

  // Game actions
  const startGame = useCallback(() => {
    const gameEmojis = getRandomEmojis(allEmojis, NUM_EMOJIS)
    setEmojis(gameEmojis)
    setCurrent(0)
    setTimer(MAX_TIME)
    setScore(0)
    setDisplayScore(0)
    setInput("")
    setSubmitted(false)
    setResults([])
    setRoundOver(false)
    setGameStarted(true)
    setShowResults(false)
    setShowLeaderboard(false)
    setEmojiKey(prev => prev + 1)
  }, [allEmojis])


  const handleSubmit = useCallback((guess) => {
    if (!submitted && !roundOver) {
      const isExact = guess.toLowerCase().trim() === answer
      const isPartial = !isExact && isPartialMatch(guess, answer, currentEmoji.keywords || [])
      handleGuessResult(isExact || isPartial, isExact, guess)
    }
  }, [submitted, roundOver, answer, currentEmoji, handleGuessResult])

  const handleSkip = useCallback(() => {
    if (!submitted && !roundOver) {
      handleGuessResult(false, false, "")
    }
  }, [submitted, roundOver, handleGuessResult])

  const resetGame = useCallback(() => {
    setGameStarted(false)
    setShowResults(false)
    setShowLeaderboard(false)
    setRoundOver(false)
    setCurrent(0)
    setTimer(MAX_TIME)
    setScore(0)
    setDisplayScore(0)
    setInput("")
    setSubmitted(false)
    setResults([])
    setEmojis([])
    setEmojiKey(0)
  }, [])

  const showLeaderboardView = useCallback(() => {
    setShowResults(false)
    setShowLeaderboard(true)
  }, [])

  // Effects
  // Load emoji data on mount
  useEffect(() => {
    async function loadEmojis() {
      try {
        const response = await fetch('/emojis.json')
        const data = await response.json()
        setAllEmojis(data.emojis || [])
        setLeaderboard(getLeaderboard())
        setLoading(false)
      } catch (error) {
        console.error('Error loading emojis:', error)
        setLoading(false)
      }
    }
    loadEmojis()
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameStarted && !submitted && !roundOver && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(t => t - 1)
      }, 1000)
    } else if (timer === 0 && !submitted && !roundOver) {
      // Pass the current input when time expires to distinguish expired vs skipped
      const currentInput = inputRef.current
      console.log('Timer expired! Input was:', `"${currentInput}"`)
      handleGuessResult(false, false, currentInput, true)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timer, gameStarted, submitted, roundOver, handleGuessResult])

  // Score animation effect
  useEffect(() => {
    if (isScoreAnimating && displayScore < score) {
      const increment = Math.ceil((score - displayScore) / 10)
      scoreAnimationRef.current = setTimeout(() => {
        setDisplayScore(prev => {
          const next = prev + increment
          if (next >= score) {
            setIsScoreAnimating(false)
            return score
          }
          return next
        })
      }, 50)
    }

    return () => {
      if (scoreAnimationRef.current) {
        clearTimeout(scoreAnimationRef.current)
      }
    }
  }, [displayScore, score, isScoreAnimating])

  const gameContext = {
    // State
    allEmojis,
    emojis,
    loading,
    current,
    timer,
    score,
    displayScore,
    isScoreAnimating,
    roundOver,
    gameStarted,
    showResults,
    showLeaderboard,
    input,
    submitted,
    results,
    resultsFilter,
    expandedResults,
    leaderboard,
    emojiKey,
    bmcWidgetLoaded,

    // Computed
    currentEmoji,
    answer,
    isExactMatch,
    isPartial,
    isCorrect,
    hint,

    // Actions
    setInput,
    setResultsFilter,
    setExpandedResults,
    startGame,
    handleSubmit,
    handleSkip,
    resetGame,
    showLeaderboardView,

    // Constants
    MAX_TIME,
    NUM_EMOJIS,
  }

  return (
    <GameContext.Provider value={gameContext}>
      {children}
    </GameContext.Provider>
  )
}