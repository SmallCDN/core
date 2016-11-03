# SmallCDN [![Build Status](https://travis-ci.org/SmallCDN/SmallCDN.svg?branch=master)](https://travis-ci.org/SmallCDN/SmallCDN)

### Adding your library
To add your library, make a PR adding it to the repo following the file structure.

### File structure
All content served by the CDN goes in `assets/`. Each file served gets it's own folder.
The naming scheme for the folders is `LIBRARYNAME.CONTENTTYPE` ex: `jquery.js`
Inside of the folder, put a file for each version you want to include with no extensions.