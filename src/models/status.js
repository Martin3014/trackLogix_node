'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../../config/db')

const status = sequelize.define('status', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    order: DataTypes.STRING
}, {
    tableName: 'status',
    timestamps: false
})

module.exports = status