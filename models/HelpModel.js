const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const helpRequestShema = new Schema({
    description: { type: String, required: true },
    creator: { type: String, required: true },
    creatorName: {type: String, required: true },
    pushNotificationToken: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, default: "REQUESTED" },
    mobileNo: { type: String, required: true },
    timeStamp: { type: Date, required: true },
    noPeopleRequired: { type: Number, default: 0 },
    usersRequested: { 
        type: [
            { 
                uid: String, 
                username: String, 
                mobileNo: String, 
                stars:{type:Number, default:0 }, 
                xp:{type:Number, default:0},
                pushNotificationToken: { type: String, default: "" }
            }
        ] 
    },
    usersAccepted: { 
        type: [
            { 
                uid: String, 
                username: String, 
                mobileNo: String, 
                stars:{type:Number, default:0 }, 
                starsForCreator: {type: Number, default:0},
                xp:{type:Number, default:0} ,
                pushNotificationToken: { type: String, default: "" }
            }
        ] 
    },
    usersRejected: { type: [{ uid: String, pushNotificationToken: { type: String, default: "" }, }] },
    usersCancelled: { type : [ { uid: String, pushNotificationToken: { type: String, default: "" }, }]}
});

module.exports = mongoose.model('HelpRequest', helpRequestShema);