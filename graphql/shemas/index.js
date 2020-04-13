module.exports = `
    scalar Date
    scalar Any

    type Query {
        helps(offset:Int!): [HelpRequest!]!
        help(id:String!): HelpRequest!
        user(uid:String!): User!
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

    type Mutation {
        createHelp(data:HelpRequestInput!):HelpRequest!
        updateHelp(id:String!, key:String!, value:Any, type:String, operation:String):HelpRequest!
        deleteHelp(id:String!):HelpRequest!
        createUser(uid:String):User!
        updateUser(uid:String!, key:String!, value:Any, type:String, operation:String):User!
        deleteUser(uid:String):User!
        incrementXpForUser(uid:String):User!
        addStarsForuser(uid:String):User!
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
        name: String!,
        uid: String!,
        mobileNo: String!,
        xp: Int!,
        stars: Int!
    }

    type AcceptedUser {
        _id: ID!
        name: String!,
        uid: String!,
        mobileNo: String!
        xp: Int!
        stars: Int!
    }

    type RejectedUser {
        uid: String!
    }

    type HelpRequest {
        _id: ID!
        creator: String!
        creatorName: String!
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
    }

    type Notification {
        _id: ID!
        message: String!,
        timeStamp: Date
    }

    type User {
        uid: String!,
        xp: Int!,
        name: String!,
        stars: Int!,
        notifications: [Notification!],
        createdHelpRequests: [String!],
        helpedHelpRequests: [String!],
    }
`;