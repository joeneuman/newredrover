/**
 * Created by brandonhebbert on 3/23/16.
 */
/**
 * Created by brandonhebbert on 3/23/16.
 */
module.exports = function() {
    var client = './public';
    // var server = './server';
    var config = {
        /**
         * Files paths
         */
        jsSource: [
            './public/controllers/*.js',
            './public/directives/*.js',
            './public/services/*.js',
            './server/**/*.js'
        ],
        
        client: client,
        // css: temp + 'styles.css',
        index: client + '/index.html',
        js: [

        ],
        sassSource: [
            './public/styles/sass/*.sass'
        ],

        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'
        },
        
        server: './server',
        defaultPort: 5656,
        nodeServer:'./server/index.js',

    };
    
    config.getWiredepDefaultOptions = function() {
      var options = {
          bowerJson: config.bower.json,
          directory: config.bower.directory,
          ignorePath: config.bower.ignorePath
      };


    };

    return config;
};

