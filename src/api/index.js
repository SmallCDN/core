const restify = require('restify');
require('dotenv').config({ path: './src/.env' });

const libraries = require('../util/loadAssets')();

const server = restify.createServer({
  name: 'API',
});

server.use(restify.gzipResponse());
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());

server.get('/api/libraries', (req, res) => res.send(200, libraries));

server.get('/api/libraries/:library', (req, res) => {
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });
  return res.send(200, libraries[req.params.library]);
});

server.get('/api/search/:query', (req, res) => {
  const data = [];
  for (const key of Object.keys(libraries).filter(e => e.includes(req.params.query))) {
    data.push(libraries[key]);
  }
  return res.send(200, data);
});

server.listen(process.env.API_PORT, () => console.log(server.name, 'listening on port', server.port));
