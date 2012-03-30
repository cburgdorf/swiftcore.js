(function () {

    if (!window.lightcore){
        throw "make sure lightcore.js was loaded before lightcore.dependencyFormatters.js"
    }

    var lightcore = window.lightcore;
    lightcore.dependencyFormatters = {};

    lightcore.dependencyFormatters.asIs = function(propertyName){
        return propertyName;
    };

    lightcore.dependencyFormatters.camelCase = function (propertyName) {
        return propertyName.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    };

})()