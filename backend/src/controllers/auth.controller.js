const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tokenBlacklistModel = require("../models/blacklist.model")

const registerUserController = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    //check if username or email already exists
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]  //or gate ke jese kam kr rha hai
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashed_password
    });

    const payload = {
        id: user._id,
        email: user.email,
        username: user.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token)
    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })



}

const loginUserController = async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "user not found"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "invalid password"
        })
    }

    const payload = {
        id: user._id,
        email: user.email,
        username: user.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token)
    return res.status(201).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })





}

//logout api using token blaklist concept
const logoutUserController = async (req, res) => {

    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token");
    return res.status(200).json({
        message: "User logged out successfully"
    })
}

const getMeController = async (req, res) => {
    const userId = req.user.id
    const user = await userModel.findById(userId).select("-password")

    return res.status(200).json({
        message: "User details fetched successfully",
        user: user
    })
}



module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};