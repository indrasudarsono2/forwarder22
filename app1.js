var express = require('express')
const cors = require('cors')
var bodyParser = require('body-parser');


var app = express();


app.use(bodyParser.json());
app.use(cors({
  origin: 'http://172.27.2.162:3000'
}))

const apiRouter = require('./router/api');
const adminRouter = require('./router/admin');
app.use('/', adminRouter);
app.use('/api/v1', apiRouter);

app.listen(3001, () => {
  console.log('Server listen from 3001')
});

