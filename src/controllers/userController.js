const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const EventModel = require("../models/eventModel");

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await UserModel.find({});
    const data = [];
    users.forEach((item) =>
        data.push({
            email: item.email ?? "",
            name: item.name ?? "",
            id: item.id,
        })
    );
    res.status(200).json({
        message: "Get users successfully",
        data,
    });
});
const getEventsFollower = asyncHandler(async (req, res) => {
    const { uid } = req.query;
    if (uid) {
        const events = await EventModel.find({ followers: { $all: uid } });
        const ids = [];
        events.forEach((event) => ids.push(event.id));
        res.status(200).json({
            message: "Get events follower successfully",
            data: ids,
        });
    } else {
        res.status(401);
        throw new Error("Missing uid");
    }
});

module.exports = {
    getAllUsers,
    getEventsFollower,
};
