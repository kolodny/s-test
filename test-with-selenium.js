var webdriver = require('selenium-webdriver');
var express = require('express');

var app = express();

app.use(express.static('.'));

var server = app.listen(function(error) {
  if (error) throw error;

  var browser;

  if (process.env.SAUCE_USERNAME != undefined) {
    console.log({ SELENIUM_VERSION: process.env.SELENIUM_VERSION });
    browser = new webdriver.Builder()
      .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: process.env.SELENIUM_BROWSER,
        version: process.env.SELENIUM_VERSION,
      }).build()
    ;
  } else {
    browser = new webdriver
      .Builder()
      .forBrowser('firefox')
      .build()
    ;
  }


  browser.manage().timeouts().setScriptTimeout(60 * 1000);

  browser.get('http://localhost:' + server.address().port + '/index.html')
    .then(function() {
      browser.executeAsyncScript('window.seleniumCallback = arguments[arguments.length - 1]')
        .then(function(info) {
          info.logs.forEach(function(log) {
            console.log.apply(console, log);
          });
          browser.quit()
            .then(function() {
              server.close(function() {
                process.exit(info.exitCode);
              });
            })
          ;
        })
      ;
    })
  ;
});

