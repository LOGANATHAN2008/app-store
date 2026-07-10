const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

exports.createOrder = async (req, res) => {
  try {
    const { appId, userId } = req.body;

    if (!appId || !userId) {
      return res.status(400).json({ error: 'App ID and User ID are required' });
    }

    const app = store.apps.find(a => a.id === appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (app.price === 0) {
      return res.status(400).json({ error: 'App is free' });
    }

    // Convert price to paise (lowest denomination for INR, or just 100 for USD cents etc. Razorpay usually uses paise)
    // Assuming price is in dollars, and Razorpay is dealing in USD/INR. We'll use the price * 100 as the amount.
    // If Razorpay is configured for INR, price in INR * 100. Let's assume price in USD, Razorpay requires currency.
    // We will use INR for Razorpay standard if it's an Indian account, or USD. Let's default to USD.
    const amount = Math.round(app.price * 100);

    const options = {
      amount,
      currency: 'USD',
      receipt: `receipt_${uuidv4().substring(0, 8)}`,
    };

    const order = await razorpay.orders.create(options);

    // Store in our database
    const paymentRecord = {
      id: uuidv4(),
      userId,
      appId,
      amount: app.price,
      currency: 'USD',
      razorpayOrderId: order.id,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.payments.push(paymentRecord);
    store.saveStore();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, appId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the payment record and update status
      const paymentIndex = store.payments.findIndex(p => p.razorpayOrderId === razorpay_order_id);
      
      if (paymentIndex !== -1) {
        store.payments[paymentIndex].status = 'paid';
        store.payments[paymentIndex].razorpayPaymentId = razorpay_payment_id;
        store.payments[paymentIndex].updatedAt = new Date().toISOString();
        store.saveStore();
      } else {
        // If somehow not found (maybe webhook already updated it or missing), let's create/update
        store.payments.push({
          id: uuidv4(),
          userId,
          appId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'paid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        store.saveStore();
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.webhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET';
  const signature = req.headers['x-razorpay-signature'];

  try {
    const isValid = Razorpay.validateWebhookSignature(JSON.stringify(req.body), signature, secret);

    if (isValid) {
      const event = req.body.event;
      const paymentData = req.body.payload.payment.entity;

      // We might use order_id or payment_id to find the record
      const orderId = paymentData.order_id;
      
      if (orderId) {
        const paymentIndex = store.payments.findIndex(p => p.razorpayOrderId === orderId);

        if (paymentIndex !== -1) {
          if (event === 'payment.captured') {
            store.payments[paymentIndex].status = 'paid';
          } else if (event === 'payment.failed') {
            store.payments[paymentIndex].status = 'failed';
          } else if (event === 'refund.processed') {
            store.payments[paymentIndex].status = 'refunded';
          }
          store.payments[paymentIndex].updatedAt = new Date().toISOString();
          store.saveStore();
        }
      }

      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getTransactions = (req, res) => {
  const transactions = store.payments || [];
  res.json({ transactions });
};

exports.getUserHistory = (req, res) => {
  const { userId } = req.params;
  const history = (store.payments || []).filter(p => p.userId === userId);
  res.json({ history });
};
