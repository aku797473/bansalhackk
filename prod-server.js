const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'gateway',    port: process.env.PORT || 5000, path: 'gateway' },
  { name: 'auth',       port: 5001, path: 'services/auth-service' },
  { name: 'user',       port: 5002, path: 'services/user-service' },
  { name: 'weather',    port: 5003, path: 'services/weather-service' },
  { name: 'crop',       port: 5004, path: 'services/crop-service' },
  { name: 'fertilizer', port: 5005, path: 'services/fertilizer-service' },
  { name: 'market',     port: 5006, path: 'services/market-service' },
  { name: 'labour',     port: 5007, path: 'services/labour-service' },
  { name: 'chatbot',    port: 5008, path: 'services/chatbot-service' },
  { name: 'news',       port: 5009, path: 'services/news-service' },
  { name: 'payment',    port: 5010, path: 'services/payment-service' },
  { name: 'frontend',   port: 5173, path: 'frontend', command: 'npm', args: ['run', 'dev'] }

];

console.log('🚀 Starting Smart Kisan Stack...');

services.forEach(svc => {
  console.log(`📦 Launching ${svc.name}...`);
  
  // Use nodemon for all services except frontend (which has its own dev server)
  const isFrontend = svc.name === 'frontend';
  const command = svc.command || (isFrontend ? 'npm' : 'npx');
  const args = svc.args || (isFrontend ? ['run', 'dev'] : ['nodemon', 'src/index.js']);
  
  const child = spawn(command, args, {
    cwd: path.join(__dirname, svc.path),
    env: { ...process.env, PORT: svc.port },
    shell: true
  });

  child.stdout.on('data', (data) => {
    console.log(`[${svc.name}] ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`[${svc.name} ERROR] ${data.toString().trim()}`);
  });

  child.on('close', (code) => {
    console.log(`[${svc.name}] exited with code ${code}`);
    if (code !== 0) process.exit(code);
  });
});

process.on('SIGINT', () => {
  console.log('Stopping all services...');
  process.exit();
});
