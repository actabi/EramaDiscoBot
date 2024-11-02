import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class User extends Model {
  public id!: string;
  public discordId!: string;
  public username!: string;
  public email!: string;
  public avatar!: string;
  public role!: 'admin' | 'freelance';
  public lastLogin!: Date;
}

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

export default User;