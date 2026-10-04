import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/submissions');
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
          <h2 className="text-xl font-bold mb-2">Profile</h2>
          <p className="text-gray-600"><span className="font-semibold">Username:</span> {user.username}</p>
          <p className="text-gray-600"><span className="font-semibold">Email:</span> {user.email}</p>
          <p className="text-gray-600"><span className="font-semibold">Role:</span> {user.role}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-2">Stats</h2>
          <p className="text-gray-600"><span className="font-semibold">Solved Problems:</span> {user.solvedProblems?.length || 0}</p>
          <p className="text-gray-600"><span className="font-semibold">Total Submissions:</span> {submissions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Recent Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b">Time</th>
                <th className="p-4 border-b">Problem</th>
                <th className="p-4 border-b">Language</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Exec Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b text-sm text-gray-600">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 border-b">
                    {sub.problem?.title || 'Unknown'}
                  </td>
                  <td className="p-4 border-b text-sm">
                    {sub.language}
                  </td>
                  <td className="p-4 border-b font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${
                      sub.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      sub.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 border-b text-sm text-gray-600">
                    {sub.executionTime !== undefined ? `${sub.executionTime} ms` : '-'}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 border-b">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
