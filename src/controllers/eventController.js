const asyncHandler = require("express-async-handler");
const EventModel = require("../models/eventModel");

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcDistanceLocation({
    currentLat,
    currentLong,
    addressLat,
    addressLong,
}) {
    const r = 6371; // km
    const dLat = toRad(addressLat - currentLat);
    const dLon = toRad(addressLong - currentLong);
    const lat1 = toRad(addressLat);
    const lat2 = toRad(currentLat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
            Math.sin(dLon / 2) *
            Math.cos(lat1) *
            Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = r * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(value) {
    return (value * Math.PI) / 180;
}
const addNewEvent = asyncHandler(async (req, res) => {
    const body = req.body;
    if (body) {
        const newEvent = await EventModel(body);
        newEvent.save();
        res.status(200).json({
            message: "Add new event successfully",
            data: newEvent,
        });
    } else {
        res.status(401);
        throw new Error("Event data not found");
    }
});
const getEvents = asyncHandler(async (req, res) => {
    const { lat, long, distance } = req.query;
    // Tìm tất cả events
    const events = await EventModel.find({});
    const items = [];
    if (events.length > 0) {
        events.forEach((event) => {
            const eventDistance = calcDistanceLocation({
                currentLat: lat,
                currentLong: long,
                addressLat: event.location.lat,
                addressLong: event.location.long,
            });
            if (eventDistance < distance) {
                items.push(event);
            }
        });
    }
    res.status(200).json({
        message: "Get events successfully",
        data: items,
    });
});

module.exports = {
    addNewEvent,
    getEvents,
};
