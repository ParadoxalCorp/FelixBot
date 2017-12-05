class TimeConverter {
    constructor() {};

    /**
     * Calculate and return how many elapsed seconds, minutes, hours and days the given milliseconds represent
     * @param {Number} ms The milliseconds to calculate
     */
    toElapsedTime(ms) {
        return {
            days: Math.floor((ms / (60 * 60 * 24 * 1000))),
            hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((ms % (1000 * 60)) / 1000)
        }
    }

    /**
     * Convert a UNIX timestamp(in ms) to human date
     * @param {Number} timestamp The UNIX timestamp in ms to convert
     * @param {Boolean} [formatted=true] Whether the date should be returned in an object or already in a string format
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
        }
        let date = new Date(timestamp);
        return formatted ? `${date.getDate()} ${getMonth(date.getMonth())} ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` : {
            seconds: date.getSeconds(),
            minutes: date.getMinutes(),
            hours: date.getHours(),
            day: date.getDate(),
            month: getMonth(date.getMonth()),
            year: date.getFullYear()
        }
    }
}

module.exports = new TimeConverter();