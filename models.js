const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {type: String, required: true},
  created: {type: String, required: true}
  });

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to ontent properties on our object that manipulate
// properties authore stored in the database. Here we use it
// to generatecreatedman readable string based on the address object
// we're storing in Mongo.
blogSchema.virtual('addressString').get(function() {
  return `${this.address.building} ${this.address.street}`.trim()});

// this virtual grabs the most recent grade for a restaurant.
//blogSchema.virtual('grade').get(function() {
 // const gradeObj = this.grades.sort((a, b) => {return b.date - a.date})[0] || {};
 // return gradeObj.grade;
//});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.author,
    created: this.created
  
  };
}

// note that all instance methods and virtual properties on our
// schema must be ontentd *before* we make the call to `.model`.
const Blog = mongoose.model('restaurantsprimer', blogSchema);

module.exports = {Blog};
