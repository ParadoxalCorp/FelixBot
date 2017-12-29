/**
 * @param {Number} level The level of the user
 * @param {Number} exp The experience of the user
 * @param {Number} multiplier The multiplier between required experience of each level
 */
getLevelDetails = function(level, exp) {
    const base = 100;
    const multiplier = 2;
    let levels = {};
    for (let i = 1; i <= (level + 2); i++) {
        levels[i] = levels[i - 1] ? levels[i - 1] * 2 : 100;
    }
    if (exp >= levels[level + 1]) level++;
    if (exp < levels[level] || exp > levels[level + 1]) {
        for (let key in levels) {
            if (exp >= levels[key] && exp < levels[new String(parseInt(key) + 1)]) level = parseInt(key);
        }
    }
    return {
        level: level,
        exp: exp,
        remainingExp: levels[level + 1] - exp,
        requiredExp: levels[level + 1],
        levelProgress: `${levels[level] ? exp - levels[level] : exp} / ${levels[level + 1] - (levels[level] || 0)}`,
        nextLevel: level + 1,
        percentage: level === 0 ? exp : Math.round((exp - levels[level]) / (levels[level + 1] - levels[level]) * 100)
    };
}

module.exports = getLevelDetails;