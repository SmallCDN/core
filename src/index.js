const fs = require('fs');
const Superhero = require('superhero');
require('dotenv').config({ path: './src/.env' });

const Router = Superhero.Router;

function main(error) {
  if (error) throw error;

  const router = new Router();

  const server = new Superhero({
    name: 'SmallCDN',
  });

  if (process.env.NODE_ENV === 'development') {
    server.use((req, res) => {
      res.header('access-control-allow-origin', '*');
    });
  }

  const v2 = require('./routes/v2');
  const api = require('./routes/api');

  router.use('/', require('./routes')); // this one is always first
  router.use('/gh', require('./routes/github')(v2, api));
  router.use('/api', api.router);

  router.use('/', v2.router); // default version gets mounted at root

  router.applyRoutes(server);

  server.listen(process.env.PORT, () => {
    console.log(server.name, 'on port', server.port); // eslint-disable-line
  });
}

fs.readdir('./libraries', (err) => {
  if (err) {
    require('simple-git')('./').clone(process.env.LIBRARY_GITHUB_REPO, './libraries', {}, main);
  } else {
    require('simple-git')('./libraries').pull(main);
  }
});
