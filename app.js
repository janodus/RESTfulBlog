// ====== SETUP
var express =           require("express"),
    app =               express(),
    bodyParser =        require("body-parser"),
    methodOverride =    require("method-override"),
    expressSanitizer =  require("express-sanitizer"),
    mongoose =          require("mongoose");
  
// App Configurations  
mongoose.connect("mongodb://localhost/blog_app"); //connects to mongodb
app.set("view engine", "ejs"); //sets the .extension of files to .ejs by default
app.use(express.static("public")); // creates a public folder that we can pull from without full folder structure
app.use(bodyParser.urlencoded({extended: true})); // body parser allows us to JSON.parse
app.use(expressSanitizer());
app.use(methodOverride("_method")); // treats _method within a query as a request (to overrid PUT and DELETE restrictions)

// Mongoose/Model configuration
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now} // we can set defaults for all key/string pairs using this syntax
});

var Blog = mongoose.model("Blog", blogSchema); // model configuration for mongoose to use (CRUD methods for Blog)

// ====== TESTS / MANUAL UPDATES

// Blog.create({
//   title: "This is a test blog", 
//   image: "https://unsplash.com/?photo=3OiYMgDKJ6k", 
//   body: "This is a simple blog post. I'm just writing this to test out the manual function",
// });


// ====== ROUTES 

//ROOT ROUTE 
app.get("/", function(req, res){
  res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
  Blog.find({}, function(err, blogposts){
    if (err) {
      console.log(err);
    }
    else {
     res.render("index", {blogs:blogposts}); 
    }
  });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
  res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
  //create blog
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog){
    if(err){
      res.render("new");
    }
    else {
      res.redirect("/blogs");
    }
  });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
  Blog.findById(req.params.id, function(err,foundBlog){
    if(err) {
      res.redirect("/blogs");
    }
    else {
      res.render("show", {foundBlog : foundBlog});
    }
  });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
  } else {
      res.render("edit", {blog: foundBlog});
  }
 });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err) {
      res.redirect("/blogs");
    }
    else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
  //destroy blog 
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err) {
      res.redirect("/blogs");
    }
    else {
      res.redirect("/blogs");
    }
  });
  //redirect to index 
});





// ====== SERVER

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("SERVER STARTED FOR BLOG!");
});