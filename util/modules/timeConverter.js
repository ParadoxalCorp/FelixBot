class TimeConverter {
    constructor() {};

    /**
     * Calculate and return how many elapsed seconds, minutes, hours and days the given milliseconds represent
     * @param {Number} ms The milliseconds to calculate
     * @param {Boolean} [formatted=false] Whether or not the elapsed time should be returned already in a readable string format
     */
    toElapsedTime(ms, formatted = false) {
        return formatted ? `${Math.floor((ms / (60 * 60 * 24 * 1000)))}d ${Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h ${Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor((ms % (1000 * 60)) / 1000)}s` : {
            days: Math.floor((ms / (60 * 60 * 24 * 1000))),
            hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((ms % (1000 * 60)) / 1000)
        }
    }

    /**
     * Convert a UNIX timestamp(in ms) to human date
     * @param {Number} timestamp The UNIX timestamp in ms to convert
     * @param {Boolean} [formatted=true] Whether or not the date should be returned already in a readable string format
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
        return formatted ? `${date.getDate()} ${getMonth(date.getMonth())} ${date.getFullYear()}, ${new String(date.getHours()).length < 2 ? "0" + date.getHours() : date.getHours()}:${new String(date.getMinutes()).length < 2 ? "0" + date.getMinutes() : date.getMinutes()}:${new String(date.getSeconds()).length < 2 ? "0" + date.getSeconds() : date.getSeconds()}` : {
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