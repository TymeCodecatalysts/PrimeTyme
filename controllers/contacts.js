const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/new', Redirect.ifNotLoggedIn('/login'), this.index); // checked
    // router.get('/new', Redirect.ifNotLoggedIn('/login'), this.new); // commenting this out because we need the views
    router.post('/', Redirect.ifNotLoggedIn('/login'), this.submit); 
    //router.get('/:username/:slug', this.show);
    // router.get('/:username/:slug/edit',
    //   Redirect.ifNotLoggedIn('/login'),
    //   Redirect.ifNotAuthorized('/posts'),
    //   this.edit
    // );
    // router.put('/:username/:contactFirstName/:contactLastName',
    //   Redirect.ifNotLoggedIn('/login'),
    //   Redirect.ifNotAuthorized('/posts'),
    //   this.update
    // );
    // router.delete('/:username/:contactFirstName/:contactLastName',
    //   Redirect.ifNotLoggedIn('/login'),
    //   Redirect.ifNotAuthorized('/posts'),
    //   this.delete
    // );

    return router;
  },
  index(req, res) {
    res.render('contacts');
    // models.Contacts.findAll({
    //   include: [{model: models.User}]
    // }).then((allContacts) => {
    //   // res.render('contacts', { allContacts });
    //   res.json(allContacts);
    // });
  },
  new(req, res) {
    res.render('contacts/new');  // there should not be anything to render 
  },
  submit(req, res) {
    // using the association
    req.user.createContact({
      contactFirstName: req.body.contactFirstName,
      contactLastName: req.body.contactLastName,
      contactNumber: req.body.contactNumber
    })
    .then((contact) => {
      res.json(contact);
    });
    // commenting this out because there is no page that we need to render
    // .then((post) => {
    //   res.redirect(`/posts/${req.user.username}/${post.slug}`);
    // }).catch(() => {
    //   res.render('posts/new');
    // });

    // Without the sequelize association
    /*
    models.Post.create({
      userId: req.user.id,
      slug: getSlug(req.body.title.toLowerCase()),
      title: req.body.title.toLowerCase(),
      body: req.body.body,
    }).then((post) => {
      res.redirect(`/posts/${req.user.username}/${post.slug}`);
    }).catch(() => {
      res.render('posts/new');
    });
    */
  },
  show(req, res) {
    // using the association
    models.Post.findOne({
      where: {
        slug: req.params.slug,
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
        slug: req.params.slug,
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
      title: req.body.title.toLowerCase(),
      slug: getSlug(req.body.title.toLowerCase()),
      body: req.body.body,
    },
    {
      where: {
        slug: req.params.slug,
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
      res.redirect(`/posts/${req.user.username}/${post.slug}`);
    });
  },
  delete(req, res) {
    models.Post.destroy({
      where: {
        slug: req.params.slug,
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
