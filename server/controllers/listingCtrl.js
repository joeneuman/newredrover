var Listing = require('../models/listingModel.js');
var Seller = require('../models/sellerModel');
var Showing = require('../models/showingModel');
// var http = require('http');
var request = require('request');
var q = require('q');

module.exports = {

  cancelShowing: function(req, res, next) {
    console.log(req.body);
    Listing.findById(req.body.listingId, function(err, listing) {
      if (err) return res.sendStatus(500);
      else {
        listing.showings.map(function(showing, index) {
          if (showing.toString() === req.body.showingId.toString()) {
            listing.showings.splice(index, 1);
          }
        })
        listing.timeSlotsUnavailable.push(req.body.timeSlot);
        listing.save(function(err, listingSave) {
          if (err) return res.sendStatus(500);
          else {
            Showing.findById(req.body.showingId, function(err, showing) {
              if (err) return res.sendStatus(500);
              else {
                showing.status = 'cancelled';
                showing.save(function(err, showingSave) {
                  if (err) return res.sendStatus(500);
                  else return res.send(listingSave);
                })
              }
            })
          }
        })
      }
    })
  },

  create: function (req, res, next) {
    Seller.find({phoneNum: req.body.sellerPhone}, function (err, seller) {
      if (err) res.sendStatus(500);
      else if (seller.length > 0) {
        var newListing = new Listing();
        newListing.agent = req.body.agent;
        newListing.address = req.body.address;
        newListing.city = req.body.city;
        newListing.price = req.body.price;
        newListing.mlsId = req.body.mlsId;
        newListing.seller = seller._id;
        newListing.picture = req.body.picture;
        newListing.save(function (err, listing) {
          if (err) res.sendStatus(500);
          else res.send(listing);
        });
      } else {
        var newSeller = new Seller();
        newSeller.sellerName.firstName = req.body.sellerName;
        newSeller.phoneNum = req.body.sellerPhone;
        newSeller.queue = [];
        newSeller.save(function (err, result) {
          if (err) res.sendStatus(500);
          else {
            var newListing = new Listing();
            newListing.agent = req.body.agent;
            newListing.address = req.body.address;
            newListing.city = req.body.city;
            newListing.price = req.body.price;
            newListing.mlsId = req.body.mlsId;
            newListing.seller = newSeller._id;
            newListing.picture = req.body.picture;
            newListing.save(function (err, listing) {
              if (err) res.sendStatus(500);
              else res.send(listing);
            })
          }
        });
      }
    });
  },

  updateListing: function(req, res, next) {
    return res.send();
  },


  getListingById: function (req, res) {
    // console.log("get listing by id", req.body);
    Listing
      .findById(req.params.id).populate('listingAgent seller showings').exec(function (err, listing) {
      if (err) {
        res.status(500).send(err);
      } else {
        var options = {
          path: 'showings.buyersAgent',
          model: 'buyersagents'
        }
        Listing.populate(listing, options, function(err, listingPopulated) {
          if (err) return res.sendStatus(500);
          else return res.send(listingPopulated);
        })
      }
    });
  },

  getListingsByAgent: function (req, res) {
    console.log('getListingsByAgent called: req.params._id', req.params._id);
    // const page = parseInt(req.query.page);
    // const amount = parseInt(req.query.amount);
    //localhost:3000/books?page=3&amount=4 === 8
    Listing //page = 3 - 1 * amount = 50 = skip = 100
    //(page # - 1)(amount)
    //localhost:3000
    //     .find({agent: req.query.agent})
    //   .find({agent: req.params._id})
      .find({listingAgentId: req.params._id})
      .populate('seller showings')
      .sort({price: -1}) //dateCreated, ascending price: 1
      .skip()//skips the first 2.
      .where('active').equals(true)
      //skip(( req.query.page-1 ) * req.query.amount)
      //skip(( page - 1) * amount)
      .limit()//retrieving 2 listings.
      //limit(req.query.amount
      .exec(function (err, listings) {
        if (err) {
          res.status(500).send(err);
        } else {
          var options = {
            path: 'showings.buyersAgent',
            model: 'buyersagents'
          };
          Listing.populate(listings, options, function(err, listingPopulated) {
            if (err) return res.sendStatus(500);
            else return res.send(listingPopulated);
          })
        }
      });
  },

  cancelTimeslot: function (req, res, next) {
    if (req.body.showingId) {
      Listing.findById(req.body.listingId, function(err, listing) {
        if (err) return res.sendStatus(500);
        else {
          listing.timeSlotsUnavailable.push(req.body.showTime)
          listing.save(function(err, listingSave) {
            if (err) return res.sendStatus(500);
            else return next();
          })
        }
      })
    } else {
      Listing.findById(req.body.listingId, function(err, listing) {
        if (err) return res.sendStatus(500);
        else {
          listing.timeSlotsUnavailable.push(req.body.showTime)
          listing.save(function(err, listingSave) {
            if (err) return res.sendStatus(500);
            else return res.send(listingSave);
          })
        }
      })
    }
  },

  uncancelTimeslot: function(req, res, next) {
    Listing.findById(req.body.listingId, function(err, listing) {
      if (err) return res.sendStatus(500);
      else {
        for (i = listing.timeSlotsUnavailable.length -1; i >= 0; i--) {
          if (new Date(listing.timeSlotsUnavailable[i]).getTime() === new Date(req.body.showTime).getTime()) {
            listing.timeSlotsUnavailable.splice(i, 1);
          }
        }
        listing.save(function(err, listingSave) {
          if (err) return res.sendStatus(500);
          else return res.send(listingSave);
        });
      }
    })
  },

  confirmSellerConnection: function (req, res, next) {
    Listing.findById(req.params._id, function (err, listing) {
      if (err) res.sendStatus(500);
      else {
        listing.seller = req.params.seller;
        listing.save(function (err, result) {
          if (err) res.sendStatus(500);
          else res.send(result);
        });
      }
    });
  }

  ,

  removeSellerConnection: function (req, res, next) {
    Listing.findById(req.params._id, function (err, listing) {
      listing.seller = null;
      listing.save(function (err, result) {
        if (err) res.sendStatus(500);
        else res.send(result);
      });
    });
  }
  ,

  addListingAgreement: function (req, res, next) {
    Listing.findById(req.params._id, function (err, listing) {
      listing.agreement = req.body.agreement;
      listing.save(function (err, result) {
        if (err) res.sendStatus(500);
        else res.send(result);
      });
    });
  }
  ,

  delete: function (req, res, next) {
    Listing.findByIdAndRemove(req.params._id, function (err, listing) {
      if (err) res.sendStatus(500);
      else res.send(listing);
    });
  }

  ,

  getListingsFromServer: function (req, res, next) {
    request({
      method: 'POST',
      // , uri: 'http://mikeal.iriscouch.com/testjs/' + rand
      // uri: 'http://104.236.170.136/washington/webservices/agents.php',
      uri: 'http://104.236.170.136/washington/webservices/agents.php?agent_id=' + req.user.agentId + '&mls_id=' + req.user.mls,
      header: {'content-type': 'application/x-www-form-urlencoded;'},
    }, function (error, response, body) {
      if (error) res.sendStatus(500);
      else {
        var agentMLSListings = JSON.parse(body).data;
        if (agentMLSListings) {
          agentMLSListings.map(function (MLSListing) {
            Listing.findOne({listingId: MLSListing.ListingID}, function (err, listing) {
              if (err) res.sendStatus(500);
              else if (listing) {
                listing.address = '';
                if (MLSListing.HouseNumber) {
                  listing.address += MLSListing.HouseNumber;
                }
                if (MLSListing.StreetDirectionPfx) {
                  listing.address += ' ' + MLSListing.StreetDirectionPfx;
                }
                if (MLSListing.StreetName) {
                  listing.address += ' ' + MLSListing.StreetName;
                }
                if (MLSListing.StreetDirectionSfx) {
                  listing.address += ' ' + MLSListing.StreetDirectionSfx;
                }
                if (MLSListing.Unit) {
                  listing.address += ' ' + MLSListing.Unit;
                }
                listing.active = true;
                listing.city = MLSListing.City;
                listing.state = MLSListing.StateProvince;
                listing.postalCode = MLSListing.PostalCode;
                listing.price = MLSListing.ListPrice;
                listing.taxId = MLSListing.TaxID;
                listing.mlsId = MLSListing.MLSIdentifier;
                listing.listingId = MLSListing.ListingID;
                listing.listingAgentId = MLSListing.AgentID;
                listing.listingAgent = req.user._id;
                listing.picture = MLSListing.image;
                listing.lotAcres = MLSListing.LotAcres;
                listing.yearBuilt = MLSListing.YearBuilt;
                listing.exterior = MLSListing.Exterior;
                listing.basementSqFt = MLSListing.Levels;
                listing.totalBedRooms = MLSListing.TotalBedrooms;
                listing.totalBathRooms = MLSListing.TotalBathrooms;
                listing.mainSqFt = MLSListing.MainSqFt;
                listing.levels = MLSListing.Levels;
                listing.zoning = MLSListing.Zoning;
                listing.garageParking = MLSListing.GarageParking;
                listing.garageCapacity = MLSListing.GarageCapacity;
                listing.publicRemarks = MLSListing.PublicRemarks;
                listing.privateRemarks = MLSListing.PrivateRemarks;
                listing.listingClass = MLSListing.ListingClass;
                listing.heating = MLSListing.Heating;
                listing.airCondtioning = MLSListing.AirConditioning;
                listing.save(function (err, listingSave) {
                  if (err) return;
                  else {
                    return;
                  }
                })
              } else {
                var newListing = new Listing();
                newListing.address = '';
                if (MLSListing.HouseNumber) {
                  newListing.address += MLSListing.HouseNumber;
                }
                if (MLSListing.StreetDirectionPfx) {
                  newListing.address += ' ' + MLSListing.StreetDirectionPfx;
                }
                if (MLSListing.StreetName) {
                  newListing.address += ' ' + MLSListing.StreetName;
                }
                if (MLSListing.StreetDirectionSfx) {
                  newListing.address += ' ' + MLSListing.StreetDirectionSfx;
                }
                if (MLSListing.Unit) {
                  newListing.address += ' ' + MLSListing.Unit;
                }
                newListing.active = true;
                newListing.city = MLSListing.City;
                newListing.state = MLSListing.StateProvince;
                newListing.postalCode = MLSListing.PostalCode;
                newListing.price = MLSListing.ListPrice;
                newListing.taxId = MLSListing.TaxID;
                newListing.mlsId = MLSListing.MLSIdentifier;
                newListing.listingId = MLSListing.ListingID;
                newListing.listingAgentId = MLSListing.AgentID;
                newListing.listingAgent = req.user._id;
                newListing.picture = MLSListing.image;
                newListing.lotAcres = MLSListing.LotAcres;
                newListing.yearBuilt = MLSListing.YearBuilt;
                newListing.exterior = MLSListing.Exterior;
                newListing.basementSqFt = MLSListing.Levels;
                newListing.totalBathRooms = MLSListing.TotalBathrooms;
                newListing.totalBedRooms = MLSListing.TotalBedrooms;
                newListing.mainSqFt = MLSListing.MainSqFt;
                newListing.levels = MLSListing.Levels;
                newListing.zoning = MLSListing.Zoning;
                newListing.garageParking = MLSListing.GarageParking;
                newListing.garageCapacity = MLSListing.GarageCapacity;
                newListing.publicRemarks = MLSListing.PublicRemarks;
                newListing.privateRemarks = MLSListing.PrivateRemarks;
                newListing.listingClass = MLSListing.ListingClass;
                newListing.heating = MLSListing.Heating;
                newListing.airConditioning = MLSListing.AirConditioning;
                newListing.save(function (err, newListingSave) {
                  if (err) return;
                  else {
                    return;
                  }
                });
              }


            })
          })
          req.agentMLSListings = agentMLSListings
          next();
        } else {
          next();
        }
      }
    })
  },
  updateListingAgentListings: function (user) {
    var dfd = q.defer();
    request({
      method: 'POST',
      // , uri: 'http://mikeal.iriscouch.com/testjs/' + rand
      // uri: 'http://104.236.170.136/washington/webservices/agents.php',
      uri: 'http://104.236.170.136/washington/webservices/agents.php?agent_id=' + user.agentId + '&mls_id=' + user.mls,
      header: {'content-type': 'application/x-www-form-urlencoded;'},
    }, function (error, response, body) {
      if (error) return error;
      else {
        var agentMLSListings = JSON.parse(body).data;
        if (agentMLSListings) {
          agentMLSListings.map(function (MLSListing) {
            Listing.findOne({listingId: MLSListing.ListingID}, function (err, listing) {
              if (err) res.sendStatus(500);
              else if (listing) {
                listing.address = '';
                if (MLSListing.HouseNumber) {
                  listing.address += MLSListing.HouseNumber;
                }
                if (MLSListing.StreetDirectionPfx) {
                  listing.address += ' ' + MLSListing.StreetDirectionPfx;
                }
                if (MLSListing.StreetName) {
                  listing.address += ' ' + MLSListing.StreetName;
                }
                if (MLSListing.StreetDirectionSfx) {
                  listing.address += ' ' + MLSListing.StreetDirectionSfx;
                }
                if (MLSListing.Unit) {
                  listing.address += ' ' + MLSListing.Unit;
                }
                listing.active = true;
                listing.city = MLSListing.City;
                listing.state = MLSListing.StateProvince;
                listing.postalCode = MLSListing.PostalCode;
                listing.price = MLSListing.ListPrice;
                listing.taxId = MLSListing.TaxID;
                listing.mlsId = MLSListing.MLSIdentifier;
                listing.listingId = MLSListing.ListingID;
                listing.listingAgentId = MLSListing.AgentID;
                listing.listingAgent = user._id;
                listing.picture = MLSListing.image;
                listing.lotAcres = MLSListing.LotAcres;
                listing.yearBuilt = MLSListing.YearBuilt;
                listing.exterior = MLSListing.Exterior;
                listing.basementSqFt = MLSListing.Levels;
                listing.totalBedRooms = MLSListing.TotalBedrooms;
                listing.totalBathRooms = MLSListing.TotalBathrooms;
                listing.mainSqFt = MLSListing.MainSqFt;
                listing.levels = MLSListing.Levels;
                listing.zoning = MLSListing.Zoning;
                listing.garageParking = MLSListing.GarageParking;
                listing.garageCapacity = MLSListing.GarageCapacity;
                listing.publicRemarks = MLSListing.PublicRemarks;
                listing.privateRemarks = MLSListing.PrivateRemarks;
                listing.listingClass = MLSListing.ListingClass;
                listing.heating = MLSListing.Heating;
                listing.airCondtioning = MLSListing.AirConditioning;
                listing.save(function (err, listingSave) {
                  if (err) return err;
                  else {
                    return listingSave;
                  }
                })
              } else {
                var newListing = new Listing();
                newListing.address = '';
                if (MLSListing.HouseNumber) {
                  newListing.address += MLSListing.HouseNumber;
                }
                if (MLSListing.StreetDirectionPfx) {
                  newListing.address += ' ' + MLSListing.StreetDirectionPfx;
                }
                if (MLSListing.StreetName) {
                  newListing.address += ' ' + MLSListing.StreetName;
                }
                if (MLSListing.StreetDirectionSfx) {
                  newListing.address += ' ' + MLSListing.StreetDirectionSfx;
                }
                if (MLSListing.Unit) {
                  newListing.address += ' ' + MLSListing.Unit;
                }
                newListing.active = true;
                newListing.city = MLSListing.City;
                newListing.state = MLSListing.StateProvince;
                newListing.postalCode = MLSListing.PostalCode;
                newListing.price = MLSListing.ListPrice;
                newListing.taxId = MLSListing.TaxID;
                newListing.mlsId = MLSListing.MLSIdentifier;
                newListing.listingId = MLSListing.ListingID;
                newListing.listingAgentId = MLSListing.AgentID;
                newListing.listingAgent = user._id;
                newListing.picture = MLSListing.image;
                newListing.lotAcres = MLSListing.LotAcres;
                newListing.yearBuilt = MLSListing.YearBuilt;
                newListing.exterior = MLSListing.Exterior;
                newListing.basementSqFt = MLSListing.Levels;
                newListing.totalBathRooms = MLSListing.TotalBathrooms;
                newListing.totalBedRooms = MLSListing.TotalBedrooms;
                newListing.mainSqFt = MLSListing.MainSqFt;
                newListing.levels = MLSListing.Levels;
                newListing.zoning = MLSListing.Zoning;
                newListing.garageParking = MLSListing.GarageParking;
                newListing.garageCapacity = MLSListing.GarageCapacity;
                newListing.publicRemarks = MLSListing.PublicRemarks;
                newListing.privateRemarks = MLSListing.PrivateRemarks;
                newListing.listingClass = MLSListing.ListingClass;
                newListing.heating = MLSListing.Heating;
                newListing.airConditioning = MLSListing.AirConditioning;
                newListing.save(function (err, newListingSave) {
                  if (err) return err;
                  else {
                    return newListingSave;
                  }
                });
              }
            })
          })
          return dfd.resolve(agentMLSListings);
        } else {
          return dfd.reject(false);
        }
      }
    })
    return dfd.promise;
  },

  setListingStatusOnLogin: function(req, res, next) {
    if (req.agentMLSListings) {
      Listing.find({listingAgent: req.user._id}, function(err, listings) {
        if (err) {
          console.log('error finding listings', err);
          return err;
        } else {
          var arrayHolder = listings.reduce(function(prev, curr, index, array) {
            var truthy = false;
            req.agentMLSListings.map(function(MLSListing) {
              if (MLSListing.ListingID === curr.listingId) {
                truthy = true;
              }
            })
            if (!truthy) {
              prev.push(curr);
              return prev;
            } else {
              return prev;
            }
          }, [])
          arrayHolder.map(function(listingToUpdate) {
            Listing.findById({_id: listingToUpdate._id}, function(err, listingHere) {
              if (err) {
                console.log('err finding listing', err);
                return err;
              } else {
                listingHere.active = false;
                listingHere.save(function(err, result) {
                  if (err) {
                    console.log('err finding listing', err);
                    return err;
                  } else {
                    return result;
                  }
                })
              }
            })
          })
          next();
        }
      })
    } else {
      next();
    }
    
  },

  setListingStatus: function(user, agentMLSListings) {
    Listing.find({listingAgent: user._id}, function(err, listings) {
      if (err) {
        console.log('error finding listings', err);
        return err;
      } else {
        var arrayHolder = listings.reduce(function(prev, curr, index, array) {
          var truthy = false;
          agentMLSListings.map(function(MLSListing) {
            if (MLSListing.ListingID === curr.listingId) {
              truthy = true;
            }
          })
          if (!truthy) {
            prev.push(curr);
            return prev;
          } else {
            return prev;
          }
        }, [])
        arrayHolder.map(function(listingToUpdate) {
          Listing.findById({_id: listingToUpdate._id}, function(err, listingHere) {
            if (err) {
              console.log('err finding listing', err);
              return err;
            } else {
              listingHere.active = false;
              listingHere.save(function(err, result) {
                if (err) {
                  console.log('err finding listing', err);
                  return err;
                } else {
                  return result;
                }
              })
            }
          })
        })
      }
    })
  },

  getAllListings: function() {
    var dfd = q.defer();
    Listing.find().exec(function(err, listings) {
      if (err) return dfd.reject(err);
      else return dfd.resolve(listings);
    })
    return dfd.promise;
  }
}