const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session')

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');

const app = express();

// This DB Config is accessible globally
dbConfig = {
    user: 'SA',
    password: 'YourStrong@Passw0rd',
    server: 'db',
    database: 'tempdb',
    options: {
        'enableArithAbort': true,
        'encrypt': false,
    }
}

// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.
app.use(session({
    secret: 'COSC 304 Rules!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 60000,
    }
}))

// Setting up the rendering engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);

app.use(express.static(__dirname + '/public'));

// Handlebar helpers
let hbs = exphbs.create({});

hbs.handlebars.registerHelper('subtotal', function (price, quantity) {
    return (quantity * price).toFixed(2);
})

hbs.handlebars.registerHelper('ordertotal', function (productList) {
    let total = 0
    for (let i = 0; i < productList.length; i++) {
        let product = productList[i]
        if (!product) {
            continue
        }
        total = total + product.quantity * product.price
    }
    return total.toFixed(2)
})

hbs.handlebars.registerHelper('displaymoney', function (number) {
    return Number(number).toFixed(2)
})

hbs.handlebars.registerHelper('updateQuanity', function(productList, productID, quantity){
    for(let i = 0; i < productList.length; i++){
        let product = productList[i]
        if(!product){
            continue
        }
        if(product.productId === productID){
            product.quantity = quantity
        }
    }
})

// Rendering the main page
app.get('/', function (req, res) {
    res.render('index', {
        title: "Only Ducks Grocery Main Page"
    });
})

// Starting our Express app
app.listen(3000)
