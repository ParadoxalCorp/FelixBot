module.exports = async(client) => {
    client.getLevelDetails = function(level, exp) {
        return new Promise(async(resolve, reject) => {
            const exponent = 2;
            const baseXP = 100;
            const requiredXp = Math.floor(baseXP * (level ** exponent));
            const thisRequiredXp = Math.floor(baseXP * ((level - 1) ** exponent));
            const thisLevelExp = requiredXp - thisRequiredXp;
            const thisLevelProgress = exp - thisRequiredXp;
            return resolve({
                remainingExp: requiredXp - exp,
                requiredExp: requiredXp,
                levelProgress: `${Math.round(exp) - Math.round(thisRequiredXp)}/${requiredXp - thisRequiredXp}`,
                nextLevel: level + 1,
                percentage: (Math.round(thisLevelProgress) / Math.round(requiredXp)) * 100
            });
        });
    }
}