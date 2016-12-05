const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const sequelizeConnection = require('./db');

const Artist = require('./models/artist-model');
const Song = require('./models/song-model');

//body-parser middleware adds .body property to req (if we make a POST AJAX request with some data attached, that data will be accessible as req.body)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Serving up our front end
app.use(express.static(path.join(__dirname, '/front/bundle')));


//listen on port 8888
app.listen('9999', () => console.log('Listening on port 9999'));



//////////
// YOUR CODE HERE:
//////////

//////////////Artist api routes////////////////////

//GET all artists, ordered a-z
app.get('/api/artists', (req, res) => {
	Artist.findAll({
		order: [ ['name', 'ASC'] ]
	})
	.then( (artists) => {
		res.send(artists);
	})
	.catch( (err) => {
		console.log(err);
	})
});

//GET a specific artist by id
app.get('/api/artists/:id', (req, res) => {
	Artist.findById(req.params.id)
	.then( (artist) => {
		res.send(artist);
	})
	.catch( (err) => {
		console.log(err);
	})
});

//POST a new artist
app.post('/api/artists', (req, res) => {
	Artist.create({
		name: req.body.name
	})
	.then( (newArtist) => {
		res.send(newArtist);
	})
	.catch( (err) => {
		console.log("Error with POSTing new artist", err);
	})
});

//DELETE an artist by id
app.delete('/api/artists/:id', (req, res) => {
	Artist.destroy({
		where: {id: req.params.id}
	})
	.then( (data) => {
		console.log(data)
	})
});

//PUT (update) a specific artist's name
app.put('/api/artists/:id/:newName', (req, res) => {
	Artist.update({
		name: req.params.newName}, 
		{where: {id: req.params.id}
	})
	.then( (artist) => {
		res.send(artist);
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(err.status)
	})
});

///////////////Song api routes///////////////////


//GET all songs with genre and artist information fully populated
app.get('/api/songs', (req, res) => {
	Song.findAll({
		include: [{all: true}]
	})
	.then( (songs) => {
		res.send(songs);
	})
	.catch( (err) => {
		consle.log(err);
		res.sendStatus(err.status);
	})
});

//GET specific song by id
app.get('/api/songs/:id', (req, res) => {
	Song.findById(req.params.id)
	.then( (song) => {
		res.send(song);
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(err.status);
	})
});

//POST (create) a new song
app.post('/api/songs', (req, res) => {
	let newSong;
	Song.findOrCreate({
		where: {
			title: req.body.title,
			youtube_url: req.body.url}
	})
	.then( (song) => {
		newSong = song;
		return Artist.findOrCreate({
			where: {name: req.body.artist}
		})
	})
	.then( (artist) => {
		newSong.addArtist(artist[0].dataValues.id);
		newSong.addGenres(req.body.genre);
	})
	.then( () => {
		res.sendStatus(200);
	})
	.catch( (err) => {
		console.log("Something went wrong while creating song: ", err);
		res.sendStatus(err.status);
	})
});

// PUT (update) a specific song's title
app.put('/api/songs/:id/:newTitle', (req, res) => {
	Song.update({
		title: req.params.newTitle},
		{where: {id: req.params.id}
	})
	.then( (song) => {
		res.send(song);
	})
	.catch( (err) => {
		console.log(err);
		console.error(err);
		res.sendStatus(err.status);
	})
});

//DELETE a specific song by id
app.delete("/api/songs/:id", (req, res) => {
	Song.destroy({
		where: {id: req.params.id}
	})
	.then( () => {

	})
})




app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/front/index.html'));
});

