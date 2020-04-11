const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const helpRequestShema = new Schema({
    description: { type: String, required: true },
    creator: { type: String, required: true },
    creatorName: {type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, default: "REQUESTED" },
    mobileNo: { type: String, required: true },
    timeStamp: { type: Date, required: true },
    noPeopleRequired: { type: Number, default: 0 },
    usersRequested: { type: [{ uid: String, name: String, stars:{type:Number, default:0 }, xp:{type:Number, default:0} }] },
    usersAccepted: { type: [{ uid: String, name: String, mobileNo: String, stars:{type:Number, default:0 }, xp:{type:Number, default:0} }] },
    usersRejected: { type: [{ uid: String }] }
});

module.exports = mongoose.model('HelpRequest', helpRequestShema);