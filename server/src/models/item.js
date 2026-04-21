const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Item extends Model {
    static associate(models) {
      Item.belongsTo(models.User, { foreignKey: 'ownerUsername', targetKey: 'username', as: 'owner' });
    }
  }

  Item.init(
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
      category: {
        type: DataTypes.ENUM('tops', 'bottoms', 'shoes', 'outerwear', 'accessories'),
        allowNull: false
      },
      color: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      icon: {
        type: DataTypes.STRING(8),
        allowNull: true
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imageDataUrl: {
        type: DataTypes.TEXT('long'),
        allowNull: true
      },
      colorExtracted: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'Server-side extracted dominant color name (overrides manual color for AI scoring)'
      },
      addedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Item',
      tableName: 'items'
    }
  );

  return Item;
};
