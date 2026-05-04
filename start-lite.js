require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn }             = require('child_process');
const path                  = require('path');
const fs                    = require('fs');

async function writeEnvFile(uri) {
  // Write a shared .env.runtime at the root that all services can read
  const envPath = path.join(__dirname, '.env.runtime');
  const lines = [
    `MONGODB_URI=${uri}`,
    `JWT_SECRET=${process.env.JWT_SECRET || 'smart_kisan_secret_123'}`,
    `JWT_EXPIRES_IN=${process.env.JWT_EXPIRES_IN || '7d'}`,
    `JWT_REFRESH_SECRET=${process.env.JWT_REFRESH_SECRET || 'smart_kisan_refresh_secret_456'}`,
    `MOCK_REDIS_KAFKA=false`,
    `REDIS_URL=rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379`,
    `OPENWEATHER_API_KEY=${process.env.OPENWEATHER_API_KEY || ''}`,
    `GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}`,
  ];
  fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
  console.log(`✅ Runtime env written to ${envPath}`);
}

async function start() {
  console.log('🌱 Smart Kisan — Starting in Lite (Zero-Config) Mode\n');

  // 1. Start in-memory MongoDB if no real URI is provided
  let uri = (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('memory')) 
    ? process.env.MONGODB_URI 
    : null;
  let mongod = null;

  if (!uri) {
    console.log('📦 Starting persistent local MongoDB...');
    const dbPath = path.join(__dirname, '.mongo-data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

    mongod = await MongoMemoryServer.create({ instance: { dbPath } });
    uri    = mongod.getUri() + 'smart-kisan';
    console.log(`✅ Local MongoDB running at: ${uri}\n`);
  } else {
    console.log(`🔗 Using Persistent MongoDB: ${uri.replace(/\/\/.*@/, '//***@')}\n`);
  }

  // 2. Set env vars on current process AND write .env.runtime for child processes
  process.env.MONGODB_URI       = uri;
  process.env.MOCK_REDIS_KAFKA  = 'true';
  process.env.JWT_SECRET        = process.env.JWT_SECRET        || 'smart_kisan_secret_123';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'smart_kisan_refresh_secret_456';
  process.env.JWT_EXPIRES_IN    = process.env.JWT_EXPIRES_IN    || '15d';

  await writeEnvFile(uri);

  // 3. Launch all services — pass env explicitly so child shells inherit it
  console.log('🚀 Launching all microservices...\n');
  const child = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGODB_URI:        uri,
      MOCK_REDIS_KAFKA:   'false',
      REDIS_URL:          'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379',
      JWT_SECRET:         process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      JWT_EXPIRES_IN:     process.env.JWT_EXPIRES_IN,
    },
    shell: true,
  });

  child.on('close', async (code) => {
    console.log(`\n🛑 Services stopped (code ${code}). Shutting down MongoDB...`);
    if (mongod) await mongod.stop();
    // Cleanup runtime env
    try { fs.unlinkSync(path.join(__dirname, '.env.runtime')); } catch {}
    process.exit(code ?? 0);
  });

  process.on('SIGINT', async () => {
    console.log('\n⏹  Graceful shutdown...');
    child.kill('SIGINT');
    if (mongod) await mongod.stop();
    try { fs.unlinkSync(path.join(__dirname, '.env.runtime')); } catch {}
    process.exit(0);
  });
}

start().catch(err => {
  console.error('❌ Fatal startup error:', err.message);
  process.exit(1);
});
