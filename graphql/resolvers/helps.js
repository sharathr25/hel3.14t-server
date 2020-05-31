const HelpModel = require('../../models/HelpModel');
const userResolvers = require('./user');
const { PubSub } = require('apollo-server-express');
const { Mutation } = userResolvers;
const { addStarsForuser, incrementXpForUser, updateUser } = Mutation;
const { NOTIFICATION_TYPES, HELP_REQUEST_STATUS, NOTIFICATION_MESSAGES } = require('../../constants');
const admin = require('firebase-admin');
const serviceAccount = require('../../haisaa-f674b-firebase-adminsdk-2cbqx-3e3dbabe10.json')

admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

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

const pubsub = new PubSub();

const CREATE_HELP = "CREATE_HELP";
const UPDATE_HELP = "UPDATE_HELP";
const DELETE_HELP = "DELETE_HELP";

const PER_PAGE = 2;

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
        // to send push notification
        if(notificationTokenOfUser) {
            await admin.messaging().send({ 
                notification: { title: NOTIFICATION_MESSAGES[type] },
                token: notificationTokenOfUser 
            });
        }
        await updateUser(null, 
            { 
                uid, 
                key: "notifications", 
                type: "array", 
                operation: "push", 
                value: { message: NOTIFICATION_MESSAGES[type], timeStamp: new Date().getTime(), type, idOfHelpRequest 
            } 
        }); 
    } catch (error) {
        console.log(error)
    }
}

const updateArrayTypeInHelpModel = async (args) => {
    const { id, key, value } = args;
    const uid = Object.keys(value)[0];
    let keyForUpdate = ""
    let userId = ""
    let starsGivenByUser = 0
    if(value[uid].stars) {
        keyForUpdate = "stars"
        userId = uid;  
        starsGivenByUser = value[uid].stars;
    } else if(value[uid].starsForCreator) {
        keyForUpdate = "starsForCreator"
        userId = value["creatorUid"]
        starsGivenByUser = value[uid].starsForCreator;
    }
    data = await HelpModel.findByIdAndUpdate(
        { _id: id }, 
        { "$set": { [`${key}.$[elem].${keyForUpdate}`]: starsGivenByUser } },
        { new: true, arrayFilters: [{ "elem.uid": { $eq: uid } }] }
    );
    if (data._doc) {
        addStarsForuser(null, { uid: userId, starsGivenByUser }, null);
    }
    return data;
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
                    updateUser(null, { uid: creator, key: "createdHelpRequests", value: res._id, type: "array", operation: "push" }, null);
                }
                pubsub.publish(CREATE_HELP, { onCreateHelp: { ...res._doc } }); // onCreateHelp is the resolver in 'Subscription'
                return res._doc;
            } catch (error) {
                throw new Error;
            }
        },
        updateHelp: async (root, args, context) => {
            const { tokenForPushNotification } = context; 
            const { id, key, value, type = "update", operation = "update" } = args;
            try {
                let data;
                if (type === "array") {
                    if (operation === "update") {
                        data = await updateArrayTypeInHelpModel(args)
                    } else if(operation === "push"){
                        // pre push
                        if (key === "usersRequested" || key === "usersAccepted") {
                            const data = await HelpModel.findById({ _id: id });
                            if(isUserAlreadyInUsers(data._doc[key], value.uid)) return data._doc;
                        }

                        // push
                        if(key === "usersRequested")
                            data = await HelpModel.findByIdAndUpdate({ _id: id }, { [`$push`]: { [key]: {...value, pushNotificationToken: tokenForPushNotification } } }, { new: true });
                        else 
                            data = await HelpModel.findByIdAndUpdate({ _id: id }, { [`$push`]: { [key]: value } }, { new: true });
                        // post push
                        const { usersAccepted, noPeopleRequired, _id } = data._doc;
                        if (key == "usersRequested") {
                            await notifyUser(value.uid, HELPER_REQUESTED, _id)
                            await updateUser(null, { uid: value.uid, key: "helpedHelpRequests", value: _id, operation: "push", type: "array" });
                        } else if (key === "usersAccepted" || key === "usersRejected") {
                            if(key === "usersAccepted") {
                                await notifyUser(value.uid, REQUESTER_ACCEPTED, _id)
                                if (usersAccepted.length === noPeopleRequired) {
                                    data = await HelpModel.findByIdAndUpdate({ _id: id }, { "status": ON_GOING }, { new: true });
                                }
                            } else if(key === "usersRejected") {
                                await notifyUser(value.uid, REQUESTER_REJECTED)
                            }
                            data = await HelpModel.findByIdAndUpdate({ _id: id }, { "$pull": { "usersRequested": { uid: value.uid } } }, { new: true });   
                        }
                    } else if(operation === "pull") {
                        // when person who is willing to help, changes his mind and cancells
                        // TODO : Extract this to new resolver function
                        data = await HelpModel.findByIdAndUpdate({ _id: id }, { [`$pull`]: { [key]: value } }, { new: true });
                        data = await HelpModel.findByIdAndUpdate({ _id: id }, { [`$push`]: { "usersCancelled": value } }, { new: true });
                        notifyUser(data._doc.creator, HELPER_CANCELLED, id)
                    }
                } else {
                    // update
                    data = await HelpModel.findByIdAndUpdate({ _id: id }, key !== "" ? { [key]: value } : value , { new: true });

                    // post update
                    const { usersAccepted } = data._doc;
                    if (data._doc && data._doc.status === COMPLETED) {
                        addXpToUsersAndNotify(usersAccepted);
                    } else if(data._doc && data._doc.status === CANCELLED) {
                        data._doc.usersRequested.forEach((user) => {
                            notifyUser(user.uid, REQUESTER_CANCELLED, id)
                        })
                        data = await HelpModel.findByIdAndUpdate(
                            { _id: id }, 
                            { "usersAccepted": [] , "usersRequested": [], "usersCancelled": [], "usersRejected": [] }, 
                            { new: true });
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
                await updateUser(null, { uid , key: "helpedHelpRequests", value: idOfHelpRequest, operation: "push", type: "array" });
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
        onUpdateHelp: {
            subscribe: () => pubsub.asyncIterator(UPDATE_HELP)
        },
        onDeleteHelp: {
            subscribe: () => pubsub.asyncIterator(DELETE_HELP)
        }
    },
}