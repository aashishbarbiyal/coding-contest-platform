import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const executeCode = async (code, input, language) => {
  const jobId = uuidv4();
  const tempDir = os.tmpdir();
  
  let codeFilePath;
  let inputFilePath = path.join(tempDir, `${jobId}.txt`);
  let outFilePath;
  let compileCmd = null;
  let executeCmd = null;

  fs.writeFileSync(inputFilePath, input);

  if (language === 'cpp') {
    codeFilePath = path.join(tempDir, `${jobId}.cpp`);
    outFilePath = path.join(tempDir, `${jobId}.exe`);
    compileCmd = `g++ "${codeFilePath}" -o "${outFilePath}"`;
    executeCmd = `"${outFilePath}" < "${inputFilePath}"`;
  } else if (language === 'c') {
    codeFilePath = path.join(tempDir, `${jobId}.c`);
    outFilePath = path.join(tempDir, `${jobId}.exe`);
    compileCmd = `gcc "${codeFilePath}" -o "${outFilePath}"`;
    executeCmd = `"${outFilePath}" < "${inputFilePath}"`;
  } else if (language === 'java') {
    // Java requires the class name to match the file name if it's public.
    // To simplify, we'll name the file Solution.java and assume the user's class is named Solution.
    codeFilePath = path.join(tempDir, `Solution_${jobId}.java`);
    compileCmd = `javac "${codeFilePath}"`;
    executeCmd = `java -cp "${tempDir}" Solution_${jobId} < "${inputFilePath}"`;
  } else if (language === 'python') {
    codeFilePath = path.join(tempDir, `${jobId}.py`);
    executeCmd = `python "${codeFilePath}" < "${inputFilePath}"`; // using 'python', may need 'python3' on some systems but windows usually uses python
  } else if (language === 'javascript') {
    codeFilePath = path.join(tempDir, `${jobId}.js`);
    executeCmd = `node "${codeFilePath}" < "${inputFilePath}"`;
  } else {
    return { status: 'Compilation Error', error: 'Unsupported language' };
  }

  // Handle Java naming specifically (replace 'public class Main' or 'public class Solution' with our generated name)
  let processedCode = code;
  if (language === 'java') {
    processedCode = code.replace(/public\s+class\s+[a-zA-Z0-9_]+/g, `public class Solution_${jobId}`);
  }
  
  fs.writeFileSync(codeFilePath, processedCode);

  const runExecution = () => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      exec(executeCmd, { timeout: 2000 }, (execError, execStdout, execStderr) => {
        const executionTime = Date.now() - startTime;
        
        // Cleanup
        try {
          if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
          if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
          if (outFilePath && fs.existsSync(outFilePath)) fs.unlinkSync(outFilePath);
          if (language === 'java') {
             const classFile = path.join(tempDir, `Solution_${jobId}.class`);
             if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
          }
        } catch (e) {
          console.error('Error cleaning up files', e);
        }

        if (execError) {
          if (execError.killed) {
            return resolve({ status: 'Time Limit Exceeded', executionTime });
          }
          return resolve({ status: 'Runtime Error', error: execStderr || execError.message, executionTime });
        }

        resolve({ status: 'Success', output: execStdout.trim(), executionTime });
      });
    });
  };

  if (compileCmd) {
    return new Promise((resolve) => {
      exec(compileCmd, (error, stdout, stderr) => {
        if (error) {
          // Cleanup on compile error
          try {
            if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
          } catch(e) {}
          return resolve({ status: 'Compilation Error', error: stderr || error.message });
        }
        resolve(runExecution());
      });
    });
  } else {
    return runExecution();
  }
};

export default executeCode;
