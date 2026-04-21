const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'username', targetKey: 'username', as: 'user' });
    }
  }

  Profile.init(
    {
      username: {
        type: DataTypes.STRING(64),
        primaryKey: true
      },
      displayName: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(190),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Profile',
      tableName: 'profiles',
      timestamps: true
    }
  );

  return Profile;
};
