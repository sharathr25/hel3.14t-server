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

    input UserDetails {
        uid: String!, 
        username: String!, 
        xp: Int!, 
        stars: Int!,
        mobileNo: String!
    }

    type Mutation {
        createHelp(data:HelpRequestInput!):HelpRequest!
        updateHelp(id:String!, key:String!, value:Any, type:String, operation:String):HelpRequest!
        deleteHelp(id:String!):HelpRequest!
        createUser(uid:String!, username: String!):User!
        updateUser(uid:String!, key:String!, value:Any, type:String, operation:String):User!
        deleteUser(uid:String):User!
        incrementXpForUser(uid:String):User!
        addStarsForuser(uid:String):User!
        requestToHelp(idOfHelpRequest: String!, userDetails: UserDetails!): HelpRequest!
    }

    type Subscription {
        onCreateHelp: HelpRequest!,
        onUpdateHelp: HelpRequest!,
        onDeleteHelp: HelpRequest!,
        onUpdateUser: User!
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