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



app.get("/getCustomer/:email", async (req, res) => {

  try {
    // Checks existing email in stripe
    const checkExisitingEmail = await stripe.customers.search({
      query: `email: \'${req.params.email}\'`,
  });
  console.log(checkExisitingEmail)

  // Om email redan finns så får vi ut samma customer id
  // Om email inte finns är det tomt och då måste vi skapa den. Fortsätt med kollen i create customer
  if(!checkExisitingEmail) {
    res.json("Kunden finns inte!") 
   console.log("Kunden finns inte")
   /*
  } else {
    res.json("Kunden finns inte")
    throw new Error("Kunden finns inte")
  } */
}

  } catch(err) {
    console.error(err)
    res.status(400).json(err)
  }
})


app.post("/create-customer", async (req, res) => {
  
  try {

    let email = req.body.email
    let name = req.body.name
    let phone = req.body.phone

    // Lägg till kontroll om kunden finns annars ska vi skapa den, på samma sätt som search???
  
    const customer = await stripe.customers.create({
      email, name, phone
    });
      console.log(customer) 
      res.json(customer.id)

  } catch (err) {
    console.error(err)
    res.status(400).json(err)
  }
})

  /*  const customer = await stripe.customers.create(req.body)   
     console.log(customer) 
 */

// Check user i create user 

// ALT 1
       // Checks existing email in stripe
  /*      const checkExisitingEmail = await stripe.customers.search({
        query: `email: \'${req.params.email}\'`,
    }); */

    //if(checkExisitingEmail) {

  // ALT 2 
     //check if stripe customer already exists
 /*   const existingCustomers = await stripe.customers.list({
      email
    });
  
    //if stripe customer exists send error message
    if (existingCustomers.data.length != 0) {
      res.status(400).send({ type: 'Failed Stripe Sign Up', message: 'User Already Exists' });
      return;
    }  */



app.post('/create-checkout-session', async (req, res) => {
  const items  = req.body;

  console.log("kommer jag in?")
  console.log("Items i requesten", items)
  const line_items = items.map(pryl => {
    return {
      quantity: pryl.quantity,
      price_data: {
        currency: "sek",
        unit_amount: pryl.unit_amount * 100,
        product_data: {
          name: pryl.name,
          description:  pryl.description,
          images: [pryl.image]
        }
      }
    }
  })
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], 
    /* customer: customer.id, */  

    line_items,
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