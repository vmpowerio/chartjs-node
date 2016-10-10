var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

var files = ['test/**/*.js', 'index.js'];

grunt.initConfig({
    mochacli: {
        options: {
            reporter: 'spec',
            bail: false
        },
        all: ['test/*.js']
    },
    jshint: {
        files: files,
        options: {
            jshintrc: '.jshintrc'
        }
    },
    jscs: {
        files: {
            src: files
        },
        options: {
            config: '.jscsrc',
            esnext: true
        }
    },
    jsbeautifier: {
        write: {
            files: {
                src: files
            },
            options: {
                config: './.beautifyrc'
            }
        }
    }
});
grunt.registerTask('test', ['mochacli', 'jshint', 'jscs']);
grunt.registerTask('validate', ['jshint', 'jscs']);
grunt.registerTask('beautify', ['jsbeautifier']);
