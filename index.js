'use strict';
const BbPromise = require('bluebird');
const jsdom = BbPromise.promisifyAll(require('jsdom'));
const fs = BbPromise.promisifyAll(require('fs'));
const debug = require('debug')('chartjs-node');
const streamBuffers = require('stream-buffers');
jsdom.defaultDocumentFeatures = {
    FetchExternalResources: ['script'],
    ProcessExternalResources: true
};

class ChartjsNode {
    constructor (width, height) {
        this._width = width;
        this._height = height;
    }
    /**
     * @returns {Number} the width of the chart/canvas in pixels
     */
    get width () {
        return this._width;
    }
    /**
     * @returns {Number} the height of the chart/canvas in pixels
     */
    get height () {
        return this._height;
    }
    _disableDynamicChartjsSettings (configuration) {
        configuration.options.responsive = false;
        configuration.options.animation = false;
        configuration.options.width = this.width;
        configuration.options.height = this.height;
    }
    /**
     * Draws the chart given the Chart.js configuration
     *
     * @returns {Promise} A promise that will resolve when the chart is completed
     */
    drawChart (configuration) {
        // ensure we clean up any existing window if drawChart was called more than once.
        this.destroy();
        return jsdom.envAsync('<html><body><div id="chart-div" style="font-size:12; width:' + this.width + '; height:' + this.height + ';"><canvas id="myChart" width="' + this.width + '" height="' + this.height + '"></canvas>></div></body></html>',
            [])
        .then(window => {
            // these are probably not defined but just to be safe store them
            var windowTemp = global.window;
            var docTemp = global.document;
            global.document = window.document;
            global.window = window;
            const Chartjs = require('chart.js');
            if(configuration.options.plugins) {
                Chartjs.pluginService.register(configuration.options.plugins);
            }
            this._window = window;
            debug('got window');
            this._disableDynamicChartjsSettings(configuration);
            this._canvas = BbPromise.promisifyAll(window.document.getElementById('myChart'));
            this._ctx = this._canvas.getContext('2d');
            this._chart = new Chartjs(this._ctx, configuration);
            global.window = windowTemp;
            global.document = docTemp;
            return this._chart;
        });
    }
    /**
     * Retrives the drawn chart as a stream
     *
     * @param {String} imageType The image type name. Valid values are image/png image/jpeg
     * @returns {Stream} The image as an in-memory stream
     */
    getImageStream (imageType) {
        return this.getImageBuffer(imageType)
        .then(buffer => {
            var readableStream = new streamBuffers.ReadableStreamBuffer({
                frequency: 10,       // in milliseconds.
                chunkSize: 2048     // in bytes.
            });
            readableStream.put(buffer);
            return {
                stream: readableStream,
                length: buffer.length
            };
        });
    }
    /**
     * Retrives the drawn chart as a buffer
     *
     * @param {String} imageType The image type name. Valid values are image/png image/jpeg
     * @returns {Array} The image as an in-memory buffer
     */
    getImageBuffer (imageType) {
        return new BbPromise((resolve, reject) => {
            this._canvas.toBlob((blob, err) => {
                if (err) {
                    return reject(err);
                }
                var buffer = jsdom.blobToBuffer(blob);
                return resolve(buffer);
            }, imageType);
        });
    }
    /**
     * Writes chart to a file
     *
     * @param {String} imageType The image type name. Valid values are image/png image/jpeg
     * @returns {Promise} A promise that resolves when the image is written to a file
     */
    writeImageToFile (imageType, filePath) {
        return this.getImageBuffer(imageType)
        .then(buffer => {
            var out = fs.createWriteStream(filePath);
            return out.write(buffer);
        });
    }
    /**
     * Destroys the virtual DOM and canvas -- releasing any native resources
     */
    destroy () {
        if (!this._window) {
            return;
        }
        this._window.close();
        this._window = undefined;
    }
}
module.exports = ChartjsNode;
