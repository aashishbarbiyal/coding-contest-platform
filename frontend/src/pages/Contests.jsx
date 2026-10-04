import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Trophy, Users } from 'lucide-react';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/contests');
        setContests(data);
      } catch (error) {
        console.error('Failed to fetch contests');
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const getStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    if (now < start) return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (now > end) return { label: 'Ended', color: 'bg-red-100 text-red-800 border-red-200' };
    return { label: 'Ongoing', color: 'bg-green-100 text-green-800 border-green-200 animate-pulse' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Coding Contests</h1>
            <p className="text-lg text-gray-500">Compete, solve problems, and climb the global leaderboard.</p>
          </div>
          <Trophy className="h-16 w-16 text-indigo-200 opacity-50 hidden sm:block" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {contests.map((contest) => {
            const status = getStatus(contest);
            return (
              <div key={contest._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="flex items-center text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-full">
                      <Users className="h-3 w-3 mr-1" />
                      {contest.registeredUsers?.length || 0}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{contest.title}</h2>
                  <p className="text-gray-600 mb-6 text-sm line-clamp-2 h-10">{contest.description}</p>
                  
                  <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="h-4 w-4 mr-3 text-indigo-500" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Starts</p>
                        <p className="font-medium">{new Date(contest.startTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="h-4 w-4 mr-3 text-indigo-500" />
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ends</p>
                        <p className="font-medium">{new Date(contest.endTime).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/contests/${contest._id}`}
                    className="block w-full text-center bg-gray-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-sm"
                  >
                    Enter Contest
                  </Link>
                </div>
              </div>
            );
          })}
          {contests.length === 0 && (
            <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Contests Found</h3>
              <p className="text-gray-500">Check back later for new coding challenges.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contests;
