/***************************************************************************
 *
 *  SVG Builder
 *  Creates SVG documents, transforming data into visual elements.
 *
 ***************************************************************************/
var xmlbuilder = require ("xmlbuilder");

if (! exports.skillmap) exports.skillmap = {};

exports.skillmap.svgbuilder = {

    // specify the units for positioning information - only in case need to change for target application
    units: {
        layout: "in",
        text: "pt"
    },

    // specify the position information for x/y coordinates of elements
    pos: {
        elementTopStart: 0.35,              // top position of first graph
        elementTopSpacing: 0.5,            // spacing between top positions of graphs
        labelLeftOffset: 1.5,               // right border position of text labels to left of graphs
        labelTopOffset: 0.15,               // distance below the top of the graph where the bottom of the text displays
        graphLeftOffset: 1.75               // left border position of the graphs
    },

    // specify the size information for width/height of elements
    size: {
        canvasMultiplier: 2,                // increases size of all elements which creates a larger canvas in the HTML
        defaultPageHeight: 1,               // used when requesting blank SVG
        fontLabel: 10,                      // size of the label to the left of the graph
        fontMilestone: 6,                   // size of the milestone text under the graph
        graphHeight: 0.15,                  // height of the graph
        graphLineHeight: 0.01,              // height of the line under the graph
        milestoneLineHeight: 0.075,         // line height for the milestone text
        milestoneMarker: 0.04,              // the radius of the circle marking a milestone
        pageWidth: 7.5                      // the width the image
    },

    // specify the colors
    colors: {
        graph: "#F00",                      // color inside the graphs if variable colors not set
        graph10: "#FF0000",                 // changes the colors based on the skill level
        graph9: "#FF1800",                  // can remove this values or set to blank if want to use the solid color
        graph8: "#FF3000",
        graph7: "#FF4800",
        graph6: "#FF6700",
        graph5: "#FF7F00",
        graph4: "#FF9700",
        graph3: "#FFB000",
        graph2: "#FFCE00",
        graph1: "#FFE600",
        graph0: "#FFFF00",
        line: "#000",                       // color of the bottom border lines and milestone markers
        textLabel: "#000",                  // color of the labels to the left of the graphs
        textMilestone: "#555"               // color of the milestone text
    },

    // builds the full skill map SVG based on the skill data provided
    buildSkillMap: function (skills, forceRealSize) {

        // set to keep actual size for elements if requested, otherwise the multiplier is retained for better HTML view
        if (forceRealSize) this.size.canvasMultipier = 1;

        var linearGradients = [];
        var stops = [];
        var elements = [];

        // add each skill
        var numSkills = skills.length;
        for (var i = 0; i < skills.length; i++) {

            var skill = skills[i];

            // build the gradient based upon the skill levels
            stops = [];
            var numSkillLevels = skill.skillLevels.length;
            for (var j = 0; j < numSkillLevels; j++) {

                // set the offset and opacity based on year position and specified skill level
                var offset = Math.ceil (j / (numSkillLevels - 1) * 100);
                var opacity = skill.skillLevels[j] / 10;

                // set the color for this step - use variable colors if defined
                var color = "";
                if (this.colors.graph10) {
                    eval("var color = this.colors.graph" + Math.ceil(opacity * 10));
                }

                // if variable colors not set, then use solid color
                else {
                    color = this.colors.graph;
                }

                stops.push ({ stop: {
                    "@offset": offset + "%",
                    "@stop-color": color,
                    "@stop-opacity": opacity
                }});

            }

            linearGradients.push ({ linearGradient: {
                "@id": "gradient-" + i,
                "#list": stops
            }});

            // add the label
            elements.push ({ text: {
                "@x": this.getPositionUnits (this.pos.labelLeftOffset),
                "@y": this.getPositionUnits (this.pos.elementTopStart + this.pos.labelTopOffset + this.pos.elementTopSpacing * i),
                "@class": "label",
                "#text": skill.title
            }});

            // add the graph gradient
            elements.push ({ rect: {
                "@x": this.getPositionUnits (this.pos.graphLeftOffset),
                "@y": this.getPositionUnits (this.pos.elementTopStart + this.pos.elementTopSpacing * i),
                "@width": this.getPositionUnits (this.size.pageWidth - this.pos.graphLeftOffset),
                "@height": this.getPositionUnits (this.size.graphHeight),
                "@fill": "url(#gradient-" + i + ")"
            }});

            // add the line under the gradient
            var lineTopPosition = this.pos.elementTopStart + this.size.graphHeight + this.pos.elementTopSpacing * i;
            elements.push ({ line: {
                "@x1": this.getPositionUnits (this.pos.graphLeftOffset),
                "@y1": this.getPositionUnits (lineTopPosition),
                "@x2": this.getPositionUnits (this.size.pageWidth),
                "@y2": this.getPositionUnits (lineTopPosition),
                "@class": "databox"
            }});

            // add a milestone marker
            var milestoneOffset = 1.75; // temporary until adding real milestones
            elements.push ({ circle: {
                "@cx": this.getPositionUnits (this.pos.graphLeftOffset + milestoneOffset),
                "@cy": this.getPositionUnits (lineTopPosition),
                "@r": this.getPositionUnits (this.size.milestoneMarker),
                "@fill": this.colors.line
            }});

            // add milestone text
            elements.push ({ text: {
                "#list": [
                    { tspan: {
                        "@x": this.getPositionUnits (this.pos.graphLeftOffset + milestoneOffset),
                        "@y": this.getPositionUnits (lineTopPosition + this.size.milestoneMarker + this.size.milestoneLineHeight),
                        "@class": "milestone",
                        "#text": "This is a"
                    }},
                    { tspan: {
                        "@x": this.getPositionUnits (this.pos.graphLeftOffset + milestoneOffset),
                        "@y": this.getPositionUnits (lineTopPosition + this.size.milestoneMarker + this.size.milestoneLineHeight * 2),
                        "@class": "milestone",
                        "#text": "sample milestone"
                    }}]
            }});

        }

        // generate the CSS
        var styleData = "\
            text.label {\
                text-anchor: end;\
                font-size: " + this.getTextUnits (this.size.fontLabel) + ";\
                fill: " + this.colors.textLabel + ";\
            }\
            tspan.milestone {\
                text-anchor: middle;\
                font-size: " + this.getTextUnits (this.size.fontMilestone) + ";\
                fill: " + this.colors.textMilestone + ";\
            }\
            line.databox {\
                stroke: " + this.colors.line + ";\
                stroke-width: " + this.getPositionUnits (this.size.graphLineHeight) + ";\
            }\
        ";

        // build the structure
        var svgData = {};
        if (elements.length) {
            svgData = {
                svg: {
                    "@width": this.getPositionUnits (this.size.pageWidth),
                    "@height": this.getPositionUnits (this.pos.elementTopSpacing * skills.length + this.pos.elementTopStart),
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
                    "@width": this.getPositionUnits (this.size.pageWidth),
                    "@height": this.getPositionUnits (this.size.defaultPageHeight),
                    "@version": "1.1",
                    "@xmlns": "http://www.w3.org/2000/svg"
                }
            }
        }

        // create the SVG document
        var svg = xmlbuilder.create (svgData, {}, {}, {headless: true}); // headless to prevent xml declaration
        svg.dtd (); // doctype svg

        return svg.end ({pretty: true});

    },

    // returns the geometry data with the supplied unit
    getPositionUnits: function (value) {

        return value * this.size.canvasMultiplier + this.units.layout;

    },

    // returns the font size with the supplied unit
    getTextUnits: function (value) {

        return value * this.size.canvasMultiplier + this.units.text;

    }

}