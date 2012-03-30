(function () {

    var swiftcore = window.swiftcore, store = {};

    swiftcore.defaultInstanceProvider = swiftcore.instanceProvider.constructorBased;
    swiftcore.defaultDependencyFormatter = swiftcore.dependencyFormatters.asIs;

    function Registration(){}

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
        this.isInitialized = instance !== undefined && instance !== null;
        return this;
    };

    Registration.prototype.asSingleton = function(){
        this.singleton = true;
        return this;
    };


    var hasDependencies = function(registration) {
        return !(registration.type.dependencies === undefined || registration.type.dependencies.length === 0);
    };

    var createInstanceOrReuseExistingOne = function(registration, dependencies){
        if (registration.singleton && registration.isInitialized){
            return registration.instance;
        }

        var instance = swiftcore.defaultInstanceProvider(registration, dependencies);
        if (registration.singleton){
            registration.instance = instance;
        }

        return instance;
    };

    var resolveOptions = function(dependencies){
        var options = {};

        for (var i in dependencies){
            var registrationName = dependencies[i];
            var registration = swiftcore.getRegistration(registrationName);
            var formattedDependencyName = swiftcore.defaultDependencyFormatter(registrationName);

            if (!hasDependencies(registration)){
                options[formattedDependencyName] = createInstanceOrReuseExistingOne(registration);
            }
            else{
                var tempOptions = resolveOptions(registration.type.dependencies);
                options[formattedDependencyName] = createInstanceOrReuseExistingOne(registration, tempOptions)
            }
        }
        return options;
    };

    var trimAndLowerCase = function(str){
        return str.trim().toLowerCase();
    }

    swiftcore.register = function(name, type, singleton){
        return swiftcore.addRegistration({
            type: type,
            singleton: !!singleton,
            name: name
        });
    };

    swiftcore.addRegistration = function(registration){
        var newRegistration = new Registration();
        newRegistration.name = registration.name;
        newRegistration.type = registration.type;
        newRegistration.singleton = !!registration.singleton;

        store[trimAndLowerCase(newRegistration.name)] = newRegistration;
        return newRegistration
    };

    swiftcore.getRegistration = function(name) {
        return store[trimAndLowerCase(name)];
    };

    swiftcore.resolve = function(name){
        var registration = swiftcore.getRegistration(name);
        if (registration === undefined) {
            throw "Failed to resolve: " + name + ". Registration unknown";
        }

        if (registration.type === undefined) {
            throw "Failed to resolve: " + name + ". Registration has no constructor function";
        }

        var dependencies = registration.type.dependencies || [];
        var dependencies = resolveOptions(dependencies);

        return createInstanceOrReuseExistingOne(registration, dependencies);
    };
})()