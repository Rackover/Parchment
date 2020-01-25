module.exports = function(port){
  const express = require('express')
  const app = express()

  app.set('view engine', 'pug')
  app.set('views', './app/views')
  
  const routes = [
    "index"
  ]
  
  app.get('/', function (req, res) {
    res.render('index', require('./routes/index.js')(req))
  })
  
  for (k in routes){
    app.get('/', function (req, res) {
      res.render('/'+routes[k], require('./routes/'+routes[k]+'.js')(req))
    })
    logger.debug('Registered route '+routes[k]);
  }
  
  
  
  app.listen(port, function () {
    logger.info('Express listening on port '+port)
  })
  
  return app
}