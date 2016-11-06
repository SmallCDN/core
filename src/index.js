const fs = require('fs');
const http = require('http');
const mime = require('mime');
const semver = require('semver');
const url = require('url');
require('dotenv').config({ path: './src/.env' });

const resError = (res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(obj));
  return res.end();
};

let libraries = require('./util/loadAssets')();

const server = http.createServer((req, res) => {
  if (req.headers['X-Update-Libraries'] === 'yus') {
    libraries = require('./util/loadAssets')();
    return undefined;
  }

  let library = req.headers['X-Library-Name'];
  let file = req.headers['X-Library-File'];
  const params = url.parse(req.url, true).query;

  if (!libraries[library]) return resError(res, 404, { code: 1, message: `library '${library}' not found` });
  if (params.v && !semver.validRange(params.v)) return resError(res, 404, { code: 3, message: `'${params.v}' is not a valid version.` });

  library = libraries[library];

  const version = params.v
    ? Object.keys(library.files).find(e => semver.satisfies(e, params.v))
    : library.latestVersion;

  if (file) {
    if (!library.files[version]) return resError(res, 404, { code: 8, message: `no versions match ${version}` });
    if (!library.files[version].includes(req.params.file)) return resError(res, 404, { code: 5, message: `the file '${file}' does not exist` });
  } else {
    if (!library.files[version]) return resError(res, 404, { code: 8, message: `no versions match ${version}` });
    file = library.info.mainfiles.find(e => library.files[version].indexOf(e) > -1);
  }

  res.header('X-Version', version);

  const path = `libraries/libs/${library}/${version}/${file}`;
  return fs.readFile(path, 'utf8', (err, data) => {
    res.writeHead(200, 'Content-Type', mime.lookup(path));
    res.write(data);
    res.end();
  });
});

server.listen(process.env.PORT);
