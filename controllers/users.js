const express = require('express');
const models = require('../models');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', this.index);  // checked
    router.get('/:email', this.show);

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
        email: req.params.email,
      },
      include: [{
        model: models.Post,
      }],
    }).then((user) => {
      if(user) {
        res.render('users/single', { user: user, allPosts: user.posts });
      } else {
        res.redirect('/users');
      }
    }).catch(() => {
      res.redirect('/users');
    });
  },
};
