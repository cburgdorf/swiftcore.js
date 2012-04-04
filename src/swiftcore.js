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

    Registration.prototype.withOptions = function(options){
        this.options = options;
        return this;
    };

    Registration.prototype.withInstanceProvider = function (instanceProvider){
        this.instanceProvider = instanceProvider;
    };

    var hasDependencies = function(registration) {
        return !(registration.type.dependencies === undefined || registration.type.dependencies.length === 0);
    };

    var createInstanceOrReuseExistingOne = function(registration, options){
        if (registration.singleton && registration.isInitialized){
            return registration.instance;
        }

        //Todo think about if that's really the right way to handle options. It could be problematic that the
        //instance provider has no *convenient* way to see which parts of the object were dependencies
        //and what were registered options.

        //think about swiftcore.defaultInstanceProvider(registration, cleanOptions, extendedOptions);

        deepExtend(options, registration.options);

        var instanceProvider = registration.instanceProvider || swiftcore.defaultInstanceProvider;

        var instance = instanceProvider(registration, options);
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
                options[formattedDependencyName] = createInstanceOrReuseExistingOne(registration, tempOptions);
            }
        }
        return options;
    };

    var trimAndLowerCase = function(str){
        return str.trim().toLowerCase();
    };

    //this code is stolen from here: http://noteslog.com/post/how-to-force-jqueryextend-deep-recursion/
    var deepExtend = function() {
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

        if (target.constructor == Boolean) {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }

        if (typeof target != "object" && typeof target != "function")
            target = {};

        if (length == 1) {
            target = this;
            i = 0;
        }

        for (; i < length; i++)
            if ((options = arguments[i]) != null)
                for ( var name in options ) {
                    if (target === options[name])
                        continue;

                    if (deep && options[name] && typeof options[name] == "object" && target[name] && !options[name].nodeType)
                        target[name] = deepExtend(true, target[name], options[name]);

                    else if (options[name] != undefined )
                        target[name] = options[name];
                }

        return target;
    };

    swiftcore.register = function(name, type, singleton){
        return swiftcore.addRegistration({
            type: type,
            singleton: !!singleton,
            name: name
        });
    };

    swiftcore.addRegistration = function(registration){
        var newRegistration = new Registration();
        deepExtend(newRegistration, registration);
        store[trimAndLowerCase(newRegistration.name)] = newRegistration;
        return newRegistration;
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
        dependencies = resolveOptions(dependencies);

        return createInstanceOrReuseExistingOne(registration, dependencies);
    };
})();