const Router = require("express");
const { register, login, verifyOtp } = require("../controllers/authController");
const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verifyOtp", verifyOtp);
module.exports = authRouter;
