const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors =require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

module.exports = favoriteRouter;

//	url: /favorites
favoriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {res.sendStatus(200);})

.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({userId: req.user._id})
	.populate('userId')
	.populate('dishes')
	.then((favorites) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(favorites);
	}, (err) => nex(err))
	.catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({userId: req.user._id})
	.then((favorites) => {
		// console.log(favorite);
		// console.log(favorite[0] == null);
		if (favorites[0] == null) {
			Favorites.create({userId: req.user._id})
			.then((favorite) => {
				for (var i = (req.body.length - 1); i>=0; i--) {
					favorite.dishes.push(req.body[i]._id);
				}
				favorite.save()
				.then((favorite) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					// console.log(favorite)
					res.json(favorite);
				}, (err) => next(err))
				.catch((err) => next(err));	

			}, (err) => next(err))
			.catch((err) => next(err));
		}
		else {
			// console.log(favorite[0].dishes.indexOf(req.body[0]._id));
			// console.log(favorite[0].dishes.indexOf(req.body[1]._id));
			for (var i = (req.body.length - 1); i>=0; i--) {
				if (favorites[0].dishes.indexOf(req.body[i]._id) != -1) {
					err = new Error('The dish ' + req.body[i]._id + ' already exists!');
					err.status = 403;
					next(err);
				}
				else {
					favorites[0].dishes.push(req.body[i]._id);
				}
			}
			favorites[0].save()
			.then((favorite) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorite);
			}, (err) => next(err))
			.catch((err) => next(err));
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({userId: req.user._id})
	.then((favorite) => {
		if (favorite[0] == null) {
			err = new Error('The list of favorites of user ' + req.user.username + ' not found!');
			err.status = 403;
			next(err);
		}
		else {
				// console.log(favorite[0].dishes[i]);
				favorite[0].dishes = [];
				favorite[0].save()
				.then((favorite) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				}, (err) => next(err))
				.catch((err) => next(err));
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});



//	url: /favorites/:dishId
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {res.sendStatus(200);})

.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({userId: req.user._id})
	.then((favorites) => {
		if (!favorites){
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
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({userId: req.user._id})
	.then((favorites) => {
		if (favorites[0] == null) {
			Favorites.create({userId: req.user._id})
			.then((favorite) => {
				
				favorite.dishes.push(req.params.dishId);

				favorite.save()
				.then((favorites) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					console.log(favorites)
					res.json(favorites);
				}, (err) => next(err))
				.catch((err) => next(err));	

			}, (err) => next(err))
			.catch((err) => next(err));
		}
		else {
				if (favorites[0].dishes.indexOf(req.params.dishId) != -1) {
					err = new Error('The dish ' + req.params.dishId + ' already exists!');
					err.status = 403;
					next(err);
				}
				else {
					favorites[0].dishes.push(req.params.dishId);
					favorites[0].save()
					.then((favorite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					}, (err) => next(err))
					.catch((err) => next(err));
				}
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /favorites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({userId: req.user._id})
	.then((favorites) => {
		console.log(favorites);
		if (favorites[0] == null) {
			err = new Error('The list of favorites of user ' + req.user.username + ' not found!');
			err.status = 404;
			next(err);
		}
		else {
			if (favorites[0].dishes.indexOf(req.params.dishId) != -1) {
				favorites[0].dishes.remove(req.params.dishId);
				favorites[0].save()
				.then((favorite) => {
					Favorites.findById(favorite._id)
					.populate('userId')
					.populate('dishes')
					.then((favorites) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
				}, (err) => next(err))
				.catch((err) => next(err));
			}
			else {
				err = new Error('The dish ' + req.params.dishId + ' not found in the list of favorites!');
				err.status = 404;
				next(err);
			}
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

