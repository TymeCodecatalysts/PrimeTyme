const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', Redirect.ifNotLoggedIn('/login'), this.index); 
    router.get('/new', Redirect.ifNotLoggedIn('/login'), this.new); // checked
    router.get('/:title/edit', this.edit);
    router.put('/:title', Redirect.ifNotLoggedIn('/login'), Redirect.ifNotAuthorized('/posts'), this.update);
    router.delete('/:title', Redirect.ifNotLoggedIn('/login'), this.delete);

    return router;
  },
  index(req, res) {
    console.log(req.user)
    models.Post.findAll({
      where: {
        userId: req.user.id
      }
    }).then((allPosts) => {
      models.Contacts.findAll({
        where: {
          userId: req.user.id
        }
      }).then((allContacts) => {
        //res.render('posts', {allPosts, allContacts});
        res.json(allPosts)
      })
    })
  },
  new(req, res) {
    res.render('posts/new');
  },
  edit(req, res) {
    models.Post.findOne({
      where: {
        title: req.params.title,
      },
      // include: [{
      //   model: models.User,
      //   where: {
      //     username: req.params.username,
      //   },
      // }],
    }).then((posts) => {
      (posts ? res.render('posts/edit', { posts }) : res.redirect('/posts'))
      //console.log("\n\n #############################\n\n");
      //res.json(posts)
    });
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
    }).then((allPosts) => {
      res.redirect('/posts');
    });
  },
  // delete(req, res) {
  //   models.Post.destroy({
  //     where: {
  //       title: req.params.title,
  //     },
  //     include: [{
  //       model: models.User,
  //       where: {
  //         username: req.params.username,
  //       },
  //     }],
  //   }).then(() => {
  //     res.redirect('/posts');
  //   });
  // },
};
