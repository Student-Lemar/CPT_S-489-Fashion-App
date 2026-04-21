const { sequelize, Sequelize } = require('../db/sequelize');

const models = {
  User: require('./user')(sequelize),
  Item: require('./item')(sequelize),
  Outfit: require('./outfit')(sequelize),
  Board: require('./board')(sequelize),
  Profile: require('./profile')(sequelize),
  Follow: require('./follow')(sequelize),
  Report: require('./report')(sequelize),
  AuditLogEntry: require('./audit_log_entry')(sequelize)
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') model.associate(models);
});

module.exports = {
  sequelize,
  Sequelize,
  ...models
};
