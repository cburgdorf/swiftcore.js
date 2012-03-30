(function () {

    if (!window.lightcore){
        throw "make sure lightcore.js was loaded before lightcore.instanceprovider.js"
    }

    var lightcore = window.lightcore;
    lightcore.instanceProvider = {};

    lightcore.instanceProvider.constructorBased = function(registration, dependencies){

        var instance = new registration.type(dependencies);
        registration.isInitialized = true;

        return instance;
    };

    lightcore.instanceProvider.initializeBased = function(registration, dependencies){
        if (!registration.instance){
            registration.instance = new registration.type();
        }
        registration.instance.initialize(dependencies);
        registration.isInitialized = true;

        return registration.instance;
    };

})()