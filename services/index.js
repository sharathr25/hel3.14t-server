const admin = require('firebase-admin');
const serviceAccount = require('../haisaa-f674b-firebase-adminsdk-2cbqx-3e3dbabe10.json')

admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

const sendPushNotification = async (notification, token) => {
    await admin.messaging().send({ notification, token });
}

module.exports = {
    sendPushNotification
}