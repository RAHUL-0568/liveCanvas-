const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const networkInterfaces = os.networkInterfaces();
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIp();
const port = 3000;
const baseUrl = `http://${ip}:${port}`;

// Bind to 0.0.0.0 for dual access, use shell:true for Windows compatibility
const nextDev = spawn('next dev -H 0.0.0.0', {
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: ['inherit', 'pipe', 'pipe']
});

// Intercept output to show the correct Network URL
nextDev.stdout.on('data', (data) => {
  let output = data.toString();
  output = output.replace(/http:\/\/0\.0\.0\.0:3000/g, baseUrl);
  process.stdout.write(output);
});

nextDev.stderr.on('data', (data) => {
  process.stderr.write(data);
});

nextDev.on('close', (code) => {
  process.exit(code);
});
