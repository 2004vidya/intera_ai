import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @access Public
 */

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({ email });
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "User with this email already exists", success: false, err: "User already exists" });
        }

        const user = await userModel.create({ username, email, password });

        res.status(201).json({ message: "User created successfully", success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message, stack: error.stack });
    }
}

/**
 * @description Verify email
 * @route GET /api/auth/verify-email
 * @access Public
 */

// const verifyEmail = async (req, res) => {
//     try {
//         const { token } = req.query;
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await userModel.findOne({ email: decodedToken.email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found", success: false, err: "User not found" });
//         }
//         user.verified = true;
//         await user.save();
//         const html= `
//         <div>
//             <h1>Email verified successfully</h1>
//             <p>Your email has been verified successfully. You can now login to your account</p>
//         </div>
//         `
//         res.send(html);
//         res.status(200).json({ message: "Email verified successfully", success: true, user });
//     } catch (error) {
//         res.status(500).json({ message: error.message, stack: error.stack });
//     }
// }

/**
 * @description Login user
 * @route POST /api/auth/login
 * @access Public
 */

const loginUser=async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false, err: "User not found" });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password", success: false, err: "Invalid password" });
        }
        // if(!user.verified){
        //     return res.status(401).json({ message: "Please verify your email", success: false, err: "Please verify your email" });
        // }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",   // required for cross-origin cookie (frontend & backend on different domains)
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: "Login successful", success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message, stack: error.stack });
    }
}

const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        res.status(200).json({ message: "User fetched successfully", success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message, stack: error.stack });
    }
}

/**
 * @description Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({ message: "Logged out successfully", success: true });
}


export { registerUser, loginUser, getMe, logoutUser };