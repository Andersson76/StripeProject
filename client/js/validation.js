const validatien=(input) = {

   /*  input.name.lengt == 0 return "Vänligen fyll i fältet" */
    /* input.email.lengt == 0 return "Vänligen fyll i fältet" */
    /* input.phone.lengt == 0 return "Vänligen fyll i ifältet" */

 }

/*  ^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})|(^[0-9]{10})+$ */


/* function validateEmail(email) { //Validates the email address
    var emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) { //Validates the phone number
    var phoneRegex = /^(\+91-|\+91|0)?\d{10}$/; // Change this regex based on requirement
    return phoneRegex.test(phone);
}

function doValidate() {
   if (!validateEmail(document.appointment.requiredphone.value) || !validatePhone(document.appointment.requiredphone.value) ){
    alert("Invalid Email");
    return false;
} */