const crypto = require('crypto');
const rawbody = require('raw-body');

module.exports = (req, res, callback) => {
  rawbody(req, {
    length: req.headers['content-length'],
    encoding: 'utf8',
    limit: '100kb',
  }).then((buffer) => {
    const hmac = crypto.createHmac('sha1', process.env.LIBRARY_GITHUB_SECRET);
    hmac.update(buffer, 'utf-8');
    const expected = `sha1=${hmac.digest('hex')}`;
    if (req.headers['x-hub-signature'] !== expected) return false;
    require('simple-git')('./libraries').pull((err) => {
      if (err) return;
      callback(require('./loadAssets')());
      res.writeHead(200, {});
      res.end();
    });
    return true;
  });
  return true;
};
