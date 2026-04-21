const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Outfit extends Model {
    static associate(models) {
      Outfit.belongsTo(models.User, { foreignKey: 'ownerUsername', targetKey: 'username', as: 'owner' });
    }
  }

  Outfit.init(
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
      occasion: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: 'Everyday'
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      itemIcons: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      posted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      boardIds: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      aiMeta: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Outfit',
      tableName: 'outfits',
      timestamps: true
    }
  );

  return Outfit;
};
