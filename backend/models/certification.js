'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Certification extends Model {
    static associate(models) {
      Certification.hasMany(models.User, {
        foreignKey: 'certification_type_id',
        as: 'users'
      });
    }
  }

  Certification.init({
    certification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    certification_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Certification',
    tableName: 'certifications',
    timestamps: false
  });

  return Certification;
};