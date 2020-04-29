const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserShema = new Schema({
    uid: { type: String, required: true },
    username: { type: String, required: true },
    createdHelpRequests: [{ type: Schema.Types.ObjectId, ref: 'HelpRequest' }],
    helpedHelpRequests: [{ type: Schema.Types.ObjectId, ref: 'HelpRequest' }],
    notifications: [{ message: { type: String } , timeStamp: { type: Number }}],
    xp: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    totalRaters: { type: Number, default: 0}
});

module.exports = mongoose.model('User', UserShema);