import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import environment from '../config/environment';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.RefreshToken = User.hasOne(models.RefreshToken);
      User.Roles = User.hasMany(models.Role);
      User.Files = User.hasMany(models.File);
    }

    static async hashPassword(password) {
      const newPass = await bcrypt.hash(password, environment.saltRounds);
      return newPass;
    }

    static async createNewUser({
      email,
      password,
      roles,
      username,
      firstName,
      lastName,
      refreshToken,
    }) {
      return sequelize.transaction(() => {
        let rolesToSave = [];

        if (roles && Array.isArray(roles)) {
          rolesToSave = roles.map((role) => ({ role }));
        }

        return User.create(
          {
            email,
            password,
            username,
            firstName,
            lastName,
            RefreshToken: { token: refreshToken },
            Roles: rolesToSave,
          },
          { include: [User.RefreshToken, User.Roles] }
        );
      });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: { msg: 'Email must be unique' },
        validate: {
          isEmail: {
            msg: 'Not a valid email address',
          },
          notNull: {
            msg: 'Email is required',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Password is required',
          },
        },
      },
      username: {
        type: DataTypes.STRING(50),
        unique: { msg: 'Username must be unique' },
        allowNull: false,
        validate: {
          len: {
            args: [2, 50],
            msg: 'Username must contain between 2 and 50 characters',
          },
          notNull: {
            msg: 'Username is required',
          },
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [3, 50],
            msg: 'First name must contain between 3 and 50 characters',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [3, 50],
            msg: 'Last name must contain between 3 and 50 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: { attributes: { exclude: ['password'] } },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  User.prototype.comparePasswords = async function (password) {
    const comparingPass = await bcrypt.compare(password, this.password);
    return comparingPass;
  };

  User.beforeSave(async (user, options) => {
    if (user.password) {
      const hashedPassword = await User.hashPassword(user.password);
      user.password = hashedPassword;
    }
  });

  User.afterCreate((user, options) => {
    delete user.dataValues.password;
  });

  return User;
};
