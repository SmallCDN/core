const crypto = require('crypto');
const Router = require('../../Router');

const router = new Router();

const init = [];

router.post('/', (req, res) => {
  if (!(req.header('X-Hub-Signature') && process.env.LIBRARY_GITHUB_SECRET) && req.header('X-Hub-Signature') !== `sha1=${crypto.createHmac('sha1', 'test').update(JSON.stringify(req.body)).digest('hex')}`) {
    res.status(401);
    return res.end();
  }

  if (req.header('X-GitHub-Event') !== 'push') {
    res.status(204);
    return res.end();
  }

  require('simple-git')('./libraries').pull((error) => {
    if (error) throw error;
    for (const func of init) func();
  });
  res.status(204);
  return res.end();
});

module.exports = (v2, api) => {
  init.push(v2.init);
  init.push(api.init);
  return router;
};
