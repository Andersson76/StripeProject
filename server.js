import express from 'express'
import fetch from 'node-fetch'
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config('.env')
console.log(dotenv.config('.env').parsed.STRIPE_SECRET_KEY)

const app = express()
const port = 3000
//const YOUR_DOMAIN = 'http://localhost:3000';


export const stripe = Stripe(dotenv.config('.env').parsed.STRIPE_SECRET_KEY)

app.use(express.json()) 
app.use("/", express.static("client"))

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

/* const chargeCustomer = async (customerId) => {
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
}; */

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

// Endpoint tillhörande med funktion getCustomer
app.get("/get-customer"), async (req, res) => {
  console.log("kommer in i customer?")
  
  try {
    const customer = await stripe.customers.search({
      query: { "data": [ { "email": "" } ] },
    });
    res.json(customer)
    console.log(customer)
  
  } catch(err) {
    console.error(err)
  }
}

// Endpoit tillhörande med funktionen createCustomer
app.post("/create-customer", async (req, res) => {
  console.log("är jag inne?")
  
  try {
    const customer = await stripe.customers.create(req.body);
    console.log(customer)
    res.json(customer.id)

  } catch (err) {
    console.error(err)
  }
})


// Endpoint tillhörande med funktionen createSession
app.post('/create-checkout-session', async (req, res) => {
  console.log("kommer jag in?")

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], 
    /* customer: customer.id,  */

    // Ska ej vara hårdkodat & fixa validering på email, telefon & namn
    line_items: [
      {
        quantity: 3,
        price_data: {
          currency: "sek",
          product_data: {
            description: "Latest and gratest smartphone from Apple.",
            name: "iPhone X",
            //images: "iPhonex.png"
          },
          unit_amount: 1149500
        }
      },
      {
        quantity: 1,
        price_data: {
          currency: "sek",
          product_data: {
            description: "Sleek and powerful smartphone from One Plus",
            name: "One Plus 5",
            //images: "OnePlus5.png"
          },
          unit_amount: 499500
        }
      },
      {
        quantity: 1,
        price_data: {
          currency: "sek",
          product_data: {
            description: "Latest edge to edge smartphone from Samsung.",
            name: "Galaxy S8",
            //images: "SamsungS8.png"
          },
          unit_amount: 799000
        }
      },
      {
        quantity: 2,
        price_data: {
          currency: "sek",
          product_data: {
            description: "Super nice and beautiful smartphone from LG.",
            name: "LG V30",
            //images: "LGV30.png"
          },
          unit_amount: 749500
        },
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/cancel.html',
  });

console.log(session)
  res.json(session.id);

});

app.use((err, req, res, next) => {
    console.log(err.status)
    console.log(err.message)
    res.status(500).json(err)
  })
  
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  })