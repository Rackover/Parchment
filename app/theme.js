const color = require('color');

module.exports = function(_tint){
    const tint = _tint%255;
    let baseColor = color.hsl(tint, 100, 50);
    baseColor = baseColor.desaturate(0.4);

    return {
        lightest: baseColor.whiten(2),
        light: baseColor.whiten(1),
        dark: baseColor.darken(1),
        darkest: baseColor.darken(2)
    }
}