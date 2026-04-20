const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Follow extends Model {
    static associate(models) {
      Follow.belongsTo(models.User, { foreignKey: 'followerUsername', targetKey: 'username', as: 'follower' });
      Follow.belongsTo(models.User, { foreignKey: 'followedUsername', targetKey: 'username', as: 'followed' });
    }
  }

  Follow.init(
    {
      followerUsername: {
        type: DataTypes.STRING(64),
        primaryKey: true
      },
      followedUsername: {
        type: DataTypes.STRING(64),
        primaryKey: true
      }
    },
    {
      sequelize,
      modelName: 'Follow',
      tableName: 'follows',
      timestamps: false
    }
  );

  return Follow;
};
