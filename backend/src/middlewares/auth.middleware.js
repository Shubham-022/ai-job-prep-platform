const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const authUser = async (req, res, next) => {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided"
        })
    }

    //check if token is in blacklist

    const isBlacklisted = await tokenBlacklistModel.findOne({ token })
    if (isBlacklisted) {
        return res.status(401).json({
            message: "Token is invalid"
        })
    }

    try {

        //verify ho gya to--> decoded ke andar payload aa jayega
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //req me jo object aya h usme new field bana rhe user ..jisme decoded ki value hogi
        //or ye same req next wale controller me bhi jayegi
        req.user = decoded;

        next();

    } catch {
        return res.status(401).json({
            message: "Invalid token"
        })
    }

}

module.exports = { authUser }