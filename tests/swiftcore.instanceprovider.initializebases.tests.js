module("swiftcore.instanceprovider.initializebased.tests", {
    setup:function () {
        swiftcore.defaultInstanceProvider = swiftcore.instanceProvider.initializeBased;
    },
    teardown:function(){
        swiftcore.defaultInstanceProvider = swiftcore.instanceProvider.constructorBased;
    }
});

test('can resolve types', function () {

    function SomeType() {
        var self = this;
        self.initialize = function(){
            self.test = "foo";
        };
    }

    swiftcore.addRegistration({
        name:"SomeType",
        type:SomeType,
        instance:new SomeType()
    });
    var instance = swiftcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('can resolve instance provider on a per registration basis', function () {

    function TypeA(){
        var self = this;
        self.initialize = function(){
            self.test = "foo";
        };
    }

    function SomeType(options) {
        var self = this;
        if (options.typeA === undefined){
            throw "missing argument [typeA]";
        }

        self.boo = options.typeA.test;
    }
    SomeType.dependencies = ["typeA"]

    swiftcore
        .register("typeA")
        .withType(TypeA);

    swiftcore
        .register("someType")
        .withType(SomeType)
        .withInstanceProvider(swiftcore.instanceProvider.constructorBased);

    var instance = swiftcore.resolve("someType");
    ok(instance !== undefined);
    ok(instance.boo === "foo");
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

    swiftcore.addRegistration({
        name: "SomeType",
        type: SomeType,
        instance: new SomeType()
    });

    var instance1 = swiftcore.resolve("SomeType");
    var instance2 = swiftcore.resolve("SomeType");

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

    swiftcore.addRegistration({
        name: "SomeType",
        type: SomeType,
        instance: new SomeType(),
        singleton: true
    });

    var instance1 = swiftcore.resolve("SomeType");
    var instance2 = swiftcore.resolve("SomeType");

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

    SomeType.dependencies = ["TypeA"];

    swiftcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA()
    });

    swiftcore.addRegistration({
        name: "SomeType",
        type: SomeType,
        instance: new SomeType()
    });

    var instance = swiftcore.resolve("SomeType");
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

    TypeB.dependencies = ["TypeA"];

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

    TypeC.dependencies = ["TypeB"];

    swiftcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA()
    });

    swiftcore.addRegistration({
        name: "TypeB",
        type: TypeB,
        instance: new TypeB()
    });

    swiftcore.addRegistration({
        name: "TypeC",
        type: TypeC,
        instance: new TypeC()
    });

    var instance = swiftcore.resolve("TypeC");
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

    TypeB.dependencies = ["TypeA"];

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

    TypeC.dependencies = ["TypeB", "TypeA"];

    swiftcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA()
    });

    swiftcore.addRegistration({
        name: "TypeB",
        type: TypeB,
        instance: new TypeB()
    });

    swiftcore.addRegistration({
        name: "TypeC",
        type: TypeC,
        instance: new TypeC()
    });

    var instance = swiftcore.resolve("TypeC");
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

    TypeB.dependencies = ["TypeA"];

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

    TypeC.dependencies = ["TypeB", "TypeA"];

    swiftcore.addRegistration({
        name: "TypeA",
        type: TypeA,
        instance: new TypeA(),
        singleton: true
    });

    swiftcore.addRegistration({
        name: "TypeB",
        type: TypeB,
        instance: new TypeB(),
        singleton: true
    });

    swiftcore.addRegistration({
        name: "TypeC",
        type: TypeC,
        instance: new TypeC(),
        singleton: true
    });

    var instance = swiftcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    equal(3, creations);
});