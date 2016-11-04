const Router = require('../../Router');

const router = new Router();

router.get('/', (req, res) => {
  if (req.header('X-GitHub-Event') !== 'push') return res.status(204).end();
  require('simple-git')('../../libraries').pull((error) => { if (error) throw error; });
  return res.status(204).end();
});

module.exports = router;
