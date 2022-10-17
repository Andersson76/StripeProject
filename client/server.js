import express from "express";
import Stripe from "stripe";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config(".env");
console.log(dotenv.config(".env").parsed.STRIPE_SECRET_KEY);

const app = express();
const port = 3000;
const dataPath = "./data/orders.json";

export const stripe = Stripe(dotenv.config(".env").parsed.STRIPE_SECRET_KEY);

app.use(express.json());
app.use("/", express.static("client"));

app.get("/getCustomer/:email", async (req, res) => {
  try {
    // Checks existing email in stripe
    const checkExisitingEmail = await stripe.customers.search({
      query: `email: \'${req.params.email}\'`,
    });

    // Kollar om mejl finns och om den finns skickas id:t med.
    if (checkExisitingEmail.data.length) {
      res.json(checkExisitingEmail.data[0].id);

      // Om kunden inte finns så måste vi skapa en
    } else {
      res.json(false);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.post("/create-customer", async (req, res) => {
  try {
    // Checks existing email in stripe
    const checkExisitingEmail = await stripe.customers.search({
      query: `email: \'${req.body.email}\'`,
    });

    if (!checkExisitingEmail.data.length) {
      const customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
      });
      res.json(customer.id);
    } else {
      /* res.json(checkExisitingEmail.id); */
      // Skicka statuskod fel??
    }
  } catch (err) {
    res.status(404).json(err);
  }
});

app.post("/create-checkout-session", async (req, res) => {
  const items = req.body.shoppingCart;

  const line_items = items.map((pryl) => {
    return {
      quantity: pryl.quantity,
      price_data: {
        currency: "sek",
        unit_amount: pryl.unit_amount * 100,
        product_data: {
          name: pryl.name,
          description: pryl.description,
          images: [pryl.image],
        },
      },
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: req.body.customerId, //- kopplad till createCustomer

    line_items,
    mode: "payment",
    success_url:
      "http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:3000/cancel.html",
  });

  console.log(session);
  res.status(200).json(session.id);
});

app.post("/api/payment/verify-payment", async (req, res) => {
  try {
    console.log("Kommer in");
    let orders = fs.readFileSync(dataPath);
    orders = JSON.parse(orders);
    const findOrder = orders.find((order) => order.id == req.body.sessionId);

    if (findOrder) {
      throw new Error();
    }

    const findSession = await stripe.checkout.sessions.retrieve(
      req.body.sessionId
    );

    if (findSession.payment_status == "paid") {
      const newOrder = {
        id: findSession.id,
        createdDate: new Date().toLocaleString(),
      };

      orders.push(newOrder);
      fs.writeFileSync(dataPath, JSON.stringify(orders));

      res.status(200).json(findSession);
      return;
    }

    res.status(404).json(false); //kolla statuskoden
  } catch (err) {
    res.status(404).json(err.message);
  }
});

app.use((err, req, res, next) => {
  console.log(err.status);
  console.log(err.message);
  res.status(500).json(err);
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
