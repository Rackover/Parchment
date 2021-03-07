const fs = require("fs")
const path = require("path")
const bodyParser = require("body-parser")
const fileUpload = require('express-fileupload')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)

const theme = require("./theme.js")
theme.loadColor()

module.exports = function(port){
  const express = require('express')
  const app = express()

  ///////
  // Middlewares
  app.set('view engine', 'pug')
  app.set('views', path.join(APPLICATION_ROOT, 'app/views'));
  app.use(fileUpload({
    safeFileNames: /\\/g,
    limits: { fileSize: 50 * 1024 * 1024 },
    createParentPath: true
  }))

  app.use(session({
    secret: Math.random().toString(36).substr(2, 8),
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false
  }))

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  //////
  // Routing
  const routes = [
    {name:"read/*", isProtected: false},
    {name:"write/*", isProtected: true},
    {name:"search", isProtected: false}
  ]
  
  // All routes
  app.get('/', function (req, res) {
    res.redirect("read/home");
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
    {name:"submit", isProtected: true},
    {name:"upload", isProtected: true},
    {name:"destroyPage", isProtected: true},
    {name:"destroyFile", isProtected: true},
    {name:"makedirectory", isProtected: true},
    {name:"logout", isProtected: true},
    {name:"login", isProtected: false}
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
          const response = await require('./routes/post/'+cleanName+'.js')(req);
          res.status(response.code).json(response);
      }
    })
    logger.debug('Registered '+(isProtected?"protected ":"")+'POST route '+route);
  }

  // CSS faking route
  app.get(theme.cssPath, function (req, res) {
    res.set('Content-Type', 'text/css');
    res.send(theme.generateCSS())
  })

  // Wiki contents route
  app.get('/'+WIKI_CONTENTS_DIRECTORY_NAME+"/*", function(req, res){
    if (req.query.dir && permissions.canWrite(req)){
      //?dir=1
      res.json(wikiContents.getEntries(decodeURI(req.path)))
    }
    else{
	    res.sendFile(path.join(WIKI_PATH, decodeURI(req.path)))
    }
  })

  // Public (parchment) directory
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
      links: wikiContents.themeLinks
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
    owner: "louve@louve.systems",
    parchmentInfo: global.VERSION,
    repositoryUrl: "https://github.com/Rackover/Parchment"
  }
}

function getNavigationInfo(req){
  let current =  req.path.replace(req.path.split("/")[1]+"/", "");
  if (!current.toLowerCase().endsWith(".md")){
    current += ".md";
  }

  return {
    arborescence: wikiMap.getTree(),
    current: current,
  }
}
