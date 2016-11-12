const restify = require('restify');
const Fuse = require('fuse.js');

const { libraries } = require('../util/loadAssets')();

const server = restify.createServer({
  name: 'API',
});

server.use(restify.gzipResponse());
server.use(restify.queryParser());

server.get('/api/libraries', (req, res) => res.send(200, libraries));

server.get('/api/libraries/:library', (req, res) => {
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });
  return res.send(200, libraries[req.params.library]);
});

server.get('/api/search/:query', (req, res) => res.send(200, new Fuse(Object.values(libraries), { keys: ['name', 'latestVersion.info.name', 'latestVersion.info.keywords'] }).search(req.params.query)));

server.listen(process.env.API_PORT, () => console.log(server.name, 'listening on port', process.env.API_PORT));
