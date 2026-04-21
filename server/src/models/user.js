const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Item, { foreignKey: 'ownerUsername', sourceKey: 'username', as: 'items' });
      User.hasMany(models.Outfit, { foreignKey: 'ownerUsername', sourceKey: 'username', as: 'outfits' });
      User.hasMany(models.Board, { foreignKey: 'ownerUsername', sourceKey: 'username', as: 'boards' });
      User.hasMany(models.Report, { foreignKey: 'posterUsername', sourceKey: 'username', as: 'reportsFiledAsPoster' });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.STRING(64),
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('creator', 'admin'),
        allowNull: false,
        defaultValue: 'creator'
      },
      status: {
        type: DataTypes.ENUM('active', 'suspended'),
        allowNull: false,
        defaultValue: 'active'
      },
      displayName: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      reports: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users'
    }
  );

  return User;
};
