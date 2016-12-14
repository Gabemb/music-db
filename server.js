const express = require('express');
const app = express();
const session = require('express-session')
const path = require('path');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const sequelizeConnection = require('./db');

const Artist = require('./models/artist-model');
const Song = require('./models/song-model');
const Genre = require('./models/genre-model');
const Playlist = require('./models/playlist-model');

//body-parser middleware adds .body property to req (if we make a POST AJAX request with some data attached, that data will be accessible as req.body)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Serving up our front end
app.use(express.static(path.join(__dirname, '/front/bundle')));


//listen on port 8888
app.listen('9999', () => console.log('Listening on port 9999'));

//Set up session for all requests
app.use(session({
  secret: 'gabe is the best',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}))


//Login route:
//Will recieve username and password through POST request
//check if user exists
//IF user exists, check if password is correct
//ELSE IF user does not exist, create new user
//(if they have correct password, or if new user) give them key and attach login (cookie/session) info to req/res, and send
//ELSE tell they have have incorrect password/or not authroized

app.post('/login', (req, res) => {
	console.log(req.body)
	console.log(req.session)
	let userInfo = req.body;
	User.sync()
	//check if user exists
	.then( () => {
		User.findOne({
			where: {
				username: userInfo.username
			}
		});
	})
	//IF user exists, check if password is correct
	.then( (user) => {
		if (user && user.password === userInfo.password){

			console.log("Password is correct!");
			return user;
		//ELSE IF user does not exists, create new user	
		} else if (!user) {
			console.log("Creating new user!");
			return User.create(userInfo);
		} else {
			return null;
		}
	})
	.then( (user) => {
		if(user) {
			req.session.username = user.username;
			req.session.save(); //if you do res.send() then you dont need this as res.send automatically saves it
			console.log('Updated session?', req.session);
			res.send(user);
		} else {
			res.send('Incorrect password!')
		}
	})
});

//Authentication route (fire when app first laods)
app.get('/auth', (req, res) => {
	console.log('session', req.session)
	if (req.session.username) {
		res.send(req.session.username);
	} else {
		res.send(null);
	}
})

//req.session.id


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
	.then( () => {
		res.sendStatus(200);
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(500)
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
		res.sendStatus(500)
	})
});

///////////////Song api routes///////////////////


//GET all songs with genre and artist information fully populated
app.get('/api/songs', (req, res) => {
	Song.findAll({
		include: [ {all: true} ]
	})
	.then( (songs) => {
		res.send(songs);
	})
	.catch( (err) => {
		consle.log(err);
		res.sendStatus(500);
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
		res.sendStatus(500);
	})
});

//Adding a class level method to the Song model to be able to simultaneously =>
//bulkCreate & findOrCreate through an array of objects
Genre.bulkFindOrCreate = (arr) => {
	let promiseArr = []
	arr.forEach( (genreNames) => {
  	promiseArr.push( Genre.findOrCreate({
  		where: {title: genreNames}
  	}) )
  });
  return Promise.all(promiseArr)
};


//POST (create) a new song
app.post('/api/songs', (req, res) => {
let genreArr = JSON.parse(req.body.genres) //keeps array an array, json has to all caps!!
let newSong;
	
	//callback
	//seperate into "server utilitiy file" in the future
	const createSongAddGenres = (artistId) => {
		Song.findOrCreate({
			where: {
				title: req.body.title,
				youtube_url: req.body.url,
				artistId: artistId 
			}
		})
		.then( (song) => {
			newSong = song[0]
			return Genre.bulkFindOrCreate(genreArr)
				.then( (genres) => {
					return genres.map( (genre) => genre[0].dataValues.id);
				});
		})
		.then( (genreIds) => {
			newSong.addGenres(genreIds);
		})
		.then( () => {
			res.send(newSong);
		})
		.catch( (err) => {
			console.log("Something went wrong while creating the song and genres: ", err)
			res.sendStatus(500)
		})
	}

	//POST request begins here
	Artist.findOrCreate({
			where: {name: req.body.artist}
	})
	.then( (artist) => {
		createSongAddGenres(artist[0].dataValues.id)
	})
	.catch( (err) => {
		console.log("Something went wrong while creating the artist and song: ", err);
		res.sendStatus(500);
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
		res.sendStatus(500);
	})
});

//DELETE a specific song by id
app.delete("/api/songs/:id", (req, res) => {
	Song.destroy({
		where: {id: req.params.id}
	})
	.then( () => {
		res.sendStatus(200)
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(500);
	})
});

//GET all playlists with song information fully populated (in other words, should say full song, artist, and genre names, instead of only having the ids)
app.get('/api/playlists', (req, res) => {
	Playlist.findAll({
		include: [{
			model: Song,
			include: [Artist, Genre]
		}]
	})
	.then( (playlists) => {
		res.send(playlists);
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(500);
	});
});

//GET a specific playlist by id
app.get('/api/playlists/:id', (req, res) => {
	Playlist.findById(req.params.id)
	.then( (playlist) => {
		res.send(playlist);
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(500)
	})
})


//POST (create) a new playlist
app.post('/api/playlists', (req, res) => {
	let songArr = JSON.parse(req.body.songs);
	let newPlaylist;
	Playlist.findOrCreate({
		where: {title: req.body.title}
	})
	.then( (playlist) => {
		newPlaylist = playlist[0]
		newPlaylist.addSongs(songArr);
		return newPlaylist
	})
	.then( (newPlaylist) => {
		res.send(newPlaylist);
	})
	.catch( (err) => {
		console.log(err);
		res.sendStatus(500);
	});
});


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/front/index.html'));
});

