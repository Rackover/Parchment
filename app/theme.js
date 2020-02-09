const color = require('color');
const cssPath = "/res/css/style.css"
const fs = require("fs")
const path = require("path")
let scheme = {}

module.exports = {
    loadColor: loadColor,
    generateCSS: generateCSS,
    cssPath: cssPath
}

function loadColor(colString){
    let baseColor = color(colString)

    scheme = {
        lightest: baseColor.whiten(0.5),
        light: baseColor,
        dark: baseColor.darken(0.6),
        darkest: baseColor.darken(0.8),
        dark_grey: baseColor.darken(0.5).grayscale(),
        darkest_grey: baseColor.darken(0.8).grayscale(),
        light_grey: baseColor.whiten(2).grayscale()
    }
}

function generateCSS(){
    return fs.readFileSync(path.join(APPLICATION_ROOT, "public", cssPath))
    .toString()
    .replace(/darkest_grey/g, scheme.darkest_grey.rgb().string())
    .replace(/light_grey/g, scheme.light_grey.rgb().string())
    .replace(/dark_grey/g, scheme.dark_grey.rgb().string())
    .replace(/darkest/g, scheme.darkest.rgb().string())
    .replace(/lightest/g, scheme.lightest.rgb().string())
    .replace(/dark/g, scheme.dark.rgb().string())
    .replace(/light/g, scheme.light.rgb().string())
}