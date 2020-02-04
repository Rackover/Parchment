module.exports = {
    canWrite: canWrite
}

const whitelist = ["2a01:cb0c:882:1400:30e6:9ecb:e3c:7aeb"]

function canWrite(req){
    // Temp, waiting for API support
    const exploded = req.ip.split(".");
    return exploded[0] === "192" && exploded[1] === "168" && exploded[2] === "1"
    || whitelist.includes(req.ip);
}