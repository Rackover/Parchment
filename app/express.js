const fs = require("fs");
const path = require("path");

module.exports = function(port){
  const express = require('express')
  const app = express()

  app.set('view engine', 'pug')
  app.set('views', './app/views')
  
  const routes = [
    "index"
  ]
  
  // All routes
  app.get('/', function (req, res) {
    res.render('index', require('./routes/index.js')(req))
  })
  for (k in routes){
    app.get('/', function (req, res) {
      res.render('/'+routes[k], require('./routes/'+routes[k]+'.js')(req))
    })
    logger.debug('Registered route '+routes[k]);
  }

  // CSS faking route
  app.get('/style.css', function (req, res) {
    const colors = require("./theme.js")(96)
    res.set('Content-Type', 'text/css');
    res.send(
      fs.readFileSync(path.join(APPLICATION_ROOT, "public", "style.css"))
      .toString()
      .replace(/darkest/g, colors.darkest.rgb().string())
      .replace(/lightest/g, colors.lightest.rgb().string())
      .replace(/dark/g, colors.dark.rgb().string())
      .replace(/light/g, colors.light.rgb().string())
    )
  })

  // Public directory
  app.use(express.static(path.join(APPLICATION_ROOT, 'public')));
  
  app.listen(port, function () {
    logger.info('Express listening on port '+port)
  })
  
  return app
}