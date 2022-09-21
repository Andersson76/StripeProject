const stripe = Stripe("pk_test_51LgtJ8IIsWx48M6ww2bKhPz3WKBhaNsD3qk5RPM1MmHXHQ4jMtHItX8s5JVZrDflpGRqJBCvBKay5EBcYdd20FL300uruvFgyP");


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
    image.src = "./assets/" + itemData.image;

    /* Unit_amount */
    var unit_amount = document.createElement("span");
    unit_amount.innerText = "" + itemData.unit_amount + " kr";

    /* Button */
    var button = document.createElement("button");
    button.innerHTML = '<i class="fa fa-cart-arrow-down" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Lägg till i kundvagnen";
    button.onclick = function () {
        shoppingCart.push(itemData);
        counter = document.querySelector("#counter");
        counter.innerText = shoppingCart.length;
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
    let input = createInputField(); // Lagt till

    var content = document.createElement("div");
    content.appendChild(header);
    content.appendChild(list);
    content.appendChild(info);
    content.appendChild(input) // Lagt till


    var container = document.querySelector("#main");
    container.replaceChild(content, container.firstChild);
}

function createShoppingCartItem(itemData, index) {
    /* Image */
    var image = document.createElement("img");
    image.src = "./assets/" + itemData.image;

    /* Name */
    var name = document.createElement("h3");
    name.innerText = itemData.name;

    /* Unit_amount */
    var unit_amount = document.createElement("span");
    unit_amount.innerText = "" + itemData.unit_amount + " kr";

    /* Button */
    var button = document.createElement("button");
    button.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Ta bort";
    button.onclick = function () {
        /* Remove the item from the array */
        shoppingCart.splice(index, 1);
        /* Update the counter */
        counter = document.querySelector("#counter");
        counter.innerText = shoppingCart.length;
        /* Update the UI list */
        isItemsViewVisible = true;
       showShoppingCart();
    };

    var item = document.createElement("li");
    item.appendChild(image);
    item.appendChild(name);
    item.appendChild(unit_amount);
    item.appendChild(button);

    return item;
}



/* Flytta detta? & fixa validering på email, telefon & namn*/
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
     inputEmail.placeholder = "Ange emailadress";
     inputEmail.type = "text";  
     inputEmail.classList.add("input-feild-email");

     let name = document.createElement("p");
     name.innerText = "Fullständigt namn"
     name.classList.add("name");

     let inputName = document.createElement("input");
     inputName.placeholder = "Ange fullständigt namn";
     inputName.type = "text";  
     inputName.classList.add("input-feild-name");

     let phone = document.createElement("p");
     phone.innerText = "Telefonnummer"
     phone.classList.add("phone");

     let inputPhone = document.createElement("input");
     inputPhone.placeholder = "Ange telefonnummer"; 
     inputPhone.type = "number";  
     inputPhone.classList.add("input-feild-phone");

     // Hämta kund
    let getCustomerButton = document.createElement("button")
    getCustomerButton.innerHTML = "Hämta kund"; 
    getCustomerButton.onclick = function () {
        alert("Hämta kund")
    }

    input.appendChild(h1)
    input.appendChild(email)
    input.appendChild(inputEmail)
    input.appendChild(name)
    input.appendChild(inputName)
    input.appendChild(phone)
    input.appendChild(inputPhone) 
    input.appendChild(getCustomerButton)  

    return input

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

        /* window.location.pathname = "confirmation.html"} */

     try {
            const newCustomerId = await createCustomer()
            console.log(newCustomerId) // Får ut customer id i consolen

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
            
            
        } catch (err) {
            console.log(err)
        }
    };

    var info = document.createElement("div");
    info.appendChild(priceLabel);
    info.appendChild(proceedButton);
    
    return info;
}


const checkCustomer = async function() {
    try {

    // kolla om email finns? 
    let inputEmail = document.getElementsByClassName("input-feild-email")[0].value

    const checkCustomerEmail = {
        email: inputEmail,
    }    
    console.log(checkCustomerEmail)

    const customerCheck = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkCustomerEmail)
    }

    let response = await fetch("/check-customer", customerCheck)
    console.log(response)

   /*  let = await response.json();
    console.log() 
    return  */

    } catch(err) {
        console.log(err)
    }
}



const createCustomer = async function() {

    try {
        let inputName = document.getElementsByClassName("input-feild-name")[0].value
        let inputEmail = document.getElementsByClassName("input-feild-email")[0].value
        let inputPhone = document.getElementsByClassName("input-feild-phone")[0].value

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




