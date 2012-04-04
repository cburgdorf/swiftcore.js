(function (window) {

    if (!window.swiftcore){
        throw "make sure swiftcore.js was loaded before swiftcore.instanceProvider.js";
    }

    var swiftcore = window.swiftcore;
    swiftcore.instanceProvider = {};

    swiftcore.instanceProvider.constructorBased = function(registration, dependencies){

        var instance = new registration.type(dependencies);
        registration.isInitialized = true;

        return instance;
    };

    swiftcore.instanceProvider.initializeBased = function(registration, dependencies){
        if (!registration.instance){
            registration.instance = new registration.type();
        }
        registration.instance.initialize(dependencies);
        registration.isInitialized = true;

        return registration.instance;
    };

})(window);