require('dotenv').config();
const express = require('express');
const db = require('./config/db')
const app = express();
const user = require('./controllers/user');
const category = require('./controllers/category');
const product = require('./controllers/product');
const purchase  = require('./controllers/purchase');

const PORT = 8000;


db.connect((err) => {
  if (err) {
    console.error('Failed connect to Database', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(express.json());
app.use('', user);
app.use('', category);
app.use('', product);
app.use('', purchase);

app.listen(PORT, function() {
    console.log(`Server Run on ${PORT} Port`);
});

