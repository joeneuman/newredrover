var User = require('../models/userModel');
var Seller = require('../models/sellerModel');
var BuyersAgent = require('../models/buyersAgentModel');
var Listing = require('../models/listingModel');
var stripe = require("stripe")("sk_test_SZnqX3g1C8FapCe1oK9qATOu");
var Showing = require('../models/showingModel');

module.exports = {

  login: function (req, email, password, done) {
    process.nextTick(function () {
      User.findOne({'email': email}, function (err, user) {
        if (err) {
          return done(err);
        } else if (user) {
          user.validPassword(password)
            .then(function (response) {
              if (response === true) {
                /*req.user = user;*/
                return done(null, user);
              } else {
                return done('Password incorrect', false);
              }
            })
            .catch(function (err) {
              return done('Server Error', false);
            });
        } else {
          return done('User not found', false);
        }
      });
    });
  },

  create: function (req, res, next) {
    var stripeToken = req.body.stripeToken;
    // var card = req.body.stripeObj.card.id
    // console.log("this is req.body", req.body);
    console.log("req.body.stripeToken", req.body.stripeToken);
    if (req.body.subscription === 'monthly') {
      stripe.customers.create({
        source: req.body.token.id,
        plan: "monthly subscription",
        // description: 'this is a description',
        // plan: "testplan",
        email: req.body.email
      }, function (err, customer) {
        console.log('creating user', req.body, 'customer:', customer);
        var newUser = new User();
        newUser.companyName = req.body.companyName;
        // newUser.stripeTokenCard = req.body;
        newUser.stripeCustomerInfo = customer.id;
        newUser.cardLast4 = req.body.token.card.last4;
        newUser.email = req.body.email;
        newUser.phoneNum = req.body.phoneNum;
        newUser.permissions = ['ListingAgent'];
        newUser.enabled = true;
        newUser.picture = req.body.picture;
        newUser.mls = req.body.mls;
        newUser.agentId = req.body.agentId;
        newUser.generateHash(req.body.password).then(function (password) {
          newUser.password = password;
          newUser.generateHash(req.body.pinNum).then(function (pinNum) {
            newUser.pinNum = pinNum;
            newUser.save(function (err, result) {
              if (err) {
                console.log('error creating user: ', err);
                return res.status(500).send(false);
              }
              else return res.send(result);
            });
          });
        });
      });
    } else {
      stripe.customers.create({
        source: req.body.token.id,
        plan: "annual plan",
        email: req.body.email
      }, function (err, customer) {

        // ...
        var newUser = new User();
        newUser.companyName = req.body.companyName;
        // newUser.stripeToken = stripeToken;
        newUser.cardLast4 = req.body.token.card.last4;
        newUser.stripeCustomerInfo = customer;
        newUser.email = req.body.email;
        newUser.phoneNum = req.body.phoneNum;
        newUser.permissions = ['ListingAgent'];
        newUser.enabled = true;
        newUser.picture = req.body.picture;
        newUser.mls = req.body.mls;
        newUser.agentId = req.body.agentId;
        newUser.generateHash(req.body.password).then(function (password) {
          newUser.password = password;
          newUser.generateHash(req.body.pinNum).then(function (pinNum) {
            newUser.pinNum = pinNum;
            newUser.save(function (err, result) {
              if (err) {
                console.log('error creating user: ', err);
                return res.status(500).send(false);
              }
              else return res.send(result);
            });
          });
        });
      })
    }
  },

  updateCard: function (req, res, next) {
    console.log('req.body upcc', req.body);
    User.findByIdAndUpdate(req.params.id, req.body, function (err, result) {
        console.log("update CC: ", req.body);
        if (err) {
          return res.status(500).send(err);
        }
        else {
          stripe.customers.createSource(
            // console.log("updating CC req.body: ", req.body),
            result.customerId,
            // result.cardId,
            // result.cardId,
            // {source: req.body.cardId},
            {
              source: req.body.token.id,
              default_source: req.body.token.id
            },
            function (err, card) {
              // asynchronously called
              console.log("card back:", card);

              /*result.save(function (err, result) {
               if (err) res.sendStatus(500);
               else res.send(result);
               });*/
              // req.user = result;
            }
          );
        }
        res.send('great');
      }
    )
    ;
  },


  updateUser: function (req, res) {
    console.log("hit user update");
    console.log(req.body);
    User.findById(req.params.id, function (err, user) {
      if (err) {
        return res.status(500).send(err)
        console.log("I am in your err updateUser!!!!!!!---------------");
        // if (req.user._id == req.params.id) {
        //     console.log("I am in your success updateUser!!!!!!!---------------");
      }
      else {
        user.companyName = req.body.companyName;
        user.phoneNum = req.body.phoneNum;
        user.email = req.body.email;
        user.save(function(err, result) {
          if (err) {
            console.log('error saving user update', err);
            return res.sendStatus(500);
          } else {
            return res.send(result);
          }
        })
      }
    })
  }

  ,
  /*updateUser: function (req, res) {
   console.log("hit user update", req.body);
   User.findById(req.params.id, function (err, user) {
   user = req.body;
   if (err)
   return res.status(500).send(err)
   // console.log("I am in your update password!!!!!!!---------------");
   // if (req.user._id == req.params.id) {
   // console.log("I am in your update password!!!!!!!---------------");
   else {

   res.status(200).send(user);
   /!*user.save(function (err, result) {
   if (err) {
   res.sendStatus(500)
   } else {
   res.send(result)
   }
   })*!/
   /!*user.generateHash(req.body.password)
   .then(function (result) {
   user.password = result;
   user.save(function (err, result) {
   if (err) {
   res.sendStatus(500)
   } else {
   res.send(result)
   }
   })
   })*!/
   }
   })
   },*/

  updateUserPassword: function (req, res) {
    console.log("hit update user password");

    User.findById(req.params.id, function (err, user) {
      if (err)
        return res.status(500).send(err)
      // console.log("I am in your update password!!!!!!!---------------");
      // if (req.user._id == req.params.id) {
      // console.log("I am in your update password!!!!!!!---------------");
      else {
        user.generateHash(req.body.password)
          .then(function (result) {
            user.password = result;
            console.log(user.password);
            user.save(function (err, userSave) {
              if (err) {
                return res.sendStatus(500)
              } else {
                return res.send(userSave);
              }
            })
          })
      }
    })

  },


  getUser: function (req, res) {
    //console.log("get user by id", req);
    User
      .findById(req.params.id, function (err, result) {
        if (err) {
          res.status(500).send(err);
        } else {

          res.status(200).send(result);
        }
      });
  }
  ,

  getAllUsers: function (req, res) {
    //console.log("get user by id", req);
    User
      .find({}, function (err, result) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      });
  }
  ,

  currentUser: function (req, res) {
    if (!req.user) {
      return res.status(500).send(false);
    }

    User.findById(req.user._id, function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (!result) {
          return res.status(500).send('no user');
        }
        
        /** Why is this here?? **/
        /*result.password = null;*/

        res.status(200).send(result);
      }
    });
  }
  ,

  /*createSeller: function (req, res, next) {
   console.log('new seller req.body',req.body);
   var newSeller = new Seller(req.body);

   newSeller.save(function (err, result) {
   if (err) res.sendStatus(500);
   else res.send(result);
   });


   },*/
  createSeller: function (req, res, next) {

    // if (!req.body._id) {
    BuyersAgent.findOne({phoneNum: req.body.seller.phoneNum}, function (err, buyersAgent) {
      if (err) {
        console.log('err finding buyersAgent', err);
        return res.sendStatus(500);
      } else if (buyersAgent) {
        console.log('found buyersAgent');
        return res.send(false);
      } else {
        Listing.findById(req.body.listingId).populate('seller').exec(function (err, listingOne) {
          if (err) res.sendStatus(500)
          else if (listingOne.seller) {
            console.log('seller attached to listing');
            Seller.findById(listingOne.seller._id, function (err, seller) {
              if (err) return res.sendStatus(500);
              else {
                seller.sellerName.firstName = req.body.seller.sellerName.firstName;
                seller.phoneNum = req.body.seller.phoneNum;
                seller.save(function (err, sellerSaved) {
                  if (err) return res.sendStatus(500);
                  else return res.send(sellerSaved);
                });
              }
            })
          } else {
            console.log(req.body.seller.phoneNum)
            Seller.findOne({phoneNum: req.body.seller.phoneNum}, function (err, sellerFind) {
              console.log(sellerFind);
              if (err) {
                console.log('err finding seller', err);
                return res.sendStatus(500);
              } else if (sellerFind) {
                console.log('found a seller not attached to listing');
                listingOne.seller = sellerFind._id;
                listingOne.save(function(err, listingSave) {
                  if (err) return res.sendStatus(500);
                  else return res.send(listingSave);
                })
              } else {
                console.log('no seller found. creating new seller');
                var newSeller = new Seller(req.body.seller);
                console.log('userCtrl 288', newSeller);
                newSeller.save(function (err, newSellerSaved) {
                  if (err) {
                    console.log('err saving newSeller', err);
                    return res.sendStatus(500);
                  } 
                  else {
                    listingOne.seller = newSellerSaved;
                    listingOne.save(function(err, listingSave) {
                      if (err) return res.sendStatus(500);
                      else return res.send(listingSave);
                    })
                  }
                });
              }
            })
          }
        })
      }
    })
  },

  addShowingToBuyersAgentQueue: function (showing) {
    BuyersAgent.findById(showing.buyersAgent).exec(function (err, buyersAgent) {
      if (err) {
        console.log(err);
        return;
      } else {
        buyersAgent.queue.push({
          showingId: showing._id,
          listingId: showing.listing,
          requestCount: 0
        });
        buyersAgent.save(function (err, result) {
          if (err) {
            console.log(err);
            return;
          } else {
            console.log('buyersAgent queue updated');
            return;
          }
        })
      }
    })
  },

  addRequestToSellersQueue: function (req, res, next) {
      Listing.findById(req.body.listingId).populate('seller').exec(function(err, listing) {
          if (err) return res.sendStatus(500);
          else {
              Seller.findById(listing.seller._id, function(err, seller) {
                  if (err) {
                      console.log(err);
                      return res.sendStatus(500);
                  } else {
                      if (!seller.queue) {
                          seller.queue = [];
                      }
                      BuyersAgent.findOne({phoneNum: req.body.showing.phoneNumber}, function(err, buyersAgentFind) {
                          if (err) {
                              console.log(err);
                              return res.sendStatus(500);
                          } else if (buyersAgentFind) {
                              var newShowing = new Showing();
                              newShowing.listing = listing._id;
                              newShowing.status = 'pending';
                              newShowing.buyersAgent = buyersAgentFind._id;
                              newShowing.dateCreated = new Date();
                              newShowing.timeSlot = req.body.timeSlot;
                              newShowing.save(function (err, newShowingSave) {
                                  if (err) {
                                    console.log(err);
                                    return res.sendStatus(500);
                                  } else { 
                                      listing.showings.push(newShowingSave._id);
                                      listing.save(function(err, savedListing) {
                                          if (err) {
                                              console.log(err);
                                              return res.sendStatus(500);
                                          } else {
                                              seller.queue.push({
                                                  listingId: req.body.listingId,
                                                  showing: newShowingSave._id,
                                                  showingTime: req.body.timeSlot,
                                                  buyersAgent: buyersAgentFind._id,
                                                  requestCount: Number(0),
                                                  timeRequested: new Date()
                                              });
                                              seller.save(function (err, result) {
                                                  if (err) return res.sendStatus(500);
                                                  else return res.send(true);
                                              }) 
                                          }
                                      })            
                                  }
                              })
                          } else {
                              var newBuyersAgent = new BuyersAgent();
                              newBuyersAgent.name = req.body.showing.name;
                              newBuyersAgent.phoneNum = req.body.showing.phoneNumber;
                              newBuyersAgent.save(function (err, buyersAgent) {
                                  if (err) {
                                      console.log(err);
                                      return res.sendStatus(500);
                                  }
                                  else {
                                    var newShowing = new Showing();
                                    newShowing.listing = listing._id;
                                    newShowing.status = 'pending';
                                    newShowing.buyersAgent = buyersAgent._id;
                                    newShowing.dateCreated = new Date();
                                    newShowing.timeSlot = req.body.timeSlot;
                                    newShowing.save(function (err, newShowingSave) {
                                        if (err) {
                                            console.log(err);
                                            return res.sendStatus(500);
                                          } else { 
                                              listing.showings.push(newShowingSave._id);
                                              listing.save(function(err, savedListing) {
                                                  if (err) {
                                                      console.log(err);
                                                      return res.sendStatus(500);
                                                  } else {
                                                      seller.queue.push({
                                                          listingId: req.body.listingId,
                                                          showing: newShowingSave._id,
                                                          showingTime: req.body.timeSlot,
                                                          buyersAgent: buyersAgent._id,
                                                          requestCount: Number(0),
                                                          timeRequested: new Date()
                                                      });
                                                      seller.save(function (err, result) {
                                                          if (err) return res.sendStatus(500);
                                                          else return res.send(true);
                                                      }) 
                                                  }
                                              })            
                                          }
                                      })
                                  }
                              });                                
                          }
                      })
                  }
              })
          }
      })
  },

  checkEmail: function (req, res, next) {
    console.log(req.body);
    User.findOne({email: req.body.email}, function (err, user) {
      if (err) {
        console.log('err finding user in checkEmail', err);
        return res.sendStatus(500);
      } else if (user) {
        console.log('email used in user');
        return res.send(true);
      } else {
        BuyersAgent.findOne({email: req.body.email}, function (err, buyersAgent) {
          if (err) {
            console.log('err finding user in checkEmail', err);
            return res.sendStatus(500);
          } else if (buyersAgent) {
            console.log('email used in buyersAgent');
            return res.send(true);
          } else {
            Seller.findOne({email: req.body.email}, function (err, seller) {
              if (err) {
                console.log('err finding user in checkEmail', err);
                return res.sendStatus(500);
              } else if (seller) {
                console.log('email used in seller');
                return res.send(true);
              } else {
                console.log('email not in use');
                return res.send(false);
              }
            })
          }
        })
      }
    })
  },

  phoneNumCheck: function (req, res, next) {
    console.log(req.body.phoneNum);
    req.body.phoneNum = '1' + req.body.phoneNum;
    User.findOne({phoneNum: req.body.phoneNum}, function (err, user) {
      if (err) {
        console.log('err finding user in phoneNumCheck', err);
        return res.sendStatus(500);
      } else if (user) {
        console.log('phoneNum used in user');
        return res.send(true);
      } else {
        BuyersAgent.findOne({phoneNum: req.body.phoneNum}, function (err, buyersAgent) {
          if (err) {
            console.log('err finding user in phoneNumCheck', err);
            return res.sendStatus(500);
          } else if (buyersAgent) {
            console.log('phoneNum used in buyersAgent');
            return res.send(true);
          } else {
            Seller.findOne({phoneNum: req.body.phoneNum}, function (err, seller) {
              if (err) {
                console.log('err finding user in phoneNumCheck', err);
                return res.sendStatus(500);
              } else if (seller) {
                console.log('phoneNum used in seller');
                return res.send(true);
              } else {
                console.log('phoneNum not in use');
                return res.send(false);
              }
            })
          }
        })
      }
    })
  }
}


  /*<< < < < < < HEAD
   createBuyersAgent: function (req, res, next) {
   var newBuyersAgent = new BuyersAgent(req.body);
   newBuyersAgent.save(function (err, result) {
   if (err) res.sendStatus(500);
   else res.send(result);
   });
   }
   *!/
   ======
   =
   >>>>>>>
   loginCtrl*/
