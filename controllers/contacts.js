const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');
const cron = require('node-cron');
const moment  = require('moment');
const Sequelize = require('sequelize');
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
  var date = dateToSend.slice(-2);
  if (date < 10) {
    date = date[1];
  }
  var hour = timeToSend.slice(0, 2);
  if (hour < 10) {
    hour = hour[1];
  }
  var min = timeToSend.slice(-2);
  if (min < 10) {
    min = min[1];
  }

  const dateMoment = moment(dateToSend);
  const dayOfWeek = dateMoment.day();

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
    // Message can't be received if user authentication is required
    router.post('/receiveMessage', this.receive); // user has to be logged in in order to receive message. Since
    // all users use the same number to send/receive messages, for now there is no other way to know who the message should be sent to unless the user logs in
    // In the future, sending messages with the user's own phone number will allow us to send messages even when the user is not logged in
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
  receive(req, res){
    console.log(req.body);
    const msgFrom = req.body.From;
    const msgBody = req.body.Body;
    // After receiving message, we have to check whether the number comes from
    // one of the contacts. Otherwise, create contact. Then, we have to store
    // number of database and display message in dashboard. 
    res.send(`
    <Response>
      <Message>
        Your message has been sent. 
      </Message>
    </Response>
    `);
    models.Contacts.findOne({
      where: {
        contactNumber: msgFrom,
        userId: 1             // since user is not authenticated to receive a message, let us just modify the first user for demo purposes
      }
    }).then((contact) => {
      // Contact does not exist
      //console.log("REQ.USER" + req.user);
      var idContact;
      if (!contact) {
        models.Contacts.create({
          userId: 1,
          contactFirstName: 'Unknown',
          contactLastName: 'Unknown',
          contactNumber: msgFrom
        });
        idContact = contact.id;
      }
      const now = moment();
      // const hour = now.hour();
      // const minute = now.minute();
      // const second = now.second();
      // const time = [];
      // time.push(hour);

      // time.push(minute);

      // time.push(second);
      // const timeVal = time.slice(0, time.length).join(':');

      // console.log("timeval" + timeVal);

      console.log(now);
      console.log(now.format("HH:mm:ss"));
      console.log(now.startOf('day'))

      models.Post.create({                     // New contact is generated when a msg is sent. But the msg is not yet created
        userId: 1,
        ContactId: idContact,
        title: msgBody,
        body: msgBody,
        timeToSend: now.format("HH:mm:ss"),
        dateToSend: now.startOf('day')
        
      })

    })
    // models.Contacts.findOne({
    //   where: {
    //     userId: req.user.id,
    //     contactNumber: msgFrom
    //   }
    // }).then((contact) => {
    //   console.log(contact);
    // })
    // console.log(msgFrom + " " + msgBody);
    // confirmation message
    
  },
  index(req, res) {
    models.Contacts.findAll({
      where: {
        userId: req.user.id
      }
    }).then((allContacts) => {
      res.json(allContacts);      
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
      res.redirect('/posts');
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
      (contact ? res.render('contacts/edit', { contact }) : res.redirect('/posts'))
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
      res.redirect('/posts');
    });
  },
  delete(req, res) {
    models.Contacts.destroy({
      where: {
        contactFirstName: req.params.contactFirstName,
      },
    }).then((allContacts) => {
      res.redirect('/posts');
    });
  },
};
