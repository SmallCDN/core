const fs = require('fs');
const express = require('express');
const compression = require('compression');
const config = require('./config');

const app = express();

app.use(compression());
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.redirect(301, 'https://smallcdn.rocks');
});

for (const folder of fs.readdirSync('./versions').reverse()) {
  require(`./versions/${folder}`)(app);
}

app.listen(config.port);
