[![Chartjs Node Header Image](./img/chartjsnode.png)](http://chartjs-demo.vmpower.io/)
[![Build Status](https://travis-ci.org/vmpowerio/chartjs-node.svg?branch=master)](https://travis-ci.org/vmpowerio/chartjs-node)
[![Code Climate](https://codeclimate.com/github/vmpowerio/chartjs-node/badges/gpa.svg)](https://codeclimate.com/github/vmpowerio/chartjs-node)

# Chartjs-Node

A simple library to make it easy to create Chartjs charts in Node.js (server-side).

This library puts together [jsdom](https://github.com/tmpvar/jsdom), [node-canvas](https://github.com/Automattic/node-canvas) and [chartjs](https://github.com/chartjs/Chart.js) to render Chartjs on the server.

**[Live Demo](http://chartjs-demo.vmpower.io)**

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
    return chartNode.getImageBuffer('image/png');
})
.then(buffer => {
    Array.isArray(buffer) // => true
    // as a stream
    return chartNode.getImageStream('image/png');
})
.then(streamResult => {
    // using the length property you can do things like
    // directly upload the image to s3 by using the
    // stream and length properties
    streamResult.stream // => Stream object
    streamResult.length // => Integer length of stream
    // write to a file
    return chartNode.writeImageToFile('image/png', './testimage.png');
})
.then(() => {
    // chart is now written to the file path
    // ./testimage.png
});
```

## Destroying the Chart

Each time you create a chart, you will create a new virtual browser `window`. You should call the `destroy`
method to release the native resources or you may leak memory:

```
chartNode.destroy();
```

## Global chart reference

You can access and modify the ChartJS reference before a chart is drawn via an event (`beforeDraw`).  ChartjsNode extends [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).

```js
var chartNode = new ChartjsNode(600, 600);
chartNode.on('beforeDraw', function (Chartjs) {
	//Chartjs.defaults
	//Chartjs.pluginService
	//Chartjs.scaleService
	//Chartjs.layoutService
	//Chartjs.helpers
	//Chartjs.controllers
	//etc
});
chartNode.drawChart(chartJsOptions)	//beforeDraw is called in here
...
```

## Adding draw plugins

To use draw plugins, simply use the ``options`` object to add your plugins, like so:
```js
var myChartOptions = {
    plugins: {
        afterDraw: function (chart, easing) {
            var self = chart.config;    /* Configuration object containing type, data, options */
            var ctx = chart.chart.ctx;  /* Canvas context used to draw with */
            ...
        }
    }
}

var chartJsOptions = {
    type: 'pie',
    data: myChartData,
    options: myChartOptions
};
```

[Read here](http://www.chartjs.org/docs/latest/developers/plugins.html) to see what plugins you can write. In the context of drawing static images, ``beforeDraw`` and/or ``afterDraw`` methods makes most sense to implement.

[Read here](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D) to see which methods are available for the ``ctx`` object.

## Adding custom charts

To use custom charts, also use the ``options`` object to add your chart config and controller, like so:
```js
var myChartOptions = {
  charts: [{
    type: 'custom',
    baseType: 'bar',
    controller: {
     draw: function (ease) {},
      ...
    },
    defaults: {
      ...
    },
  }]
}

var chartJsOptions = {
    type: 'custom',
    data: myChartData,
    options: myChartOptions
};
```

[Read here](http://www.chartjs.org/docs/latest/developers/charts.html) to see how to write custom charts.
