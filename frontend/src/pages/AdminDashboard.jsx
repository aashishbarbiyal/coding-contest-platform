import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('contests');
  
  // Data states
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Fetch data
  const fetchData = async () => {
    try {
      if (activeTab === 'contests') {
        const { data } = await axios.get('/api/contests');
        setContests(data);
      } else if (activeTab === 'problems') {
        const { data } = await axios.get('/api/problems');
        setProblems(data);
      } else if (activeTab === 'users') {
        const { data } = await axios.get('/api/users');
        setUsers(data);
      } else if (activeTab === 'submissions') {
        const { data } = await axios.get('/api/submissions/all');
        setSubmissions(data);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Form states
  const [contestData, setContestData] = useState({ title: '', description: '', startTime: '', endTime: '' });
  const [problemData, setProblemData] = useState({ title: '', description: '', difficulty: 'Easy', constraints: '', contestId: '', score: 100 });
  const [testCases, setTestCases] = useState([{ input: '', output: '', isHidden: false }]);

  const handleContestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contests', contestData);
      toast.success('Contest created successfully');
      setContestData({ title: '', description: '', startTime: '', endTime: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create contest');
    }
  };

  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...problemData, testCases, tags: [] };
      await axios.post('/api/problems', payload);
      toast.success('Problem created successfully');
      setProblemData({ title: '', description: '', difficulty: 'Easy', constraints: '', contestId: '', score: 100 });
      setTestCases([{ input: '', output: '', isHidden: false }]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create problem');
    }
  };

  const handleDeleteContest = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/contests/${id}`);
      toast.success('Contest deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete contest');
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/problems/${id}`);
      toast.success('Problem deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete problem');
    }
  };

  const handleMakeAdmin = async (id) => {
    if (!window.confirm('Make this user admin?')) return;
    try {
      await axios.put(`/api/users/${id}/role`, { role: 'admin' });
      toast.success('User updated to admin');
      fetchData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
        {['contests', 'problems', 'users', 'submissions'].map(tab => (
          <button 
            key={tab}
            className={`py-2 px-4 font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 capitalize">Manage {activeTab}</h2>
          
          {activeTab === 'contests' && (
            <div className="space-y-4">
              {contests.map(c => (
                <div key={c._id} className="flex justify-between items-center border p-4 rounded">
                  <div>
                    <h3 className="font-bold">{c.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(c.startTime).toLocaleString()} - {new Date(c.endTime).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDeleteContest(c._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
              ))}
              {contests.length === 0 && <p className="text-gray-500">No contests found.</p>}
            </div>
          )}

          {activeTab === 'problems' && (
            <div className="space-y-4">
              {problems.map(p => (
                <div key={p._id} className="flex justify-between items-center border p-4 rounded">
                  <div>
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="text-sm text-gray-500">{p.difficulty} | {p.score} points</p>
                  </div>
                  <button onClick={() => handleDeleteProblem(p._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
              ))}
              {problems.length === 0 && <p className="text-gray-500">No problems found.</p>}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              {users.map(u => (
                <div key={u._id} className="flex justify-between items-center border p-4 rounded">
                  <div>
                    <h3 className="font-bold">{u.username}</h3>
                    <p className="text-sm text-gray-500">{u.email} | Role: <span className={u.role === 'admin' ? 'text-indigo-600 font-bold' : ''}>{u.role}</span></p>
                  </div>
                  <div className="space-x-2">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleMakeAdmin(u._id)} className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600">Make Admin</button>
                    )}
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-2 border-b">User</th>
                    <th className="p-2 border-b">Problem</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="p-2 border-b text-sm">{s.user?.username || 'Unknown'}</td>
                      <td className="p-2 border-b text-sm">{s.problem?.title || 'Unknown'}</td>
                      <td className="p-2 border-b text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${s.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2 border-b text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr><td colSpan="4" className="p-4 text-center text-gray-500 border-b">No submissions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: Create Forms */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Create New</h2>
          
          {activeTab === 'contests' && (
            <form onSubmit={handleContestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required value={contestData.title} onChange={e => setContestData({...contestData, title: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={contestData.description} onChange={e => setContestData({...contestData, description: e.target.value})} className="w-full border rounded p-2 h-24 text-sm"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="datetime-local" required value={contestData.startTime} onChange={e => setContestData({...contestData, startTime: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="datetime-local" required value={contestData.endTime} onChange={e => setContestData({...contestData, endTime: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium transition">Create Contest</button>
            </form>
          )}

          {activeTab === 'problems' && (
            <form onSubmit={handleProblemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contest ID (Optional)</label>
                <input type="text" value={problemData.contestId} onChange={e => setProblemData({...problemData, contestId: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Object ID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required value={problemData.title} onChange={e => setProblemData({...problemData, title: e.target.value})} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={problemData.description} onChange={e => setProblemData({...problemData, description: e.target.value})} className="w-full border rounded p-2 h-20 text-sm"></textarea>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={problemData.difficulty} onChange={e => setProblemData({...problemData, difficulty: e.target.value})} className="w-full border rounded p-2 text-sm">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input type="number" required value={problemData.score} onChange={e => setProblemData({...problemData, score: Number(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-sm mb-2">Test Cases</h3>
                {testCases.map((tc, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded mb-2 border text-xs relative">
                    <button 
                      type="button" 
                      onClick={() => setTestCases(testCases.filter((_, i) => i !== index))}
                      className="absolute top-1 right-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <textarea placeholder="Input" value={tc.input} onChange={e => { const newTc = [...testCases]; newTc[index].input = e.target.value; setTestCases(newTc); }} className="w-full border rounded p-1"></textarea>
                      <textarea placeholder="Output" value={tc.output} onChange={e => { const newTc = [...testCases]; newTc[index].output = e.target.value; setTestCases(newTc); }} className="w-full border rounded p-1"></textarea>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={tc.isHidden} onChange={e => { const newTc = [...testCases]; newTc[index].isHidden = e.target.checked; setTestCases(newTc); }} />
                      <span>Hidden Test Case</span>
                    </label>
                  </div>
                ))}
                <button type="button" onClick={() => setTestCases([...testCases, { input: '', output: '', isHidden: false }])} className="text-indigo-600 text-sm font-semibold hover:underline">+ Add Test Case</button>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium transition">Create Problem</button>
            </form>
          )}

          {(activeTab === 'users' || activeTab === 'submissions') && (
            <div className="text-gray-500 text-sm text-center py-8">
              Select Contests or Problems to see creation forms.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
