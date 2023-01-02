//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({extended: true}));

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
mongoose.connect("mongodb+srv://admin2-om:test1234@cluster0.pgoezg0.mongodb.net/todoListDB");
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const itemsSchema = {
  name : String
};
const Item= mongoose.model("Item", itemsSchema);
const item1 = new Item ({
  name : "Welcome to todoList"
});
const item2 = new Item({
  name : "Hit + button to add a new item"
});
const item3 = new Item({
  name : "-- to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();

Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(error);
      }
      else{
        console.log("Succesfully inserted the items");
      }
    });
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  // console.log(listName);
  const item = new Item({
    name : itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName}, function(err, foundList){

      foundList.items.push(item);
      foundList.save();
    });
    res.redirect("/"+listName);
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(error);
      }
      else{
        // console.log("Successfully removed that item");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name : listName}, {$pull :{items :{_id : checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }

})

app.get("/:paramName", function(req, res){
  const customListName = _.capitalize(req.params.paramName);
  List.findOne({name : customListName}, function(err, foundList){
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        // console.log("Doesn't exist");
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        // console.log("Exists");
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  })

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
