'use strict';

const { DataTypes } = require("sequelize");

const sequelize = require('../dbs/init.postgresql').getInstance().sequelize;

const MODEL_NAME = 'User';

const User = sequelize.define(MODEL_NAME, {
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
    }
})

module.exports = User;