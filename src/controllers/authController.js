const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const getJsonWebToken = (email, id) => {
    const payload = {
        email,
        id,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "7d",
    });
    return token;
};

const register = asyncHandler(async (req, res) => {
    const { email, fullName, password } = req.body;
    // Kiểm tra user có tồn tại hay không
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        res.status(401);
        throw new Error("User has already existed!!!");
    }
    // Mã hóa password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new UserModel({
        email,
        fullName: fullName ?? "",
        password: hashPassword,
    });
    // Lưu user xuống database
    await newUser.save();
    // Tạo thành công
    res.status(200).json({
        message: "Register new user successfully",
        data: {
            ...newUser,
            accessToken: await getJsonWebToken(email, newUser.id),
        },
    });
});

module.exports = {
    register,
};
