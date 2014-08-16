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
        elementTopSpacing: 0.5,             // spacing between top positions of graphs
        labelLeftOffset: 1.5,               // right border position of text labels to left of graphs
        labelTopOffset: 0.15,               // distance below the top of the graph where the bottom of the text displays
        graphLeftOffset: 1.75,              // left border position of the graphs
        milestoneGraphPadding: 0.35,        // the min distance from the borders of the graph, where a milestone marker can sit
        yearTop: 0.15                       // the position for placement of year labels
    },

    // specify the size information for width/height of elements
    size: {
        canvasMultiplier: 2,                // increases size of all elements which creates a larger canvas in the HTML
        defaultPageHeight: 1,               // used when requesting blank SVG
        fontLabel: 10,                      // size of the label to the left of the graph
        fontMilestone: 6,                   // size of the milestone text under the graph
        graphHeight: 0.15,                  // height of the graph
        graphLineHeight: 0.01,              // height of the line under the graph
        milestoneLineHeight: 0.085,         // line height for the milestone text
        milestoneMarker: 0.04,              // the radius of the circle marking a milestone
        pageWidth: 7.5,                     // the width the image
        yearLaneLineWidth: 0.005,           // width of the year lane lines
        yearLaneLineDashLength: 0.5,        // length of the dash for the year lane lines
        yearLaneLineDashSpacing: 2.5        // length of the blank between the dashes in the year lane lines
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
        graphLine: "#000",                  // color of the bottom border lines and milestone markers
        textLabel: "#000",                  // color of the labels to the left of the graphs
        textMilestone: "#555",              // color of the milestone text
        yearLaneLine: "#555"                // color of the year lane lines
    },

    // builds the full skill map SVG based on the skill data provided
    buildSkillMap: function (skills, forceRealSize) {

        var linearGradients = [];
        var stops = [];
        var elements = [];

        var numSkills = skills.length;
        if (numSkills) {

            // add the vertical lines showing the active years
            this.addSvgYearLanes (elements, skills[0].startYear, skills[0].endYear, numSkills);

            // add each skill
            for (var i = 0; i < skills.length; i++) {

                var skill = skills[i];

                // build the gradient based upon the skill levels
                stops = [];
                var numSkillLevels = skill.skillLevels.length;
                for (var j = 0; j < numSkillLevels; j++) {

                    // set the offset and opacity based on year position and specified skill level
                    var offset = Math.ceil(j / (numSkillLevels - 1) * 100);
                    var opacity = skill.skillLevels[j] / 10;

                    // set the color for this step - use variable colors if defined
                    var color = "";
                    if (this.colors.graph10) {
                        eval("var color = this.colors.graph" + (opacity * 10));
                    }

                    // if variable colors not set, then use solid color
                    else {
                        color = this.colors.graph;
                    }

                    stops.push({ stop: {
                        "@offset": offset + "%",
                        "@stop-color": color,
                        "@stop-opacity": opacity
                    }});

                }

                linearGradients.push({ linearGradient: {
                    "@id": "gradient-" + i,
                    "#list": stops
                }});

                // add the label
                elements.push({ text: {
                    "@x": this.getPositionUnits(this.pos.labelLeftOffset),
                    "@y": this.getPositionUnits(this.pos.elementTopStart + this.pos.labelTopOffset + this.pos.elementTopSpacing * i),
                    "@class": "label",
                    "#text": skill.title
                }});

                // add the graph gradient
                elements.push({ rect: {
                    "@x": this.getPositionUnits(this.pos.graphLeftOffset),
                    "@y": this.getPositionUnits(this.pos.elementTopStart + this.pos.elementTopSpacing * i),
                    "@width": this.getPositionUnits(this.size.pageWidth - this.pos.graphLeftOffset),
                    "@height": this.getPositionUnits(this.size.graphHeight),
                    "@fill": "url(#gradient-" + i + ")"
                }});

                // add the line under the gradient
                var lineTopPosition = this.pos.elementTopStart + this.size.graphHeight + this.pos.elementTopSpacing * i;
                elements.push({ line: {
                    "@x1": this.getPositionUnits(this.pos.graphLeftOffset),
                    "@y1": this.getPositionUnits(lineTopPosition),
                    "@x2": this.getPositionUnits(this.size.pageWidth),
                    "@y2": this.getPositionUnits(lineTopPosition),
                    "@class": "databox"
                }});

                // add the milestones
                for (var j = 0; j < skill.milestones.length; j++) {
                    var milestone = skill.milestones[j];

                    // add a milestone marker
                    var milestoneOffsetPercent = (milestone.year - skill.startYear) / (skill.endYear - skill.startYear);
                    var milestoneOffset = this.pos.milestoneGraphPadding + (this.size.pageWidth - this.pos.graphLeftOffset - this.pos.milestoneGraphPadding * 2) * milestoneOffsetPercent;
                    elements.push({ circle: {
                        "@cx": this.getPositionUnits(this.pos.graphLeftOffset + milestoneOffset),
                        "@cy": this.getPositionUnits(lineTopPosition),
                        "@r": this.getPositionUnits(this.size.milestoneMarker),
                        "@fill": this.colors.graphLine
                    }});

                    var textLine1 = "";
                    var textLine2 = "";

                    if (milestone.text.length <= 10 || milestone.text.indexOf(" ") < 0) {
                        textLine1 = milestone.text;
                    }
                    else {
                        var textLines = this.getSplitText(milestone.text);
                        textLine1 = textLines[0];
                        textLine2 = textLines[1];
                    }

                    // add milestone text
                    elements.push({ text: {
                        "#list": [
                            { tspan: {
                                "@x": this.getPositionUnits(this.pos.graphLeftOffset + milestoneOffset),
                                "@y": this.getPositionUnits(lineTopPosition + this.size.milestoneMarker + this.size.milestoneLineHeight),
                                "@class": "milestone",
                                "#text": textLine1
                            }},
                            { tspan: {
                                "@x": this.getPositionUnits(this.pos.graphLeftOffset + milestoneOffset),
                                "@y": this.getPositionUnits(lineTopPosition + this.size.milestoneMarker + this.size.milestoneLineHeight * 2),
                                "@class": "milestone",
                                "#text": textLine2
                            }}
                        ]
                    }});

                }
            }
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
                stroke: " + this.colors.graphLine + ";\
                stroke-width: " + this.getPositionUnits (this.size.graphLineHeight) + ";\
            }\
            line.yearlane {\
                stroke: " + this.colors.yearLaneLine + ";\
                stroke-width: " + this.getPositionUnits (this.size.yearLaneLineWidth) + ";\
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

    addSvgYearLanes: function (elements, yearStart, yearEnd, numSkills) {

        var topPosition = this.pos.yearTop + this.size.milestoneLineHeight;
        var leftPosition = this.pos.graphLeftOffset + this.pos.milestoneGraphPadding;
        var bottomPosition = this.pos.elementTopSpacing * numSkills + (this.pos.elementTopStart - this.pos.yearTop); // places bottom of line to be equal distance from bottom of last graph to top of first graph
        var dashLength = this.getCalculatedSize (this.size.yearLaneLineDashLength);
        var dashSpacing = this.getCalculatedSize (this.size.yearLaneLineDashSpacing);

        elements.push({ text: {
            tspan: {
                "@x": this.getPositionUnits(leftPosition),
                "@y": this.getPositionUnits(this.pos.yearTop),
                "@class": "milestone",
                "#text": yearStart
            }}});
        elements.push({ line: {
            "@x1": this.getPositionUnits(leftPosition),
            "@y1": this.getPositionUnits(topPosition),
            "@x2": this.getPositionUnits(leftPosition),
            "@y2": this.getPositionUnits(bottomPosition),
            "@stroke-dasharray": dashLength + ", " + dashSpacing,
            "@class": "yearlane"
        }});

        leftPosition = this.size.pageWidth - this.pos.milestoneGraphPadding;
        elements.push({ text: {
            tspan: {
                "@x": this.getPositionUnits(leftPosition),
                "@y": this.getPositionUnits(this.pos.yearTop),
                "@class": "milestone",
                "#text": yearEnd
            }}});
        elements.push({ line: {
            "@x1": this.getPositionUnits(leftPosition),
            "@y1": this.getPositionUnits(topPosition),
            "@x2": this.getPositionUnits(leftPosition),
            "@y2": this.getPositionUnits(bottomPosition),
            "@stroke-dasharray": dashLength + ", " + dashSpacing,
            "@class": "yearlane"
        }});

    },

    // splits the text into 2 lines, breaking on the center-most space
    getSplitText: function (text) {

        var textLines = new Array ();

        var middle = Math.ceil (text.length / 2);
        for (var i = 0; i <= middle; i++) {

            var breakPosition = 0;
            if (text.charAt (middle - i) == " ") {
                breakPosition = middle - i;
            }
            else if (text.charAt (middle + i) == " ") {
                breakPosition = middle + i;
            }

            if (breakPosition) {
                textLines[0] = text.substring (0, breakPosition);
                textLines[1] = text.substring (breakPosition + 1);
                break;
            }
        }

        return textLines;

    },

    // returns the geometry data with the supplied unit
    getPositionUnits: function (value) {

        return this.getCalculatedSize (value) + this.units.layout;

    },

    // returns the font size with the supplied unit
    getTextUnits: function (value) {

        return this.getCalculatedSize (value) + this.units.text;

    },

    // returns the calculated size based on the canvas multiplier
    getCalculatedSize: function (value) {

        return value * this.size.canvasMultiplier;

    }

}