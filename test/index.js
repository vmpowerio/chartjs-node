/* globals describe, it, before, after*/
'use strict';
const debug = require('debug')('chartjs-node:test');
const assert = require('assert');
const ChartjsNode = require('../index.js');
const fs = require('fs');
/**
 * Schedule compute test. Tests a variety of schedules to validate correctness
 */
describe('chartjs', function () {
    describe('#destroy', function () {
        it('should destroy the in-memory window', function () {
            var chartNode = new ChartjsNode(600, 600);
            return chartNode.drawChart({
                type: 'bar',
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
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
                                beginAtZero:true
                            }
                        }]
                    },
                    tooltips: {
                        mode: 'label'
                    }
                }
            })
            .then(chart => {
                assert.ok(chart);
                return chartNode.destroy();
            });
        });
    });
    describe('#drawChart', function () {
        it('should draw the chart to a buffer', function () {
            var chartNode = new ChartjsNode(500, 500);
            return chartNode.drawChart({
                type: 'bar',
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
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
                                beginAtZero:true
                            }
                        }]
                    },
                    tooltips: {
                        mode: 'label'
                    }
                }
            })
            .then(chart => {
                assert.ok(chart);
                return chartNode.getImageBuffer('image/png');
            })
            .then(buffer => {
                assert(buffer.length > 1);
                return chartNode.writeImageToFile('image/png', './testimage.png');
            })
            .then(() => {
                assert.ok(fs.existsSync('./testimage.png'));
                // clean up
                fs.unlinkSync('./testimage.jpg');
            });
        });
    });
});
