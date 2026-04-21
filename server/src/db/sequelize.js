const { Sequelize } = require('sequelize');
const sequelizeConfig = require('./sequelize.config');

const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  sequelizeConfig.assertProductionDatabaseEnvOrThrow();
}

const dbConfig = sequelizeConfig[env];

if (!dbConfig) {
  throw new Error(`Missing Sequelize config for NODE_ENV="${env}"`);
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging === true ? console.log : false,
  define: {
    underscored: true,
    timestamps: true
  }
});

module.exports = { sequelize, Sequelize };
