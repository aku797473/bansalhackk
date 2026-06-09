const Razorpay = require('razorpay');
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SzQKPeruEMA35Z',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'a58ViZaSUL4LYy3jepIs1g2b',
  });

  const segments = req.url.split('?')[0].split('/').filter(Boolean);
  const endpoint = segments[segments.length - 1];

  try {
    // POST /api/payment/order
    if (req.method === 'POST' && endpoint === 'order') {
      const { amount } = req.body;
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });
      return res.json(order);
    }

    // POST /api/payment/verify
    if (req.method === 'POST' && endpoint === 'verify') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const key_secret = process.env.RAZORPAY_KEY_SECRET || 'a58ViZaSUL4LYy3jepIs1g2b';
      const hmac = crypto.createHmac('sha256', key_secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = hmac.digest('hex');
      if (digest === razorpay_signature) {
        return res.json({ success: true, message: 'Payment verified' });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
