import React from 'react'

export default function HUD({ timer, displayScore, current, totalEmojis }) {
  return (
    <div className="w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] bg-gray-100 rounded-b-2xl py-2 sm:py-3 -mx-4 sm:-mx-6 mt-4 sm:mt-6">
      <div className="flex justify-between items-center px-6 sm:px-9">
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-yellow-700">
            <span className="hud-timer">{timer}s</span>
          </div>
          <div className="text-xs text-yellow-600 font-medium">Time</div>
        </div>

        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-purple-700">
            <span className="hud-score">{displayScore.toLocaleString()}</span>
          </div>
          <div className="text-xs text-purple-600 font-medium">Score</div>
        </div>

        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-green-700 overflow-hidden">
            <span key={current} className="progress-number inline-block hud-number">{current + 1}</span>
            <span className="hud-number">/{totalEmojis}</span>
          </div>
          <div className="text-xs text-green-600 font-medium">Progress</div>
        </div>
      </div>
    </div>
  )
}