module.exports = async(client) => {
    client.findReminder = function(userId, reminderId) { //External functions to avoid the db caching
        const reminderPos = client.userData.get(userId).reminders.findIndex(function(element) {
            return element.id === reminderId; //In case the user deleted it
        });
        return reminderPos;
    }
}