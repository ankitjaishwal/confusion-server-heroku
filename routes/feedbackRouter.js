const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const Feedbacks = require('../models/feedback');
var authenticate = require('../authenticate');

const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
/*.get(cors.cors, (req, res, next) => {
    Feedbacks.find(req.query)
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})*/
.get(cors.cors, (req, res, next) => {
    const page = req.query.page;
    const limit = 2;
    const start = (page - 1) * limit;
    const end = page * limit;

    Feedbacks.find().limit(limit).skip(start)
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, (req, res, next) => {
    if(req.body != null) {
        Feedbacks.create(req.body)
        .then((comments) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(comments);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error("Feedback not found in request body");
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /feedbacks`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Feedbacks.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err) => next(err));
})

module.exports = feedbackRouter;