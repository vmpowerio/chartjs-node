![Chartjs Node Header Image](./img/chartjsnode.png)
[![Build Status](https://travis-ci.org/vmpowerio/chartjs-node.svg?branch=master)](https://travis-ci.org/vmpowerio/chartjs-node)
[![Code Climate](https://codeclimate.com/github/vmpowerio/chartjs-node/badges/gpa.svg)](https://codeclimate.com/github/vmpowerio/chartjs-node)

# Chartjs-Node

A simple library to make it easy to create Chartjs charts in Node.js (server-side).

This library puts together [jsdom](https://github.com/tmpvar/jsdom), [node-canvas](https://github.com/Automattic/node-canvas) and [chartjs](https://github.com/chartjs/Chart.js) to render Chartjs on the server.

## Getting Started

### Peer Dependencies

You'll need to npm install `chart.js`. This library will pick up the exact version you end up installing.

### Cairo

Before installing this library you'll need to install Cairo for your system. The instructions for the most common platforms can be found [here](https://github.com/Automattic/node-canvas#installation).

Now you're ready to install the package:

```
npm install chartjs-node
```

## Creating a Chart

```js
const ChartjsNode = require('chartjs-node');
// 600x600 canvas size
var chartNode = new ChartjsNode(600, 600);
return chartNode.drawChart(chartJsOptions)
.then(() => {
    // chart is created

    // get image as png buffer
    chartNode.getImageBuffer('image/png');
    // as a stream
    chartNode.getImageStream('image/png');
    // write to a file
    chartNode.writeImageToFile('image/png', './testimage.png');
});
```

## Destroying the Chart

Each time you create a chart, you will create a new virtual browser `window`. You should call the `destroy`
method to release the native resources or you may leak memory:

```
chartNode.destroy();
```
