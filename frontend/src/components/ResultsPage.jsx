import React from 'react'
import { useGameContext } from '../context/GameContext'

export default function ResultsPage() {
  const {
    score,
    emojis,
    results,
    expandedResults,
    setExpandedResults,
    showLeaderboardView,
    startGame,
  } = useGameContext()

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedResults(newExpanded)
  }

  // Show all results
  const filteredResults = emojis.map((e, i) => ({ emoji: e, index: i, result: results[i] }))

  // Calculate counts
  const perfectCount = results.filter(r => r?.correct && r?.exact).length
  const partialCount = results.filter(r => r?.correct && !r?.exact).length
  const expiredCount = results.filter(r => {
    const isExpired = r && !r.correct && r.isExpired
    if (r && !r.correct) {
      console.log(`Result ${results.indexOf(r)}: guess="${r.guess}", isExpired flag=${r.isExpired}, categorized as expired=${isExpired}`)
    }
    return isExpired
  }).length
  const skippedCount = results.filter(r => {
    const isSkipped = r && !r.correct && !r.isExpired
    if (r && !r.correct) {
      console.log(`Result ${results.indexOf(r)}: guess="${r.guess}", isExpired flag=${r.isExpired}, categorized as skipped=${isSkipped}`)
    }
    return isSkipped
  }).length

  console.log('Categorization counts:', { perfectCount, partialCount, expiredCount, skippedCount })
  console.log('All results:', results)


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


      {/* Results List */}
      <div className="relative w-full max-w-lg mb-6">
        <div className="w-full max-h-96 overflow-y-auto">
          {filteredResults.map(({ emoji, index, result }) => {
          const isPerfect = result?.correct && result?.exact
          const isPartial = result?.correct && !result?.exact
          const isExpired = result && !result.correct && result?.isExpired
          const isSkipped = result && !result.correct && !result?.isExpired
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
        {/* Gradient overlay to indicate more content below */}
        {filteredResults.length > 5 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 via-white/90 to-transparent pointer-events-none z-10"></div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={showLeaderboardView}
          className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10">Leaderboard</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
        </button>
        <button
          onClick={startGame}
          className="group relative px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-lg rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10">Play Again</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-[length:400%_100%] rounded-full animate-gradient-sweep"></div>
        </button>
      </div>
    </div>
  )
}