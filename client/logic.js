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
    /* Create input fields */
    
    /* Shopping info & action */
    var info = createShoppingSummary();

    var content = document.createElement("div");
    content.appendChild(header);
    content.appendChild(list);
    content.appendChild(info);
    content.appendChild()

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

    proceedButton.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Slutför ditt köp";


    proceedButton.onclick = async function () {

        try {
            const newCustomerId = await createCustomer()
            console.log(newCustomerId)

            const reqOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(shoppingCart, newCustomerId)
            }
            
            let response = await fetch("/create-checkout-session", reqOptions)
            
            let sessionId = await response.json();
            console.log(sessionId)
            
            const redirect = stripe.redirectToCheckout({sessionId}, /* createCustomer() */) // Få in customer id...
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


const createCustomer = async function() {
    try {
        const fullname = document.getElementById("name").value
        const email = document.getElementById("email").value
        const phone = document.getElementById("phone").value
        
        const newCustomer = {
            name: "Martin",
            email: "martin.a@mail.com",
            phone: "+46735880188"
        }
        const customerOpt = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomer)
        }

    let response = await fetch("/create-customer", customerOpt)
    console.log(response)

    let customerId = await response.json();
    console.log(customerId)
    return customerId

    /* const redirectCustomer = stripe.redirectToCheckout({customerId}) // Få in customer id...
    console.log(redirectCustomer) */

}catch(err) {
    console.log(err)
}
}

