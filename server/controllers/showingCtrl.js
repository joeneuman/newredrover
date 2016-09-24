var Showing = require('../models/showingModel');
var Listing = require('../models/listingModel');
var q = require('q');

module.exports = {

    create: function (req, res, next) {
        var newShowing = new Showing();
        newShowing.listing = req.params._id;
        newShowing.buyersAgent = req.body._id;
        newShowing.dateCreated = new Date();
        newShowing.requestDate = req.body.requestDate;
        newShowing.save(function (err, result) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.send(result);
            }
        });
    },

    populateDatabaseWithShowings: function(req, res, next) {
        var newDateObj = new Date();
        for (i = 0; i <= 6; i++) {
            var showingDateFill = new Date(newDateObj.getFullYear(), newDateObj.getMonth(), newDateObj.getDate(), (i + 13), 0 );
            var newShowing = new Showing();
            newShowing.listing = req.params.id;
            newShowing.buyersAgent = req.body.buyersAgent;
            newShowing.dateCreated = newDateObj;
            newShowing.timeSlot = showingDateFill;
            newShowing.status = 'pending';
            newShowing.save(function (err, result) {
                if (err) {
                    res.sendStatus(500)
                } else {
                    Listing.findById(req.params.id, function(err, listing) {
                        if (err) return res.sendStatus(500);
                        else {
                            listing.showings.push(result._id);
                            listing.save(function(err, listingSave) {
                                if (err) return res.sendStatus(500);
                            })
                        }
                    })
                }
            });
        }
        return res.send(true);
        
    },
    
    
    getShowingsByListing: function(req, res, next) {
      Showing.findById(req.params._id, function(err, showing) {
          if (err) {
              res.sendStatus(500);
          }
          else {
              res.send(showing)
          }
      })  
    },

    confirmShowingRequest: function(req, res, next) {
        console.log('in confirmShowingRequest');
        console.log('in confirm server', req.body);
        Listing
            .findById(req.body.listingId)
            .populate('showings')
            .exec(function(err, listing) {
            if (err) res.sendStatus(500);
           /* else {
                console.log(req.body.requestCode, listing.randomNum);
                if (Number(req.body.requestCode) !== Number(listing.randomNum)) {
                    return res.send(false);
                } */else {
                    if (listing.showings && listing.showings.length > 0) {
                        console.log('code correct. checking if there is already a showing.');
                        for (var i = 0; i < listing.showings.length; i++) {
                            if (new Date(listing.showings[i].timeSlot).getTime() === new Date(req.body.timeSlot).getTime()) {
                                console.log('found a showing');
                                return res.send('already showing');
                            }
                        }
                    }
                    console.log('no showing found');
                    return next();
                }
            // }
        })
    },

    addFeedbackToShowing: function(req, res, next) {
        Showing.findById(req.params._id, function(err, showing) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                showing.feedback = req.body.feedback;
                showing.save(function(err, result) {
                    if (err) {
                        res.sendStatus(500);
                    }
                    else res.send(result)
                });
            }
        });
    },

    getShowingsPast: function() {
        var minutesPast = 15;
        var rightNow = new Date().getTime();
        var dfd = q.defer();
        Showing
            .find()
            .where('feedback').equals(null)
            .exec(function(err, showings) {
                if (err) {
                    console.log('error finding showing in getShowingsPast', err);
                    dfd.reject(false);
                } else if (showings.length > 0) {
                    var showingArray = [];
                    showings.map(function(showing) {
                        if (showing.status === 'pending' && new Date(showing.timeSlot).getTime() + 600000 <= rightNow) {
                            showing.status = 'cancelled';
                            showing.save(function(err, showingSave) {
                                if(err) {
                                    console.log('err saving cancelled showing');
                                } else {
                                    console.log('showing cancelled', showingSave);
                                }

                            })
                            return;
                        } else if (showing.status === 'confirmed' && new Date(showing.timeSlot).getTime() + (1000 * 60 * minutesPast) <= rightNow) {

                            showing.status = 'feedback-requested';
                            showing.save(function(err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            })
                            showingArray.push(showing);
                            return;
                        } else {
                            return;
                        }
                    })

                    dfd.resolve(showingArray);
                } else {
                    // console.log('no showings found in getShowingsPast', showings);
                    dfd.reject(false);
                }
            })
        return dfd.promise;
    },

    delete: function(req, res, next) {
        Showing.findByIdAndRemove(req.params._id, function(err, showing) {
            if (err) res.sendStatus(500);
            else res.send(showing);
        });
    }
};