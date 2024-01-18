'use strict';

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: "ProyectQuickBok",
  username: "postgres",
  password: "Jetaboom2611",
  host: "127.0.0.1",
  dialect: 'postgres',
});

// Exporta la instancia de Sequelize
module.exports = sequelize;