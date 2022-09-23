const stripe = Stripe("pk_test_51LgtJ8IIsWx48M6ww2bKhPz3WKBhaNsD3qk5RPM1MmHXHQ4jMtHItX8s5JVZrDflpGRqJBCvBKay5EBcYdd20FL300uruvFgyP");

/* import {createInputField} from "./customer.js" */


var itemsData;
var shoppingCart = [];
var isItemsViewVisible = false;


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
    if (isItemsViewVisible) { return; }
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
    button.innerHTML = '<i class="fa fa-cart-arrow-down" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Lägg till i kundvagnen";
    button.onclick = function () {
        console.log(itemData);
        const existingItem = shoppingCart.find(i => i.name === itemData.name);
        if (existingItem) {
            existingItem.quantity++
        } else {
            itemData.quantity = 1;
            shoppingCart.push(itemData);
        };
        
        counter = document.querySelector("#counter");
        counter.innerText = shoppingCart.reduce((sum, item) =>{
            return sum + item.quantity 
        },0);
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
    if (!isItemsViewVisible) { return; }
    isItemsViewVisible = false;

    /* Header */
    var header = document.createElement("h2");
    header.innerHTML = '<i class="fa fa-shopping-cart" aria-hidden="true"></i>' + " Kundvagn";

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
    quantity.innerText = "Quantity: " + itemData.quantity
    /* Button */
    var button = document.createElement("button");
    button.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Ta bort";
    button.onclick = function () {
        shoppingCart[index].quantity--
        quantity.innerText = shoppingCart[index].quantity
        if(shoppingCart[index].quantity < 1){
            /* Remove the item from the array */
            shoppingCart.splice(index, 1);
        }
     

        /* Update the counter */
        counter = document.querySelector("#counter");
        counter.innerText = shoppingCart.reduce((sum, item) =>{
            return sum + item.quantity
        },0);
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
    proceedButton.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Gå vidare";

    proceedButton.onclick = async function () {
        createSession()
        createCustomer()
    }

    let input = createInputField();
    var info = document.createElement("div");
    info.appendChild(priceLabel);
    info.appendChild(input) 
    info.appendChild(proceedButton);
    
    return info;
}


const createSession = async function() {

    try {
        const newCustomerId = await createCustomer()
        console.log("Kund skapad, skapar checkout session nu", newCustomerId) 

        const reqOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(shoppingCart, newCustomerId)
        }
        
        let response = await fetch("/create-checkout-session", reqOptions)
        
        let sessionId = await response.json();
        console.log(sessionId) // Får ut session Id i consollen
        
        const redirect = stripe.redirectToCheckout({sessionId}) 
        console.log(redirect)

    }catch(err){
        console.error(err)
    }

}


function createInputField() {

    /* Create input fields */
    var input = document.createElement("div");

    let h1 = document.createElement("h1")
    h1.classList.add("h1")
    h1.innerText = "Kunduppgifter"

   let email = document.createElement("p");
    email.innerText = "Email Adress"
    email.classList.add("email");

    let inputEmail = document.createElement("input");
    inputEmail.setAttribute("type", "hidden");
    inputEmail.placeholder = "Ange emailadress";
    inputEmail.type = "text";
    inputEmail.pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
    inputEmail.required = true
    inputEmail.classList.add("input-field-email");

    let name = document.createElement("p");
    name.innerText = "Fullständigt namn"
    name.classList.add("name");

    let inputName = document.createElement("input");
    inputName.setAttribute("type", "hidden");
    inputName.placeholder = "Ange fullständigt namn";
    inputName.type = "text";  
    inputName.required = true
    inputName.classList.add("input-field-name");

    let phone = document.createElement("p");
    phone.innerText = "Telefonnummer"
    phone.classList.add("phone");

    let inputPhone = document.createElement("input");
    inputPhone.setAttribute("type", "hidden");
    inputPhone.placeholder = "Ange telefonnummer"; 
    inputPhone.type = "text";  
    inputPhone.pattern = "[0-9 +]+"
    inputPhone.required = true
    inputPhone.classList.add("input-field-phone");

   let getCustomerButton = document.createElement("button")
   getCustomerButton.innerHTML = "Hämta kund"; 
   getCustomerButton.addEventListener("click", async () => {
       let inputEmail = document.getElementsByClassName("input-field-email")[0].value
       let collectedCustomer = await getCustomer(inputEmail)
       console.log(collectedCustomer)
   })

   let registerButton = document.createElement("button")
   registerButton.innerHTML = "Registrera kund"; 
   registerButton.addEventListener("click", async () => {
        /* createCustomer() */
        getCustomer()
   })


   input.appendChild(h1)
   input.appendChild(email)
   input.appendChild(inputEmail)
   input.appendChild(name)
   input.appendChild(inputName)
   input.appendChild(phone)
   input.appendChild(inputPhone) 
   input.appendChild(getCustomerButton)  
   input.appendChild(registerButton)

   return input

}


const getCustomer = async function(email) {

    try {
    console.log(email)
    const response = await fetch("http://localhost:3000/getCustomer/" + email)
    console.log(response)

   let data = await response.json();
   console.log(data) 
   return data  

   // om kunden inte finns kalla på creareCustomer () & ta fram de andra inputfälten 

    } catch(err) {
        console.log(err)
    }
}


const createCustomer = async function() {

    let inputName = document.getElementsByClassName("input-field-name")[0].value
    let inputEmail = document.getElementsByClassName("input-field-email")[0].value
    let inputPhone = document.getElementsByClassName("input-field-phone")[0].value
      
    try {
        const newCustomer = {
            name: inputName,
            email: inputEmail,
            phone: inputPhone,
        }    
        console.log(newCustomer)

        const customerOpt = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomer)
        }

    let response = await fetch("/create-customer", customerOpt) 
    console.log(response)

    let customerId = await response.json();
    console.log(customerId) // får ut customer id i consollen..
    return customerId


}catch(err) {
    console.log(err)
}
}


