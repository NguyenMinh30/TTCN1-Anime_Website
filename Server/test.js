const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/animeDB");
const Anime = require('./models/anime.model');

Anime.find().then(r => console.log(r));
