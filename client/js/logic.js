const stripe = Stripe(
  "pk_test_51LgtJ8IIsWx48M6ww2bKhPz3WKBhaNsD3qk5RPM1MmHXHQ4jMtHItX8s5JVZrDflpGRqJBCvBKay5EBcYdd20FL300uruvFgyP"
);

/* import {createInputField} from "./customer.js" */

var itemsData;
var shoppingCart = [];
var isItemsViewVisible = false;

let valueEmail = "";
let valueCustomerId = "";

/* Fetch data from the json file into a javascript object */
fetch("./assets/data.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    itemsData = data;
    createUIFromLoadedItemsData();
  });

/* Use the data to create a list of these object on your website */
function createUIFromLoadedItemsData() {
  if (isItemsViewVisible) {
    return;
  }
  isItemsViewVisible = true;

  /* Create a list of the products */
  var list = document.createElement("ul");
  for (var index = 0; index < itemsData.length; index++) {
    list.appendChild(createListItem(itemsData[index]));
  }

  /* Add the list to the DOM */
  var container = document.querySelector("#main");
  if (container.firstChild) {
    container.replaceChild(list, container.firstChild);
  } else {
    container.appendChild(list);
  }
}

function createListItem(itemData) {
  /* Name */
  var name = document.createElement("h3");
  name.innerText = itemData.name;

  /* Description */
  var description = document.createElement("p");
  description.innerText = itemData.description;

  /* Image */
  var image = document.createElement("img");
  image.src = itemData.image;

  /* Unit_amount */
  var unit_amount = document.createElement("span");
  unit_amount.innerText = "" + itemData.unit_amount + " kr";

  /* Button */
  var button = document.createElement("button");
  button.innerHTML =
    '<i class="fa fa-cart-arrow-down" aria-hidden="true"></i>' +
    "&nbsp;&nbsp;&nbsp;" +
    "Lägg till i kundvagnen";
  button.onclick = function () {
    const existingItem = shoppingCart.find((i) => i.name === itemData.name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      itemData.quantity = 1;
      shoppingCart.push(itemData);
    }

    counter = document.querySelector("#counter");
    counter.innerText = shoppingCart.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
  };

  var item = document.createElement("li");
  item.appendChild(name);
  item.appendChild(description);
  item.appendChild(image);
  item.appendChild(unit_amount);
  item.appendChild(button);

  return item;
}

function showShoppingCart() {
  if (!isItemsViewVisible) {
    return;
  }
  isItemsViewVisible = false;

  /* Header */
  var header = document.createElement("h2");
  header.innerHTML =
    '<i class="fa fa-shopping-cart" aria-hidden="true"></i>' + " Kundvagn";

  /* Shopping list */
  var list = document.createElement("ul");
  for (var index = 0; index < shoppingCart.length; index++) {
    list.appendChild(createShoppingCartItem(shoppingCart[index], index));
  }

  /* Shopping info & action */
  var info = createShoppingSummary();

  var content = document.createElement("div");
  content.appendChild(header);
  content.appendChild(list);
  content.appendChild(info);

  var container = document.querySelector("#main");
  container.replaceChild(content, container.firstChild);
}

function createShoppingCartItem(itemData, index) {
  /* Image */
  var image = document.createElement("img");
  image.src = itemData.image;

  /* Name */
  var name = document.createElement("h3");
  name.innerText = itemData.name;

  /* Unit_amount */
  var unit_amount = document.createElement("span");
  unit_amount.innerText = "" + itemData.unit_amount + " kr";

  var quantity = document.createElement("quantity");
  quantity.innerText = "Quantity: " + itemData.quantity;
  /* Button */
  var button = document.createElement("button");
  button.innerHTML =
    '<i class="fa fa-trash-o" aria-hidden="true"></i>' +
    "&nbsp;&nbsp;&nbsp;" +
    "Ta bort";
  button.onclick = function () {
    shoppingCart[index].quantity--;
    quantity.innerText = shoppingCart[index].quantity;
    if (shoppingCart[index].quantity < 1) {
      /* Remove the item from the array */
      shoppingCart.splice(index, 1);
    }

    /* Update the counter */
    counter = document.querySelector("#counter");
    counter.innerText = shoppingCart.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
    /* Update the UI list */
    isItemsViewVisible = true;
    showShoppingCart();
  };

  var item = document.createElement("li");
  item.appendChild(image);
  item.appendChild(name);
  item.appendChild(unit_amount);
  item.appendChild(quantity);
  item.appendChild(button);

  return item;
}

function createShoppingSummary() {
  /* Total price */
  var totalPrice = 0;
  for (var i = 0; i < shoppingCart.length; i++) {
    totalPrice += shoppingCart[i].unit_amount;
  }
  var priceLabel = document.createElement("h2");
  priceLabel.innerText = "Totalt pris: " + totalPrice + " kr";

  /* Proceed button */
  var proceedButton = document.createElement("button");
  proceedButton.innerHTML =
    '<i class="fa fa-check" aria-hidden="true"></i>' +
    "&nbsp;&nbsp;&nbsp;" +
    "Gå vidare";

  proceedButton.onclick = async function () {
    // Skapa order
    createSession();
  };

  let input = createInputField();
  var info = document.createElement("div");
  info.appendChild(priceLabel);
  info.appendChild(input);
  info.appendChild(proceedButton);

  return info;
}

const createSession = async function () {
  try {
    // Email från global variabel längst upp.
    console.log(valueEmail);

    // Om inget värde finns i inputfältet email (glabal variabel) så fastnar du här
    if (!valueEmail) {
      alert("Fel på email");
      return;
    }

    // Kollar om kunden existerar
    let customerId = await getCustomer(valueEmail);

    // Om kund inte existerar så stannar du här
    if (!customerId) {
      alert("Användare existerar ej");
      return;
    }

    // Objekt som skickas med i api-anrop. Skickar med shoppincart och customer id i ett objekt
    const reqOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shoppingCart, customerId }),
    };

    // Skapar session och får tillbaka session id
    let response = await fetch("/create-checkout-session", reqOptions);

    let sessionId = await response.json();

    // Redirectas till checkout-sidan.
    const redirect = stripe.redirectToCheckout({ sessionId });
  } catch (err) {
    console.error(err);
  }
};

function createInputField() {
  /* Create input fields */
  var input = document.createElement("div");
  input.classList.add("container");

  let h1 = document.createElement("h1");
  h1.classList.add("h1");
  h1.innerText = "Kunduppgifter";

  let email = document.createElement("p");
  email.innerText = "Email Adress";
  email.classList.add("email");

  let inputEmail = document.createElement("input");
  inputEmail.placeholder = "Ange emailadress";
  inputEmail.type = "text";
  inputEmail.pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
  inputEmail.required = true;
  inputEmail.classList.add("input-field-email");

  let getCustomerButton = document.createElement("button");
  getCustomerButton.innerHTML = "Hämta kund";

  // Gör en check om kund existerar eller inte
  getCustomerButton.addEventListener("click", async () => {
    let inputEmail =
      document.getElementsByClassName("input-field-email")[0].value;

    // kollar om kund existerar
    let collectedCustomer = await getCustomer(inputEmail);

    // Om kund inte existerar så kommer vi in här
    if (!collectedCustomer) {
      alert("Kund existerar ej. Var god registrera dig");

      getCustomerButton.classList.add("hidden");

      let inputName = document.createElement("input");
      inputName.placeholder = "Ange fullständigt namn";
      inputName.type = "text";
      inputName.required = true;
      inputName.classList.add("input-field-name");

      let inputPhone = document.createElement("input");
      inputPhone.placeholder = "Ange telefonnummer";
      inputPhone.type = "text";
      inputPhone.pattern = "[0-9 +]+";
      inputPhone.required = true;
      inputPhone.classList.add("input-field-phone");

      let registerButton = document.createElement("button");
      registerButton.innerHTML = "Registrera kund";

      input.append(inputName, inputPhone, registerButton);

      // Registrerar ny kund
      registerButton.addEventListener("click", async () => {
        let inputEmail =
          document.getElementsByClassName("input-field-email")[0].value;
        let inputName =
          document.getElementsByClassName("input-field-name")[0].value;
        let inputPhone =
          document.getElementsByClassName("input-field-phone")[0].value;

        // kollar om kund existerar
        let checkexistingEmail = await getCustomer(inputEmail);
        // Om kund inte existerar så fatsnar man här
        if (checkexistingEmail) {
          valueEmail = inputEmail;
          alert("Användaren existerar redan");
          return;
        }

        // Skapar kund
        let checkOutCustomer = await createCustomer(
          inputEmail,
          inputName,
          inputPhone
        );

        if (checkOutCustomer) {
          valueEmail = inputEmail;
          alert("Nu är du registrerad, tryck på gå vidare");
          return;
        }
        alert("Något gick fel med registreringen. Var god försök igen");
      });
      return;
    }
    valueEmail = inputEmail;
    alert("Du finns i vårt register, var god gå vidare");
  });

  input.appendChild(h1);
  input.appendChild(email);
  input.appendChild(inputEmail);
  input.appendChild(getCustomerButton);

  return input;
}

// Kollar om kund existerar
const getCustomer = async function (email) {
  try {
    const response = await fetch("http://localhost:3000/getCustomer/" + email);

    let data = await response.json();

    return data;
  } catch (err) {
    console.log(err);
  }
};

// Skapar kund
const createCustomer = async function (email, name, phone) {
  try {
    let newCustomer = {
      email,
      name,
      phone,
    };

    const customerOpt = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    };

    let response = await fetch("/create-customer", customerOpt);

    let customerId = await response.json();

    return customerId;
  } catch (err) {
    console.error("Error", err);
  }
};
