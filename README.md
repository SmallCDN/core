# SmallCDN #
[![Build Status](https://travis-ci.org/SmallCDN/core.svg?branch=master)](https://travis-ci.org/SmallCDN/SmallCDN)
![](https://david-dm.org/smallcdn/core.svg)

### Adding your library ###
To add your library, see [SmallCDN/libraries][library_repo]

### How it all works ###
Requests are handled by nginx, which parses the request url, and then passes it to the node backend as headers, which can then serve cached files directly from memory, or fall back to reading from disk if needed. The eventual plan is to move caching to nginx. Additionally, CloudFlare provides moderate caching, which we clear out every hour when we reload the libraries from our [Library Repository][library_repo].

The API is always uncached, except for `/libraries`, which is cached and cleared with the above library reloading.

[library_repo]: https://github.com/SmallCDN/libraries
