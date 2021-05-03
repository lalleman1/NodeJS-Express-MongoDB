const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
// GET: When the user does a GET operation on '/favorites', retrieve the favorite document for that user using Favorite.find(),
// passing to the find method the object { user: req.user._id } as its only argument. To the retrieved favorite document,
// chain two populate() methods to populate the user and campsites refs. To the res object, set an appropriate Content-Type header
// and a status code of 200. Return the favorite document using the res.json() method with the appropriate argument. 
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({
        user: req.user._id
    })
    .populate('favorites.user')
    .populate('favorites.campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader = ('Content-Type', 'application/json');
        res.json(favorite)
    })
    .catch(err => next(err));
})


//POST to /favorites: When the user does a POST operation on '/favorites' by including a message in the format of
// [{"_id":"campsite ObjectId"},  . . . , {"_id":"campsite ObjectId"}] in the body of the message (see Testing section for example),
// you will check if the user has an associated favorite document. Use Favorite.findOne({user: req.user._id }) for this.
//Then, check if the favorite document exists:
//If so, then you will check which campsites in the request body are already in the campsites array of the favorite document,
// if any, and you will only add to the document those that are not already there. There are various ways to conduct this check.
// The use of JavaScript array methods forEach, includes, and push can help you with this task.  
//If there is no favorite document for the user, you will create a favorite document for the user and add the campsite IDs from the request body to the campsites array for the document.
// Save the favorite document, set the response Content-Type header and a status code of 200, and send the response back using res.json() with the favorite document as its argument.   
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if (!favorite.campsites._id.includes(fav._id)) {
                    favorite.campsites.push(fav._id);
                }
            });
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
            })
            .catch(err => next(err));
            } else {
                Favorite.create({ user: req.user._id })
                .then(favorite => {
                    req.body.forEach(fav => {
                        if(!favorite.campsites.includes(fav._id)) {
                            favorite.campsites.push(fav._id);
                        }
                    });
                    favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favorite);
                    })
                    .catch(err => next(err));
                })
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
    })


//Unsupported: For the GET request to '/favorites/:campsiteId' and the PUT request to '/favorites' and '/favorites/:campsiteId',
// return a response with a status code of 403 and a message that the operation is not supported.
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})


//DELETE to /favorites: When the user performs a DELETE operation on '/favorites', 
//use findOneAndDelete to locate the favorite document corresponding to this user and delete it. 
//For the response, set a status code of 200. If a favorite document was found, then set the Content-Type header to "application/json" 
//and return the favorite document with res.json(). If no favorite document was found,
// then set the Content-Type header to 'text/plain' and use res.end() to send the response 'You do not have any favorites to delete.'
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain')
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
})




favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
//Unsupported: For the GET request to '/favorites/:campsiteId' and the PUT request to '/favorites' and '/favorites/:campsiteId',
// return a response with a status code of 403 and a message that the operation is not supported.
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites:campsiteId');
})


//POST to /favorites/:campsiteId: When the user performs a POST operation on '/favorites/:campsiteId',
// use findOne to locate the favorites document for the user. Then you will add the campsite specified in the URL parameter to the favorites.campsites array,
// if it's not already there. If the campsite is already in the array, then respond with a message
// saying "That campsite is already in the list of favorites!" If the user has not previously defined any favorites,
// then you will need to create a new Favorite document for this user and add the campsite to it. 
//Note: As a bonus challenge, you could add error checking to make sure that the campsiteId in the URL parameter corresponds to a valid campsite,
// but it is not required for this assignment. 
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId)
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Created', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That campsite is already in the list of favorites!');
            }
        } else {
            Favorite.create({ user: req.user._id, campsites: req.params.campsiteId})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        })
            


//Unsupported: For the GET request to '/favorites/:campsiteId' and the PUT request to '/favorites' and '/favorites/:campsiteId',
// return a response with a status code of 403 and a message that the operation is not supported.
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites:campsiteId');
})


// DELETE to /favorites/:campsiteId: When the user performs a DELETE operation on '/favorites/:campsiteId', 
//use findOne to find the favorites document for the user. 
//If it exists, delete the campsite in the URL parameter req.params.campsiteId from its campsites array. 
//There are multiple ways to approach this. Because you are deleting an element from an array and not a single document, 
//you can not use the findOneAndDelete method. 
//Instead, you could use a combination of indexOf and splice methods on the favorite.campsites array to remove the specified campsite. 
//Alternatively, you could use the filter array method.
// Afterward, save the document then return a response with a status code of 200, a Content-Type header of 'application/json', and the favorite document. 
//If no favorite document exists, return a response with a Content-Type header of 'text/plain' and a message that there are no favorites to delete.
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id})
    .then(favorite => {
        let campsiteIndex = favorite.campsites.indexOf(req.params.campsiteId);
        if(campsiteIndex !== -1) {
            favorite.campsites.splice(campsiteIndex, 1);
            favorite.save()
                .then((favorite) => {
                    console.log('Favorite Deleted', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
})




module.exports = favoriteRouter;