module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', {
    // slug: {
    //   type: DataTypes.STRING,
    //   unique: 'compositeIndex',
    //   allowNull: false,
    //   validate: {
    //     notEmpty: true,
    //   },
    // },
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
    models.Post.belongsToMany(models.Contacts, {through: 'contacts_and_messages'});

  }

  return Post;
};
