const Router = require("express");
const {
    getAllUsers,
    getEventsFollower,
} = require("../controllers/userController");
const userRouter = Router();
userRouter.get("/get-all", getAllUsers);
userRouter.get("/get-events-follower", getEventsFollower);

module.exports = userRouter;
