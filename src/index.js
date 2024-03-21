require('dotenv').config();
const express = require('express');
const db = require('./config/db')
const app = express();
const user = require('./routes/user');
const category = require('./routes/category');

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

app.listen(PORT, function() {
    console.log(`Server Run on ${PORT} Port`);
});

