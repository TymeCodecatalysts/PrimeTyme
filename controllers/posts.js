const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', this.index); 
    router.get('/new', Redirect.ifNotLoggedIn('/login'), this.new); // checked
    router.get('/:username/:title', this.show); // checked
    router.get('/:username/:title/edit',
      Redirect.ifNotLoggedIn('/login'),
      Redirect.ifNotAuthorized('/posts'),
      this.edit
    );
    router.put('/:username/:title',
      Redirect.ifNotLoggedIn('/login'),
      Redirect.ifNotAuthorized('/posts'),
      this.update
    );
    router.delete('/:username/:title',
      Redirect.ifNotLoggedIn('/login'),
      Redirect.ifNotAuthorized('/posts'),
      this.delete
    );

    return router;
  },
  index(req, res) {
    console.log(req.user)
    models.Post.findAll({

    }).then((allPosts) => {
      res.render('posts', { allPosts });
     //res.json(allPosts);
    });
  },
  new(req, res) {
    res.render('posts/new');
  },
  show(req, res) {
    // using the association
    models.Post.findOne({
      where: {
        title: req.params.title,
      },
      include: [{
        model: models.User,
        where: {
          username: req.params.username,
        },
      }],
    }).then((post) => {
      (post ? res.render('posts/single', { post, user: post.user }) : res.redirect('/posts'))
    });

    // without the sequelize association (explicit queries)
    // models.User.findOne({
    //   where: {
    //     username: req.params.username,
    //   }
    // }).then((user) => {
    //   models.Post.findOne({
    //     where: {
    //       userId: user.id,
    //       slug: req.params.slug,
    //     }
    //   }).then((post) =>
    //     (post ? res.render('posts/single', { post, user }) : res.redirect('/posts'))
    //   );
    // });
  },
  edit(req, res) {
    models.Post.findOne({
      where: {
        title: req.params.title,
      },
      include: [{
        model: models.User,
        where: {
          username: req.params.username,
        },
      }],
    }).then((post) =>
      (post ? res.render('posts/edit', { post }) : res.redirect('/posts'))
    );
  },
  update(req, res) {
    models.Post.update({
      title: req.body.title,
      body: req.body.body,
      dateToSend: req.body.dateToSend,
      timeToSend: req.body.timeToSend
    },
    {
      where: {
        title: req.params.title,
      },
      include: [{
        model: models.User,
        where: {
          username: req.params.username,
        },
      }],
      returning: true,
    }).then(([numRows, rows]) => {
      const post = rows[0];
      res.redirect(`/posts/${req.user.username}/${post.title}`);
    });
  },
  delete(req, res) {
    models.Post.destroy({
      where: {
        title: req.params.title,
      },
      include: [{
        model: models.User,
        where: {
          username: req.params.username,
        },
      }],
    }).then(() => {
      res.redirect('/posts');
    });
  },
};
