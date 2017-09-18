/* globals describe, it*/
'use strict';
const debug = require('debug')('chartjs-node:test');
const assert = require('assert');
const ChartjsNode = require('../index.js');
const fs = require('fs');
const stream = require('stream');
/**
 * Schedule compute test. Tests a variety of schedules to validate correctness
 */
describe('chartjs', function () {

    function runScenarios(chartConfig) {
        describe('#destroy', function () {
            it('should destroy the in-memory window', function () {
                var chartNode = new ChartjsNode(600, 600);
                return chartNode.drawChart(chartConfig)
                    .then(() => {
                        chartNode.destroy();
                        // check if there are window properties to destroy from node global object
                        assert(!chartNode._windowPropertiesToDestroy);
                        assert(!chartNode._window);
                        debug('Sucessfully destroyed in-memory window properties');
                    });
            });
        });
        describe('#drawChart', function () {
            it('should draw the chart to a file', function () {
                var chartNode = new ChartjsNode(600, 600);
                return chartNode.drawChart(chartConfig)
                    .then(() => {
                        assert.ok(chartNode);
                        return chartNode.writeImageToFile('image/png', './testimage.png');
                    })
                    .then(() => {
                        assert(fs.existsSync('./testimage.png'));
                        // clean up
                        fs.unlinkSync('./testimage.png');
                        debug('Sucessfully wrote image to a file');
                    });
            });
            it('should draw the chart to a buffer', function () {
                var chartNode = new ChartjsNode(600, 600);
                return chartNode.drawChart(chartConfig)
                    .then(() => {
                        assert.ok(chartNode);
                        return chartNode.getImageBuffer('image/png');
                    })
                    .then(buffer => {
                        assert(buffer.length > 1);
                        assert(buffer instanceof Buffer);
                        debug('Sucessfully wrote image to a Buffer');
                    });
            });
            it('should draw the chart to a stream', function () {
                var chartNode = new ChartjsNode(600, 600);
                return chartNode.drawChart(chartConfig)
                    .then(() => {
                        assert.ok(chartNode);
                        return chartNode.getImageStream('image/png');
                    })
                    .then(imageStream => {
                        assert(imageStream.stream instanceof stream.Readable);
                        var length = imageStream.length;
                        var readLength = 0;
                        return new Promise((resolve, reject) => {
                            imageStream.stream.on('data', d => {
                                readLength += d.length;
                                if (readLength === length) {
                                    debug('Sucessfully wrote image to a Readable stream');
                                    resolve();
                                }
                            });
                            setTimeout(() => {
                                debug('length: ' + length);
                                debug('readLength: ' + readLength);
                                reject('Failed to read complete chart image stream in time');
                            }, 1000);
                        });
                    });
            });
            it('should return the image as data url', function () {
                var chartNode = new ChartjsNode(600, 600);
                return chartNode.drawChart(chartConfig)
                    .then(() => {
                        assert.ok(chartNode);
                        return chartNode.getImageDataUrl('image/png');
                    })
                    .then(imageData => {
                        assert(imageData.length > 1);
                        debug('Sucessfully wrote image to a Readable stream');
                    });
            });
        });
        describe('beforeDraw event', function () {
            it('should provide a reference to global Chartjs instance', function () {
                var Chartjs = null;
                var chartNode = new ChartjsNode(600, 600);
                chartNode.on('beforeDraw', function (c) {
                    Chartjs = c;
                });
                return chartNode.drawChart(chartConfig)
                    .then(() => {
                        assert.ok(Chartjs);
                        chartNode.destroy();
                        debug('Sucessfully emitted beforeDraw event');
                    });
            });
        });
    }

    var testPlugin = {
        beforeDraw: function (chartController, easingValue, pluginOptions) {
            var ctx = chartController.chart.ctx;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '10px Georgia';
            ctx.fillText(pluginOptions.text, 0, 0);
            return true;
        }
    };
    var testPluginOptions = {
        testPlugin: {
            text: 'Hello World'
        }
    };
    var testchart = {
        type: 'custom',
        controller: {
            addElements: function () {},
            addElementAndReset: function () {},
            buildOrUpdateElements: function () {},
            getMeta: function () {},
            transition: function () {},
            initialize: function (chart) {
                this._chart = chart;
            },
            draw: function () {
                var options = this._chart.config.options;
                var ctx = this._chart.ctx;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = options.customFont;
                ctx.fillText('Hello World!', 0, 0);
                return true;
            }
        },
        defaults: {
            customFont: '10px Georgia'
        }
    };

    describe('with no charts or plugins,', function () {

        var chartConfig = {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                width: 400,
                height: 400,
                animation: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                tooltips: {
                    mode: 'label'
                }
            }
        };
        runScenarios(chartConfig);
    });

    describe('with no charts but plugins,', function () {

        var chartConfig = {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                width: 400,
                height: 400,
                animation: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                tooltips: {
                    mode: 'label'
                },
                plugins: testPluginOptions
            },
            plugins: [testPlugin]
        };
        runScenarios(chartConfig);
    });

    describe('with charts but no plugins,', function () {

        describe('bar chart', function () {

            var chartConfig = {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    width: 400,
                    height: 400,
                    animation: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    tooltips: {
                        mode: 'label'
                    },
                    charts: [testchart]
                }
            };
            runScenarios(chartConfig);
        });

        describe('custom chart', function () {

            var chartConfig = {
                type: 'custom',
                data: {
                    datasets: [{
                        label: '',
                        data: []
                    }]
                },
                options: {
                    charts: [testchart]
                }
            };
            runScenarios(chartConfig);
        });
    });

    describe('with charts and plugins,', function () {

        describe('bar chart', function () {

            var chartConfig = {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    width: 400,
                    height: 400,
                    animation: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    tooltips: {
                        mode: 'label'
                    },
                    charts: [testchart],
                    plugins: testPluginOptions
                },
                plugins: [testPlugin]
            };
            runScenarios(chartConfig);
        });

        describe('custom chart', function () {

            var chartConfig = {
                type: 'custom',
                data: {
                    datasets: [{
                        label: '',
                        data: []
                    }]
                },
                options: {
                    charts: [testchart],
                    plugins: testPluginOptions
                },
                plugins: [testPlugin]
            };
            runScenarios(chartConfig);
        });
    });
});
