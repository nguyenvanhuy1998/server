const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    locationTitle: {
        type: String,
        required: true,
    },
    locationAddress: {
        type: String,
        required: true,
    },
    location: {
        type: Object,
        required: true,
    },
    photoUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    users: {
        type: [String],
    },
    authorId: {
        type: String,
        required: true,
    },
    startAt: {
        type: Number,
        required: true,
    },
    endAt: {
        type: Number,
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});
const EventModel = mongoose.model("events", EventSchema);
module.exports = EventModel;
