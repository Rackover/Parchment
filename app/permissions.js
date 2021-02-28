const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)
const fs = require("fs")
const mkdirp = require("mkdirp")

let permissions = {}
const PERMISSION_FILE = process.env.PERMISSION_FILE
const backupName = ".bak"

module.exports = function(){
    // Constructor
    loadPermissions()

    return {
        canWrite: canWrite,
        addUser: addUser,
        destroyUser: destroyUser,
        writePermissions: writePermissions,
        isPasswordCorrect: isPasswordCorrect
    }
}()

function canWrite(req){
    if (req.session.user){
        return true
    }
    return false
}

function loadPermissions(){
    if (fs.existsSync(PERMISSION_FILE)){
        const content = fs.readFileSync(PERMISSION_FILE, "utf-8")
        logger.debug("Loading "+PERMISSION_FILE+"...")
        try{
            const lines = content.split("\n")
            for(k in lines){
                const line = lines[k]
                const xLine = line.split(":")
                if (xLine.length < 2)
                    continue

                const usr = xLine[0]
                const hashed = xLine[1]
                const login = Buffer.from(usr, "base64").toString("utf-8")
                permissions[login] = {hash: hashed, b64login:usr} 
                logger.debug("Loaded user '"+login+"'!")
            }
            logger.info("Loaded "+Object.keys(permissions).length+" users successfully!")
        }
        catch(e){
            logger.warn("Could NOT load the user database at "+PERMISSION_FILE+". Was the file damaged? Destroying file.\n"+JSON.stringify(e, null, 4))
            fs.unlinkSync(PERMISSION_FILE)
        }
    }
    else{
        if (fs.existsSync(PERMISSION_FILE+backupName)){
            fs.copyFileSync(PERMISSION_FILE+backupName, PERMISSION_FILE)
            fs.unlinkSync(PERMISSION_FILE+backupName)
            logger.warn("Could not find a valid user database at "+PERMISSION_FILE+", but found a backup! Loading the backup instead.")
            loadPermissions()
            return
        }
        logger.warn("Could not find a valid user database at "+PERMISSION_FILE+", creating one...")
        const randomWord = require('random-words');
        const pass = randomWord({exactly:4, join: ' '})
        const usr = "scribe" // Default user SCRIBE

        addUser(usr, pass)
        try{
            writePermissions()
        }
        catch(e){
            logger.error("Could NOT create the user database at "+PERMISSION_FILE+". Please check the permissions and make sure the destination exists.\n"+JSON.stringify(e, null, 4))
            process.exit(1)
        }
        logger.info("===================\n\nPLEASE NOTE THIS CAREFULLY:\nParchment has created a default user with login '"+usr+"' and password '"+pass+"'\n\n===================")
        loadPermissions()
    }
}

function writePermissions(){
    mkdirp.sync(PERMISSION_FILE.substring(0, PERMISSION_FILE.lastIndexOf('/')))
    let strPerm = ""
    for(k in permissions){
        strPerm += permissions[k].b64login+":"+permissions[k].hash+": ("+k+")\n"
    }
    // Copy before writing
    if (fs.existsSync(PERMISSION_FILE)){
        fs.copyFileSync(PERMISSION_FILE, PERMISSION_FILE+backupName)
    }
    
    fs.writeFileSync(PERMISSION_FILE, strPerm)
    logger.debug("Wrote permissions to file")
}

function addUser(login, clear_pass){
    login = login.toLowerCase()
    permissions[login] = {hash: bcrypt.hashSync(clear_pass, salt), b64login:Buffer.from(login).toString("base64")}
    logger.debug("Added user '"+login+"' to the in-memory permissions")
}

function destroyUser(login){
    login = login.toLowerCase()
    if (permissions[login] === undefined){
        logger.warn("Tried to remove user '"+login+"' from the in-memory permissions, but they do not exist")
    }
    else{
        delete permissions[login]
        logger.debug("Removed user '"+login+"' from the in-memory permissions")
    }
}

function isPasswordCorrect(login, clear_pass){
    return (permissions[login] != undefined) && bcrypt.compareSync(clear_pass, permissions[login].hash)
}
