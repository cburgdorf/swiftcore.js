(function () {

    if (!window.swiftcore){
        throw "make sure swiftcore.js was loaded before swiftcore.dependencyFormatters.js"
    }

    var swiftcore = window.swiftcore;
    swiftcore.dependencyFormatters = {};

    swiftcore.dependencyFormatters.asIs = function(propertyName){
        return propertyName;
    };

    swiftcore.dependencyFormatters.camelCase = function (propertyName) {
        return propertyName.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    };

})()