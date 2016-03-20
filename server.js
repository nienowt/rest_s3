'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let router = express.Router();
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:db');

require('./routes/file-routes')(router);
require('./routes/trial-user-routes')(router);

app.use(bodyParser.json());

app.use('/', router);
app.listen(3000, () => {
  console.log('livin 3000');
});
