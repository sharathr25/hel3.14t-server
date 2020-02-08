const HelpModel = require('../../models/HelpModel');
const userResolvers = require('./user');
const { PubSub } = require('apollo-server-express');
const { Mutation } = userResolvers;
const { addStarsForuser, incrementXpForUser, updateUser } = Mutation;

const pubsub = new PubSub();

const CREATE_HELP = "CREATE_HELP";
const UPDATE_HELP = "UPDATE_HELP";
const DELETE_HELP = "DELETE_HELP";

const PER_PAGE = 2;

const addXpToUsersAndNotify = (users) => {
    users.forEach(async user => {
        const { uid } = user;
        incrementXpForUser(null, { uid }, null);
        await notifyUser(uid, "Help Completed ...");
    });
}

const notifyUser = async (uid, message) => {
    await updateUser(null, { uid, key: "notifications", type: "array", operation: "push", value: { message, timeStamp: new Date().getTime() } });
}

module.exports = {
    Query: {
        helps: async (root, args, context) => {
            const { offset } = args;
            try {
                const data = await HelpModel.find({}).skip(offset).limit(PER_PAGE);
                return data;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        help: async (root, args, context) => {
            try {
                const { id } = args;
                const res = await HelpModel.findOne({ _id: id });
                return res._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
    },
    Mutation: {
        createHelp: async (root, args, context) => {
            try {
                const { data } = args;
                const { creator } = data;
                const res = await new HelpModel(data).save();
                if (res._doc) {
                    updateUser(null, { uid: creator, key: "createdHelpRequests", value: res._id, type: "array", operation: "push" }, null);
                }
                pubsub.publish(CREATE_HELP, { onCreateHelp: { ...res._doc } }); // onCreateHelp is the resolver in 'Subscription'
                return res._doc;
            } catch (error) {
                throw new Error;
            }
        },
        updateHelp: async (root, args, context) => {
            const { id, key, value, type = "update", operation = "update" } = args;
            try {
                let data;
                if (type === "array") {
                    if (operation === "update") {
                        const uid = Object.keys(value)[0];
                        const starsGivenByUser = value[uid].stars;
                        data = await HelpModel.findByIdAndUpdate({ _id: id }, { "$set": { [`${key}.$[elem].stars`]: starsGivenByUser } }, { new: true, arrayFilters: [{ "elem.uid": { $eq: uid } }] });
                        if (data._doc) {
                            addStarsForuser(null, { uid, starsGivenByUser }, null);
                        }
                    } else {
                        data = await HelpModel.findByIdAndUpdate({ _id: id }, { [`$${operation}`]: { [key]: value } }, { new: true });
                        if (key == "usersRequested") {
                            const { uid } = value;
                            await notifyUser(uid, "Helper willing to help you ...")
                        } else if (key === "usersAccepted") {
                            const { usersAccepted, noPeopleRequired } = data._doc;
                            data = await HelpModel.findByIdAndUpdate({ _id: id }, { "$pull": { "usersRequested": { uid: value.uid } } }, { new: true });
                            if (usersAccepted.length === noPeopleRequired) {
                                data = await HelpModel.findByIdAndUpdate({ _id: id }, { "status": "ON_GOING" }, { new: true });
                            }
                        } else if (key === "usersRejected") {
                            data = await HelpModel.findByIdAndUpdate({ _id: id }, { "$pull": { "usersRequested": { uid: value.uid } } }, { new: true });
                        }
                    }
                } else {
                    data = await HelpModel.findByIdAndUpdate({ _id: id }, { [key]: value }, { new: true });
                    if (data._doc && data._doc.status === "COMPLETED") {
                        const { usersAccepted } = data._doc;
                        addXpToUsersAndNotify(usersAccepted);
                    }
                }
                pubsub.publish(UPDATE_HELP, { onUpdateHelp: { ...data._doc } });
                return data._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        deleteHelp: async (root, args, context) => {
            const { id } = args;
            try {
                const res = HelpModel.deleteOne({ _id: id });
                pubsub.publish(DELETE_HELP, { onDeleteHelp: { ...data._doc } });
                return res._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
    },
    Subscription: {
        onCreateHelp: {
            subscribe: () => pubsub.asyncIterator(CREATE_HELP)
        },
        onUpdateHelp: {
            subscribe: () => pubsub.asyncIterator(UPDATE_HELP)
        },
        onDeleteHelp: {
            subscribe: () => pubsub.asyncIterator(DELETE_HELP)
        }
    },
}