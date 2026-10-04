import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

const ProblemSolving = () => {
  const { contestId, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' or 'result'
  const [customInput, setCustomInput] = useState('');
  const [runResult, setRunResult] = useState(null);

  const templates = {
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    // your code goes here\n    return 0;\n}',
    java: 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}',
    python: '# your code goes here\n',
    javascript: '// your code goes here\n'
  };

  useEffect(() => {
    setCode(templates[language]);
  }, [language]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axios.get(`/api/problems/${problemId}`);
        setProblem(data);
        if (data.testCases && data.testCases.length > 0) {
          // Pre-fill custom input with the first public testcase
          const publicTc = data.testCases.find(tc => !tc.isHidden);
          if (publicTc) setCustomInput(publicTc.input);
        }
      } catch (error) {
        toast.error('Failed to load problem');
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setSubmissionResult(null);
    setActiveTab('result');
    try {
      const { data } = await axios.post('/api/submissions/run', {
        code,
        language,
        input: customInput
      });
      setRunResult(data);
      if (data.status === 'Success') {
        toast.success('Code executed successfully');
      } else {
        toast.error(`Execution failed: ${data.status}`);
      }
    } catch (error) {
      toast.error('Failed to run code');
      setRunResult({ status: 'Error', error: error.message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionResult(null);
    setRunResult(null);
    setActiveTab('result');
    try {
      const { data } = await axios.post('/api/submissions', {
        problemId,
        contestId,
        code,
        language
      });
      setSubmissionResult(data);
      if (data.status === 'Accepted') {
        toast.success('Solution Accepted!');
      } else {
        toast.error(`Submission failed: ${data.status}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="text-center mt-20 text-white">Loading problem...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0f111a] text-gray-300 font-sans">
      
      {/* Left side: Problem Description */}
      <div className="w-1/2 flex flex-col border-r border-gray-700 bg-[#1c1e29] m-2 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-[#282a36] px-4 py-2 flex space-x-4 border-b border-gray-700">
          <button className="text-sm font-semibold text-white border-b-2 border-indigo-500 pb-1">Description</button>
          <button className="text-sm font-semibold text-gray-400 hover:text-white pb-1 transition">Submissions</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
          <h1 className="text-2xl font-bold mb-3 text-white">{problem.title}</h1>
          <div className="flex space-x-3 mb-6 text-xs font-semibold">
            <span className={`px-2 py-1 rounded-full ${
              problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {problem.difficulty}
            </span>
            <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">{problem.score} points</span>
          </div>
          
          <div className="prose prose-invert max-w-none text-sm text-gray-300">
            <p className="whitespace-pre-wrap leading-relaxed mb-6">{problem.description}</p>
            
            {problem.testCases && problem.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
              <div key={idx} className="mb-6">
                <p className="font-semibold text-white mb-2">Example {idx + 1}:</p>
                <div className="bg-[#282a36] border-l-4 border-gray-500 rounded p-4 text-xs font-mono">
                  <div className="mb-2">
                    <span className="font-bold text-gray-400">Input:</span><br/>
                    <span className="text-white whitespace-pre-wrap">{tc.input}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">Output:</span><br/>
                    <span className="text-white whitespace-pre-wrap">{tc.output}</span>
                  </div>
                </div>
              </div>
            ))}

            {problem.constraints && (
              <>
                <p className="font-semibold text-white mb-2 mt-8">Constraints:</p>
                <ul className="list-disc pl-5 bg-[#282a36] p-4 rounded text-xs font-mono text-indigo-300 whitespace-pre-wrap">
                  {problem.constraints.split('\n').map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Code Editor & Console */}
      <div className="w-1/2 flex flex-col m-2 ml-0 space-y-2">
        
        {/* Editor Container */}
        <div className="flex-grow flex flex-col rounded-lg overflow-hidden bg-[#1c1e29] shadow-lg border border-gray-700">
          <div className="flex justify-between items-center bg-[#282a36] px-4 py-2 border-b border-gray-700">
            <select 
              className="bg-gray-700 text-sm text-white border-none rounded px-3 py-1 outline-none hover:bg-gray-600 transition cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <div className="flex space-x-2">
              <button 
                onClick={handleRun}
                disabled={running || submitting}
                className={`px-4 py-1.5 rounded font-bold text-sm transition shadow ${
                  running ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 hover:shadow-lg'
                }`}
              >
                {running ? 'Running...' : 'Run Code'}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting || running}
                className={`px-6 py-1.5 rounded font-bold text-sm transition shadow ${
                  submitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 hover:shadow-lg'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          <div className="flex-grow">
            <Editor
              height="100%"
              language={language === 'c' ? 'cpp' : language} 
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth"
              }}
            />
          </div>
        </div>

        {/* Console Container */}
        <div className="h-64 flex flex-col rounded-lg overflow-hidden bg-[#1c1e29] shadow-lg border border-gray-700">
          <div className="flex space-x-4 bg-[#282a36] px-4 py-2 border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('testcase')}
              className={`text-sm font-semibold pb-1 transition ${activeTab === 'testcase' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
            >
              Testcase
            </button>
            <button 
              onClick={() => setActiveTab('result')}
              className={`text-sm font-semibold pb-1 transition ${activeTab === 'result' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
            >
              Test Result
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 bg-[#0f111a]">
            {activeTab === 'testcase' && (
              <div className="h-full flex flex-col">
                <label className="text-xs text-gray-400 mb-2 font-semibold">Custom Input:</label>
                <textarea
                  className="flex-grow bg-[#1c1e29] text-white p-3 rounded border border-gray-700 font-mono text-sm resize-none outline-none focus:border-indigo-500 custom-scrollbar"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              </div>
            )}
            
            {activeTab === 'result' && (
              <div className="h-full">
                {!submissionResult && !runResult ? (
                  <div className="text-gray-500 text-sm flex items-center justify-center h-full">
                    Run your code or submit to see results.
                  </div>
                ) : submissionResult ? (
                  /* Submission Result */
                  <div>
                    <h2 className={`text-xl font-bold mb-2 ${
                      submissionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {submissionResult.status}
                    </h2>
                    {submissionResult.executionTime !== undefined && (
                      <p className="text-sm text-gray-400 mb-4">
                        Runtime: <span className="text-white font-mono">{submissionResult.executionTime} ms</span>
                      </p>
                    )}
                    {submissionResult.errorMessage && (
                      <div className="bg-red-900/20 border border-red-900 rounded p-4 mt-2">
                        <span className="text-red-400 font-bold text-sm">Error Message:</span>
                        <pre className="mt-2 text-red-300 text-xs whitespace-pre-wrap font-mono">
                          {submissionResult.errorMessage}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : runResult ? (
                  /* Run Result */
                  <div>
                    <h2 className={`text-lg font-bold mb-2 ${
                      runResult.status === 'Success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {runResult.status}
                    </h2>
                    {runResult.executionTime !== undefined && (
                      <p className="text-sm text-gray-400 mb-4">
                        Runtime: <span className="text-white font-mono">{runResult.executionTime} ms</span>
                      </p>
                    )}
                    {runResult.status === 'Success' ? (
                      <div className="mt-2">
                        <span className="text-gray-400 font-bold text-sm">Output:</span>
                        <pre className="mt-2 bg-[#1c1e29] border border-gray-700 rounded p-3 text-gray-300 text-sm whitespace-pre-wrap font-mono">
                          {runResult.output}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-red-900/20 border border-red-900 rounded p-4 mt-2">
                        <span className="text-red-400 font-bold text-sm">Error Message:</span>
                        <pre className="mt-2 text-red-300 text-xs whitespace-pre-wrap font-mono">
                          {runResult.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1c1e29; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; 
        }
      `}} />
    </div>
  );
};

export default ProblemSolving;
