'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TextType extends Model {
    static associate(models) {
      TextType.hasMany(models.Text, {
        foreignKey: 'text_type_id',
        as: 'texts'
      });
    }
  }

  TextType.init({
    type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TextType',
    tableName: 'text_types',
    timestamps: false
  });

  return TextType;
};