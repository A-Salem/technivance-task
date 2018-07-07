
const express = require('express');
const bodyParser = require('body-parser');
const {Pool, Client} = require('pg');
const app = express();

const port = process.env.PORT || 3000;

// DB Connect String
const connect = "postgress://techRole:!F-*sSRh26@localhost/technivance";

module.exports = { Pool, Client, connect };

const cartsApis = require('./apis/carts.js');
const customersApis = require('./apis/customers.js');
const itemsApis = require('./apis/items.js');
const ordersApis = require('./apis/orders.js');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Main Page
app.get('/', async (req, res) => {
  res.send('App is up and running')
});


// Add Customer Endpoint
app.post('/customers', async (req, res) => {
  customersApis.addCustomer(req, res);
});


// Delete Customer Endpoint
app.delete('/customers/:id', async (req, res) => {
  customersApis.deleteCustomer(req, res);
});


// Get Customers Endpoint
app.get('/customers', async (req, res) => {
  customersApis.listCustomers(req, res);
});



// Add Item Endpoint
app.post('/items', async (req, res) => {
  itemsApis.addItem(req, res);
});


// Delete Item Endpoint
app.delete('/items/:id', async (req, res) => {
  itemsApis.deleteItem(req, res);
});


// Get Items Endpoint
app.get('/items', async (req, res) => {
  itemsApis.listItems(req, res);
});


// Add To Cart Endpoint
app.post('/carts', async (req, res) => {
  cartsApis.addToCart(req, res);
});



// Edit Customer Cart Item Quantity
app.post('/carts/edit', async (req, res) => {
  cartsApis.editCart(req, res);
});


// Delete Item From Chart Endpoint
app.delete('/carts/:id', async (req, res) => {
  cartsApis.deleteCartItem(req, res);
});



// Get Customer Cart Items Endpoint
app.get('/customers/:customer_id/cart', async (req, res) => {
  cartsApis.getCustomerCart(req, res);
});


// Submit Order
app.post('/orders', async (req, res) => {
  ordersApis.submitOrder(req, res);
});



// Get Customer's Orders Endpoint
app.get('/orders', async (req, res) => {
  ordersApis.listCustomerOrders(req, res);
});


// Start Server
app.listen('3000', () => {
  console.log(`Server Started On Port ${port}`);
});
