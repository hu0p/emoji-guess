import React from "react"

export default function Leaderboard({ scores = [] }) {
  return (
    <div className="w-full max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 py-10 flex flex-col items-center border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🏆</span>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          Leaderboard
        </h2>
      </div>
      <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <th className="py-3 px-4 text-left font-semibold">#</th>
              <th className="py-3 px-4 text-left font-semibold">Name</th>
              <th className="py-3 px-4 text-right font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                  No scores yet. Be the first!
                </td>
              </tr>
            ) : (
              scores.map((entry, i) => (
                <tr
                  key={entry.name + entry.score + i}
                  className={`border-b border-gray-100 hover:bg-purple-50 transition-colors duration-150 ${
                    i === 0 ? "bg-yellow-50" : i === 1 ? "bg-gray-50" : i === 2 ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    {i === 0 ? (
                      <span className="text-2xl">🥇</span>
                    ) : i === 1 ? (
                      <span className="text-2xl">🥈</span>
                    ) : i === 2 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="font-mono text-gray-500 text-lg">{i + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{entry.name}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-lg font-bold text-purple-600">
                      {entry.score.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}