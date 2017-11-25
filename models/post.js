module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', {
    title: {
      type: DataTypes.STRING,
      unique: 'compositeIndex',
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    dateToSend: DataTypes.DATE,
    timeToSend: DataTypes.TIME,
  });

  Post.associate = (models) => {
    models.Post.belongsTo(models.User);
    models.Post.belongsTo(models.Contacts);
  }

  return Post;
};
