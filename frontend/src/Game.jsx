import React, { useState, useEffect, useRef } from "react"
import { Check, X, Command, Keyboard } from "lucide-react"
import "./index.css"
import Leaderboard from "./Leaderboard"

// Comprehensive list of face emojis with CLDR short names
const EMOJIS = [
  { emoji: "😀", name: "grinning face" },
  { emoji: "😃", name: "grinning face with big eyes" },
  { emoji: "😄", name: "grinning face with smiling eyes" },
  { emoji: "😁", name: "beaming face with smiling eyes" },
  { emoji: "😆", name: "grinning squinting face" },
  { emoji: "😅", name: "grinning face with sweat" },
  { emoji: "🤣", name: "rolling on the floor laughing" },
  { emoji: "😂", name: "face with tears of joy" },
  { emoji: "🙂", name: "slightly smiling face" },
  { emoji: "🙃", name: "upside-down face" },
  { emoji: "🫠", name: "melting face" },
  { emoji: "😉", name: "winking face" },
  { emoji: "😊", name: "smiling face with smiling eyes" },
  { emoji: "😇", name: "smiling face with halo" },
  { emoji: "🥰", name: "smiling face with hearts" },
  { emoji: "😍", name: "smiling face with heart-eyes" },
  { emoji: "🤩", name: "star-struck" },
  { emoji: "😘", name: "face blowing a kiss" },
  { emoji: "😗", name: "kissing face" },
  { emoji: "☺️", name: "smiling face" },
  { emoji: "😚", name: "kissing face with closed eyes" },
  { emoji: "😙", name: "kissing face with smiling eyes" },
  { emoji: "🥲", name: "smiling face with tear" },
  { emoji: "😋", name: "face savoring food" },
  { emoji: "😛", name: "face with tongue" },
  { emoji: "😜", name: "winking face with tongue" },
  { emoji: "🤪", name: "zany face" },
  { emoji: "😝", name: "squinting face with tongue" },
  { emoji: "🤑", name: "money-mouth face" },
  { emoji: "🤗", name: "smiling face with open hands" },
  { emoji: "🤭", name: "face with hand over mouth" },
  { emoji: "🫢", name: "face with open eyes and hand over mouth" },
  { emoji: "🫣", name: "face with peeking eye" },
  { emoji: "🤫", name: "shushing face" },
  { emoji: "🤔", name: "thinking face" },
  { emoji: "🫡", name: "saluting face" },
  { emoji: "🤐", name: "zipper-mouth face" },
  { emoji: "🤨", name: "face with raised eyebrow" },
  { emoji: "😐", name: "neutral face" },
  { emoji: "😑", name: "expressionless face" },
  { emoji: "😶", name: "face without mouth" },
  { emoji: "🫥", name: "dotted line face" },
  { emoji: "😶", name: "face in clouds" },
  { emoji: "😏", name: "smirking face" },
  { emoji: "😒", name: "unamused face" },
  { emoji: "🙄", name: "face with rolling eyes" },
  { emoji: "😬", name: "grimacing face" },
  { emoji: "😮‍💨", name: "face exhaling" },
  { emoji: "🤥", name: "lying face" },
  { emoji: "😌", name: "relieved face" },
  { emoji: "😔", name: "pensive face" },
  { emoji: "😪", name: "sleepy face" },
  { emoji: "🤤", name: "drooling face" },
  { emoji: "😴", name: "sleeping face" },
  { emoji: "😷", name: "face with medical mask" },
  { emoji: "🤒", name: "face with thermometer" },
  { emoji: "🤕", name: "face with head-bandage" },
  { emoji: "🤢", name: "nauseated face" },
  { emoji: "🤮", name: "face vomiting" },
  { emoji: "🤧", name: "sneezing face" },
  { emoji: "🥵", name: "hot face" },
  { emoji: "🥶", name: "cold face" },
  { emoji: "🥴", name: "woozy face" },
  { emoji: "😵", name: "dizzy face" },
  { emoji: "😵", name: "face with spiral eyes" },
  { emoji: "🤯", name: "exploding head" },
  { emoji: "🤠", name: "cowboy hat face" },
  { emoji: "🥳", name: "partying face" },
  { emoji: "🥸", name: "disguised face" },
  { emoji: "😎", name: "smiling face with sunglasses" },
  { emoji: "🤓", name: "nerd face" },
  { emoji: "🧐", name: "face with monocle" },
  { emoji: "😕", name: "confused face" },
  { emoji: "🫤", name: "face with diagonal mouth" },
  { emoji: "😟", name: "worried face" },
  { emoji: "🙁", name: "slightly frowning face" },
  { emoji: "☹️", name: "frowning face" },
  { emoji: "😮", name: "face with open mouth" },
  { emoji: "😯", name: "hushed face" },
  { emoji: "😲", name: "astonished face" },
  { emoji: "🥱", name: "yawning face" },
  { emoji: "😳", name: "flushed face" },
  { emoji: "🥺", name: "pleading face" },
  { emoji: "🥹", name: "face holding back tears" },
  { emoji: "😦", name: "frowning face with open mouth" },
  { emoji: "😧", name: "anguished face" },
  { emoji: "😨", name: "fearful face" },
  { emoji: "😰", name: "anxious face with sweat" },
  { emoji: "😥", name: "sad but relieved face" },
  { emoji: "😢", name: "crying face" },
  { emoji: "😭", name: "loudly crying face" },
  { emoji: "😱", name: "face screaming in fear" },
  { emoji: "😖", name: "confounded face" },
  { emoji: "😣", name: "persevering face" },
  { emoji: "😞", name: "disappointed face" },
  { emoji: "😓", name: "downcast face with sweat" },
  { emoji: "😩", name: "weary face" },
  { emoji: "😫", name: "tired face" },
  { emoji: "🥱", name: "yawning face" },
  { emoji: "😤", name: "face with steam from nose" },
  { emoji: "😡", name: "pouting face" },
  { emoji: "😠", name: "angry face" },
  { emoji: "🤬", name: "face with symbols on mouth" },
  { emoji: "😈", name: "smiling face with horns" },
  { emoji: "👿", name: "angry face with horns" },
  { emoji: "💀", name: "skull" },
  { emoji: "☠️", name: "skull and crossbones" },
  { emoji: "💩", name: "pile of poo" },
  { emoji: "🤡", name: "clown face" },
  { emoji: "👹", name: "ogre" },
  { emoji: "👺", name: "goblin" },
  { emoji: "👻", name: "ghost" },
  { emoji: "👽", name: "alien" },
  { emoji: "👾", name: "alien monster" },
  { emoji: "🤖", name: "robot" },
  { emoji: "😺", name: "grinning cat" },
  { emoji: "😸", name: "grinning cat with smiling eyes" },
  { emoji: "😹", name: "cat with tears of joy" },
  { emoji: "😻", name: "smiling cat with heart-eyes" },
  { emoji: "😼", name: "cat with wry smile" },
  { emoji: "😽", name: "kissing cat" },
  { emoji: "🙀", name: "weary cat" },
  { emoji: "😿", name: "crying cat" },
  { emoji: "😾", name: "pouting cat" },
]

const MAX_TIME = 30 // seconds per emoji
const MAX_SCORE_PER_EMOJI = 1000
const NUM_EMOJIS = 20 // 20 emojis per round
const LEADERBOARD_KEY = "emoji_guess_leaderboard"
const LEADERBOARD_SIZE = 10

function getRandomEmojis(num) {
  // Shuffle and pick num emojis
  const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random())
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

export default function Game() {
  const [emojis] = useState(getRandomEmojis(NUM_EMOJIS))
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState("")
  const [timer, setTimer] = useState(MAX_TIME)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [roundOver, setRoundOver] = useState(false)
  const intervalRef = useRef()
  const inputRef = useRef()
  const [isMacPlatform, setIsMacPlatform] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState([]) // {emoji, name, correct, guess}

  const answer = emojis[current].name.toLowerCase().trim()
  const allNames = EMOJIS.map((e) => e.name.toLowerCase())
  const suggestion = getSuggestion(input, answer, allNames)
  const isCorrect = input.toLowerCase().trim() === answer

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
        handleSkip()
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [isMobileDevice])

  useEffect(() => {
    if (roundOver) return
    setTimer(MAX_TIME)
    setInput("")
    setFeedback("")
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
    // eslint-disable-next-line
  }, [current, roundOver])

  useEffect(() => {
    if (isCorrect && !roundOver) {
      const emojiScore = Math.floor((timer / MAX_TIME) * MAX_SCORE_PER_EMOJI)
      setScore((s) => s + emojiScore)
      setFeedback("✅ Correct!")
      setTimeout(() => nextEmoji(), 800)
    } else if (input.length > 0 && !isCorrect) {
      setFeedback("❌ Try again!")
    } else {
      setFeedback("")
    }
    // eslint-disable-next-line
  }, [input])

  // Track per-emoji results
  function handleGuessResult(isCorrect) {
    setResults((prev) => {
      const updated = [...prev]
      updated[current] = {
        emoji: emojis[current].emoji,
        name: emojis[current].name,
        correct: isCorrect,
        guess: input,
      }
      return updated
    })
  }

  useEffect(() => {
    // Reset results on new game
    setResults([])
  }, [emojis])

  useEffect(() => {
    // Track result on correct guess or skip
    if (isCorrect && !roundOver) {
      handleGuessResult(true)
    }
    // eslint-disable-next-line
  }, [input])

  function handleInput(e) {
    setInput(e.target.value)
  }

  function handleKeyUp() {
    // Process guess on every keyup
    // Already handled by useEffect
  }

  function handleSkip() {
    handleGuessResult(false)
    nextEmoji()
  }

  function endRound() {
    setShowResults(true)
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
    window.location.reload() // Simple reset for now
  }

  function nextEmoji() {
    clearInterval(intervalRef.current)
    if (current + 1 < emojis.length) {
      setCurrent((c) => c + 1)
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus()
      }, 0)
    } else {
      setRoundOver(true)
      endRound()
    }
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
          className="mt-6 px-6 py-3 !bg-blue-700 text-white text-lg rounded-lg font-bold shadow-lg border-2 border-blue-800 hover:!bg-blue-900 transition"
        >
          Play Again
        </button>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="w-full max-w-md bg-white/90 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Results</h2>
        <div className="w-full max-h-64 overflow-y-auto mb-6">
          {emojis.map((e, i) => (
            <div
              key={e.emoji + i}
              className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-3xl">{e.emoji}</span>
              <span className="flex-1 text-gray-800">{e.name}</span>
              {results[i]?.correct ? (
                <Check className="text-green-600 w-6 h-6" />
              ) : (
                <X className="text-red-500 w-6 h-6" />
              )}
              {!results[i]?.correct && (
                <span className="text-xs text-gray-400 ml-2">
                  {results[i]?.guess ? `You: ${results[i].guess}` : "Skipped"}
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleShowLeaderboard}
          className="px-6 py-3 !bg-blue-700 text-white text-lg rounded-lg font-bold shadow-lg border-2 border-blue-800 hover:!bg-blue-900 transition"
        >
          View Leaderboard
        </button>
        <button
          onClick={handlePlayAgain}
          className="mt-3 px-6 py-3 !bg-indigo-800 text-white text-lg rounded-lg font-bold shadow-lg border-2 border-indigo-900 hover:!bg-indigo-900 transition"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Emoji Guessing Game
      </h2>
      <div className="text-7xl mb-6">{emojis[current].emoji}</div>
      <div className="w-full relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          onKeyUp={handleKeyUp}
          onKeyDown={handleTabCompletion}
          placeholder="Type the emoji name..."
          autoFocus
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg pr-10 bg-transparent"
          style={{ position: "relative", zIndex: 2, background: "transparent" }}
        />
        {/* Inline suggestion overlay */}
        {suggestion &&
          input &&
          suggestion !== input.toLowerCase() &&
          input.length >= 4 && (
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {/* Show only the part after the input */}
              <span style={{ opacity: 0 }}>{input}</span>
              {suggestion.slice(input.length)}
            </span>
          )}
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {input.length > 0 &&
            (isCorrect ? (
              <Check className="text-green-600 w-6 h-6" />
            ) : (
              <X className="text-red-500 w-6 h-6" />
            ))}
        </span>
      </div>
      <div className="flex justify-between w-full mb-2 text-lg">
        <span>
          <b>Time:</b> {timer}s
        </span>
        <span>
          <b>Score:</b> {score}
        </span>
      </div>
      <div className="flex justify-between w-full mb-4 text-lg">
        <span>
          <b>Progress:</b> {current + 1} / {emojis.length}
        </span>
      </div>
      <div
        className={`mb-4 text-xl min-h-[28px] ${
          feedback.startsWith("✅")
            ? "text-green-600"
            : feedback.startsWith("❌")
            ? "text-red-500"
            : feedback.startsWith("⏭️")
            ? "text-yellow-500"
            : ""
        }`}
      >
        {feedback}
      </div>
      <button
        onClick={handleSkip}
        className="mt-2 px-4 py-2 !bg-blue-700 text-white text-base rounded-lg font-bold shadow-lg border-2 border-blue-800 hover:!bg-blue-900 transition flex items-center gap-2"
      >
        Skip
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
      </button>
    </div>
  )
}
