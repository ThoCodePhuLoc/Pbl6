'use strict';
const Sequelize = require('sequelize');
const { db} = require('../config/config.postgresql');

class Database {

    constructor() {
        this.connect();
    }

    async connect() {
        const logging = process.env.NODE_ENV === 'dev' ? console.log : false;
    
        try {
            this.sequelize = new Sequelize({
                database: db.name,
                username: db.username,
                password: db.password,
                host: db.host,
                port: db.port,
                dialect: 'postgres',
                logging,
            });
    
            await this.sequelize.authenticate();
            console.log('Connected to PostgreSQL');
            await this.sequelize.sync();
        } catch (err) {
            console.error('Error connecting to PostgreSQL', err);
        }
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }
}

module.exports = Database;