
var express = require ("express"),
    util = require ("util"),
    skillmapsvg = require ("./svgbuilder.js");

var app = express ();
app.use (express.static (__dirname + "/public"));

// load raw post data to req rawBody param
app.use(function(req, res, next) {

    req.rawBody = "";

    req
        .on ("data", function(chunk) {
            req.rawBody += chunk;
        })
        .on ("end", function() {
            next();
        });

});

// handle SVG requests
app.route ("/*.svg").all (function (req, res) {

    var instructions = req.rawBody || req.query.instructions || ""; // pulls from raw post, then query string if none provided

    res.type ("svg");
    console.log ("Requested SVG Image - Instructions: " + instructions);
    var skills = [];
    try {
        skills = JSON.parse (instructions);
    }
    catch (err) {}

    // build the skill map SVG
    var svg = skillmapsvg.skillmap.svgbuilder.buildSkillMap (skills);

    // return the SVG document
    res.send (svg);

});

// handle all other requests
app.set ("views", __dirname + "/views/layout");
app.engine ("ejs", require ("ejs").renderFile);
app.get ("/*", function (req, res) {

    res.render ("template.ejs");

});

// start server
app.listen (80);
console.log ("Server started.");
