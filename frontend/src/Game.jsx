import React, { useState, useEffect, useRef } from "react"
import { Command, Keyboard, RotateCcw } from "lucide-react"
import "./index.css"
import Leaderboard from "./Leaderboard"

const MAX_TIME = 20 // seconds per emoji (reduced from 30)
const MAX_SCORE_PER_EMOJI = 1000
const NUM_EMOJIS = 10 // 10 emojis per round (reduced for easier gameplay)
const LEADERBOARD_KEY = "emoji_guess_leaderboard"
const LEADERBOARD_SIZE = 10

function getRandomEmojis(num, emojiList) {
  // Shuffle and pick num emojis from the provided pool
  const shuffled = [...emojiList].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, num)
}

function getSuggestion(input, answer, allNames) {
  if (!input) return ""
  const lower = input.toLowerCase()
  // Prefer answer if it starts with input
  if (answer.startsWith(lower)) return answer
  // Otherwise, find the first name that starts with input
  const found = allNames.find((n) => n.startsWith(lower) && n !== answer)
  return found || ""
}

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

function getLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLeaderboard(scores) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores))
}

// Helper function for partial matching
function isPartialMatch(input, answer, keywords = []) {
  const normalizedInput = input.toLowerCase().trim()
  const normalizedAnswer = answer.toLowerCase().trim()

  // Remove common words from answer for matching
  const commonWords = ["face", "with", "the", "a", "an"]
  const answerWords = normalizedAnswer.split(" ").filter(w => !commonWords.includes(w))

  // Check if input matches any significant word in the answer
  const matchesAnswerWord = answerWords.some(word => word === normalizedInput)

  // Check if input matches any keyword
  const matchesKeyword = keywords.some(keyword =>
    keyword.toLowerCase() === normalizedInput
  )

  // Check if input is the answer without common words
  const answerWithoutCommon = answerWords.join(" ")
  const matchesSimplified = answerWithoutCommon === normalizedInput

  return matchesAnswerWord || matchesKeyword || matchesSimplified
}

// Function to generate hints
function getHint(answer, timer, maxTime) {
  const words = answer.split(" ")

  if (timer > 15) {
    return null // No hint yet (more than 15s remaining)
  }

  let hintLevel
  if (timer > 10) {
    hintLevel = 1 // 15s to 11s remaining: first hint
  } else if (timer > 5) {
    hintLevel = 2 // 10s to 6s remaining: second hint
  } else {
    hintLevel = 3 // 5s or less remaining: third hint
  }

  if (hintLevel === 1) {
    // Show first letter of each word
    return words.filter(w => w.length > 0).map(w => w[0] + "_".repeat(Math.max(0, w.length - 1))).join(" ")
  } else if (hintLevel === 2) {
    // Show first two letters of each word
    return words.filter(w => w.length > 0).map(w => {
      if (w.length === 1) return w
      if (w.length === 2) return w
      return w.slice(0, 2) + "_".repeat(Math.max(0, w.length - 2))
    }).join(" ")
  } else if (hintLevel >= 3) {
    // Show more letters progressively
    const extraLetters = Math.min(2, hintLevel - 2)
    return words.filter(w => w.length > 0).map(w => {
      const lettersToShow = Math.min(w.length, 2 + extraLetters)
      if (lettersToShow >= w.length) return w
      return w.slice(0, lettersToShow) + "_".repeat(w.length - lettersToShow)
    }).join(" ")
  }

  return null
}

export default function Game() {
  const [allEmojis, setAllEmojis] = useState([])
  const [emojis, setEmojis] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState("")
  const [timer, setTimer] = useState(MAX_TIME)
  const [score, setScore] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [roundOver, setRoundOver] = useState(false)
  const intervalRef = useRef()
  const inputRef = useRef()
  const [isMacPlatform, setIsMacPlatform] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState([]) // {emoji, name, correct, guess}
  const [gameStarted, setGameStarted] = useState(false) // New state for start screen
  const [emojiKey, setEmojiKey] = useState(0) // Key for triggering emoji transitions
  const [resultsFilter, setResultsFilter] = useState("all") // all, correct, wrong, skipped
  const [expandedResults, setExpandedResults] = useState(new Set()) // Set of expanded result indices
  const [bmcWidgetLoaded, setBmcWidgetLoaded] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)
  const [isScoreAnimating, setIsScoreAnimating] = useState(false)

  const currentEmoji = emojis[current] || {}
  const answer = currentEmoji.name?.toLowerCase().trim() || ""
  const allNames = allEmojis.map((e) => e.name.toLowerCase())
  const suggestion = getSuggestion(input, answer, allNames)
  const isExactMatch = input.toLowerCase().trim() === answer
  const isPartial = !isExactMatch && isPartialMatch(input, answer, currentEmoji.keywords || [])
  const isCorrect = isExactMatch || isPartial
  const hint = getHint(answer, timer, MAX_TIME)

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedResults(newExpanded)
  }

  // Load emoji data on component mount
  useEffect(() => {
    fetch('/emojis.json')
      .then(response => response.json())
      .then(data => {
        setAllEmojis(data.emojis)
        // Don't set game emojis yet - wait for start button
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading emojis:', error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setIsMacPlatform(isMac())
    setIsMobileDevice(isMobile())
  }, [])

  // Global skip shortcut
  useEffect(() => {
    if (isMobileDevice) return
    function onGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        // Only allow skip during active gameplay
        if (gameStarted && !roundOver && !showResults && !showLeaderboard) {
          handleSkip()
        }
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [isMobileDevice, gameStarted, roundOver, showResults, showLeaderboard, handleSkip])

  useEffect(() => {
    if (roundOver || !emojis.length) return // Don't start timer if no emojis loaded
    setTimer(MAX_TIME)
    setInput("")
    setSubmitted(false)
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          handleSkip()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, roundOver, emojis.length])

  function animateScore(newScore, oldScore) {
    setIsScoreAnimating(true)
    const duration = 600
    const steps = 30
    const increment = (newScore - oldScore) / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayScore(newScore)
        setIsScoreAnimating(false)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(oldScore + (increment * currentStep)))
      }
    }, stepDuration)
  }

  function handleSubmit() {
    if (!input.trim() || submitted) return

    setSubmitted(true)

    if (isCorrect) {
      // Calculate score (partial matches get 70% of the points)
      const baseScore = Math.floor((timer / MAX_TIME) * MAX_SCORE_PER_EMOJI)
      const emojiScore = isExactMatch ? baseScore : Math.floor(baseScore * 0.7)

      const oldScore = score
      const newScore = score + emojiScore
      setScore(newScore)
      animateScore(newScore, oldScore)
      handleGuessResult(true, isExactMatch)

      // Clear timer and advance after brief delay
      clearInterval(intervalRef.current)
      setTimeout(() => {
        if (current >= emojis.length - 1) {
          setRoundOver(true)
          endRound()
        } else {
          nextEmoji()
        }
      }, 100)
    } else {
      handleGuessResult(false)
    }
  }

  // Track per-emoji results
  function handleGuessResult(isCorrect, isExact = false, customGuess = null) {
    if (!emojis[current]) return // Guard against undefined emoji

    setResults((prev) => {
      const updated = [...prev]
      updated[current] = {
        emoji: emojis[current].emoji,
        name: emojis[current].name,
        correct: isCorrect,
        exact: isCorrect ? isExact : false,
        guess: customGuess !== null ? customGuess : input,
      }
      return updated
    })
  }

  useEffect(() => {
    // Reset results on new game
    setResults([])
  }, [emojis])

  // Initialize display score when game starts
  useEffect(() => {
    if (!isScoreAnimating) {
      setDisplayScore(score)
    }
  }, [score, isScoreAnimating])



  function handleInput(e) {
    setInput(e.target.value)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSkip() {
    handleGuessResult(false, false, "") // Mark as skip with empty guess
    nextEmoji()
  }

  function endRound() {
    setShowResults(true)
    // Load Buy Me A Coffee widget when results are shown
    if (!bmcWidgetLoaded) {
      const script = document.createElement('script')
      script.setAttribute('data-name', 'BMC-Widget')
      script.setAttribute('data-cfasync', 'false')
      script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js'
      script.setAttribute('data-id', 'loagain')
      script.setAttribute('data-description', 'Support me on Buy me a coffee!')
      script.setAttribute('data-message', 'Support my ability to build more fun projects like this!')
      script.setAttribute('data-color', '#BD5FFF')
      script.setAttribute('data-position', 'Right')
      script.setAttribute('data-x_margin', '18')
      script.setAttribute('data-y_margin', '18')
      document.head.appendChild(script)
      setBmcWidgetLoaded(true)
    }
  }

  function handleShowLeaderboard() {
    // Save score if it's a high score
    let scores = getLeaderboard()
    const newEntry = { name: "You", score }
    scores.push(newEntry)
    scores = scores.sort((a, b) => b.score - a.score).slice(0, LEADERBOARD_SIZE)
    saveLeaderboard(scores)
    setLeaderboard(scores)
    setShowLeaderboard(true)
  }

  function handlePlayAgain() {
    // Reset game state without reloading
    setEmojis(getRandomEmojis(NUM_EMOJIS, allEmojis))
    setCurrent(0)
    setScore(0)
    setDisplayScore(0)
    setIsScoreAnimating(false)
    setRoundOver(false)
    setShowResults(false)
    setShowLeaderboard(false)
    setResults([])
    setResultsFilter("all")
    setExpandedResults(new Set())
    setInput("")
    setSubmitted(false)
    setGameStarted(true)
  }

  function handleStartGame() {
    // Initialize game with random emojis
    setEmojis(getRandomEmojis(NUM_EMOJIS, allEmojis))
    setEmojiKey(0) // Reset emoji key for first emoji
    setGameStarted(true)
  }

  function nextEmoji() {
    clearInterval(intervalRef.current)

    // Check if this is the last emoji
    if (current >= emojis.length - 1) {
      setRoundOver(true)
      endRound()
      return
    }

    // Move to next emoji
    setCurrent((c) => c + 1)
    setEmojiKey((k) => k + 1) // Trigger new animation
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus()
    }, 0)
  }

  function handleTabCompletion(e) {
    if (
      e.key === "Tab" &&
      suggestion &&
      input &&
      suggestion !== input.toLowerCase()
    ) {
      e.preventDefault()
      setInput(suggestion)
    }
  }

  if (showLeaderboard) {
    return (
      <div className="flex flex-col items-center w-full">
        <Leaderboard scores={leaderboard} />
        <button
          onClick={handlePlayAgain}
          className="group relative mt-6 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10">Play Again</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
        </button>
      </div>
    )
  }

  if (showResults) {
    // Filter and sort results
    const filteredAndSortedResults = (() => {
      let filtered = emojis.map((e, i) => ({ emoji: e, index: i, result: results[i] }))

      // Apply filter
      if (resultsFilter !== "all") {
        filtered = filtered.filter(item => {
          if (resultsFilter === "perfect") return item.result?.correct && item.result?.exact
          if (resultsFilter === "partial") return item.result?.correct && !item.result?.exact
          if (resultsFilter === "expired") return item.result && !item.result.correct && item.result?.guess
          if (resultsFilter === "skipped") return item.result && !item.result.correct && !item.result?.guess
          return true
        })
      }

      return filtered
    })()
    const perfectCount = results.filter(r => r?.correct && r?.exact).length
    const partialCount = results.filter(r => r?.correct && !r?.exact).length
    const expiredCount = results.filter(r => r && !r.correct && r.guess).length
    const skippedCount = results.filter(r => r && !r.correct && !r.guess).length

    return (
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 py-10 flex flex-col items-center border border-gray-100">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Results</h2>

        {/* Score Display */}
        <div className="mb-6 text-center">
          <div className="text-5xl font-bold text-purple-600 mb-2">{score.toLocaleString()}</div>
          <div className="text-lg text-gray-600">Total Score</div>
        </div>

        {/* Stats Summary */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="text-center" title="Guessed the exact emoji name correctly (100% points)">
            <div className="text-lg font-semibold text-emerald-600">{perfectCount}</div>
            <div className="text-gray-500">Perfect</div>
          </div>
          <div className="text-center" title="Guessed a keyword or alternative name (70% points)">
            <div className="text-lg font-semibold text-blue-600">{partialCount}</div>
            <div className="text-gray-500">Partial Credit</div>
          </div>
          <div className="text-center" title="Timer ran out while typing a guess">
            <div className="text-lg font-semibold text-rose-600">{expiredCount}</div>
            <div className="text-gray-500">Expired</div>
          </div>
          <div className="text-center" title="Passed without entering any guess">
            <div className="text-lg font-semibold text-amber-600">{skippedCount}</div>
            <div className="text-gray-500">Skipped</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 w-full max-w-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter:</label>
          <select
            value={resultsFilter}
            onChange={(e) => setResultsFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          >
            <option value="all">All ({emojis.length})</option>
            <option value="perfect">Perfect ({perfectCount})</option>
            <option value="partial">Partial Credit ({partialCount})</option>
            <option value="expired">Expired ({expiredCount})</option>
            <option value="skipped">Skipped ({skippedCount})</option>
          </select>
        </div>

        {/* Results List */}
        <div className="w-full max-h-96 overflow-y-auto mb-6">
          {filteredAndSortedResults.map(({ emoji, index, result }) => {
            const isPerfect = result?.correct && result?.exact
            const isPartial = result?.correct && !result?.exact
            const isSkipped = result && !result.correct && !result?.guess
            const isExpired = result && !result.correct && result?.guess
            const isExpanded = expandedResults.has(index)

            return (
              <div
                key={emoji.emoji + index}
                className={`rounded-lg mb-3 border-2 transition-all duration-200 ${
                  isPerfect ? 'bg-green-50 border-green-200' :
                  isPartial ? 'bg-blue-50 border-blue-200' :
                  isSkipped ? 'bg-gray-50 border-gray-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/50 transition-colors"
                  onClick={() => toggleExpanded(index)}
                >
                  <span className="text-4xl">{emoji.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{emoji.name}</div>
                    {!isExpanded && (
                      <div className="text-sm text-gray-600">
                        {isPerfect ? 'Perfect' : isPartial ? 'Partial Credit' : isSkipped ? 'Skipped' : 'Expired'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-current border-opacity-20 p-4 pt-3">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Correct Answer:</span>
                        <span className="ml-2 font-mono text-gray-800">{emoji.name}</span>
                      </div>
                      {isExpired && (
                        <div>
                          <span className="font-semibold text-gray-700">Your Guess:</span>
                          <span className="ml-2 font-mono text-gray-800">"{result?.guess || ''}"</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-700">Partial Credit:</span>
                        <span className="ml-2">
                          {(() => {
                            const userGuess = result?.guess?.toLowerCase().trim() || ''

                            // Check if user matched a word from the answer
                            const commonWords = ["face", "with", "the", "a", "an"]
                            const answerWords = emoji.name.toLowerCase().split(" ").filter(w => !commonWords.includes(w))
                            const matchedAnswerWord = isPartial && userGuess && answerWords.includes(userGuess)

                            return (
                              <>
                                {matchedAnswerWord && (
                                  <span className="inline-block bg-green-200 text-green-800 font-semibold border-2 border-green-400 px-2 py-1 rounded text-xs mr-2 mb-1">
                                    {userGuess} (from name)
                                  </span>
                                )}
                                {emoji.keywords?.map((keyword, ki) => {
                                  const isMatchingKeyword = isPartial && userGuess &&
                                    keyword.toLowerCase() === userGuess

                                  return (
                                    <span
                                      key={ki}
                                      className={`inline-block px-2 py-1 rounded text-xs mr-2 mb-1 ${
                                        isMatchingKeyword
                                          ? 'bg-blue-200 text-blue-800 font-semibold border-2 border-blue-400'
                                          : 'bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      {keyword}
                                    </span>
                                  )
                                }) || (!matchedAnswerWord && <span className="text-gray-500 text-xs">No partial credit options available</span>)}
                              </>
                            )
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleShowLeaderboard}
            className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10">Leaderboard</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
          </button>
          <button
            onClick={handlePlayAgain}
            className="group relative px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10">Play Again</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-6 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Loading...</h2>
      </div>
    )
  }

  // Show start screen if game hasn't started
  if (!gameStarted) {
    return (
      <div className="group w-full max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 py-10 flex flex-col items-center border border-gray-100">
        <div className="text-8xl mb-4 disco-sparkle">🪩</div>
        <h1 className="text-4xl font-extrabold mb-4 text-center animate-text-gradient">
          Emoji Guessing Game
        </h1>
        <p className="text-gray-600 text-center mb-8 leading-relaxed max-w-md">
          Test your emoji knowledge! Type the <a href="https://unicode.org/emoji/charts/full-emoji-list.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">emoji name</a> to score points.
          <span className="text-purple-600 font-semibold"> 20 seconds</span> per emoji,
          <span className="text-pink-600 font-semibold"> 10 emojis</span> per round!
        </p>
        <button
          onClick={handleStartGame}
          disabled={loading || !allEmojis.length}
          className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10">
            {loading ? "Loading..." : "Start Game"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
        </button>
      </div>
    )
  }

  if (!emojis.length && gameStarted) {
    return (
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-6 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Error loading game</h2>
        <p className="text-gray-600">Please refresh the page to try again.</p>
      </div>
    )
  }

  return (
    <main className="w-full max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl px-6 pt-10 pb-0 flex flex-col items-center border border-gray-100 relative">
      <div
        key={emojiKey}
        className="text-8xl mb-6 emoji-transition"
        role="img"
        aria-label={`Current emoji: ${currentEmoji.name || 'Loading'}`}
      >
        {currentEmoji.emoji}
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
          onChange={handleInput}
          onKeyDown={(e) => {
            handleKeyDown(e)
            handleTabCompletion(e)
          }}
          placeholder="Type the emoji name and press Enter..."
          autoFocus
          aria-label="Emoji name input"
          aria-describedby="input-help"
          className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg pr-12 bg-white shadow-sm transition-all duration-200"
          style={{ position: "relative", zIndex: 2 }}
        />
        <span id="input-help" className="sr-only">Type the name of the emoji shown above and press Enter to submit your answer</span>
        {/* Inline suggestion overlay */}
        {suggestion &&
          input &&
          suggestion !== input.toLowerCase() &&
          input.length >= 2 && (
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {/* Show only the part after the input */}
              <span style={{ opacity: 0 }}>{input}</span>
              {suggestion.slice(input.length)}
            </span>
          )}
        <span className="absolute right-3 top-1/2 -translate-y-1/2" role="status" aria-live="polite">
          {input.length > 0 && !submitted && (
            isExactMatch ? (
              <span className="text-2xl" aria-label="Perfect match">💯</span>
            ) : isPartial ? (
              <span className="text-2xl" aria-label="Partial match">⭐</span>
            ) : (
              <span className="text-2xl" aria-label="Incorrect">❌</span>
            )
          )}
          {submitted && (
            isCorrect ? (
              isExactMatch ? (
                <span className="text-2xl" aria-label="Perfect match submitted">💯</span>
              ) : (
                <span className="text-2xl" aria-label="Partial match submitted">⭐</span>
              )
            ) : (
              <span className="text-2xl" aria-label="Incorrect answer submitted">❌</span>
            )
          )}
        </span>
      </div>
      <div className="flex gap-3 mb-4 mt-4">
        <button
          onClick={handleSkip}
          aria-label={`Pass this emoji${!isMobileDevice ? ` (${isMacPlatform ? 'Cmd' : 'Ctrl'}+K)` : ''}`}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer overflow-hidden"
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
          onClick={() => {
            if (confirm("Are you sure you want to restart? Your current score will be lost.")) {
              handlePlayAgain()
            }
          }}
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

      {/* HUD at bottom edge */}
      <div className="w-[calc(100%+3rem)] bg-gray-100 rounded-b-2xl py-3 -mx-6 mt-6">
        <div className="flex justify-between items-center px-9">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-700">
              <span className="hud-timer">{timer}s</span>
            </div>
            <div className="text-xs text-yellow-600 font-medium">Time</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-purple-700">
              <span className="hud-score">{displayScore.toLocaleString()}</span>
            </div>
            <div className="text-xs text-purple-600 font-medium">Score</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-green-700 overflow-hidden">
              <span key={current} className="progress-number inline-block hud-number">{current + 1}</span>
              <span className="hud-number">/{emojis.length}</span>
            </div>
            <div className="text-xs text-green-600 font-medium">Progress</div>
          </div>
        </div>
      </div>
    </main>
  )
}