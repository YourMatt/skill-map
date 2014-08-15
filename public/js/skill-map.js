
// data model for the skill data
var Milestone = (function () {

    this.year = "";
    this.text = "";

});
var Skill = (function (years) {

    this.title = "";
    this.startYear = years[0];
    this.endYear = years[years.length - 1];

    this.skillLevels = new Array ();
    for (var i = 0; i < years.length; i++) {
        this.skillLevels[this.skillLevels.length] = "";
    }

    this.milestones = new Array ();
    this.milestones.push (new Milestone ());

});

// set up the angular module
var app = angular.module ("skillMap", []);
app.controller ("SkillMapController", ["$scope", function (scope) {

    scope.skills = [];

    // set up the available years
    scope.years = getAvailableYears ();

    // set up the skills
    var skill = new Skill (scope.years);
    scope.skills = [skill];

    // checks if more input fields are needed and adds as necessary
    scope.setInputFields = function (skipJsonReset) {

        // check if any title is given for the last skill - if so, show another line for input
        var lastSkill = $(scope.skills).get (-1);
        if (lastSkill.title) {
            var skill = new Skill (scope.years);
            scope.skills.push (skill);
        }

        // check if any milestones set for any skill - if so, show another line for input
        for (var i = 0; i < scope.skills.length; i++) {
            if (scope.skills[i].milestones.length) {
                var lastMilestone = $(scope.skills[i].milestones).get(-1);
                if (lastMilestone.year && lastMilestone.text) {
                    scope.skills[i].milestones.push (new Milestone ());
                }
            }
            else scope.skills[i].milestones.push (new Milestone ());
        }

        // reset the viewable JSON string
        if (! skipJsonReset) {
            scope.loadSkillsJson();
        }

    };

    // updates the JSON structure from data provided in the input fields
    scope.loadSkillsJson = function () {

        var newSkills = copyObject (scope.skills);

        // remove the last element if blank
        if ($(newSkills).get (-1).title == "") {
            newSkills.pop ();
        }

        // remove any blank milestones at the end of the milestone list
        for (var i = 0; i < newSkills.length; i++) {
            if ($(newSkills[i].milestones).get (-1).year == "") {
                newSkills[i].milestones.pop ();
            }
        }

        scope.skillsJson = angular.toJson (newSkills);

    };

    // updates the skills with data provided within the JSON viewer
    scope.reloadSkillsFromJson = function () {

        // load the skills from the JSON and publish for the controllers
        try {
            var newSkills = angular.fromJson (scope.skillsJson);
            scope.skills = newSkills;
            scope.setInputFields (true); // prevent circular loop
        }
        catch (err) { }

    };

    // prompts to download the SVG image - sends new request to server to ensure no scaling
    scope.promptDownload = function () {

        window.location = "skillmap.svg?download=1&instructions=" + encodeURIComponent (scope.skillsJson);

    },

    // rebuilds the image with the instructions provided by the current skill data
    scope.regenerateSvgImage = function () {

        $("#results-image").attr ("src", "skillmap.svg?instructions=" + encodeURIComponent (scope.skillsJson));

    };

    // load the initial JSON string
    scope.loadSkillsJson ();

}]);

function getAvailableYears () {

    var yearStart = 2000;
    var yearEnd = new Date ().getFullYear ();

    var years = new Array ();
    for (var i = yearStart; i <= yearEnd; i++) {
        years.push (i);
    }

    return years;

}

// force an object to be copied instead of referenced
function copyObject (object) {

    return JSON.parse (JSON.stringify (object));

}