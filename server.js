import express from 'express'
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config('.env')
console.log(dotenv.config('.env').parsed.STRIPE_SECRET_KEY)

const app = express()
const port = 3000

export const stripe = Stripe(dotenv.config('.env').parsed.STRIPE_SECRET_KEY)

app.use(express.json()) 
app.use("/", express.static("client"))


app.get("/getCustomer/:email", async (req, res) => {

  try {
    // Checks existing email in stripe
    const checkExisitingEmail = await stripe.customers.search({
      query: `email: \'${req.params.email}\'`,
  });
  console.log(checkExisitingEmail)


  // Kollar om mejl finns och om den finns skickas id:t med.
  if (checkExisitingEmail.data.length) { 
    res.json(checkExisitingEmail.data[0].id)
    
    console.log("Customer already exists!")
    console.log(checkExisitingEmail.data[0].id)

    // Om kunden inte finns så måste vi skapa en 
  } else {
    console.log("Customer doesnt´t exist!")
    res.json(false);
  }

  } catch(err) {
    console.error(err)
    res.status(400).json(err)
  }
})


app.post("/create-customer", async (req, res) => {
  
  try {
    // Checks existing email in stripe
    const checkExisitingEmail = await stripe.customers.search({
      query: `email: \'${req.body.email}\'`,
  });
  console.log(checkExisitingEmail)


    if (!checkExisitingEmail.data.length) {
      const customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
      });
      res.json(customer.id)
      console.log(customer)
    } else {
      console.log("Customer already exist!")
      /* res.json(checkExisitingEmail.id); */ // Skicka statuskod fel??
    }

  } catch (err) {
    res.status(404).json(err);
  }
});

  

app.post('/create-checkout-session', async (req, res) => {
  const items  = req.body;

/*   console.log("kommer jag in?")
  console.log("Items i requesten", items) */
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
    customer: req.body.newCustomer, //- kopplad till createCustomer

    line_items,
    mode: 'payment',
    success_url: 'http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/cancel.html',
  });

console.log(session)
res.status(200).json(session.id);
  /* res.json(session.id); */

});


app.post("/orderSuccess/:sessionId", async (req, res) => {
  try {
    
/*
    // if(sessionId) - verifeira att session är ok. skicka med sessionId i res.json...

    if(sessionId) - verifeira att session är ok. skicka med sessionId i res.json...

// app.post - stripe.checkout.session.retrieve - 

if sats för att kolla om ordern är betald 
"paid", då kan ordern aldrig bli lagt om betalningen inte är gjord.

// const processingOrder = [] -
 ta bort från listan när ordern är lagd - ordern blir inte dubletter.. / Servern.. */
   
    const sessionId = req.params.sessionId;
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log(session)

    let checkIfpaid = session.payment_status == "paid"

    if(checkIfpaid) {
      let order = fs.readFileSync("order.json")
      orderData = JSON.parse(order)
    }

  } catch (err) {
    res.status(400).json(err.message);
  } 

  })

   /* checkout.session.completed / webhooks */
  
/* app.get('/order/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);

  res.send(`<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`);
});

 */

app.use((err, req, res, next) => {
    console.log(err.status)
    console.log(err.message)
    res.status(500).json(err)
  })
  
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  })