var User = require('../models/userModel');

// Set your secret key: remember to change this to your live secret key in production
// See your keys here https://dashboard.stripe.com/account/apikeys
var stripe = require("stripe")("sk_test_SZnqX3g1C8FapCe1oK9qATOu");

module.exports = {


  createUserWithSubscription: function (req, res, next) {
    // console.log(req.body.stripeToken);
    // console.log('req.body', req.body);
    // console.log("req.body.token.id", req.body.token.id);
    // var stripeToken = req.body.stripeToken;
    console.log('req.body.stripeToken', req.body.stripeToken);
    // var card = req.body.stripeObj.card.id
    // console.log("this is req.body", req.body);
    if (req.body.user.subscription === 'monthly') {
      stripe.customers.create({
        plan: "monthly subscription",
        email: req.body.user.email,
        description: "description is this: ...",
        source: req.body.token.id
      }, function (err, customer) {
        // ...
        console.log(customer);
        var newUser = new User();
        newUser.randomEmail = req.body.user.randomEmail;
        newUser.customerId = customer.id;
        newUser.cardId = req.body.token.card.id;
        newUser.cardLast4 = req.body.token.card.last4;
        newUser.companyName = req.body.user.companyName;
        newUser.email = req.body.user.email;
        newUser.phoneNum = req.body.user.phoneNum;
        newUser.permissions = ['ListingAgent'];
        newUser.enabled = true;
        newUser.picture = req.body.user.picture;
        newUser.generateHash(req.body.user.password).then(function (password) {
          newUser.password = password;
          newUser.generateHash(req.body.user.pinNum).then(function (pinNum) {
            newUser.pinNum = pinNum;
            console.log('newUser', newUser);
            newUser.save(function (err, result) {
              if (err) {
                console.log('err after pin', err);
                res.sendStatus(500);
              }
              else res.send(result);
            });
          });
        });
      })

    } else {
      /*stripe.customers.create({
       description: 'Customer for test@example.com',
       source: "tok_17zIy9FOzTC91b3ZvIK6T03K" // obtained with Stripe.js
       }, function(err, customer) {
       // asynchronously called
       });*/
      stripe.customers.create({
        source: stripeToken,
        // default_source: stripeToken,
        // plan: "annual plan",
        description: "this is a description for a customre",
        email: req.body.user.email
      }, function (err, customer) {
        // ...
        var newUser = new User();
        newUser.randomEmail = req.body.user.randomEmail;
        newUser.customerId = customer.id;
        newUser.cardId = req.body.token.card.id;
        newUser.cardLast4 = req.body.token.card.last4;
        newUser.companyName = req.body.user.companyName;
        newUser.email = req.body.user.email;
        newUser.phoneNum = req.body.user.phoneNum;
        newUser.permissions = ['ListingAgent'];
        newUser.enabled = true;
        newUser.picture = req.body.user.picture;
        newUser.generateHash(req.body.user.password).then(function (password) {
          newUser.password = password;
          newUser.generateHash(req.body.user.pinNum).then(function (pinNum) {
            newUser.pinNum = pinNum;
            newUser.save(function (err, result) {
              if (err) {
                res.sendStatus(500);
              }
              else res.send(result);
            });
          });
        });
      })
    }
  },

  updateCard: function (req, res, next) {
    console.log("update CC: ", req.body);
    console.log('token to update', req.body.token.id);
    User.findByIdAndUpdate(req.params.id, req.body, function (err, result) {
        console.log("user result", result.stripeCustomerInfo)
        if (err) {
          return res.status(500).send(err);
        }
        else {
          stripe.customers.retrieve(
            result.stripeCustomerInfo,
            function (err, customer) {
              if (err) res.sendStatus(500)
              else {
                console.log('stripe customer', customer);
                console.log('stripe customer source [0]', customer.sources.data[0]);
                stripe.customers.deleteCard(
                  customer.id,
                  customer.sources.data[0].id,
                  function (err, confirmation) {
                    if (err) res.sendStatus(500)
                    else {
                      console.log('card deleted', confirmation);
                      stripe.customers.createSource(
                        customer.id,
                        {
                          source: req.body.token.id,
                        }, function (err, card) {
                          if (err) res.sendStatus(500)
                          result.cardLast4 = card.last4;
                          result.save(function (err, saved) {
                            if (err) res.sendStatus(500);
                            else res.send(saved);
                          });
                        }
                      )
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  },

  deleteAccount: function (req, res, next) {
    console.log('stripe delete acc ctrl server');
    console.log('req.body.customerId', req.body);
    stripe.customers.del(
      req.body.customerId,
      function (err, confirmation) {
        // asynchronously called
        if (err)
          console.log('inside your delete error'),
            res.sendStatus(500)
        else {
          console.log('inside your delete');
          User.findByIdAndRemove(req.body._id, function (err) {
            if (!err) {
              // message.type = 'notification!';
              console.log('user deleted');
            }
            else {
              console.log('error');
              message.type = 'error';
            }
          });
          res.send(confirmation)
        }
      })

  }
}





