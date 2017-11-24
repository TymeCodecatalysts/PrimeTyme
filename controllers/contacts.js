const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', Redirect.ifNotLoggedIn('/login'), this.index); // checked
    router.get('/new', Redirect.ifNotLoggedIn('/login'), this.new); // checked
    router.get('/:contactFirstName', Redirect.ifNotLoggedIn('/login'), this.newMsg); // checked
    router.post('/', Redirect.ifNotLoggedIn('/login'), this.submit); // checked
    router.post('/:contactFirstName', Redirect.ifNotLoggedIn('/login'), this.createMsg); // this will take you to create chats // checked 
    router.get('/:contactFirstName/edit', Redirect.ifNotLoggedIn('/login'), this.edit); // checked
    router.put('/:contactFirstName', Redirect.ifNotLoggedIn('/login'), this.update); // checked
    router.delete('/:contactFirstName', Redirect.ifNotLoggedIn('/login'), this.delete); // checked

    return router;
  },
  index(req, res) {
    models.Contacts.findAll({
      where: {
        userId: req.user.id
      }
    }).then((allContacts) => {
      res.render('contacts', {allContacts});
      
    })
  },
  new(req, res) {
    res.render('contacts/new');   
  },
  submit(req, res) {
    // using the association
    req.user.createContact({
      contactFirstName: req.body.contactFirstName,
      contactLastName: req.body.contactLastName,
      contactNumber: req.body.contactNumber
    })
    .then((allContacts) => {
      res.redirect('contacts');
    });
  },
  newMsg(req, res) {
    models.Contacts.findOne({
      where: {
        userId: req.user.id,
        contactFirstName: req.params.contactFirstName,
      }
    }).then((contact) => {
      res.render('posts/new', {contact});
    })
  },
  createMsg(req, res) {
    models.Contacts.findOne({
      where: {
        userId: req.user.id,
        contactFirstName: req.params.contactFirstName
      }
    }).then((contact) => {
      models.Post.create({
        userId: req.user.id,
        ContactId: contact.id,
        title: req.body.title,
        body: req.body.body,
        dateToSend: req.body.date,
        timeToSend: req.body.time
      })
    }).then(() => {
      res.redirect('/posts')
    })
  },
  edit(req, res) {
    models.Contacts.findOne({
      where: {
        contactFirstName: req.params.contactFirstName,
      },
    }).then((contact) =>
      (contact ? res.render('contacts/edit', { contact }) : res.redirect('/contacts'))
    );
  },
  update(req, res) {
    models.Contacts.update({
      contactFirstName: req.body.contactFirstName,
      contactLastName: req.body.contactLastName,
      contactNumber: req.body.contactNumber,
    },
    {
      where: {
        contactFirstName: req.params.contactFirstName,
      },
    }).then(() => {
      res.redirect('/contacts');
    });
  },
  delete(req, res) {
    models.Contacts.destroy({
      where: {
        contactFirstName: req.params.contactFirstName,
      },
    }).then((allContacts) => {
      res.redirect('/contacts');
    });
  },
};
