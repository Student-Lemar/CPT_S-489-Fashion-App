const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, { foreignKey: 'posterUsername', targetKey: 'username', as: 'poster' });
    }
  }

  Report.init(
    {
      id: {
        type: DataTypes.STRING(64),
        primaryKey: true
      },
      type: {
        type: DataTypes.ENUM('post', 'board'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'removed', 'hidden', 'resolved'),
        allowNull: false,
        defaultValue: 'pending'
      },
      contentId: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      contentLabel: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      posterUsername: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true
    }
  );

  return Report;
};
