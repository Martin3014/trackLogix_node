'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db')

const customers = sequelize.define('customers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    code: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING
}, {
    tableName: 'customers', 
    timestamps: false, 
});

module.exports = customers;