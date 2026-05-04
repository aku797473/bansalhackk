const Redis = require('ioredis');

const url = 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';

console.log('Testing Redis connection to Upstash...');
const redis = new Redis(url, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: {}
});

redis.on('connect', () => {
  console.log('✅ SUCCESS: Connected to Upstash Redis!');
  process.exit(0);
});

redis.on('error', (err) => {
  console.error('❌ ERROR: Failed to connect:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏱️ TIMEOUT: Connection took too long.');
  process.exit(1);
}, 5000);
