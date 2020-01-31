const color = require('color');

module.exports = function(colString){
    let baseColor = color(colString)

    return {
        lightest: baseColor.whiten(0.8),
        light: baseColor,
        dark: baseColor.darken(0.6),
        darkest: baseColor.darken(0.8),
        dark_grey: baseColor.darken(0.5).grayscale(),
        darkest_grey: baseColor.darken(0.8).grayscale(),
        light_grey: baseColor.whiten(2).grayscale()
    }
}