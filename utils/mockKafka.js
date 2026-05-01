class MockProducer {
  async connect() { return true; }
  async send(params) {
    console.log(`[MockKafka] Sent message to ${params.topic}`);
  }
}

class MockConsumer {
  async connect() { return true; }
  async subscribe() { return true; }
  async run() { return true; }
}

class MockKafka {
  constructor() {}
  producer() { return new MockProducer(); }
  consumer() { return new MockConsumer(); }
}

module.exports = { Kafka: MockKafka };
