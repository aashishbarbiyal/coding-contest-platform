import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const executeCpp = async (code, input) => {
  const jobId = uuidv4();
  const tempDir = os.tmpdir();
  const codeFilePath = path.join(tempDir, `${jobId}.cpp`);
  const inputFilePath = path.join(tempDir, `${jobId}.txt`);
  const outFilePath = path.join(tempDir, `${jobId}.exe`);

  fs.writeFileSync(codeFilePath, code);
  fs.writeFileSync(inputFilePath, input);

  return new Promise((resolve, reject) => {
    exec(`g++ ${codeFilePath} -o ${outFilePath}`, (error, stdout, stderr) => {
      if (error) {
        return resolve({ status: 'Compilation Error', error: stderr });
      }

      const startTime = Date.now();
      exec(`${outFilePath} < ${inputFilePath}`, { timeout: 2000 }, (execError, execStdout, execStderr) => {
        const executionTime = Date.now() - startTime;
        
        // Cleanup
        try {
          fs.unlinkSync(codeFilePath);
          fs.unlinkSync(inputFilePath);
          fs.unlinkSync(outFilePath);
        } catch (e) {
          console.error('Error cleaning up files', e);
        }

        if (execError) {
          if (execError.killed) {
            return resolve({ status: 'Time Limit Exceeded', executionTime });
          }
          return resolve({ status: 'Runtime Error', error: execStderr, executionTime });
        }

        resolve({ status: 'Success', output: execStdout.trim(), executionTime });
      });
    });
  });
};

export default executeCpp;
