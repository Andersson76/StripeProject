/* import { } from './logic.js';

var input = document.querySelector("#main");
let createCustomerInfo = createInputField()
input.appendChild(createCustomerInfo) 

export function createInputField() {

    //Create input fields 
    let div = document.createElement("div") 
    div.classList.add("customerInfo")

    const inputName = document.createElement("input");  
    inputName.placeholder = "Ange fullständigt namn";
    inputName.type = "text";  
    inputName.classList.add("input-feild-name");

    const inputEmail = document.createElement("input");  
    inputEmail.placeholder = "Ange emailadress";
    inputEmail.type = "text";  
    inputEmail.classList.add("input-feild-email");

    const inputPhone = document.createElement("input"); 
    inputPhone.placeholder = "Ange telefonnummer"; 
    inputPhone.type = "number";  
    inputPhone.classList.add("input-feild-phone");

    var button = document.createElement("button");
    button.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>' + "&nbsp;&nbsp;&nbsp;" + "Gå vidare";

 div.appendChild(inputName)
 div.appendChild(inputEmail)
 div.appendChild(inputPhone)
 div.appendChild(button);

   return div

}

export default createCustomerField()

*/