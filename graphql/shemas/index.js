module.exports = `
    scalar Date
    scalar Any

    type Query {
        helps: [HelpRequest!]!
        help(id:String!): HelpRequest
    }

    input HelpRequestInput {
        uid: String!
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
        updateHelp(id:String!, key:String!, value:Any):String!
        deleteHelp(id:String!):String!
    }

    type HelpRequest {
        _id: ID!
        uid: String!
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
        usersAccepted : [String!]!
        usersRequested: [String!]!
    }
`;