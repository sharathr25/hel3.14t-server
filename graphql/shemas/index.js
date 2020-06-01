module.exports = `
    scalar Date
    scalar Any

    type Query {
        helps(offset:Int!): [HelpRequest!]!
        help(id:String!): HelpRequest!
        user(uid:String!): User!
        topHelpers: [User!]!
    }

    input HelpRequestInput {
        creator: String!
        creatorName: String!
        mobileNo: String!
        name: String!
        latitude: Float!
        longitude: Float!
        timeStamp: Date!
        noPeopleRequired: Int
        noPeopleRequested: Int
        noPeopleAccepted: Int
        status: String!
        description: String!
    }

    input UserDetailsToRequest {
        uid: String!, 
        username: String!, 
        xp: Int!, 
        stars: Int!,
        mobileNo: String!
    }

    input UserDetailsToAccept {
        uid: String!, 
        username: String!, 
        mobileNo: String!,
        pushNotificationToken: String!
    } 

    input UserDetailsToReject {
        uid: String!,
        pushNotificationToken: String!
    }

    input UserDetailsToCancel {
        uid: String!
    }

    input NotificationInput {
        title: String
        message: String!
        idOfHelpRequest:String!
        type: String
    }

    type Mutation {
        createHelp(data:HelpRequestInput!):HelpRequest!
        deleteHelp(id:String!):HelpRequest!
        createUser(uid:String!, username: String!):User!
        deleteUser(uid:String):User!
        incrementXpForUser(uid:String):User!
        addCreatedHelpRequest(uid: String!, idOfHelpRequest: String!): User
        addHelpedHelpRequest(uid: String!, idOfHelpRequest: String!): User
        addStarsForuser(uid:String):User!
        addNotification(uid: String!, notification: NotificationInput!): User
        removeNotification(uid: String!, idOfNotification:String!): User
        requestToHelp(idOfHelpRequest: String!, userDetails: UserDetailsToRequest!): HelpRequest!
        cancelToHelp(idOfHelpRequest: String!, userDetails: UserDetailsToCancel!): HelpRequest
        acceptHelper(idOfHelpRequest: String!, userDetails: UserDetailsToAccept!): HelpRequest
        rejectHelper(idOfHelpRequest: String!, userDetails: UserDetailsToReject!): HelpRequest
        finishHelp(idOfHelpRequest: String!): HelpRequest
        repostHelp(idOfHelpRequest: String!): HelpRequest
        cancelHelp(idOfHelpRequest: String!): HelpRequest
        giveRatingsToHelper(idOfHelpRequest: String!, ratings: Int!, uid: String!): HelpRequest
        giveRatingsToCreator(idOfHelpRequest: String!, ratings: Int!, uid: String!): HelpRequest
    }

    type Subscription {
        onCreateHelp: HelpRequest!,
        onUpdateHelp: HelpRequest!,
        onDeleteHelp: HelpRequest!,
        onXpIncrement: User!
    }

    type RequestedUser{
        _id: ID!
        username: String!,
        uid: String!,
        mobileNo: String!,
        xp: Int!,
        stars: Int!
        pushNotificationToken: String
    }

    type AcceptedUser {
        _id: ID!
        username: String!,
        uid: String!,
        mobileNo: String!
        xp: Int!
        stars: Int!
        starsForCreator: Int
        pushNotificationToken: String
    }

    type RejectedUser {
        uid: String!
        pushNotificationToken: String
    }

    type CancelledUser {
        uid: String!
        pushNotificationToken: String
    }

    type HelpRequest {
        _id: ID!
        creator: String!
        creatorName: String!
        pushNotificationToken: String
        mobileNo: String!
        name: String!
        latitude: Float!
        longitude: Float!
        timeStamp: Date!
        noPeopleRequired: Int!
        status: String!
        description: String!
        usersAccepted : [AcceptedUser!]!
        usersRequested: [RequestedUser!]!
        usersRejected: [RejectedUser!]!
        usersCancelled: [CancelledUser!]!
    }

    type Notification {
        _id: ID!
        message: String!,
        timeStamp: Date,
        type: String,
        idOfHelpRequest: String,
        isReaded: Boolean
    }

    type User {
        uid: String!,
        username: String!,
        xp: Int!,
        name: String!,
        stars: Int!,
        notifications: [Notification!],
        createdHelpRequests: [String!],
        helpedHelpRequests: [String!],
        totalRaters: Int!
    }
`;