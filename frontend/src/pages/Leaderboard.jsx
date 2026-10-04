import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Leaderboard = () => {
  // If we have contestId, we show contest leaderboard. Else global (mocked or need a different route).
  // Let's assume we pass contestId for contest leaderboard.
  const { contestId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (contestId) {
          const { data } = await axios.get(`/api/contests/${contestId}/leaderboard`);
          setLeaderboard(data);
        } else {
          // Mock global leaderboard or fetch from a global route if it existed
          // For now, we'll just show empty if no contestId is provided
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [contestId]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {contestId ? 'Contest Leaderboard' : 'Global Leaderboard'}
      </h1>
      
      {!contestId ? (
        <div className="bg-yellow-50 p-4 rounded text-yellow-800">
          Global leaderboard is not implemented. Please view a specific contest leaderboard.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-white text-sm">
                <th className="p-4">Rank</th>
                <th className="p-4">User</th>
                <th className="p-4">Score</th>
                <th className="p-4">Penalty</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 border-b">
                  <td className="p-4 font-bold">{idx + 1}</td>
                  <td className="p-4 font-medium text-gray-900">{entry.user?.username || 'Unknown'}</td>
                  <td className="p-4 text-green-600 font-bold">{entry.score}</td>
                  <td className="p-4 text-gray-500">{entry.timePenalty}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No users on the leaderboard yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
