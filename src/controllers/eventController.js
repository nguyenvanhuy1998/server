const asyncHandler = require("express-async-handler");
const EventModel = require("../models/eventModel");

const addNewEvent = asyncHandler(async (req, res) => {
    const body = req.body;
    console.log("body", body);
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

module.exports = {
    addNewEvent,
};
