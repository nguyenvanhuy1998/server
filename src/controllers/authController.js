const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.USERNAME_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

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
const handleSendMail = async (value, email) => {
    //send mail
    try {
        await transporter.sendMail({
            from: `Support Event Hub Application <${process.env.USERNAME_EMAIL}>`, // sender address
            to: email, // list of receivers
            subject: "Verification email code", // Subject line
            text: "Your code to verification email", // plain text body
            html: `<h1>${value}</h1>`, // html body
        });
        return "OK";
    } catch (error) {
        return error;
    }
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
            email: newUser.email,
            id: newUser.id,
            accessToken: getJsonWebToken(email, newUser.id),
        },
    });
});
const verifyOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.round(1000 + Math.random() * 9000);
    try {
        await handleSendMail(verificationCode, email);
        res.status(200).json({
            message: "Send verification code successfully",
            data: {
                code: verificationCode,
            },
        });
    } catch (error) {
        res.status(401);
        throw new Error("Cannot send email");
    }
});
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Kiểm tra email có tồn tại không
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
        res.status(403);
        throw new Error("User does not exist");
    }
    const isMatchPassword = bcrypt.compareSync(password, existingUser.password);
    if (!isMatchPassword) {
        res.status(401);
        throw new Error("Email or passwords do not match");
    }
    res.status(200).json({
        message: "Login successfully",
        data: {
            id: existingUser.id,
            email: existingUser.email,
            accessToken: getJsonWebToken(email, existingUser.id),
        },
    });
});
module.exports = {
    register,
    login,
    verifyOtp,
};
