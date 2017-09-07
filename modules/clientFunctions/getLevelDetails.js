module.exports = async(client) => {
    /**
     * @param {number || string} level The level of the user
     * @param {number || string} exp The experience of the user
     */
    client.getLevelDetails = function(level, exp) {
        const exponent = 2;
        const baseXP = 100;
        const requiredXp = Math.floor(baseXP * (level ** exponent));
        const thisRequiredXp = Math.floor(baseXP * ((level - 1) ** exponent));
        const thisLevelExp = requiredXp - thisRequiredXp;
        const thisLevelProgress = exp - thisRequiredXp;
        return {
            remainingExp: requiredXp - exp,
            requiredExp: requiredXp,
            levelProgress: `${Math.round(exp) - Math.round(thisRequiredXp)}/${requiredXp - thisRequiredXp}`,
            nextLevel: level + 1,
            percentage: (Math.round(thisLevelProgress) / Math.round(requiredXp)) * 100
        };
    }
}