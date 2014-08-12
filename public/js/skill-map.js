
// data model for the skill data
var Skill = (function () {
    this.title = "";
});

// set up the angular module
var app = angular.module ("skillMap", []);
app.controller ("SkillMapController", ["$scope", function (scope) {

    scope.skills = [];

    // set up the available years
    scope.years = getAvailableYears ();

    // set up the skills
    var skill = new Skill ();
    scope.skills = [skill];

    // checks if more input fields are needed and adds as necessary
    scope.setInputFields = function (skipJsonReset) {

        // check if any title is given for the last skill - if so, show another line for input
        var lastSkill = $(scope.skills).get(-1);
        if (lastSkill.title) {
            scope.skills.push (new Skill ());
        }

        // reset the viewable JSON string
        if (! skipJsonReset) {
            scope.loadSkillsJson();
        }

    };

    // updates the JSON structure from data provided in the input fields
    scope.loadSkillsJson = function () {

        // remove the last element if blank - not popping off the end because will affect existing skills without deep copy workaround
        var newSkills = [];
        var maxItem = scope.skills.length - 1;
        for (var i = 0; i < maxItem; i++) {
            newSkills.push (scope.skills[i]);
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

    // rebuilds the image with the instructions provided by the current skill data
    scope.regenerateSvgImage = function () {

        $("#results-image").attr ("src", "skillmap.svg?instructions=" + scope.skillsJson);

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