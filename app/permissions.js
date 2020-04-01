const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


module.exports = {
    canWrite: canWrite
}

const whitelist = [
    "2a01:cb0c:882:1400:30e6:9ecb:e3c:7aeb", // 970 HOME VAL 
    "2a01:cb0c:882:1400:d9ff:9aff:8a16:2d14" // TWONK HOME VAL
]

function canWrite(req){
    // Temp, waiting for API support
    const exploded = req.ip.replace("::ffff:", "").split(".");
    return exploded[0] === "192" && exploded[1] === "168" && exploded[2] === "1"
    || whitelist.includes(req.ip);
}

function hashPassword(){

}

function createUser(login, clear_password){

}
