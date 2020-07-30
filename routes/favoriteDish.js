const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');

const favDishRouter = express.Router();

favDishRouter.use(bodyParser.json());

favDishRouter.route('/')
.all(authenticate.verifyUser)
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('dishes')
    .populate('user')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite == null) {
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                for (const i in req.body) {
                    //console.log(req.body[i]);
                    favorite.dishes.push(req.body[i]);
                }
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => next(err));
            }) 
            .catch((err) => next(err));
        }
        else {
            for (const i in req.body) {
                if(favorite.dishes.indexOf(req.body[i]) < 0) {
                    //console.log(req.body[i]);
                    favorite.dishes.push(req.body[i]);
                }  
            }
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('favorite Added ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
            })
            .catch((err) => next(err)); 
        }
    })
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /leaders`);
})
.delete(cors.corsWithOptions, (req,res,next) =>{
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err) => next(err));
})

favDishRouter.route('/:dishId')
.all(authenticate.verifyUser)
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite == null) {
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => next(err));
            }) 
            .catch((err) => next(err));
        }
        else {
            if(favorite.dishes.indexOf(req.params.dishId) < 0) {
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('favorite added ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => next(err));
            } 
            else {
                res.statusCode = 200;
                res.end("Favorite already added!!");
            }
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, (req,res,next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite == null) {
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(index > -1) {
            favorite.dishes.remove(req.params.dishId);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    console.log('favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    })
});

module.exports = favDishRouter;