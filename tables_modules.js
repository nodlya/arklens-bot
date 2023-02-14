import { Sequelize, DataTypes, Model } from 'sequelize';

export class User extends Model{};
export class Character extends Model{};
export class Equipment extends Model{};
export class Audit extends Model{};

export const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './sequelize_db.sqlite'
});

export async function Init(){
Character.init({
  Id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  Name:{
    type: DataTypes.TEXT,
    allowNull: false
  },
  Money: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  }  
}, {sequelize});

User.init( {
    ChatId:{ 
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    CharacterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Character,
        key: 'Id'
      }
    }
  }, {sequelize});

Equipment.init({
  Id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  Value:{
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  Owner:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Character,
      key: 'Id'
    }
  }
},
  {sequelize});

Audit.init({
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Type: {
    type: DataTypes.TEXT
  },
  OwnerId:{
    type: DataTypes.INTEGER,
    references:{
      model: Character,
      key: 'Id'
    }
  },
  Value:{
    type: DataTypes.TEXT
  }
}, {sequelize})
}