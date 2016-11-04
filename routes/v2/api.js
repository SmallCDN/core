const Router = require('../../Router');

module.exports = (libraries) => {
  const router = new Router();

  router.get('/:library', (req, res, next) => {
    if (!libraries[req.params.library]) return res.send(404, { code: 1, message: `library '${req.params.library}' not found` });
    res.end(JSON.stringify(libraries[req.params.library]));
    return next();
  });

  return router;
};
