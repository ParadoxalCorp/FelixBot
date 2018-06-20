'use strict';

/**
 * Provides some utility methods to parse time
 */
class timeConverter {
    constructor() {}

    /**
     * @typedef {object} ElapsedTime 
     * @property {number} elapsedTime.days - Number of days elapsed with the given milliseconds
     * @property {number} elapsedTime.hours - Number of hours elapsed with the given milliseconds
     * @property {number} elapsedTime.minutes - Number of minutes elapsed with the given milliseconds
     * @property {number} elapsedTime.seconds - Number of seconds elapsed with the given milliseconds
     */

    /**
     * @typedef {object} HumanDate 
     * @property {number} humanDate.seconds - The second
     * @property {number} humanDate.minutes - The minute
     * @property {number} humanDate.hours - The hour
     * @property {number} humanDate.day - The day
     * @property {number} humanDate.month - The month
     * @property {number} humanDate.year - The year
     */

    /**
     * Calculate and return how many elapsed seconds, minutes, hours and days the given milliseconds represent
     * @param {number} ms The milliseconds to calculate
     * @param {boolean} [formatted=false] Whether or not the elapsed time should be returned already in a readable string format
     * @returns {ElapsedTime} An object or a string depending on if formatted is true or false
     */
    toElapsedTime(ms, formatted = false) {
        return formatted ? `${Math.floor((ms / (60 * 60 * 24 * 1000)))}d ${Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h ${Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor((ms % (1000 * 60)) / 1000)}s` : {
            days: Math.floor((ms / (60 * 60 * 24 * 1000))),
            hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((ms % (1000 * 60)) / 1000)
        };
    }

    /**
     * Convert a UNIX timestamp(in ms) to human date
     * @param {number} timestamp The UNIX timestamp in ms to convert
     * @param {boolean} [formatted=true] Whether or not the date should be returned already in a readable string format
     * @returns {HumanDate} An object or a string depending on if formatted is true or false
     */
    toHumanDate(timestamp, formatted = true) {
        const getMonth = function(monthNumber) {
            let month = '';
            switch (monthNumber) {
                case 0:
                    month = "January";
                    break;
                case 1:
                    month = "February";
                    break;
                case 2:
                    month = "March";
                    break;
                case 3:
                    month = "April";
                    break;
                case 4:
                    month = "May";
                    break;
                case 5:
                    month = 'June';
                    break;
                case 6:
                    month = "July";
                    break;
                case 7:
                    month = "August";
                    break;
                case 8:
                    month = 'September';
                    break;
                case 9:
                    month = "October";
                    break;
                case 10:
                    month = "November";
                    break;
                case 11:
                    month = 'December';
                    break;
            }
            return month;
        };

        let date = new Date(timestamp);
        return formatted ? `${date.getDate()} ${getMonth(date.getMonth())} ${date.getFullYear()}, ${new String(date.getHours()).length < 2 ? "0" + date.getHours() : date.getHours()}:${new String(date.getMinutes()).length < 2 ? "0" + date.getMinutes() : date.getMinutes()}:${new String(date.getSeconds()).length < 2 ? "0" + date.getSeconds() : date.getSeconds()}` : {
            seconds: date.getSeconds(),
            minutes: date.getMinutes(),
            hours: date.getHours(),
            day: date.getDate(),
            month: getMonth(date.getMonth()),
            year: date.getFullYear()
        };
    }
}

module.exports = new timeConverter();