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
    res.redirect("index")
  })
  for (k in routes){
    const route = routes[k]
    app.get('/'+route, function (req, res) {
      logger.debug("Acccessing route "+route)
      res.render(route, require('./routes/'+route+'.js')
        (
          req,
          getPageInfo(req)
        )
      )
    })
    logger.debug('Registered route '+routes[k]);
  }

  // CSS faking route
  app.get('/style.css', function (req, res) {
    const colors = require("./theme.js")(120)
    res.set('Content-Type', 'text/css');
    res.send(
      fs.readFileSync(path.join(APPLICATION_ROOT, "public", "style.css"))
      .toString()
      .replace(/darkest_grey/g, colors.darkest_grey.rgb().string())
      .replace(/light_grey/g, colors.light_grey.rgb().string())
      .replace(/dark_grey/g, colors.dark_grey.rgb().string())
      .replace(/darkest/g, colors.darkest.rgb().string())
      .replace(/lightest/g, colors.lightest.rgb().string())
      .replace(/dark/g, colors.dark.rgb().string())
      .replace(/light/g, colors.light.rgb().string())
    )
  })

  // Public directory
  app.use(express.static(path.join(APPLICATION_ROOT, 'public')));
  
  return new Promise(function(resolve, reject){
    app.listen(port, function () {
      logger.info('Express listening on port '+port)
      resolve()
    })
  });
}

function getPageInfo(req){
  return {
    header: getHeaderInfo(),
    navigation: getNavigationInfo(req),
    footer: getFooterInfo()
  }
}

function getHeaderInfo(){
  return {
    title: WIKI_NAME
  }
}

function getFooterInfo(){
  return {
    year: new Date().getFullYear(),
    owner: "louve@louve.systems"
  }
}

function getNavigationInfo(req){
  return {
    arborescence: wikiMap.getTree(),
    current: "page3"
  }
}
