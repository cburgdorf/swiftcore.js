module("lightcore.instanceprovider.initializebased.tests", {
    setup:function () {
        lightcore.defaultInstanceProvider = lightcore.instanceProvider.initializeBased;
    },
    teardown:function(){
        lightcore.defaultInstanceProvider = lightcore.instanceProvider.constructorBased;
    }
});

test('can resolve types', function () {

    function SomeType() {
        var self = this;
        self.initialize = function(){
            self.test = "foo";
        };
    }

    lightcore.addRegistration({
        name:"SomeType",
        type:SomeType,
        instance:new SomeType()
    });
    var instance = lightcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('multiple resolves result in multiple initialize calls', function () {

    function SomeType() {
        var self = this;
        self.initCount = 0;
        self.initialize = function(){
            self.test = "foo";
            self.initCount++;
        };
    }

    lightcore.addRegistration({
        name: "SomeType",
        type: SomeType,
        instance: new SomeType()
    });

    var instance1 = lightcore.resolve("SomeType");
    var instance2 = lightcore.resolve("SomeType");

    ok(instance1 !== undefined);
    ok(instance1.test === "foo");
    ok(instance2 !== undefined);
    ok(instance2.test === "foo");
    ok(instance1.initCount === 2)
});



test('multiple resolves result in one initialize call with singleton option', function () {

    function SomeType() {
        var self = this;
        self.initCount = 0;
        self.initialize = function(){
            self.test = "foo";
            self.initCount++;
        };
    }

    lightcore.addRegistration({
        name: "SomeType",
        type: SomeType,
        instance: new SomeType(),
        singleton: true
    });

    var instance1 = lightcore.resolve("SomeType");
    var instance2 = lightcore.resolve("SomeType");

    ok(instance1 !== undefined);
    ok(instance1.test === "foo");
    ok(instance2 !== undefined);
    ok(instance2.test === "foo");
    ok(instance1.initCount === 1)
});




test('can resolve types depending on other types', function () {

    function TypeA() {
        this.initialize = function(){};
    }

    function SomeType() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeA === undefined){
                throw "missing argument [TypeA]"
            }
            self.test = "foo";

            if (Object.keys(options).length !== 1){
                throw "unexpected arguments"
            }

        };
    }

    SomeType.requires = ["TypeA"];

    lightcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA()
    });

    lightcore.addRegistration({
        name: "SomeType",
        type: SomeType,
        instance: new SomeType()
    });

    var instance = lightcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('can resolve types depending on other types (3 levels)', function () {
    function TypeA() {
        this.initialize = function(){};
    }

    function TypeB() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeA === undefined){
                throw "missing argument [TypeA]"
            }

            if (Object.keys(options).length !== 1){
                throw "unexpected arguments"
            }
        };
    }

    TypeB.requires = ["TypeA"];

    function TypeC() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeB === undefined){
                throw "missing argument [TypeA]"
            }

            if (Object.keys(options).length !== 1){
                throw "unexpected arguments"
            }

            this.test = "foo";
        };
    }

    TypeC.requires = ["TypeB"];

    lightcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA()
    });

    lightcore.addRegistration({
        name: "TypeB",
        type: TypeB,
        instance: new TypeB()
    });

    lightcore.addRegistration({
        name: "TypeC",
        type: TypeC,
        instance: new TypeC()
    });

    var instance = lightcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});


test('can resolve types depending on multiple other types', function () {

    function TypeA() {
        this.initialize = function(){};
    }

    function TypeB() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeA === undefined){
                throw "missing argument [TypeA]"
            }

            if (Object.keys(options).length !== 1){
                throw "unexpected arguments"
            }
        };
    }

    TypeB.requires = ["TypeA"];

    function TypeC() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeB === undefined){
                throw "missing argument [TypeB]"
            }

            if (options.TypeA === undefined){
                throw "missing argument [TypeA]"
            }

            if (Object.keys(options).length !== 2){
                throw "unexpected arguments"
            }

            this.test = "foo";
        };
    }

    TypeC.requires = ["TypeB", "TypeA"];

    lightcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA()
    });

    lightcore.addRegistration({
        name: "TypeB",
        type: TypeB,
        instance: new TypeB()
    });

    lightcore.addRegistration({
        name: "TypeC",
        type: TypeC,
        instance: new TypeC()
    });

    var instance = lightcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('nested singletons are only created once', function () {
    var creations = 0;

    function TypeA() {
        this.initialize = function(){
            creations++;
        };
    }

    function TypeB() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeA === undefined){
                throw "missing argument [TypeA]"
            }

            if (Object.keys(options).length !== 1){
                throw "unexpected arguments"
            }
            creations++;
        };
    }

    TypeB.requires = ["TypeA"];

    function TypeC() {
        var self = this;
        self.initialize = function(options){
            if (options.TypeB === undefined){
                throw "missing argument [TypeB]"
            }

            if (options.TypeA === undefined){
                throw "missing argument [TypeA]"
            }

            if (Object.keys(options).length !== 2){
                throw "unexpected arguments"
            }

            this.test = "foo";
            creations++;
        };
    }

    TypeC.requires = ["TypeB", "TypeA"];

    lightcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA(),
        singleton: true
    });

    lightcore.addRegistration({
        name: "TypeB",
        type: TypeB,
        instance: new TypeB(),
        singleton: true
    });

    lightcore.addRegistration({
        name: "TypeC",
        type: TypeC,
        instance: new TypeC(),
        singleton: true
    });

    var instance = lightcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    equal(3, creations);
});