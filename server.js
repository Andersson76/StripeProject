import express from 'express'
import fetch from 'node-fetch'
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config('.env')
console.log(dotenv.config('.env').parsed.STRIPE_SECRET_KEY)

const app = express()
const port = 3000

export const stripe = Stripe(dotenv.config('.env').parsed.STRIPE_SECRET_KEY)

app.use(express.json()) 
app.use("/", express.static("client"))

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

const chargeCustomer = async (customerId) => {
  // Lookup the payment methods available for the customer
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  try {
    // Charge the customer and payment method immediately
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethods.data[0].id,
      off_session: true,
      confirm: true,
    });
  } catch (err) {
    // Error code will be authentication_required if authentication is needed
    console.log("Error code is: ", err.code);
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
    console.log("PI retrieved: ", paymentIntentRetrieved.id);
  }
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  const customer = await stripe.customers.create();


  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    setup_future_usage: "off_session",
    amount: calculateOrderAmount(items),
    currency: "sek",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1LhBFFIIsWx48M6wXhWcEdrj',
        quantity: 1,
      },
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1LhBE1IIsWx48M6wGw14hlTB',
        quantity: 1,
      },
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1LhBCMIIsWx48M6wjMJemZAy',
        quantity: 1,
      },
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1LhB9QIIsWx48M6wxmV1eEjV',
        quantity: 1,
      }
    ],
    mode: 'payment',
    /* success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`, */
    automatic_tax: {enabled: true},
  });

  res.redirect(303, session.url);
});




app.use((err, req, res, next) => {
    console.log(err.status)
    console.log(err.message)
    res.status(500).json(err)
  })
  
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  })