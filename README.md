# StripeProject
A school project with a webshop using Stripe for payments

Betaltjänst med integration emot Stripe
I den här inlämningen skall ni skapa en webbshop där det går att lägga en order och 
genomföra en betalning med integration med Stripe. När betalningen är godkänd skall 
ordern sparas i en JSON-fil på servern. I samband med att en order läggs skall även en ny 
Customer skapas (formulär för denna information måste skapas i checkout).


Krav för godkänt: 
1. Uppgiften lämnas in i tid. - CHeCK
2. Produkter ska listas på en sida. - CHECK
3. Det ska gå att lägga till produkter i en kundvagn. CHECK 
4. Baserad på kundvagnen skall det gå att lägga en order genom Stripe. CHECK
5. En ”Customer" skall skapas i Stripe i samband med att en ny order placeras (detta 
kräver ett formulär för att ange informationen Stripe efterfrågar). Validering på detta 
formulär/inputfält skall finnas. CHECK
6. Samtliga placerade ordrar skall sparas till en lista i en JSON-fil. CHECK 
7. Ordern får inte under några omständigheter läggas utan genomförd betalning! (dvs. 
Spara aldrig ett orderobjekt såvida ni inte fått bekräftelse tillbaka ifrån stripe att 
betalningen gått igenom) CHECK


Installation hur man startar projektet: 
1. Installera npm install
2. Installera npm init y 
3. Installera npm i express
4. Installera npm nodemon
5. Installera stripe och dontenv
5. I json-filen lägger du till "type": "module", & "start": "nodemon index.js"
6. Därefter skriver du in npm start i terminalen för att starta projektet.
