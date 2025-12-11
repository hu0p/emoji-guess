import React, { useState, useEffect } from 'react'

export default function RestartModal({ show, onClose, onConfirm }) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (show) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Restart Game?</h3>
          <p className="text-gray-600 mb-6">Your current score and progress will be lost.</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all transform hover:scale-105 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 cursor-pointer"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}