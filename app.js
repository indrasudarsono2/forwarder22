const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const fsPromise = require('fs/promises');
const dayjs = require('dayjs')
const cors = require('cors')

var express = require('express')
var bodyParser = require('body-parser');

var app = express();

const apiRouter = require('./router/api');
const adminRouter = require('./router/admin');

app.use(bodyParser.json());
app.use(cors({
  origin: ['http://172.21.4.22:3000', 'http://172.21.4.23:3001', 'http://172.21.4.23:3000', 'http://172.21.4.23', 'http://172.27.2.162:3001']
}));
app.use('/api/v1', apiRouter);
app.use('/admin', adminRouter);

// let file = [];
// let fileMaster = [];

app.get('/', (req, res) => {
  const file = {"data" : "oke"};
  res.json(file);
});


app.listen(3000, () => {
  console.log('Server listen from 3000')
});

