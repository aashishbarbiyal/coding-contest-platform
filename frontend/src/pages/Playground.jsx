import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';

const Playground = () => {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [running, setRunning] = useState(false);

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

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setStatus('');
    setExecutionTime(null);
    try {
      const { data } = await axios.post('/api/submissions/run', {
        code,
        language,
        input
      });
      setStatus(data.status);
      setExecutionTime(data.executionTime);
      if (data.status === 'Success') {
        setOutput(data.output);
        toast.success('Code executed successfully');
      } else {
        setOutput(data.error || 'Execution failed');
        toast.error(`Error: ${data.status}`);
      }
    } catch (error) {
      toast.error('Failed to run code');
      setOutput(error.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0f111a] text-gray-300 font-sans">
      <div className="flex justify-between items-center px-6 py-3 bg-[#1c1e29] border-b border-gray-800">
        <h1 className="text-xl font-bold text-white flex items-center">
          Code Playground
        </h1>
        <div className="flex items-center space-x-4">
          <select 
            className="bg-gray-800 text-sm text-white border border-gray-700 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
          <button 
            onClick={handleRun}
            disabled={running}
            className={`flex items-center px-4 py-1.5 rounded font-bold text-sm transition shadow ${
              running ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 hover:shadow-lg'
            }`}
          >
            <Play className="h-4 w-4 mr-1" /> {running ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Editor */}
        <div className="w-2/3 border-r border-gray-800 flex flex-col">
          <Editor
            height="100%"
            language={language === 'c' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              padding: { top: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth"
            }}
          />
        </div>
        
        {/* IO Panel */}
        <div className="w-1/3 flex flex-col bg-[#1c1e29]">
          <div className="flex-1 flex flex-col border-b border-gray-800">
            <div className="bg-[#282a36] px-4 py-2 text-sm font-semibold border-b border-gray-800 text-gray-300">
              Custom Input
            </div>
            <textarea
              className="flex-grow bg-[#1c1e29] text-white p-4 font-mono text-sm resize-none outline-none custom-scrollbar"
              placeholder="Enter your input here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="bg-[#282a36] px-4 py-2 text-sm font-semibold border-b border-gray-800 flex justify-between items-center text-gray-300">
              <span>Output</span>
              {status && (
                <span className={`text-xs px-2 py-0.5 rounded ${status === 'Success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {status} {executionTime !== null && `(${executionTime}ms)`}
                </span>
              )}
            </div>
            <div className="flex-grow bg-[#0f111a] p-4 overflow-y-auto custom-scrollbar">
              {output ? (
                <pre className={`font-mono text-sm whitespace-pre-wrap ${status === 'Success' ? 'text-gray-300' : 'text-red-400'}`}>
                  {output}
                </pre>
              ) : (
                <p className="text-gray-600 text-sm italic font-mono">Output will appear here after execution.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1c1e29; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}} />
    </div>
  );
};

export default Playground;
