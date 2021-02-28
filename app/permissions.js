module.exports = {
    canWrite: canWrite
}

const whitelist = [
    "2001:861:34c4:9360:1cfb:2ca8:c87a:9061", // 970 HOME VAL 
    "2a01:cb0c:882:1400:d9ff:9aff:8a16:2d14" // TWONK HOME VAL
]

function canWrite(req){
    // Temp, waiting for API support
    const exploded = req.ip.replace("::ffff:", "").split(".");
    return exploded[0] === "192" && exploded[1] === "168" && exploded[2] === "1"
    || whitelist.includes(req.ip);
}