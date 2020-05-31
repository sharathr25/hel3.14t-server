const NOTIFICATION_TYPES = {
    HELPER_REQUESTED: "HELPER_REQUESTED",
    REQUESTER_ACCEPTED: "REQUESTER_ACCEPTED",
    HELPER_CANCELLED: "HELPER_CANCELLED",
    REQUESTER_CANCELLED: "REQUESTER_CANCELLED",
    REQUESTER_REJECTED: "REQUESTER_REJECTED",
    REQUESTER_COMPLETED: "REQUESTER_COMPLETED"
}

const {
    REQUESTER_ACCEPTED,
    HELPER_CANCELLED,
    HELPER_REQUESTED,
    REQUESTER_CANCELLED,
    REQUESTER_REJECTED,
    REQUESTER_COMPLETED
} = NOTIFICATION_TYPES;

const NOTIFICATION_MESSAGES = {
    [REQUESTER_ACCEPTED]: "you got accepted", // notify -> helper
    [HELPER_CANCELLED]: "Some helper cancelled", // notify -> creator
    [HELPER_REQUESTED]: "Some one is willing to help you", // notify -> creator
    [REQUESTER_CANCELLED]: "Request has been cancelled to help you", // notify -> helpers(users-accepted)
    [REQUESTER_REJECTED]: "You got rejected sorry", // notify -> helper
    [REQUESTER_COMPLETED]: "Help completed" // notify -> helper
}

const HELP_REQUEST_STATUS = {
    REQUESTED: "REQUESTED",
    ON_GOING: "ON_GOING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
}

module.exports = {
    NOTIFICATION_TYPES,
    HELP_REQUEST_STATUS,
    NOTIFICATION_MESSAGES
}