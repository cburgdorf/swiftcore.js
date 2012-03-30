(function () {

    var lightcore = window.lightcore, store = {};

    lightcore.defaultInstanceProvider = lightcore.instanceProvider.constructorBased;

    function Registration(){};

    Registration.prototype.register = function(name){
        this.name = name;
        return this;
    };

    Registration.prototype.withType = function(type){
        this.type = type;
        return this;
    };

    Registration.prototype.withInstance = function(instance){
        this.instance = instance;
        return this;
    };

    Registration.prototype.asSingleton = function(){
        this.singleton = true;
        return this;
    };


    var hasDependencies = function(registration) {
        return !(registration.type.requires === undefined || registration.type.requires.length === 0);
    };

    var createInstanceOrReuseExistingOne = function(registration, dependencies){
        if (registration.singleton && registration.isInitialized){
            return registration.instance;
        }

        var instance = lightcore.defaultInstanceProvider(registration, dependencies);
        if (registration.singleton){
            registration.instance = instance;
        }

        return instance;
    };

    var resolveOptions = function(requiresArray, dependencies){
        dependencies = dependencies || {};

        for (var i in requiresArray){
            var registrationName = requiresArray[i];
            var registration = lightcore.getRegistration(registrationName);

            if (!hasDependencies(registration)){
                dependencies[registrationName] = createInstanceOrReuseExistingOne(registration);
            }
            else{
                var tempDependencies = resolveOptions(registration.type.requires);
                dependencies[registrationName] = createInstanceOrReuseExistingOne(registration, tempDependencies)
            }
        }
        return dependencies;
    };

    lightcore.register = function(name, type, singleton){
        return lightcore.addRegistration({
            type: type,
            singleton: !!singleton,
            name: name
        });
    };

    lightcore.addRegistration = function(registration){
        var newRegistration = new Registration();
        newRegistration.name = registration.name;
        newRegistration.type = registration.type;
        newRegistration.singleton = !!registration.singleton;

        store[newRegistration.name] = newRegistration;
        return newRegistration
    };

    lightcore.getRegistration = function(name) {
        return store[name];
    };

    lightcore.resolve = function(name){
        var registration = lightcore.getRegistration(name);
        if (registration === undefined) {
            throw "Failed to resolve: " + name + ". Registration unknown";
        }

        if (registration.type === undefined) {
            throw "Failed to resolve: " + name + ". Registration has no constructor function";
        }

        var requiresArray = registration.type.requires || [];
        var dependencies = resolveOptions(requiresArray);

        return createInstanceOrReuseExistingOne(registration, dependencies);
    };
})()