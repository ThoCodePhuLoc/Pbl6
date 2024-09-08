'use strict';

const User = require('../models/user.model');
const { AbstractDialect } = require('sequelize/lib/dialects/abstract/index');
const e = require('express');

class UserRepository {
    static async createUser({username, email, password}) {
        return await User.create({
            username,
            email,
            password
        });
    }

    static async getUserById(id, unSelect = []) {
        return await User.findByPk(id, {
            attributes: {
                exclude: unSelect
            }
        });
    }

    static async searchUser(searchQuery, unSelect = []) {
        return await User.findOne({
            where: searchQuery,
            attributes: {
                exclude: unSelect
            }    
        });
    }

    static async findUserByUsername(username, unSelect = []) {
        await searchUser(username, unSelect);
    }

    static async findUserByEmail(email, unSelect = []) {
        await searchUser(email, unSelect);
    }

    static async updateUser(id, newData) {
        await User.update(newData, {
            where: { user_id: id }
        });
        const updatedUser = await User.findOne({
            where: { user_id: id }
        });
        return updatedUser;
    }
}

module.exports = UserRepository;