<!-- <img src='https://openactive.io/brand-assets/openactive-logo-large.png' width='500'> -->
<img src='images/OpenActive-Landscape-Logo-2.png' width='500'>

[![License](http://img.shields.io/:license-mit-blue.svg)](http://theodi.mit-license.org)

# Files

This repository contains files for exploring OpenActive data via Node.js. The main content can be found in the `index.js` file.

# Running

To run locally, first clone this repository to a destination of your choice, and make sure that you've installed the Node.js packages listed in `package.json` by:

```
$ npm install
```

Then run by:

```
$ node index.js
```

This will seek all RPDE feed endpoints in the OpenActive network, and print summary information about them all in the terminal.

# To do

- Save output to a file
- Enable launch and use via a web server e.g. Express
- Harvest opportunity/event info from all RPDE feed endpoints
- Try to consolidate the flow to build up a single object for all levels of detail, rather than a separate object for each level as had currently
- Store metadata for each level, especially regarding any points where the crawl failed in order to return to and try later, and also the final page URLs for each RPDE feed endpoint in order to update content more efficiently than starting over each time
