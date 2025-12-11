import React from 'react'

export default function StartScreen({ onStartGame, loading, allEmojisLength }) {
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
        onClick={onStartGame}
        disabled={loading || !allEmojisLength}
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