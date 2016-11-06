const fs = require('fs');
const http = require('http');
const mime = require('mime');
const semver = require('semver');
const url = require('url');
const getDependencies = require('./util/getDependencies');
const resError = require('./util/resError');
require('dotenv').config({ path: './src/.env' });

let libraries = require('./util/loadAssets')();

const server = http.createServer((req, res) => {
  if (req.headers['X-Update-Libraries'] === 'yus') {
    libraries = require('./util/loadAssets')();
    return undefined;
  }

  let library = req.headers['x-library-name'];
  let file = req.headers['x-library-file'];
  const params = url.parse(req.url, true).query;

  if (!libraries[library]) return resError(res, 404, { code: 1, message: `library '${library}' not found` });
  if (params.v && !semver.validRange(params.v)) return resError(res, 404, { code: 3, message: `'${params.v}' is not a valid version.` });

  library = libraries[library];

  const version = params.v
    ? Object.keys(library.files).find(e => semver.satisfies(e, params.v))
    : library.latestVersion;

  if (file) {
    if (!library.files[version]) return resError(res, 404, { code: 8, message: `no versions match ${version}` });
    if (!library.files[version].includes(file)) return resError(res, 404, { code: 5, message: `the file '${file}' does not exist` });
  } else {
    if (!library.files[version]) return resError(res, 404, { code: 8, message: `no versions match ${version}` });
    file = library.info.mainfiles.find(e => library.files[version].indexOf(e) > -1);
    if (!file) return resError(res, 500, { code: 4, message: `the library '${library}' has a configuration issue, please report this to the library owner` });
  }

  res.setHeader('X-Version', version);

  return fs.readFile(`libraries/libs/${library.name}/${version}/${file}`, 'utf8', (err, data) => {
    if (err) return resError(res, 500, { code: 6, message: 'there was an error reading from cache' });
    res.writeHead(200, 'Content-Type', mime.lookup(file));
    if (library.info.dependencies && params.deps !== undefined) {
      console.log(1);
      res.write(getDependencies(res, libraries, library, file).concat(`\n\n${data}`).trim());
    } else {
      res.write(data);
    }
    return res.end();
  });
});

function run(err) {
  if (err) throw err;
  server.listen(process.env.PORT, () => console.log('Serving on port', process.env.PORT));
}

fs.readdir('./libraries', (err) => {
  if (err) {
    require('simple-git')('./').clone(process.env.LIBRARY_GITHUB_REPO, './libraries', {}, run);
  } else {
    require('simple-git')('./libraries').pull(run);
  }
});
