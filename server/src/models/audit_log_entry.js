const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AuditLogEntry extends Model {
    static associate(models) {
      AuditLogEntry.belongsTo(models.User, { foreignKey: 'adminUsername', targetKey: 'username', as: 'admin' });
    }
  }

  AuditLogEntry.init(
    {
      id: {
        type: DataTypes.STRING(80),
        primaryKey: true
      },
      adminUsername: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      action: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      target: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'AuditLogEntry',
      tableName: 'audit_log_entries',
      timestamps: false
    }
  );

  return AuditLogEntry;
};
