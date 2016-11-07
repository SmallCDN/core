const fs = require('fs');
const http = require('http');
const mime = require('mime');
const semver = require('semver');
const url = require('url');
const getDependencies = require('./util/getDependencies');
const resError = require('./util/resError');
const handleGithub = require('./util/handleGithub');
require('dotenv').config({ path: './src/.env' });

function run(err) {
  if (err) throw err;
  let libraries = require('./util/loadAssets')();

  require('child_process').fork('./src/api');

  const server = http.createServer((req, res) => {
    handleGithub(req, res, lib => libraries = lib); // eslint-disable-line

    let library = req.headers['x-library-name'];
    let file = req.headers['x-library-file'];
    const params = url.parse(req.url, true).query;

    if (!libraries[library]) return resError(res, 404, { code: 1, message: `library '${library}' not found` });
    if (params.v && !semver.validRange(params.v)) return resError(res, 404, { code: 3, message: `'${params.v}' is not a valid version.` });

    library = libraries[library];

    const version = params.v
      ? Object.keys(library.versions).find(e => semver.satisfies(e, params.v))
      : library.latestVersion;

    if (!library.versions[version].files) return resError(res, 404, { code: 8, message: `no versions match ${version}` });

    if (file) {
      if (!library.versions[version].files.includes(file)) return resError(res, 404, { code: 5, message: `the file '${file}' does not exist` });
    } else {
      if (library.versions[version].files.indexOf(library.versions[version].info.index) < 0) return resError(res, 500, { code: 4, message: `the library '${library}' has a configuration issue, please report this to the library owner` });
      file = library.versions[version].info.index;
    }

    res.setHeader('X-Version', version);

    return fs.readFile(`libraries/libs/${library.name}/${version}/${file}`, 'utf8', (error, data) => {
      if (error) return resError(res, 500, { code: 6, message: 'there was an error reading from cache' });
      if (library.versions[version].info.dependencies && params.deps !== undefined) {
        const deps = getDependencies(res, libraries, library, file, version);
        if (res.finished) return undefined;
        res.writeHead(200, { 'Content-Type': mime.lookup(file) });
        res.write(deps.concat(`\n\n${data}`).trim());
      } else {
        res.writeHead(200, { 'Content-Type': mime.lookup(file) });
        res.write(data);
      }
      return res.end();
    });
  });

  server.listen(process.env.PORT, () => console.log('CDN listening on port', process.env.PORT)); // eslint-disable-line
}

fs.readdir('./libraries', (err) => {
  if (err) {
    require('simple-git')('./').clone(process.env.LIBRARY_GITHUB_REPO, './libraries', {}, run);
  } else {
    require('simple-git')('./libraries').pull(run);
  }
});
