
var express = require ("express"),
    skillmapsvg = require ("./svgbuilder.js");

var app = express ();
app.use (express.static (__dirname + "/public"));

// handle SVG requests
app.route ("/*.svg").all (function (req, res) {

    var instructions = req.query.instructions;
    var download = (req.query.download);

    res.type ("svg");
    console.log ("Requested SVG Image - Instructions: " + instructions);
    var skills = [];
    try {
        skills = JSON.parse (instructions);
    }
    catch (err) {}

    // build the skill map SVG
    if (download) skillmapsvg.skillmap.svgbuilder.size.canvasMultiplier = 1;
    var svg = skillmapsvg.skillmap.svgbuilder.buildSkillMap (skills);

    // set to prompt if requesting download
    if (download) {
        console.log ("attempting download");
        res.setHeader ("Content-disposition", "attachment; filename=skillmap.svg");
    }

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
