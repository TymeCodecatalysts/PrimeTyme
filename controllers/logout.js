const express = require('express');

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.post('/', this.logout); // checked

    return router;
  },
  logout(req, res) {
    req.logout();
    res.redirect('/');
  },
};
