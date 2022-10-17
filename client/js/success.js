const stripe = Stripe(
  "pk_test_51LgtJ8IIsWx48M6ww2bKhPz3WKBhaNsD3qk5RPM1MmHXHQ4jMtHItX8s5JVZrDflpGRqJBCvBKay5EBcYdd20FL300uruvFgyP"
);

const initSite = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get("session_id");

  if (sessionId) {
    await verifyPayment(sessionId);
  } else {
    window.location.href = "/";
  }
};

async function verifyPayment(sessionId) {
  const body = JSON.stringify({ sessionId });

  let response = await fetch(
    "http://localhost:3000/api/payment/verify-payment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }
  );

  let result = await response.json();

  console.log(result);
}

window.addEventListener("load", initSite);
