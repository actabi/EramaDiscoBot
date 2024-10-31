const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  discordId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  avatar: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('admin', 'freelance'),
    defaultValue: 'freelance',
  },
  lastLogin: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'User',
});

module.exports = User;