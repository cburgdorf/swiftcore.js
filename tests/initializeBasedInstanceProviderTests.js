module("initializeBasedInstnaceProviderTests", {
    setup:function () {
        lightcore.defaultInstanceProvider = lightcore.instanceProvider.initializeBased;
    }
});

test('can resolve types', function () {

    function SomeType() {
        var self = this;
        self.initialize = function(){
            self.test = "foo";
        };
    }

    lightcore.register("SomeType", SomeType);
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

    lightcore.register("SomeType", SomeType);
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

    lightcore.register("SomeType", SomeType);
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


/*

test('can resolve types depending on other types', function () {

    function TypeA() {
    }

    function SomeType(options) {
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }
        this.test = "foo";
    }

    SomeType.requires = ["TypeA"];

    lightcore.register("TypeA", TypeA);
    lightcore.register("SomeType", SomeType);
    var instance = lightcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('can resolve types depending on other types (3 levels)', function () {

    function TypeA() {
    }

    function TypeB(options) {
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }
    }

    TypeB.requires = ["TypeA"];

    function TypeC(options) {
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }

        this.test = "foo";
    }

    TypeC.requires = ["TypeB"];

    lightcore.register("TypeA", TypeA);
    lightcore.register("TypeB", TypeB);
    lightcore.register("TypeC", TypeC);

    var instance = lightcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('can resolve types depending on multiple other types', function () {

    function TypeA() {
    }

    function TypeB(options) {
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }
    }

    TypeB.requires = ["TypeA"];

    function TypeC(options) {
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (options.TypeB === undefined) {
            throw "missing argument [typeB]"
        }

        this.test = "foo";
    }

    TypeC.requires = ["TypeB", "TypeA"];

    lightcore.register("TypeA", TypeA);
    lightcore.register("TypeB", TypeB);
    lightcore.register("TypeC", TypeC);

    var instance = lightcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('nested singletons are only created once', function () {

    var creations = 0;

    function TypeA() {
        creations++;
    }

    function TypeB(options) {
        creations++;
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }
    }

    TypeB.requires = ["TypeA"];

    function TypeC(options) {
        creations++;
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (options.TypeB === undefined) {
            throw "missing argument [typeB]"
        }

        this.test = "foo";
    }

    TypeC.requires = ["TypeB", "TypeA"];

    lightcore.register("TypeA", TypeA, true);
    lightcore.register("TypeB", TypeB, true);
    lightcore.register("TypeC", TypeC, true);

    var instance = lightcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    equal(3, creations);
});*/
