// Route: POST /api/create-payment-intent
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentIntent =  async (req, res) => {
  const { amount } = req.body; // amount in cents (i.e. 10.99 => 1099)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
module.exports = {
    paymentIntent
}