import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ContestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/contests/${id}`);
        setContest(data);
      } catch (error) {
        toast.error('Failed to load contest');
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id]);

  useEffect(() => {
    if (!contest) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);

      if (now < startTime) {
        const diff = startTime - now;
        setCountdown(`Starts in: ${formatTime(diff)}`);
      } else if (now >= startTime && now <= endTime) {
        const diff = endTime - now;
        setCountdown(`Ends in: ${formatTime(diff)}`);
      } else {
        setCountdown('Contest has ended');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleRegister = async () => {
    try {
      await axios.post(`http://localhost:5000/api/contests/${id}/register`);
      toast.success('Successfully registered for the contest');
      setContest({ ...contest, registeredUsers: [...contest.registeredUsers, user._id] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!contest) return <div className="text-center mt-20">Contest not found</div>;

  const isRegistered = user && contest.registeredUsers.includes(user._id);
  const now = new Date();
  const hasStarted = now >= new Date(contest.startTime);
  const hasEnded = now > new Date(contest.endTime);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{contest.title}</h1>
        <p className="text-gray-700 text-lg mb-6">{contest.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-lg text-sm">
          <div>
            <span className="text-gray-500 font-semibold block">Start Time</span>
            <p>{new Date(contest.startTime).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500 font-semibold block">End Time</span>
            <p>{new Date(contest.endTime).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500 font-semibold block">Status</span>
            <p>
              {hasEnded ? <span className="text-red-600 font-bold">Ended</span> :
               hasStarted ? <span className="text-green-600 font-bold">Ongoing</span> :
               <span className="text-yellow-600 font-bold">Upcoming</span>}
            </p>
          </div>
          <div>
            <span className="text-gray-500 font-semibold block">Timer</span>
            <p className="font-mono font-bold text-indigo-600">{countdown}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600 font-semibold">{contest.registeredUsers.length} Users Registered</p>
          {isRegistered && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">Registered</span>
          )}
        </div>

        {!isRegistered && !hasEnded && user && (
          <button 
            onClick={handleRegister}
            className="w-full mb-8 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Register for Contest
          </button>
        )}
        
        {!user && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            Please <Link to="/login" className="font-bold underline">login</Link> to register for this contest.
          </div>
        )}

        {isRegistered && !hasStarted && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
            You are registered. Waiting for the contest to start...
          </div>
        )}

        {(isRegistered && hasStarted) || (user && user.role === 'admin') ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Problems</h2>
            <div className="space-y-4">
              {contest.problems.map((problem, idx) => (
                <div key={problem._id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-lg mr-4">{idx + 1}.</span>
                    <Link to={`/contests/${contest._id}/problems/${problem._id}`} className="text-indigo-600 hover:underline text-lg font-medium">
                      {problem.title}
                    </Link>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-gray-500">{problem.score} pts</span>
                  </div>
                </div>
              ))}
              {contest.problems.length === 0 && <p className="text-gray-500">No problems added yet.</p>}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ContestDetails;
