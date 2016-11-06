const Router = require('../util/Router');

const router = new Router();

router.get('/', (req, res, next) => {
  res.redirect(301, 'https://smallcdn.rocks', next);
});

module.exports = router;
