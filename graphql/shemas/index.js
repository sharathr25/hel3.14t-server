module.exports = `
    scalar Date
    scalar Any

    type Query {
        helps: [HelpRequest!]!
        help(id:String!): HelpRequest!
        user(uid:String!): User!
    }

    input HelpRequestInput {
        creator: String!
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
        updateHelp(id:String!, key:String!, value:Any, type:String!, operation:String!):String!
        deleteHelp(id:String!):String!
        createUser(uid:String):User!
        updateUser(uid:String!, key:String!, value:Any, type:String!, operation:String!):String!
        deleteUser(uid:String):String!
    }

    type RequestedUser{
        _id: ID!
        name: String!,
        uid: String!,
        xp: Int!
    }

    type AcceptedUser {
        _id: ID!
        name: String!,
        uid: String!,
        mobileNo: String!
    }

    type HelpRequest {
        _id: ID!
        creator: String!
        mobileNo: String!
        name: String!
        latitude: String!
        longitude: String!
        timeStamp: Date!
        noPeopleRequired: Int!
        noPeopleRequested: Int!
        noPeopleAccepted: Int!
        status: String!
        description: String!
        usersAccepted : [AcceptedUser!]!
        usersRequested: [RequestedUser!]!
    }

    type User {
        uid: String!,
        xp: Int!,
        name: String!,
        stars: Int!,
        notifications: [String!],
        createdHelpRequests: [String!]
    }
`;