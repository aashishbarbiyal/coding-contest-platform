import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Code, Filter } from 'lucide-react';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/problems');
        setProblems(data);
      } catch (error) {
        console.error('Failed to fetch problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const tags = ['All', ...new Set(problems.flatMap(p => p.tags || []).filter(Boolean))];
  
  // If we don't have tags in db yet, let's hardcode a few for visual presentation based on typical tags
  const displayTags = tags.length > 1 ? tags : ['All', 'Array', 'Hashing', 'Recursion', 'Graph', 'Linked List'];

  const filteredProblems = selectedTag === 'All' 
    ? problems 
    : problems.filter(p => p.tags && p.tags.includes(selectedTag));

  const isSolved = (problemId) => {
    if (!user || !user.solvedProblems) return false;
    return user.solvedProblems.includes(problemId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center">
              <Code className="mr-3 h-8 w-8 text-indigo-600" /> Practice Problems
            </h1>
            <p className="text-gray-500">Master DSA topics and improve your coding skills.</p>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center space-x-2 overflow-x-auto">
          <Filter className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
          {displayTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Problems Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 w-16 text-center">Status</th>
                  <th className="p-4 font-semibold text-gray-600">Title</th>
                  <th className="p-4 font-semibold text-gray-600">Difficulty</th>
                  <th className="p-4 font-semibold text-gray-600">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProblems.map((problem) => (
                  <tr key={problem._id} className="hover:bg-gray-50 transition group">
                    <td className="p-4 text-center align-middle">
                      {isSolved(problem._id) ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="block h-5 w-5 rounded-full border-2 border-gray-300 mx-auto group-hover:border-indigo-300"></span>
                      )}
                    </td>
                    <td className="p-4">
                      {/* Navigate to problem solving route. We can use a generic contest id, or update the route to not strictly require a contest id.
                          For now, we'll route to a special path if we update App.jsx, or use a "practice" pseudo-contest.
                          Let's assume we update App.jsx to handle /problems/:problemId */}
                      <Link 
                        to={`/problems/${problem._id}`} 
                        className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline text-lg"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags && problem.tags.length > 0 ? (
                          problem.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">No tags</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No problems found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Problems;
