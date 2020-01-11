const HelpModel = require('../../models/HelpModel');

const keyOfarraysInHelpModel = ["usersAccepted", "usersRequested"];

module.exports = {
    helps: () => {
        return HelpModel.find({})
            .then((res) => {
                return res;
            })
            .catch(err => {
                console.log(err)
            })
    },
    help: (args) => {
        const { id } = args;
        return HelpModel.findOne({_id:id})
            .then((res) => {
                return res;
            })
            .catch(err => console.log(err))
    },
    createHelp: (args) => {
        console.log(args);
        const { data } = args;
        return new HelpModel(data).save().then((res) => {
            return { ...res._doc };
        }).catch(err => console.log(err));
    },
    updateHelp: (args) => {
        const { id, key, value } = args;
        if (keyOfarraysInHelpModel.indexOf(key) > -1) {
            return HelpModel.updateOne({ _id: id }, { "$push": { [key]: value } })
                .then(() => "SUCESS")
                .catch(() => "ERROR");
        }
        return HelpModel.updateOne({ _id: id },{ [key]: value })
            .then(() => "SUCESS")
            .catch(() => "ERROR");
    },
    deleteHelp: (args) => {
        const { id } = args;
        return HelpModel.deleteOne({ _id: id })
            .then(() => "SUCESS")
            .catch(() => "ERROR");
    }
}