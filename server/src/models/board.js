const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Board extends Model {
    static associate(models) {
      Board.belongsTo(models.User, { foreignKey: 'ownerUsername', targetKey: 'username', as: 'owner' });
    }
  }

  Board.init(
    {
      id: {
        type: DataTypes.STRING(80),
        primaryKey: true
      },
      ownerUsername: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      visibility: {
        type: DataTypes.ENUM('private', 'public'),
        allowNull: false,
        defaultValue: 'private'
      },
      outfitIds: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      }
    },
    {
      sequelize,
      modelName: 'Board',
      tableName: 'boards',
      timestamps: true
    }
  );

  return Board;
};
