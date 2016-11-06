const Router = require('superhero').Router;

const router = new Router();

let libraries = require('../../util/loadAssets')();

router.get('/libraries', (req, res) => res.send(200, libraries));

router.get('/libraries/:library', (req, res) => {
  if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });
  return res.send(200, libraries[req.params.library]);
});

router.get('/search/:query', (req, res) => {
  const data = [];
  for (const key of Object.keys(libraries).filter(e => e.includes(req.params.query))) {
    data.push(libraries[key]);
  }
  return res.send(200, data);
});

module.exports = {
  router,
  init: () => {
    libraries = require('../../loadAssets')();
  },
};
