'use strict';
// repository
const UserRepository = require('../repositories/user.repo');
///////////////////////////////
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {BadRequestError} = require('../core/error.response');
const {getInforData} = require('../utils/index');
const { createAccessToken, createRefreshToken, verifyToken } = require("../auth/authUtils");
const RedisService = require('./redis.service');
require('dotenv').config();

class AcessService {
    static async signUp({email, username, password}) {
        const holderEmail = await UserRepository.findUserByEmail(email);
        if(holderEmail) {
            throw new BadRequestError('Email already in use');
        }
        const holderUsername = await UserRepository.findUserByUsername(username);
        if(holderUsername) {
            throw new BadRequestError('Username already in use');
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await UserRepository.createUser({email, username, password: hashPassword});
        RedisService.setCachedData({key: `user:${newUser.user_id}`, data: newUser});
        return getInforData(newUser, ['user_id', 'email', 'username']);
    }

    static async login({username, password}) {
        const holder = await UserRepository.findUserByUsername(username);
        if(!holder) {
            throw new BadRequestError('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, holder.password);
        if(!isMatch) {
            throw new BadRequestError('Invalid username or password');
        }
        const user_id = holder.user_id;
        let refreshToken = await RedisService.getRefreshToken({userId: user_id});
        const accessTokenKey = process.env.ACCESS_TOKEN_SECRET, refreshTokenKey = process.env.REFRESH_TOKEN_SECRET;
        let accessToken;
        if(!refreshToken) {
            refreshToken = createRefreshToken({userId: user_id, username}, refreshTokenKey);
        }
        accessToken = createAccessToken({userId: user_id, username}, accessTokenKey);
        // save refreshToken to redis
        RedisService.setRefreshToken({userId: user_id, refreshToken: refreshToken, exp: process.env.REFRESH_TOKEN_EXPIRY});
        return {
            user: getInforData(holder, ['user_id', 'username']),
            token: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }
    }

    static async logout({user_id}) {
        await RedisService.deleteRefreshToken({userId: user_id.toString()});
    }

    static async changePassword({userId, oldPassword, newPassword, repeatPassword}) {
        if(newPassword !== repeatPassword) {
            throw new BadRequestError('Password does not match');
        }
        RedisService.timeToLive = 3600;
        const callback = () => UserRepository.getUserById(userId);
        const holder = await RedisService.getCachedData({key: `user:${userId}`, callback});
        if(!holder) {
            throw new BadRequestError('Invalid request');
        }
        const isMatch = await bcrypt.compare(oldPassword, holder.password);
        if(!isMatch) {
            throw new BadRequestError('Invalid password');
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const newUser = await UserRepository.updateUser(userId, {password: hashPassword});
        const refreshToken = createRefreshToken({userId: userId, username: holder.username}, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = createAccessToken({userId: userId, username: holder.username}, process.env.ACCESS_TOKEN_SECRET);
        // update refreshToken to redis
        RedisService.timeToLive = +process.env.REFRESH_TOKEN_EXPIRY;
        RedisService.setRefreshToken({userId: newUser.user_id, refreshToken: refreshToken});
        // update user to redis
        RedisService.timeToLive = 3600;
        RedisService.setCachedData({key: `user:${userId}`, data: newUser});
        return {
            user: getInforData(newUser, ['user_id', 'username']),
            token: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }
    }

    static async getAccessToken({userId, refreshToken}) {
        const decode = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(decode.userId !== userId) {
            throw new BadRequestError('Invalid token');
        }
        const accessToken = createAccessToken({userId, username: decode.username}, process.env.ACCESS_TOKEN_SECRET);
        return {accessToken};
    }
}

module.exports = AcessService;