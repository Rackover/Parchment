const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const permissions = require("./permissions.js")

module.exports = function(port){
  const express = require('express')
  const app = express()

  ///////
  // Middlewares
  app.set('view engine', 'pug')
  app.set('views', './app/views')
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //////
  // Routing
  const routes = [
    {name:"read/*", isProtected: false},
    {name:"write/*", isProtected: true}
  ]
  
  // All routes
  app.get('/', function (req, res) {
    res.redirect(routes[0].name)
  })
  for (k in routes){
    const route = routes[k].name
    const isProtected = routes[k].isProtected
    const cleanName = route.replace("/*", "")
    app.get('/'+route, async function (req, res, next) {
      
      // Access denied
      if (isProtected && !permissions.canWrite(req)){
        res.status(403).send({ auth: false, message: 'This page requires identification.' }); 
        logger.info("Refused access to "+req.path+" to "+req.ip+" because of insufficient permission")
      }

      // OK 200
      else{
        res.render(cleanName, await require('./routes/'+cleanName+'.js')
          (
            req,
            getPageInfo(req)
          )
        )
      }
    })
    logger.debug('Registered '+(isProtected?"protected ":"")+'route '+route);
  }
  
  const apiRoutes = [
    {name:"submit", isProtected: true}
  ]
  for (k in apiRoutes){
    const route = apiRoutes[k].name
    const isProtected = apiRoutes[k].isProtected
    const cleanName = route.replace("/*", "")
      app.post('/'+route, async function (req, res, next) {
        if (isProtected && !permissions.canWrite(req)){
          res.status(403).send({ auth: false, message: 'This page requires identification.' }); 
          logger.info("Refused access to POST "+req.path+" to "+req.ip+" because of insufficient permission")
        }
        else{
          const response = await require('./routes/post/'+cleanName+'.js')(req.body);
          res.status(response.code).json(response);
      }
    })
    logger.debug('Registered '+(isProtected?"protected ":"")+'POST route '+route);
  }

    // CSS faking route
  const cssPath = '/res/css/style.css';
  app.get(cssPath, function (req, res) {
    const colors = require("./theme.js")("#AAAADD")
    res.set('Content-Type', 'text/css');
    res.send(
      fs.readFileSync(path.join(APPLICATION_ROOT, "public", cssPath))
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

  // Wiki contents route
  app.get('/'+WIKI_CONTENTS_DIRECTORY_NAME+"/*", function(req, res){
    res.sendFile(path.join(WIKI_PATH, req.path))
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
    footer: getFooterInfo(),
    website: {
      name: WIKI_NAME,
      links: wikiContents
    },
    user: {
      canWrite: permissions.canWrite(req),
      ip: req.ip
    }
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
    current: req.path.replace(req.path.split("/")[1]+"/", ""),
  }
}