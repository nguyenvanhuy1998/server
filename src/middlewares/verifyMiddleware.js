const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyMiddleware = asyncHandler((req, res, next) => {
    const accessToken = req.headers.authorization;
    const token = accessToken && accessToken.split(" ")[1];
    if (!token) {
        res.status(401);
        throw new Error("Un authorization!!!");
    } else {
        try {
            const verify = jwt.verify(token, process.env.SECRET_KEY);
            if (verify) {
                next();
            }
        } catch (error) {
            res.status(403);
            throw new Error("Access token is not valid");
        }
    }
});
module.exports = verifyMiddleware;
