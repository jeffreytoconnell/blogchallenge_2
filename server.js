const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;
// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
//const {PORT, DATABASE_URL} = require('./config');
//const {Blog} = require('./models');
var Schema = mongoose.Schema;
var blogSchema = new Schema({
  title: String, 
  author: {
      firstName: String,
      lastName: String,
  },
  content: String
//created: {type: String, required: true}
})
var Blog = mongoose.model('Blog', blogSchema);
mongoose.connect('mongodb://jeff:gunner@ds115352.mlab.com:15352/blogchallenge');
const app = express();
app.use(bodyParser.json());
app.get('/', function(req, res){
  console.log(Blog);
  Blog.find(function(err,blogs){
    console.log(err);
    console.log(blogs);
    if (err)
      res.send(err);
    res.json(blogs)
  })
})
// GET requests to /blogs => return 10 blogs
app.get('/posts', (req, res) => {
  Blog
    .find()
    // we're limiting because blogs db has > 25,000
    // documents, and that's too much to process/return
    .limit(10)
    // `exec` returns a promise
    .exec()
    // success callback: for each blog we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(Blogs => {
      res.json({
        Blogs: Blogs.map(
          (Blog) => Blog.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// can also request by ID
app.get('/blogs/:id', (req, res) => {
  blog
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .exec()
    .then(blog =>res.json(blog.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/blogs', (req, res) => {

  const requiredFields = ['title', 'author', 'content'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  blog
    .create({
      title: req.body.title,
      name: req.body.name,
      content: req.body.content
      })
    .then(
      blog => res.status(201).json(blog.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


app.put('/blogs/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['title', 'name', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  blog
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/blogs/:id', (req, res) => {
  blog
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});
app.listen(8080);
console.log("listeing on port 8080");
module.exports = {app};
