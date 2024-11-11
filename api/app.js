import fs from 'node:fs/promises';

import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/meals', async (req, res) => {
  const meals = await fs.readFile('./data/available-meals.json', 'utf8');
  res.json(JSON.parse(meals));
});

app.post('/orders', async (req, res) => {
  const orderData = req.body.order;

  // Validate order data
  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ message: 'Missing order items.' });
  }

  const customer = orderData.customer;

  // Adjust the mapping of customer data based on the frontend keys
  const customerData = {
    name: customer['full-name'],  // 'full-name' is sent by the frontend
    email: customer.email,
    street: customer['Endereço'], // 'Endereço' is sent by the frontend
    bairro: customer['Bairro'],   // 'Bairro' is sent by the frontend
    postalCode: customer['CEP'],  // 'CEP' is sent by the frontend
    city: customer['Cidade'],     // 'Cidade' is sent by the frontend
  };

  // Validate customer data
  if (
    !customerData.name ||
    !customerData.email ||
    !customerData.street ||
    !customerData.bairro ||
    !customerData.postalCode ||
    !customerData.city ||
    !customerData.email.includes('@') ||
    customerData.name.trim() === '' ||
    customerData.street.trim() === '' ||
    customerData.postalCode.trim() === '' ||
    customerData.city.trim() === '' ||
    customerData.bairro.trim() === ''
  ) {
    return res.status(400).json({
      message: 'Missing or invalid data: Name, email, street, bairro, postal code, or city.',
    });
  }

  // Create the new order with a unique ID
  const newOrder = {
    ...orderData,
    id: (Math.random() * 1000).toString(),
    customer: customerData,  // Updated customer data
  };

  // Read the current orders from the file
  const orders = await fs.readFile('./data/orders.json', 'utf8');
  const allOrders = JSON.parse(orders);

  // Add the new order to the list
  allOrders.push(newOrder);

  // Save the updated orders to the file
  await fs.writeFile('./data/orders.json', JSON.stringify(allOrders, null, 2));

  // Respond with success
  res.status(201).json({ message: 'Order created!' });
});


app.use((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: 'Not found' });
});

app.listen(3000);
