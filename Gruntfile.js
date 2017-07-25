module.exports = function(grunt) {
  // load up all of the necessary grunt plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-nodemon');


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
      }
    },

    // configure the server for travis
    express: {
      dev: {
        options: {
          script: 'dist/app/server.js'
        }
      }
    },

    // configure the server for local
    nodemon: {
      dev: {
        options: {
          script: 'dist/app/server.js'
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
        tasks: [ 'build' ]
      },
      server: {
        files: [ 'app/**' ],
        tasks: [ 'build', 'express:dev' ],
        options: {
          spawn: false // Restart server
        }
      }
    }
  });

  // Perform a build
  grunt.registerTask('build', [ 'jshint', 'clean', 'copy', 'concat', 'uglify']);


  // Start watching and run tests when files change
  grunt.registerTask('default', [ 'build', 'express:dev', 'watch' ]);
};