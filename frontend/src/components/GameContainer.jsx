import React from 'react'
import { useGameContext } from '../context/GameContext'
import StartScreen from './StartScreen'
import GamePlay from './GamePlay'
import ResultsPage from './ResultsPage'
import Leaderboard from '../Leaderboard'

export default function GameContainer() {
  const {
    loading,
    gameStarted,
    showResults,
    showLeaderboard,
    allEmojis,
    leaderboard,
    startGame,
  } = useGameContext()

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-6 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Loading...</h2>
      </div>
    )
  }

  if (showLeaderboard) {
    return (
      <div className="flex flex-col items-center w-full">
        <Leaderboard scores={leaderboard} />
        <button
          onClick={startGame}
          className="group relative mt-6 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10">Play Again</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
        </button>
      </div>
    )
  }

  if (showResults) {
    return <ResultsPage />
  }

  if (!gameStarted) {
    return (
      <StartScreen
        onStartGame={startGame}
        loading={loading}
        allEmojisLength={allEmojis.length}
      />
    )
  }

  return <GamePlay />
}