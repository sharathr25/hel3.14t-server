const NOTIFICATION_TYPES = {
    HELPER_REQUESTED: "HELPER_REQUESTED",
    HELPER_ACCEPTED: "HELPER_ACCEPTED",
    HELPER_CANCELLED: "HELPER_CANCELLED",
    REQUESTER_CANCELLED: "REQUESTER_CANCELLED",
    REQUESTER_REJECTED: "REQUEST_REJECTED"
}

const HELP_REQUEST_STATUS = {
    REQUESTED: "REQUESTED",
    ON_GOING: "ON_GOING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
}

module.exports = {
    NOTIFICATION_TYPES,
    HELP_REQUEST_STATUS
}