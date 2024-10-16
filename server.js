const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Your existing backend code

// Fallback to React for any unhandled routes in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
