const fs = require('fs');
const mime = require('mime');
const getDependencies = require('./getDependencies');

module.exports = (req, res, libraries, library, version, file) => {
  fs.readFile(`libraries/libs/${library.name}/${version}/${file}`, 'utf8', (err, data) => {
    if (err) return res.send(500, { code: 6, message: 'there was an error reading from cache' });
    res.header('Content-Type', mime.lookup(file));
    if (library.info.dependencies && req.query.deps !== undefined) {
      return res.end(getDependencies(req, res, libraries, library, file).concat(`\n\n${data}`).trim());
    }
    return res.end(data);
  });
};
