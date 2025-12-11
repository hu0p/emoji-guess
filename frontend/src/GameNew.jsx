import React from 'react'
import { GameProvider } from './context/GameContext'
import GameContainer from './components/GameContainer'

export default function Game() {
  return (
    <div className="fixed inset-0 w-screen h-screen grid place-items-center bg-gradient-to-br from-blue-100 to-purple-100 text-gray-900">
      <GameProvider>
        <GameContainer />
      </GameProvider>
    </div>
  )
}