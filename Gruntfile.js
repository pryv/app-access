/* global module, require */

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: require('./package.json'),

    jshint: {
      files: ['Gruntfile.js', './js/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    browserify: {
      dist: {
        src: ['./js/*.js'],
        dest: 'dist/scriptBrowserify.js',
        options: {
          alias: ['./js/script.js:scriptBrowserify.js']
        }
      }
    },

    copy: {
      all: {
        files: [
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['./html/index.html'],
            dest: 'dist/'
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['css/*.css'],
            dest: 'dist/'
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['img/*.png'],
            dest: 'dist/'
          }
        ]
      }
    },

    buildGhPages: {
      ghPages: {}
    },

    watch: {
      all: {
        files: ['Gruntfile.js', './js/*.js', './css/*.css', './html/*.html'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-build-gh-pages');

  grunt.registerTask('default', ['jshint', 'browserify', 'copy']);
  grunt.registerTask('gh-pages', ['buildGhPages']);
};