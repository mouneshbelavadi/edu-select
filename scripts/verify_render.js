const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const htmlPath = path.resolve(__dirname, '..', 'architecture_preview.html');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const child = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--virtual-time-budget=4000',
  '--enable-logging=stderr',
  '--v=1',
  'file:///' + htmlPath.replace(/\\/g, '/')
]);

let logs = '';
child.stderr.on('data', (d) => { logs += d.toString(); });
child.stdout.on('data', (d) => { logs += d.toString(); });

child.on('close', (code) => {
  console.log('Chrome exited with code:', code);
  const consoleLines = logs.split('\n').filter(l => l.includes('CONSOLE') || l.includes('Mermaid') || l.includes('error') || l.includes('Error'));
  console.log('Filtered relevant lines:\n', consoleLines.join('\n'));
});
