/**
 * Created by brandonhebbert on 3/24/16.
 */
var Listing = require('../models/listingModel');
var User = require('../models/userModel');
var Seller = require('../models/sellerModel');
var Showing = require('../models/showingModel');
var BuyersAgent = require('../models/buyersAgentModel');
var q = require('q');

var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var dayArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// testing twilio accounts
// joe's account sid:
// accountSid = 'ACec65ec8a176a0c2c14b673ac91e527d3'
// joe authtoken:
// authToken = "d29c5974fc198697c9fe891d928d1a36"

// Brandon's twilio accoutSid:
var accountSid = "AC0230247e2a490e86a424cd1285068596"
// Brandon's twilio authToken:
var authToken = "1c6b9e9eb9c814ddc1506eadf3026163"


var accountSid = 'ACec65ec8a176a0c2c14b673ac91e527d3';
var authToken = "d29c5974fc198697c9fe891d928d1a36";


var client = require('twilio')(accountSid, authToken);


module.exports = {
  findTwilioNumber: function (req, res) {
    console.log('checking are code: ', req.body);
    client.availablePhoneNumbers('US').local.list({
      areaCode: req.body.areaCode.areaCode
    }).then(function (searchResults) {
      console.log(searchResults);
      // handle the case where there are no numbers found
      if (searchResults.availablePhoneNumbers.length < 1) {
        // res.send('No numbers are currently available with that zip code.  Numbers are added daily.')
        throw {message: 'No numbers found with area code: ' + req.body.areaCode.areaCode};
      }
      else res.send(searchResults);
      // Okay, so there are some available numbers.  Now, let's buy the first one
      // in the list.  Return the promise created by the next call to Twilio:
      /*client.incomingPhoneNumbers.list(function (err, data) {
       if (err) res.sendStatus(500)
       else res.send(data);
       });*/
      /*return client.incomingPhoneNumbers.create({
       phoneNumber: searchResults.availablePhoneNumbers[0].phoneNumber,
       voiceUrl: 'https://demo.twilio.com/welcome/voice',
       smsUrl: 'https://demo.twilio.com/welcome/sms/reply'
       });*/
    });
    /*.then(function (number) {
     // We bought the number!  Everything worked!
     console.log('Your new number: ' + number.phoneNumber);

     req.body.user.twilioNumber = number.phoneNumber;

     User.findByIdAndUpdate(req.params.id, req.body.user, function (err, result) {
     if (err)
     return res.status(500).send(err)
     else
     res.send(number.phoneNumber);
     })
     }).fail(function (error) {
     // This callback will be invoked on any error returned in the
     // process.
     console.log('Number purchase failed! Reason: ' + error.message);
     }).fin(function () {
     // You can use this optional callback like a "finally" block
     // It will always execute last.  Perform any cleanup necessary here.
     });*/
  },

  checkTwilioNumber: function (req, res) {
    console.log('checking numbers ', req.body);
    client.incomingPhoneNumbers.list(function (err, data) {
      if (err) res.sendStatus(500);
      else res.send(data);
    });
  },

  buyTwilioNumber: function (req, res) {
    return client.incomingPhoneNumbers.create({
      phoneNumber: req.body.twilioNumber.twilioNumber,
      friendlyName: req.body.user.email,
      voiceUrl: 'https://demo.twilio.com/welcome/voice',
      smsUrl: 'http://redrover.h8.rs/twilio/return',
      smsMethod: 'GET'
    })
      .then(function (number) {
        console.log('Your new number: ' + number.phoneNumber);
        console.log('user to update', req.body.user);
        req.body.user.twilioNumber = number.phoneNumber;

        User.findById(req.params.id, function (err, user) {
          if (err)
            return res.status(500).send(err)
          else {
            console.log(user);
            user.twilioNumber = number.phoneNumber;
            user.save(function (err, result) {
              if (err) {
                console.log('error in updating user with twilio number: ', err);
                return res.send(500).send(err);
              } else {
                console.log('successfully saved twilio number on user: ', result);
                res.send(result);
              }
            })
          }
        })
      }).fail(function (error) {
        // This callback will be invoked on any error returned in the
        // process.
        console.log('Number purchase failed! Reason: ' + error.message);
      }).fin(function () {
        // You can use this optional callback like a "finally" block
        // It will always execute last.  Perform any cleanup necessary here.
      });
  },

  /*req {showing: showing.phoneNumber, listingId: $scope.listingId}*/
  newShowingRequest: function (req, res, next) {
    console.log('req', req.body);

    /*find seller in db by phoneNumber*/
    Seller.findOne({phoneNum: req.body.showing.phoneNumber}, function (err, seller) {
      if (err) {
        console.log('err finding seller', err);
        return res.sendStatus(500);
      } else if (seller) {
        return res.send(false);
      } else {
        /*create 4 digit random number*/
        var arr = [];
        while (arr.length < 4) {
          var randomnumber = Math.ceil(Math.random() * 9)
          var found = false;
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] == randomnumber) {
              found = true;
              break
            }
          }
          if (!found)arr[arr.length] = randomnumber;
        }
        var randomNum = arr.join('');

        /*find listing by listingId*/
        Listing.findById(req.body.listingId).populate('listingAgent').exec(function (err, listing) { //listingAgent is now populated on listing
          if (err) {
            res.sendStatus(500)
          }
          else {
            listing.randomNum = randomNum;
            listing.save(function (err, result) {
              if (err) {
                res.sendStatus(500)
              } else {

                /* need the random number to find listing in que*/
                client.messages.create({
                  to: '+' + req.body.showing.phoneNumber,
                  from: '+' + listing.listingAgent.twilioNumber,
                  body: req.body.showing.name + ', you made a showing request for ' + listing.address + '.  Please confirm by entering the 4 digit code at the showing request and clicking "Confirm": ' + randomNum
                }, function (err, data) {
                  if (err) {
                    console.log('err sending message ', err);
                    return res.status(500).send('failed to send');
                  } else {
                    return res.send(data);
                  }
                });
              }
            })
          }
        })
      }
    })
  },

  // if response is yes send this message:
  returnMessage: function (req, res, next) {
    console.log('hit return message', req);
    // console.log('hit return message', req.query.To);
    /*if (!req.query.To || !req.query.From) {
     console.log('no query');
     return res.send(false);
     }*/
    var listingAgentNum = req.query.To.toString();
    console.log(listingAgentNum);
    listingAgentNum = listingAgentNum.split('').splice(1).join('');
    var senderNum = req.query.From;
    console.log(senderNum);
    senderNum = senderNum.split('').splice(1).join('');

    Seller.findOne({'phoneNum': senderNum}).populate('queue.buyersAgent').exec(function (err, seller) {
      if (err) return res.sendStatus(500);
      else if (seller && seller.queue && seller.queue.length > 0) {
        console.log('seller found', senderNum);
        Listing.findById(seller.queue[0].listingId).populate('listingAgent').exec(function (err, listing) {
          if (err) return res.sendStatus(500);
          else {
            if (req.query.Body.toLowerCase() === ('yes' || 'yeah' || 'yep')) {
              client.messages.create({
                to: seller.queue[0].buyersAgent.phoneNum,
                from: '+' + listing.listingAgent.twilioNumber,
                body: 'Your request to show ' + listing.address + ' in ' + listing.city + ' has been approved.'
              }, function (err, data) {
                if (err) return res.sendStatus(500);
                else {
                  /*client.messages.create({
                   to: listing.listingAgent.phoneNum,
                   from: '+' + listing.listingAgent.twilioNumber,
                   body: 'Your request to show ' + listing.address + ' in ' + listing.city + ' has been approved.'
                   })*/
                  Showing.findById(seller.queue[0].showing, function (err, showing) {
                    if (err) {
                      console.log(err);
                      return res.sendStatus(500);
                    } else {
                      showing.status = 'confirmed';
                      showing.save(function (err, showingSave) {
                        if (err) {
                          console.log(err);
                          return res.sendStatus(500);
                        } else {
                          seller.queue.splice(0, 1);
                          seller.save(function (err, sellerSave) {
                            if (err) return res.sendStatus(500);
                            else {
                              if (sellerSave.queue.length > 0) {
                                var time = {};
                                var requestDate = new Date(sellerSave.queue[0].showingTime);

                                if (requestDate.getHours() > 12) {
                                  time.hours = requestDate.getHours() - 12;
                                  time.minutes = requestDate.getMinutes();
                                  time.amPm = 'pm';
                                } else if (requestDate.getHours() === 12) {
                                  time.hours = requestDate.getHours();
                                  time.minutes = requestDate.getMinutes();
                                  time.amPm = 'pm';
                                } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
                                  time.hours = 12;
                                  time.minutes = requestDate.getMinutes();
                                  time.amPm = 'am';
                                } else {
                                  time.hours = requestDate.getHours();
                                  time.minutes = requestDate.getMinutes();
                                  time.amPm = 'am';
                                }
                                if (requestDate.getMinutes() < 10) {
                                  time.minutes = '0' + requestDate.getMinutes();
                                } else {
                                  time.minutes = requestDate.getMinutes();
                                }
                                client.messages.create({
                                  to: '+' + sellerSave.phoneNum,
                                  from: '+' + listing.listingAgent.twilioNumber,
                                  body: 'There is a showing request for your property at ' + listing.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + '. Will that work for you? (Please respond with "yes" or "no")'
                                }, function (err, data) {
                                  if (err) {
                                    return res.status(500).send('failed to send');
                                  } else {
                                    sellerSave.queue[0].requestCount += 1;
                                    sellerSave.save(function (err, newSellerSave) {
                                      if (err) return res.sendStatus(500);
                                      else return res.send(newSellerSave);
                                    })
                                  }
                                });
                              }
                            }
                          })
                        }
                      })
                    }
                  })
                }
              })
            } else if (req.query.Body.toLowerCase() === ('no' || 'nope')) {
              console.log('seller replied no');
              Showing.findById(seller.queue[0].showing, function (err, showing) {
                if (err) {
                  console.log('err finding listing twilioCtrl', err);
                  return res.sendStatus(500);
                } else {
                  showing.status = 'cancelled';
                  showing.save(function (err, shovingSave) {
                    if (err) return res.sendStatus(500);
                    else {
                      client.messages.create({
                        to: seller.queue[0].buyersAgent.phoneNum,
                        from: '+' + listing.listingAgent.twilioNumber,
                        body: 'The showing time you requested for ' + listing.address + ' in ' + listing.city + ' does not work for the seller. Please choose a different time slot by going to: http://redrover.h8.rs/#/showingrequest/' + listing._id
                      }, function (err, data) {
                        if (err) return res.sendStatus(500);
                        else {
                          listing.timeSlotsUnavailable.push(seller.queue[0].showingTime);
                          listing.save(function (err, listingSave) {
                            if (err) {
                              console.log('err finding listing twilioCtrl', err);
                              return res.sendStatus(500);
                            } else {
                              seller.queue.splice(0, 1);
                              seller.save(function (err, sellerSave) {
                                if (err) return res.sendStatus(500);
                                else {
                                  if (sellerSave.queue.length > 0) {
                                    var time = {};
                                    var requestDate = new Date(sellerSave.queue[0].showingTime);

                                    if (requestDate.getHours() > 12) {
                                      time.hours = requestDate.getHours() - 12;
                                      time.minutes = requestDate.getMinutes();
                                      time.amPm = 'pm';
                                    } else if (requestDate.getHours() === 12) {
                                      time.hours = requestDate.getHours();
                                      time.minutes = requestDate.getMinutes();
                                      time.amPm = 'pm';
                                    } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
                                      time.hours = 12;
                                      time.minutes = requestDate.getMinutes();
                                      time.amPm = 'am';
                                    } else {
                                      time.hours = requestDate.getHours();
                                      time.minutes = requestDate.getMinutes();
                                      time.amPm = 'am';
                                    }
                                    if (requestDate.getMinutes() < 10) {
                                      time.minutes = '0' + requestDate.getMinutes();
                                    } else {
                                      time.minutes = requestDate.getMinutes();
                                    }
                                    client.messages.create({
                                      to: '+' + sellerSave.phoneNum,
                                      from: '+' + listing.listingAgent.twilioNumber,
                                      body: 'There is a showing request for your property at ' + listing.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + '. Will that work for you? (Please respond with "yes" or "no")'
                                    }, function (err, data) {
                                      if (err) {
                                        return res.status(500).send('failed to send');
                                      } else {
                                        sellerSave.queue[0].requestCount += 1;
                                        sellerSave.save(function (err, newSellerSave) {
                                          if (err) return res.sendStatus(500);
                                          else return res.send(newSellerSave);
                                        })
                                      }
                                    });
                                  }
                                }
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              })

            }
          }
        })
      } else {
        console.log('no seller found', senderNum);
        BuyersAgent.findOne({phoneNum: senderNum}, function (err, buyersAgent) {
          if (buyersAgent && buyersAgent.queue && buyersAgent.queue.length > 0) {
            console.log('found buyers agent', buyersAgent);
          }
          if (err) return res.sendStatus(500)
          else if (buyersAgent && buyersAgent.queue && buyersAgent.queue.length > 0) {
            Showing.findOne({_id: buyersAgent.queue[0].showingId}, function (err, showing) {
              if (err) return res.sendStatus(500)
              else {
                console.log('showing', showing);
                console.log('body', req.query.Body);
                showing.feedback = req.query.Body;
                showing.save(function (err, showingSave) {
                  console.log('showingSave', err, showingSave);
                  if (err) return res.sendStatus(500);
                  else {
                    buyersAgent.queue.splice(0, 1);
                    buyersAgent.save(function (err, buyersAgentSave) {
                      if (err) return res.sendStatus(500);
                      else {
                        console.log('buyersAgentSave', buyersAgentSave);
                        if (buyersAgentSave.queue && buyersAgentSave.queue.length > 0) {
                          BuyersAgent.findById(buyersAgentSave._id).populate('queue.listingId queue.showingId').exec(function (err, buyersAgentFind) {
                            if (err) return res.sendStatus(err);
                            else {
                              Listing.findById(buyersAgentSave.queue[0].listingId).populate('listingAgent').exec(function (err, listing) {
                                if (err) {
                                  console.log('err finding listing', err);
                                  return res.sendStatus(500);
                                } else {
                                  console.log('buyersAgentFind', buyersAgentFind);
                                  var time = {};
                                  var requestDate = new Date(buyersAgentFind.queue[0].showingId.timeSlot);
                                  if (requestDate.getHours() > 12) {
                                    time.hours = requestDate.getHours() - 12;
                                    time.minutes = requestDate.getMinutes();
                                    time.amPm = 'pm';
                                  } else if (requestDate.getHours() === 12) {
                                    time.hours = requestDate.getHours();
                                    time.minutes = requestDate.getMinutes();
                                    time.amPm = 'pm';
                                  } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
                                    time.hours = 12;
                                    time.minutes = requestDate.getMinutes();
                                    time.amPm = 'am';
                                  } else {
                                    time.hours = requestDate.getHours();
                                    time.minutes = requestDate.getMinutes();
                                    time.amPm = 'am';
                                  }
                                  if (requestDate.getMinutes() < 10) {
                                    time.minutes = '0' + requestDate.getMinutes();
                                  } else {
                                    time.minutes = requestDate.getMinutes();
                                  }
                                  client.messages.create({
                                    to: buyersAgentFind.phoneNum,
                                    from: '+' + listing.listingAgent.twilioNumber,
                                    body: 'Please text me some feedback on your show of ' + buyersAgentFind.queue[0].listingId.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + '. Thank you.'
                                  }, function (err, data) {
                                    if (err) {
                                      return res.sendStatus(500);
                                    } else {
                                      buyersAgentFind.queue[0].timeFeedbackRequested = new Date();
                                      buyersAgentFind.queue[0].requestCount += 1;
                                      console.log(buyersAgentFind.queue[0].requestCount);
                                      buyersAgentFind.save(function (err, result) {
                                        if (err) {
                                          console.log('problem saving buyersAgent queue in requestBuyersAgentFeedback', err);
                                          return res.sendStatus(500);
                                        } else {
                                          console.log('saved new time correctly', result);
                                          return res.send(result);
                                        }
                                      })
                                    }
                                  })
                                }
                              })
                            }
                          })
                        }
                      }
                    })
                  }
                })
              }
            })
          } else {
            console.log('nothing in sellers or buyers agent queue and they texted');
            return;
          }
        })
      }
    })
  },

  sendRequestToSellerFromQueue: function (seller, listing) {
    console.log('sending request from sendRequestToSellerFromQueue');
    var time = {};
    var requestDate = new Date(seller.queue[0].showingTime);
    if (requestDate.getHours() > 12) {
      time.hours = requestDate.getHours() - 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 12) {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
      time.hours = 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    } else {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    }
    if (requestDate.getMinutes() < 10) {
      time.minutes = '0' + requestDate.getMinutes();
    } else {
      time.minutes = requestDate.getMinutes();
    }
    client.messages.create({
      to: '+' + seller.phoneNum,
      from: '+' + listing.listingAgent.twilioNumber,
      body: 'There is a showing request for your property at ' + seller.queue[0].listingId.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + '. Will that work for you? (Please respond with "yes" or "no")'
    }, function (err, data) {
      if (err) {
        return err;
      } else {
        seller.timeRequested = new Date();
        if (seller.queue[0].requestCount === 0) {
          seller.queue[0].requestCount = 1;
        } else {
          seller.queue[0].requestCount += seller.queue[0].requestCount;
        }
        seller.save(function (err, sellerSave) {
          if (err) return err;
          else {
            console.log('sellerSave', sellerSave);
            return sellerSave;
          }
        })
      }
    });
  },

  requestBuyersAgentFeedback: function (buyersAgent) {
    console.log('requesting feedback from buyersAgent 557', buyersAgent.queue[0].timeFeedbackRequested);
    var time = {};
    var requestDate = new Date(buyersAgent.queue[0].showingId.timeSlot);
    if (requestDate.getHours() > 12) {
      time.hours = requestDate.getHours() - 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 12) {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
      time.hours = 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    } else {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    }
    if (requestDate.getMinutes() < 10) {
      time.minutes = '0' + requestDate.getMinutes();
    } else {
      time.minutes = requestDate.getMinutes();
    }
    client.messages.create({
      to: buyersAgent.phoneNum,
      from: '+' + buyersAgent.queue[0].listingId.listingAgent.twilioNumber,
      body: 'Please text me some feedback on your showing of ' + buyersAgent.queue[0].listingId.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + '. Thank you.'
    }, function (err, data) {
      if (err) {
        return false;
      } else {
        buyersAgent.queue[0].timeFeedbackRequested = new Date();
        if (buyersAgent.queue[0].requestCount === 0) {
          buyersAgent.queue[0].requestCount = 1
        } else {
          buyersAgent.queue[0].requestCount += buyersAgent.queue[0].requestCount;
        }
        buyersAgent.save(function (err, result) {
          if (err) {
            console.log('problem saving buyersAgent queue in requestBuyersAgentFeedback', err);
            return false;
          } else {
            console.log('saved new time correctly', result);
            return true;
          }
        })
      }
    })
  },

  showingCancelationNoticeToBuyersAgent: function (req, res, next) {
    console.log('sending cancelation to buysers agent');
    Showing.findById(req.body.showingId).populate('listing buyersAgent').exec(function (err, showing) {
      if (err) {
        console.log('error finding showing', err);
        return res.sendStatus(500);
      } else {
        console.log('found showing to cancel', showing);
        User.findById(showing.listing.listingAgent, function (err, listingAgent) {
          if (err) {
            console.log('error finding listing agent', err);
            return res.status(500).send(err);
          } else {
            console.log('listingAgent', listingAgent)
            var time = {};
            var requestDate = new Date(req.body.showTime);
            if (requestDate.getHours() > 12) {
              time.hours = requestDate.getHours() - 12;
              time.minutes = requestDate.getMinutes();
              time.amPm = 'pm';
            } else if (requestDate.getHours() === 12) {
              time.hours = requestDate.getHours();
              time.minutes = requestDate.getMinutes();
              time.amPm = 'pm';
            } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
              time.hours = 12;
              time.minutes = requestDate.getMinutes();
              time.amPm = 'am';
            } else {
              time.hours = requestDate.getHours();
              time.minutes = requestDate.getMinutes();
              time.amPm = 'am';
            }
            if (requestDate.getMinutes() < 10) {
              time.minutes = '0' + requestDate.getMinutes();
            } else {
              time.minutes = requestDate.getMinutes();
            }
            client.messages.create({
              to: showing.buyersAgent.phoneNum,
              from: '+' + listingAgent.twilioNumber,
              body: 'The showing you requested for ' + showing.listing.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + ' has been cancelled by the seller. Please go to http://redrover.h8.rs/?#/showingrequest/' + req.body.listingId + ' to schedule another showing. Thank you.'
            }, function (err, data) {
              if (err) {
                console.log('error sending message to buyers agent', err);
                return res.sendStatus(500);
              } else {
                console.log('sent message to buyersAgent');
                Seller.findById(showing.listing.seller, function (err, seller) {
                  if (err) return res.sendStatus(500);
                  else {
                    console.log('found seller', seller);
                    if (seller.queue && seller.queue.length > 0) {
                      console.log('found seller queue', seller.queue);
                      for (var i = seller.queue.length - 1; i >= 0; i--) {
                        console.log(seller.queue[i].showing.toString(), req.body.showingId.toString());
                        if (seller.queue[i].showing.toString() === req.body.showingId.toString()) {
                          seller.queue.splice(i, 1);
                        }
                      }
                      console.log('seller queue spliced');
                      seller.save(function (err, sellerSave) {
                        if (err) return res.sendStatus(500);
                        else {
                          showing.status = 'cancelled';
                          showing.save(function (err, showingSave) {
                            if (err) {
                              console.log('err saving showing', err);
                              return res.sendStatus(500);
                            }
                            else {
                              console.log('saved showing', showingSave);
                              return res.send(showingSave);
                            }
                          })
                        }
                      })
                    } else {
                      console.log('no seller queue');
                      showing.status = 'cancelled';
                      showing.save(function (err, showingSave) {
                        if (err) {
                          console.log('err saving showing', err);
                          return res.sendStatus(500);
                        }
                        else {
                          console.log('saved showing', showingSave);
                          return res.send(showingSave);
                        }
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  },

  resetPassword: function (req, res) {
    console.log(req.body.phoneNum);
    User.findOne({phoneNum: req.body.phoneNum}).exec(function (err, user) {
      if (err) {
        console.log('error finding user', err);
        return res.status(500).send(err)
      }
      else if (user) {
        console.log('found user', user.phoneNum);
        client.messages.create({
          to: '+' + user.phoneNum,
          from: '+14352169949',
          body: 'http://redrover.h8.rs/?#/changepassword/' + user._id,
        }, function (err, data) {
          console.log(err, data);
          if (err) {
            console.log('err sending link to buyers agent', err);
            return res.status(500).send('failed to send');
          } else {
            console.log('successfully sent password reset link to buyers agent');
            return res.json(data);
          }
        });
      } else {
        return res.send(false);
      }
    })
  },

  sendDenialToBuyersAgent: function (seller, listing) {
    var dfd = q.defer();
    var time = {};
    var requestDate = new Date(seller.queue[0].showingTime);
    if (requestDate.getHours() > 12) {
      time.hours = requestDate.getHours() - 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 12) {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
      time.hours = 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    } else {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    }
    if (requestDate.getMinutes() < 10) {
      time.minutes = '0' + requestDate.getMinutes();
    } else {
      time.minutes = requestDate.getMinutes();
    }
    client.messages.create({
      to: seller.queue[0].buyersAgent.phoneNum,
      from: '+' + listing.listingAgent.twilioNumber,
      body: 'We cannot get ahold of the seller to see if the showing time you requested for ' + seller.queue[0].listingId.address + ' in ' + seller.queue[0].listingId.city + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + ' works for them. Please choose a different time slot and try again by going to: http://redrover.h8.rs/#/showingrequest/' + seller.queue[0].listingId._id
    }, function (err, data) {
      if (err) return dfd.reject(err);
      else {
        client.messages.create({
          to: '+' + seller.phoneNum,
          from: '+' + listing.listingAgent.twilioNumber,
          body: 'We attempted to contact you concerning the showing request for your property at ' + seller.queue[0].listingId.address + ' on ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + ', but we could not get ahold of you so we will cancel this showing request and they can try to set up another time so see your house. Thank you.'
        }, function (err, data) {
          if (err) {
            return dfd.reject(err);
          } else {
            return dfd.resolve(true);
          }
        });
      }
    })
    return dfd.promise;
  },

  sendCancellationForFeedbackRequestToBuyersAgent: function (buyersAgent) {
    var dfd = q.defer();
    var time = {};
    var requestDate = new Date(buyersAgent.queue[0].showingId.timeSlot);
    if (requestDate.getHours() > 12) {
      time.hours = requestDate.getHours() - 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 12) {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'pm';
    } else if (requestDate.getHours() === 0 || requestDate.getHours() === 24) {
      time.hours = 12;
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    } else {
      time.hours = requestDate.getHours();
      time.minutes = requestDate.getMinutes();
      time.amPm = 'am';
    }
    if (requestDate.getMinutes() < 10) {
      time.minutes = '0' + requestDate.getMinutes();
    } else {
      time.minutes = requestDate.getMinutes();
    }
    client.messages.create({
      to: buyersAgent.phoneNum,
      from: '+' + buyersAgent.queue[0].listingId.listingAgent.twilioNumber,
      body: 'We have attempted to contact you four times for feedback for your showing of ' + buyersAgent.queue[0].listingId.address + ' at ' + dayArray[requestDate.getDay()] + ', ' + monthArray[requestDate.getMonth()] + ' ' + requestDate.getDate() + ', ' + requestDate.getFullYear() + ' at ' + (time.hours - 2) + ':' + time.minutes + time.amPm + ' and haven\'t heard back from you so we are canceling the request for feedback for this showing. Please do not respond to that request. Thank you for your time.'
    }, function (err, data) {
      if (err) return dfd.reject(err);
      else return dfd.resolve(true);
    });
    return dfd.promise;
  },

  sendUrlToSeller: function (req, res) {
    console.log('hit seller Url twilio', req.body);
    Listing.findOne({_id: req.body.listingId}).populate('seller listingAgent').exec(function (err, listing) {
      // console.log('listing.seller.phoneNum: ', listing.seller.phoneNum);
      // console.log('listing', listing);
      // console.log('listing Agent Number', listing.listingAgent.twilioNumber);
      client.messages.create({
        to: listing.seller.phoneNum,
        from: '+' + listing.listingAgent.twilioNumber,
        body: 'Showing and feedback details:' + req.body.url,
      }, function (err, data) {
        if (err) return res.sendStatus(500);
        else {
          console.log(data);
          res.send('success')
        }
      })
    })
  }
};
// }
