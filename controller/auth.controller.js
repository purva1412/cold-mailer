import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "../model/auth.model.js"
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, domain, Skills } = req.body
        if(!name || !email || !password) {
            return res.status(400).json({
                success : false,
                message : "All Fields are Required"
            })
        }
        if(password.length < 6) {
            return res.status(400).json({
                success : false,
                message : "Password must be at least 8 characters long"
            })

        }
        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.status(400).json({
                success : false,
                message : "User with this email already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            domain,
            Skills
        })
        return res.status(201).json({
            success : true,
            message : "User Registered Successfully",user
        })
    }
    catch(e) {
        console.log(e.message)
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(400).json({
                success : false,
                message : "Invalid Email or Password"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success : false,
                message : "Invalid Email or Password"
            })
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        return res.status(200).json({
            success : true,
            message : "User Logged In Successfully",
            user,
            token
        })
    }
    catch(e) {
        console.log(e.message)
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}