const Router = require("express");
const {
    register,
    login,
    verifyOtp,
    forgotPassword,
    loginWithGoogle,
} = require("../controllers/authController");
const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verifyOtp", verifyOtp);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.post("/login-with-google", loginWithGoogle);
module.exports = authRouter;
