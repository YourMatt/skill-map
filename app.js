
var express = require ("express"),
    util = require ("util"),
    xmlbuilder = require ("xmlbuilder");

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
    var data = [];
    try {
        data = JSON.parse (instructions);
    }
    catch (err) {}

    var linearGradients = [];
    var stops = [];
    var elements = [];

    // add each skill
    if (data.length) {

        stops.push ({ stop: {
            "@offset": "0%",
            "@stop-color": "#F00",
            "@stop-opacity": "0"
        }});
        stops.push ({ stop: {
            "@offset": "33.3%",
            "@stop-color": "#F00",
            "@stop-opacity": "0.8"
        }});
        stops.push ({ stop: {
            "@offset": "100%",
            "@stop-color": "#F00",
            "@stop-opacity": "0.2"
        }});

        linearGradients.push ({ linearGradient: {
            "@id": "gradient-1",
            "#list": stops
        }});

        // LOOP THROUGH SKILLS HERE

        // add the label
        elements.push ({ text: {
            "@x": "1.5in",
            "@y": "0.5in",
            "@class": "label",
            "#text": "Label"
        }});

        // add the graph gradient
        elements.push ({ rect: {
            "@x": "1.75in",
            "@y": "0.35in",
            "@width": "10in",
            "@height": "0.15in",
            "@fill": "url(#gradient-1)"
        }});

        // add the line under the gradient
        elements.push ({ line: {
            "@x1": "1.75in",
            "@y1": "0.5in",
            "@x2": "11.75in",
            "@y2": "0.5in",
            "@class": "databox"
        }});

        // add a milestone marker
        elements.push ({ circle: {
            "@cx": "3in",
            "@cy": "0.5in",
            "@r": "0.04in",
            "@fill": "black"
        }});

        // add milestone text
        elements.push ({ text: {
            "#list": [
                { tspan: {
                    "@x": "3in",
                    "@y": "0.65in",
                    "@class": "milestone",
                    "#text": "This is a"
                }},
                { tspan: {
                    "@x": "3in",
                    "@y": "0.75in",
                    "@class": "milestone",
                    "#text": "sample milestone"
                }}]
        }});

    }

    var styleData = "\
        text.label {\
            text-anchor: end;\
            font-size: 12pt;\
        }\
        tspan.milestone {\
            text-anchor: middle;\
            font-size: 8pt;\
        }\
        line.databox {\
            stroke: black;\
            stroke-width: 0.01in;\
        }\
    ";

    // build the structure
    var svgData = {};
    if (elements.length) {
        svgData = {
            svg: {
                "@width": "12in",
                "@height": "3in",
                "@version": "1.1",
                "@xmlns": "http://www.w3.org/2000/svg",
                defs: {
                    style: {
                        "@type": "text/css",
                        "#cdata": styleData
                    },
                    "#list": linearGradients
                },
                "#list": elements
            }
        };
    }

    // if no elements are available, build an empty SVG
    else {
        svgData = {
            svg: {
                "@width": "12in",
                "@height": "1in",
                "@version": "1.1",
                "@xmlns": "http://www.w3.org/2000/svg"
            }
        }
    }

    // create the SVG document
    var svg = xmlbuilder.create (svgData, {}, {}, {headless: true}); // headless to prevent xml declaration
    svg.dtd (); // doctype svg

    // return the SVG document
    res.send (svg.end ({pretty: true}));

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
