import express from 'express'
import fetch from 'node-fetch'


const app = express()
const port = 3000

const stripe = require("stripe")('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');

app.use(express.json()) 
app.use("/", express.static("client"))

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