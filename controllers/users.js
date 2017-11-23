const express = require('express');
const models = require('../models');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', this.index);  // checked
    router.get('/:username', this.show); // we might not want this in the future, checked

    return router;
  },
  index(req, res) {
    models.User.findAll({
    }).then((allUsers) => {
      //res.render('users', { allUsers });
      res.json(allUsers);
    });
  },
  show(req, res) {
    models.User.findOne({
      where: {
        username: req.params.username,
      },
      include: [{
        model: models.Post,
        include: [{
          model: models.Contacts
        }]
      }],
    }).then((user) => {
      if(user) {
        // res.render('users/single', { user: user, allPosts: user.posts });
        res.json(user);
      } else {
        res.redirect('/users');
      }
    }).catch(() => {
      res.redirect('/users');
    });
  },
};
