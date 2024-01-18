'use strict'

const Customers = require('./customers')
const Status = require('./status')
const { DataTypes } = require('sequelize')
const sequelize = require('../../config/db')

const packages = sequelize.define('packages', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    tracking: DataTypes.INTEGER,
    weight: DataTypes.STRING,
    description: DataTypes.STRING
}, {
    tableName: 'packages',
    timestamps: false
})

//Foraneas
packages.belongsTo(Status, {foreignKey: 'id'})
packages.belongsTo(Customers, {foreignKey: 'id'})

module.exports = packages