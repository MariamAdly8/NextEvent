import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HTTPError from './../utils/HTTPError.js';
import RefreshToken from "../models/refreshTokenModel.js";

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        return res.status(201).json({
            status: "Success",
            message: "Account created successfully",
            user
        });
    } catch (err) {
        next(err);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return next(new HTTPError(401, "Wrong email or password"));
        if (!await user.comparePassword(password))
            return next(new HTTPError(401, "Wrong email or password"));

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        const refreshExpiryMs = parseInt(process.env.JWT_REFRESH_EXPIRES_IN);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + refreshExpiryMs)
        });

        return res.status(200).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: refreshExpiryMs
        }).json({
            message: "User authenticated",
            accessToken,
            user
        });
    } catch (err) {
        next(err);
    }
}

const getRefreshToken = async (req) => {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        throw new HTTPError(400, "Refresh token not exist");

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new HTTPError(400, "Invalid Refresh token");
    }

    let userTokens = await RefreshToken.find({ user: payload.userId });
    const comparisons = await Promise.all(userTokens.map(t => t.compareToken(refreshToken)));
    const matchedIndex = comparisons.findIndex(m => m === true);

    if (matchedIndex === -1)
        throw new HTTPError(400, "User doesn't have refresh tokens");

    return userTokens[matchedIndex];
}

export const refresh = async (req, res, next) => {
    try {
        const storedToken = await getRefreshToken(req);

        await RefreshToken.findByIdAndDelete(storedToken._id);

        const newRefreshToken = jwt.sign(
            { userId: storedToken.user },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        const refreshExpiryMs = parseInt(process.env.JWT_REFRESH_EXPIRES_IN);

        await RefreshToken.create({
            token: newRefreshToken,
            user: storedToken.user,
            expiresAt: new Date(Date.now() + refreshExpiryMs)
        });

        const accessToken = jwt.sign(
            { userId: storedToken.user },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        return res.status(200)
            .cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: refreshExpiryMs
            })
            .json({
                message: "Access token refreshed",
                accessToken
            });

    } catch (err) {
        next(err);
    }
}

export const logout = async (req, res, next) => {
    try {
        const storedToken = await getRefreshToken(req);
        await RefreshToken.findByIdAndDelete(storedToken._id);

        return res.status(200).clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        }).json({
            message: "User logged out successfully"
        });
    } catch (err) {
        next(err);
    }
}