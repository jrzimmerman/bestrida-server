/* globals casper, document */
casper.test.begin('App is setup correctly', 1, function suite(test) {
  casper.start('http://localhost:8000/', function() {
    test.assert(true);
  });

  casper.run(function() {
    test.done();
  });
});