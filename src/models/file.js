import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class File extends Model {
    static associate(models) {
      File.belongsTo(models.User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  File.init(
    {
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    { sequelize, modelName: 'File' }
  );

  return File;
};
