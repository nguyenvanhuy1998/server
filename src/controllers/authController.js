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
const handleSendMail = async (value) => {
    //send mail
    try {
        await transporter.sendMail(value);
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
        name: fullName ?? "",
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
        const data = {
            from: `Support Event Hub Application <${process.env.USERNAME_EMAIL}>`, // sender address
            to: email, // list of receivers
            subject: "Verification email code", // Subject line
            text: "Your code to verification email", // plain text body
            html: `<h1>${verificationCode}</h1>`, // html body
        };
        await handleSendMail(data);
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
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const randomPassword = Math.round(100000 + Math.random() * 99000);

    const data = {
        from: `New password <${process.env.USERNAME_EMAIL}>`, // sender address
        to: email, // list of receivers
        subject: "New password", // Subject line
        text: "Your password", // plain text body
        html: `<h1>${randomPassword}</h1>`, // html body
    };
    // Kiểm tra user có tồn tại không
    const user = await UserModel.findOne({ email });
    if (user) {
        // Mã hóa password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = bcrypt.hashSync(`${randomPassword}`, salt);
        await UserModel.findByIdAndUpdate(user._id, {
            password: hashPassword,
            isChangePassword: true,
        })
            .then(() => {})
            .catch((error) => {
                console.log("update failed", error);
            });

        await handleSendMail(data)
            .then(() => {
                res.status(200).json({
                    message: "Send mail new password successfully",
                    data: {
                        password: randomPassword,
                    },
                });
            })
            .catch((error) => {
                res.status(401);
                throw new Error("Cannot send email");
            });
    } else {
        res.status(401);
        throw new Error("User not found");
    }
});
const loginWithGoogle = asyncHandler(async (req, res) => {
    const userInfo = req.body;

    // Kiểm tra user có tồn tại trong DB không
    const existingUser = await UserModel.findOne({
        email: userInfo.email,
    });
    const user = { ...userInfo };
    if (existingUser) {
        await UserModel.findByIdAndUpdate(existingUser.id, {
            ...userInfo,
            updatedAt: Date.now(),
        });
        user.accessToken = getJsonWebToken(userInfo.email, userInfo.id);
    } else {
        const newUser = await UserModel({
            email: userInfo.email,
            name: userInfo.name,
            ...userInfo,
        });
        await newUser.save();
        user.accessToken = getJsonWebToken(newUser.email, newUser.id);
    }
    res.status(200).json({
        message: "Login with google successfully",
        data: user,
    });
});
module.exports = {
    register,
    login,
    verifyOtp,
    forgotPassword,
    loginWithGoogle,
};
