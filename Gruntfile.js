module.exports = function(grunt) {
  // load up all of the necessary grunt plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-casperjs');
  grunt.loadNpmTasks('grunt-mocha');


  // in what order should the files be concatenated
  var publicIncludeOrder = require('./include.conf.js');

  // grunt setup
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // create a task called clean, which
    // deletes all files in the listed folders
    clean: {
      dist: 'dist/*',
      results: 'results/*'
    },

    // what files should be linted
    jshint: {
      gruntfile: 'Gruntfile.js',
      //public: publicIncludeOrder,
      server: 'server/**/*.js',
      options: {
        globals: {
          eqeqeq: true
        }
      }
    },

    // uglify the files
    uglify: {
      app: {
        files: {
          'dist/public/scripts/app.js': publicIncludeOrder
        }
      }
    },

    // copy necessary files to our dist folder
    copy: {
      // create a task for public files
      public: {
        // Copy everything but the to-be-concatenated app JS files
        src: [ 'public/**', '!public/scripts/app/**' ],
        dest: 'dist/'
      },
      // create a task for server files
      server: {
        src: [ 'app/**' ],
        dest: 'dist/'
      }
    },

    // concat all the js files
    concat: {
      app: {
        files: {
          // concat all the app js files into one file
          'dist/public/scripts/app.js': publicIncludeOrder
        }
      }
    },

    // configure the server
    express: {
      dev: {
        options: {
          script: 'dist/app/server.js'
        }
      }
    },

    // configure karma
    karma: {
      options: {
        configFile: 'karma.conf.js',
        reporters: ['progress', 'coverage']
      },
      // Watch configuration
      watch: {
        background: true,
        reporters: ['progress']
      },
      // Single-run configuration for development
      single: {
        singleRun: true,
      },
      // Single-run configuration for CI
      ci: {
        singleRun: true,
        coverageReporter: {
          type: 'lcov',
          dir: 'results/coverage/'
        }
      }
    },

    // configure casperjs
    casperjs: {
      options: {},
      e2e: {
        files: {
          'results/casper': 'test/end2end/**/*.js'
        }
      }
    },

    // create a watch task for tracking
    // any changes to the following files
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: 'jshint:gruntfile'
      },
      public: {
        files: [ 'public/**' ],
        tasks: [ 'build', 'karma:watch:run', 'casperjs' ]
      },
      server: {
        files: [ 'server/**' ],
        tasks: [ 'build', 'express:dev', 'casperjs' ],
        options: {
          spawn: false // Restart server
        }
      },
      unitTests: {
        files: [ 'test/unit/**/*.js' ],
        tasks: [ 'karma:watch:run' ]
      },
      integrationTests: {
        files: [ 'test/integration/**/*.js' ],
        tasks: [ 'karma:watch:run' ]
      },
      end2endTests: {
        files: [ 'test/end2end/**/*.js' ],
        tasks: [ 'casperjs' ]
      }
    }
  });

  // Perform a build
  grunt.registerTask('build', [ 'jshint', 'clean', 'copy', 'concat', 'uglify']);

  // Run end2end tests once
  grunt.registerTask('testend2end', [ 'express:dev', 'casperjs' ]);

  // Run public tests once
  grunt.registerTask('testPublic', [ 'karma:single' ]);

  // Run all tests once
  grunt.registerTask('test', [ 'testPublic', 'testend2end']);

  // Run all tests once
  grunt.registerTask('ci', [ 'build','karma:ci', 'express:dev', 'casperjs' ]);

  // Start watching and run tests when files change
  grunt.registerTask('default', [ 'build', 'express:dev', 'karma:watch:start', 'watch' ]);
};