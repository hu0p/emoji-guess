import React from "react"

export default function Leaderboard({ scores = [] }) {
  return (
    <div className="w-full max-w-md bg-white/90 rounded-xl shadow-lg p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Leaderboard</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 px-2">#</th>
            <th className="py-2 px-2">Name</th>
            <th className="py-2 px-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-400">
                No scores yet
              </td>
            </tr>
          ) : (
            scores.map((entry, i) => (
              <tr
                key={entry.name + entry.score + i}
                className="border-b border-gray-100"
              >
                <td className="py-2 px-2 font-mono text-gray-500">{i + 1}</td>
                <td className="py-2 px-2 font-semibold">{entry.name}</td>
                <td className="py-2 px-2 text-right font-mono">
                  {entry.score}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
