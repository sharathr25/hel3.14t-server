const HelpModel = require('../../models/HelpModel');
const userResolvers = require('./user');
const { PubSub } = require('apollo-server-express');
const { Mutation } = userResolvers;
const { addStarsForuser, incrementXpForUser, addNotification, addCreatedHelpRequest, addHelpedHelpRequest } = Mutation;
const { NOTIFICATION_TYPES, HELP_REQUEST_STATUS, NOTIFICATION_MESSAGES } = require('../../constants');
const { sendPushNotification } = require('../../services');

const { 
    HELPER_REQUESTED,
    REQUESTER_ACCEPTED,
    HELPER_CANCELLED,
    REQUESTER_CANCELLED,
    REQUESTER_REJECTED,
    REQUESTER_COMPLETED
} = NOTIFICATION_TYPES;

const {
    REQUESTED,
    ON_GOING,
    CANCELLED,
    COMPLETED
} = HELP_REQUEST_STATUS

const CREATE_HELP = "CREATE_HELP";
const DELETE_HELP = "DELETE_HELP";

const PER_PAGE = 2;

const pubsub = new PubSub();

const addXpToUsersAndNotify = (users, idOfHelpRequest = "") => {
    users.forEach(async user => {
        const { uid, pushNotificationToken } = user;
        incrementXpForUser(null, { uid }, null);
        await notifyUser(uid, REQUESTER_COMPLETED, idOfHelpRequest, pushNotificationToken);
    });
}

const notifyUsers = (users, idOfHelpRequest = "") => {
    users.forEach(async user => {
        const { uid, pushNotificationToken } = user;
        await notifyUser(uid, REQUESTER_CANCELLED, idOfHelpRequest, pushNotificationToken);
    });
}

const notifyUser = async (uid, type = "", idOfHelpRequest = "", notificationTokenOfUser = "") => {
    try {
        if(notificationTokenOfUser) {
            await sendPushNotification({ title: NOTIFICATION_MESSAGES[type] }, notificationTokenOfUser)
        }
        await addNotification(null, { 
            uid, notification: {
                message: NOTIFICATION_MESSAGES[type],
                type,
                idOfHelpRequest
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const isUserAlreadyInUsers = (users, uid) => users.some((user) => user.uid === uid)

module.exports = {
    Query: {
        helps: async (root, args, context) => {
            const { offset } = args;
            try {
                const data = await HelpModel.find({ status: REQUESTED }).skip(offset).limit(PER_PAGE);
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
            const { tokenForPushNotification = "" } = context;
            try {
                const { data } = args;
                const { creator } = data;
                const res = await new HelpModel({...data, pushNotificationToken: tokenForPushNotification }).save();
                if (res._doc) {
                    addCreatedHelpRequest(null, { uid: creator , idOfHelpRequest: res._id })
                }
                pubsub.publish(CREATE_HELP, { onCreateHelp: { ...res._doc } }); // onCreateHelp is the resolver in 'Subscription'
                return res._doc;
            } catch (error) {
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
        requestToHelp: async (root, args, context) => {
            try {
                const { tokenForPushNotification } = context;
                const { idOfHelpRequest, userDetails } = args;
                const { uid } = userDetails;
                let data = await HelpModel.findById({ _id: idOfHelpRequest });
                const { creator, usersRequested, pushNotificationToken } = data._doc;
                if(isUserAlreadyInUsers(usersRequested, uid)) return data._doc;
                data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest },
                    { "$push" : { "usersRequested": {...userDetails, pushNotificationToken: tokenForPushNotification } } }, 
                    { new: true }
                );
                notifyUser(creator, HELPER_REQUESTED, idOfHelpRequest, pushNotificationToken);
                await addHelpedHelpRequest(null, { uid, idOfHelpRequest })
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        cancelToHelp: async (root, args, context) => {
            try {
                const { idOfHelpRequest, userDetails } = args;
                data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest }, 
                    { "$pull": { "usersRequested": userDetails }, "$push": { "usersCancelled": userDetails } }, 
                    { new: true }
                );
                const { pushNotificationToken, creator } = data._doc;
                notifyUser(creator, HELPER_CANCELLED, idOfHelpRequest, pushNotificationToken);
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        acceptHelper: async (root, args, context) => {
            try {
                const { idOfHelpRequest, userDetails } = args;
                const { uid, pushNotificationToken } = userDetails
                let data = await HelpModel.findById({ _id: idOfHelpRequest });
                let { usersAccepted, noPeopleRequired  } = data._doc;
                if(isUserAlreadyInUsers(usersAccepted, uid)) return data._doc;
                data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest },
                    { "$push" : { "usersAccepted": {...userDetails } }, "$pull": { "usersRequested": { uid } } }, 
                    { new: true }
                );
                usersAccepted = data._doc.usersAccepted;
                notifyUser(uid, REQUESTER_ACCEPTED, idOfHelpRequest, pushNotificationToken)
                if (usersAccepted.length === noPeopleRequired) {
                    data = await HelpModel.findByIdAndUpdate({ _id: idOfHelpRequest }, { "status": ON_GOING }, { new: true });
                }
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error
            }
        },
        rejectHelper: async (root, args, context) => {
            try {
                const { idOfHelpRequest, userDetails } = args;
                const { uid, pushNotificationToken } = userDetails;
                let data = await HelpModel.findById({ _id: idOfHelpRequest });
                let { usersRejected  } = data._doc;
                if(isUserAlreadyInUsers(usersRejected, uid)) return data._doc;
                data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest },
                    { "$push" : { "usersRejected": userDetails },"$pull": { "usersRequested": { uid } } }, 
                    { new: true }
                );
                await notifyUser(uid, REQUESTER_REJECTED, idOfHelpRequest, pushNotificationToken);
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        finishHelp: async (root, args, context) => {
            try {
                const { idOfHelpRequest } = args;
                const data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest }, 
                    { "status": COMPLETED }, 
                    { new: true }
                );
                const { usersAccepted } = data._doc;
                addXpToUsersAndNotify(usersAccepted, idOfHelpRequest);
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new error;
            }
        },
        repostHelp: async (root, args, context) => {
            try {
                const { idOfHelpRequest } = args;
                const data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest }, 
                    { "status": REQUESTED, "usersAccepted": [] , "usersRequested": [], "usersCancelled": [], "usersRejected": [] }, 
                    { new: true }
                );
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        cancelHelp: async (root, args, context) => {
            try {
                const { idOfHelpRequest } = args;
                const dataBeforeUpdate  = await HelpModel.findById({ _id: idOfHelpRequest })
                const { usersAccepted } = dataBeforeUpdate._doc;
                const data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest }, 
                    { "status": CANCELLED, "usersAccepted": [] , "usersRequested": [], "usersCancelled": [], "usersRejected": [] }, 
                    { new: true }
                );
                notifyUsers(usersAccepted, idOfHelpRequest);
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        giveRatingsToHelper: async (root, args, context) => {
            try {
                const { idOfHelpRequest, ratings, uid } = args;
                const data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest }, 
                    { "$set": { [`usersAccepted.$[elem].stars`]: ratings } },
                    { new: true, arrayFilters: [{ "elem.uid": { $eq: uid } }] }
                );
                if (data._doc) {
                    addStarsForuser(null, { uid, starsGivenByUser: ratings }, null);
                }
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        giveRatingsToCreator: async (root, args, context) => {
            try {
                const { idOfHelpRequest, ratings, uid } = args;
                const data = await HelpModel.findByIdAndUpdate(
                    { _id: idOfHelpRequest }, 
                    { "$set": { [`usersAccepted.$[elem].starsForCreator`]: ratings } },
                    { new: true, arrayFilters: [{ "elem.uid": { $eq: uid } }] }
                );
                if (data._doc) {
                    addStarsForuser(null, { uid, starsGivenByUser: ratings }, null);
                }
                return data._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        }
    },
    Subscription: {
        onCreateHelp: {
            subscribe: () => pubsub.asyncIterator(CREATE_HELP)
        },
        onDeleteHelp: {
            subscribe: () => pubsub.asyncIterator(DELETE_HELP)
        }
    },
}