import React from 'react'
import { GameProvider } from './context/GameContext'
import GameContainer from './components/GameContainer'

export default function Game() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-gray-900 p-4 md:p-0">
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </div>
  )
}