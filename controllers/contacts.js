const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');
const cron = require('node-cron');
const moment  = require('moment')

const now = moment(); // current date and time



// pass array with cron parameters
function delayMessage(number, message, cronParams) {
  const accountSid = 'AC65bdbdfbf0837bccd4962a2293745ceb';
  const authToken = '47d2cd5dc2994c6824db3ea677586b5d';
  const client = require('twilio')(accountSid, authToken);
  // cron.schedule('55 17 28 11 2', function() {
  cron.schedule(cronParams, function() {
   client.messages
   .create({
     to: number,
     from: '+12012926280',
     body: message,
   })
   .then((message) => console.log(message.sid));
  });
}

// convert date parameter to acceptable cron format
// min hour date month dayOfWeek
// add a parameter to store the day of the week to send
// needs to be added to mondel and rendered on the views
// accepts the day of week as a string i.e Monday
// display a drop down with a list of the days so that
// we don't have to worry if the user spells it wrong
function parseDate(dateToSend, timeToSend) {
  var arr = [];

  const year = dateToSend.slice(0,4);
  const month = dateToSend.slice(5,7);
  const date = dateToSend.slice(-2);
  const hour = timeToSend.slice(0, 2);
  const min = timeToSend.slice(-2);
  const dayOfWeek = 5;

  // push values into array in cron format
  arr.push(min);
  arr.push(hour);
  arr.push(date);
  arr.push(month);
  arr.push(dayOfWeek);
  arr.push(year);
  
  // function returns an array of cron parameters [min, hour, date, month, dayOfWeek]
  return arr;
}


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
      console.log("\n\n_ - - - - - - - - - - _\n\n")
      console.log(now)
      
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
      // delayMessage(contact.contactNumber, req.body.body);
      models.Post.create({
        userId: req.user.id,
        ContactId: contact.id,
        title: req.body.title,
        body: req.body.body,
        dateToSend: req.body.date,
        timeToSend: req.body.time
      })

      console.log(parseDate(req.body.date, req.body.time))

      var cronVals = parseDate(req.body.date, req.body.time)
      cronVals = cronVals.slice(0, cronVals.length - 1).join(' ');
      console.log("-----------------------------------------------------------------");
      console.log(cronVals);
      console.log("-----------------------------------------------------------------");

      delayMessage(contact.contactNumber, req.body.body, cronVals);

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
