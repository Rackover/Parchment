const color = require('color');

module.exports = function(_tint){
    const tint = _tint%255;
    let baseColor = color.hsl(tint, 70, 50);

    return {
        lightest: baseColor.whiten(3),
        light: baseColor.whiten(2),
        dark: baseColor.darken(0.6),
        darkest: baseColor.darken(0.8),
        dark_grey: baseColor.darken(0.5).desaturate(1),
        darkest_grey: baseColor.darken(0.8).desaturate(1),
        light_grey: baseColor.whiten(2).desaturate(1)
    }
}