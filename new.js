const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const jsonDataArray = [];
// Array to hold the received JSON data


// POST endpoint to handle JSON requests
app.post('/', (req, res) => {
  const jsonBody = req.body; // Access the JSON body of the request
  // console.log(jsonBody); // Do something with the JSON data

  // Add the received JSON data to the array
  jsonDataArray.push(jsonBody);
  console.log(jsonDataArray);
  res.status(200).send('Received and stored JSON data');
});

// GET endpoint to retrieve the stored JSON data
app.get('/show', (req, res) => {
  res.json(jsonDataArray);
});

app.get('/delete', (req, res) => {
  jsonDataArray.length = 0
  // array.splice(0);
  
  console.log(jsonDataArray);
  res.json(jsonDataArray);
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
