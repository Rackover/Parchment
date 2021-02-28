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

function loadColor(){
    let baseColor = color(WIKI_COLOR)

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
    .replace(/DARKEST_GREY/g, scheme.darkest_grey.hex())
    .replace(/LIGHT_GREY/g, scheme.light_grey.hex())
    .replace(/DARK_GREY/g, scheme.dark_grey.hex())
    .replace(/DARKEST/g, scheme.darkest.hex())
    .replace(/LIGHTEST/g, scheme.lightest.hex())
    .replace(/DARK/g, scheme.dark.hex())
    .replace(/LIGHT/g, scheme.light.hex())
}