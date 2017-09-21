module.exports = async(client) => {
    client.loadReminders = function() {
        return new Promise(async(resolve, reject) => {
            var existingReminders = client.userData.filter(u => JSON.parse(u).reminders).filter(u => JSON.parse(u).reminders.length !== 0);
            const expiredReminders = existingReminders.filter(u => JSON.parse(u).reminders.filter(r => r.timestamp < Date.now()).length !== 0);
            let deletedReminders = 0;
            let restartedReminders = 0;
            if (expiredReminders.size !== 0) {
                expiredReminders.forEach(function(user) {
                    let userEntry = client.userData.get(JSON.parse(user).id);
                    let userExpiredReminders = userEntry.reminders.filter(r => r.timestamp < Date.now());
                    userExpiredReminders.forEach(function(reminder) {
                        try {
                            client.users.get(JSON.parse(user).id).send("Hoi o/ seems like i was down at the moment so i might be a bit late but you asked me to remind you about ```\n" + reminder.cleanText + "```");
                            userEntry.reminders.splice(userEntry.reminders.findIndex(function(element) {
                                return element.id === reminder.id;
                            }), 1);
                            client.userData.set(JSON.parse(user).id, userEntry);
                            deletedReminders++;
                        } catch (err) {
                            console.error(err);
                        }
                    });
                });
                existingReminders = client.userData.filter(u => JSON.parse(u).reminders).filter(u => JSON.parse(u).reminders.length !== 0); //Update the collection since all the expired reminders got deleted
                console.log("Deleted " + deletedReminders + " expired reminders");
            }
            existingReminders.forEach(function(user) {
                let userEntry = client.userData.get(JSON.parse(user).id);
                userEntry.reminders.forEach(function(reminder) {
                    setTimeout(async function() {
                        if (client.findReminder(JSON.parse(user).id, reminder.id) === -1) {
                            return;
                        }
                        try {
                            client.users.get(JSON.parse(user).id).send("Hey, you wanted me to remind you about ```\n" + reminder.cleanText + "```");
                            userEntry.reminders.splice(client.findReminder(JSON.parse(user).id, reminder.id), 1); //Delete the expired reminder
                            client.userData.set(JSON.parse(user).id, userEntry);
                        } catch (err) {
                            console.error(err);
                        }
                    }, reminder.timestamp - Date.now());
                    restartedReminders++;
                });
            });
            resolve({
                remindersRestarted: restartedReminders,
                remindersDeleted: deletedReminders
            });
        });
    }
}