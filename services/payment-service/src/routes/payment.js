const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// Note: In a real app, these should be in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

/**
 * @route   POST /api/payment/order
 * @desc    Create a Razorpay Order
 * @access  Private (Farmer)
 */
router.post('/order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_' + Date.now() } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const isPlaceholderKey = !process.env.RAZORPAY_KEY_ID || 
                             process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder' || 
                             !process.env.RAZORPAY_KEY_SECRET || 
                             process.env.RAZORPAY_KEY_SECRET === 'secret_placeholder';

    if (isPlaceholderKey) {
      return res.json({
        id: 'order_mock_' + Date.now(),
        entity: 'order',
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency,
        receipt,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        isMock: true
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    try {
      const order = await razorpay.orders.create(options);
      
      if (!order) {
        return res.status(500).json({ message: 'Failed to create order' });
      }

      res.json(order);
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError.message);
      return res.status(400).json({ 
        message: 'Razorpay order creation failed: ' + razorpayError.message,
        error: razorpayError.message 
      });
    }
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay Payment Signature
 * @access  Private (Farmer)
 */
router.post('/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      return res.json({ 
        status: 'success', 
        success: true,
        message: 'Payment verified successfully (Mock)',
        data: { razorpay_payment_id }
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      // Here you would typically update your database (e.g., mark laborer as booked)
      return res.json({ 
        status: 'success', 
        message: 'Payment verified successfully',
        data: { razorpay_payment_id }
      });
    } else {
      return res.status(400).json({ 
        status: 'failure', 
        message: 'Invalid signature, payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
