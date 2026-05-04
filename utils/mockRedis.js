class MockRedis {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }
  async setex(key, ttlSeconds, value) {
    this.store.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
    return 'OK';
  }
  async del(key) {
    this.store.delete(key);
    return 1;
  }
  on(event, callback) {
    // Dummy event listener
    return this;
  }
  get status() {
    return 'ready';
  }
}

module.exports = MockRedis;
