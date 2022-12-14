const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const bodyParser = require('body-parser')

let index = require('./routes/index');
let loadData = require('./routes/loaddata')
let listOrder = require('./routes/listorder')
let listProd = require('./routes/listprod')
let addCart = require('./routes/addcart')
let showCart = require('./routes/showcart')
let checkout = require('./routes/checkout')
let order = require('./routes/order')
let login = require('./routes/login')
let validateLogin = require('./routes/validateLogin')
let logout = require('./routes/logout')
let admin = require('./routes/admin')
let product = require('./routes/product')
let displayImage = require('./routes/displayImage')
let customer = require('./routes/customer')
let ship = require('./routes/ship')
let signup = require('./routes/signup')
let createAccount = require('./routes/createAccount')
let editAccount = require('./routes/editAccount')
let viewOrders = require('./routes/viewOrders')
const app = express()

// Enable parsing of requests for POST requests
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))

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
        maxAge: 6000000,
    }
}))

// Setting up the rendering engine
app.engine('handlebars', exphbs());

app.use(function (req, res, next) {
    res.locals.session = req.session;
    res.locals.body = req.body
    next();
});

app.set('view engine', 'handlebars');

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use('/', index)
app.use('/loaddata', loadData)
app.use('/listorder', listOrder)
app.use('/listprod', listProd)
app.use('/addcart', addCart)
app.use('/showcart', showCart)
app.use('/checkout', checkout)
app.use('/order', order)
app.use('/createAccount', createAccount)
app.use('/login', login)
app.use('/validateLogin', validateLogin)
app.use('/logout', logout)
app.use('/admin', admin)
app.use('/product', product)
app.use('/displayImage', displayImage)
app.use('/customer', customer)
app.use('/ship', ship)
app.use('/signup', signup)
app.use('/editAccount', editAccount)
app.use('/viewOrders', viewOrders)
app.use(express.static(__dirname + '/public'))

// Handlebar helpers
let hbs = exphbs.create({});

hbs.handlebars.registerHelper('subtotal', function (price, quantity) {
    return (quantity * price).toFixed(2)
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

hbs.handlebars.registerHelper('getAddToCartLink', function (productId, productName, productPrice) {
    return ("addcart?id=" + productId + "&name=" + escape(productName) + "&price=" + productPrice)
})

hbs.handlebars.registerHelper('login', function (session) {
    if (session.authenticatedUser)
        return '<a class="nav-link active nav-color" aria-current="page" href="/customer">' + session.authenticatedUser + '</a>'
    else
        return '<a class=\"nav-link active nav-color\" aria-current=\"page\" href="/login">Login</a>'
})

hbs.handlebars.registerHelper('displayDate', function (date){
    return new Date(date).toLocaleDateString("en-CA")
})

hbs.handlebars.registerHelper('getProductDescriptionLink', function(productId){
    return ("product?id=" + productId)
})

hbs.handlebars.registerHelper('displayAdmin', function (session){
    return session.isAdmin
})

hbs.handlebars.registerHelper('selected', function(option, value){
    if (option === value) {
        return 'selected';
    } else {
        return ''
    }
})

hbs.handlebars.registerHelper('selected', function(option, value) {
    if (option === value) {
        return 'selected';
    } else {
        return ''
    }
})

// Starting our Express app
app.listen(3000)
