module.exports = function(env){
  cEnv = process.env;
  defaultEnv = require("./defaultenv.js");
  cEnv.DEBUG_LEVEL = env.debuglvl || process.env.DEBUG_LEVEL || defaultEnv.DEBUG_LEVEL
  cEnv.PORT = env.port || process.env.PORT || defaultEnv.PORT
  cEnv.LOG_PORT = env.logport || process.env.LOG_PORT || defaultEnv.LOG_PORT
  return cEnv;
}