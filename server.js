var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

var app = express();

var db = require("./models");


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// var routes = require("./controllers/articleController.js");

// app.use(routes);

app.get("/scrape", function (req, res) {
    axios.get("https://vox.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];

        $("h2").children().attr("data-analytics-link", "article").each(function (i, element) {

            // var everything = $(element).children().text();

            var result = {};

            result.title = $(element).text();
            result.url = $(element).attr("href");
            result.author = $(element).parent().parent().children(".c-byline").children().first().text().trim();

            if (db.Article.find({ url: result.url }).length === 0) {

                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                        results.push(result);
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            }
        });
        res.json("Scrape Successful!");
    });
})

app.get("/scraped", function (req, res) {
    db.Article.find({}).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err)
    })
})

app.get("/", function (req, res) {

    db.Article.find(function (err, articles) {
        res.render("index", { articles: articles })
    })
})

app.get("/scraped/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id }, function (error, article) {

        if (error){
            console.log(error)
        }else{
        console.log("test " + article);
        res.render("articleView", {article: article });
        }
    });
    // }.then(function(dbArticle){
    //     res.render("articleView", )
    //     res.json(dbArticle)
    // }).catch(function(err){
    //     res.json(err);
    // })
})

app.listen(process.env.PORT || 3000, function () {
    console.log("App running on port 3000!");
});