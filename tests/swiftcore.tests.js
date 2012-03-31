module("swiftcore.tests");

test('can register types', function () {

    function SomeType() {
    }

    swiftcore.register("SomeType", SomeType);
    var registration = swiftcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
});

test('can resolve types', function () {

    function SomeType() {
        this.test = "foo";
    }

    swiftcore.register("SomeType", SomeType);
    var instance = swiftcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('resolves types insensitive to case or whitespace', function () {

    function SomeType() {
        this.test = "foo";
    }

    swiftcore.register("SomeType", SomeType);
    var instance = swiftcore.resolve("sometype");

    swiftcore.register("Some Type", SomeType);
    var instance2 = swiftcore.resolve("sometype ");

    ok(instance !== undefined);
    ok(instance.test === "foo");

    ok(instance2 !== undefined);
    ok(instance2.test === "foo");
});

test('multiple resolves result in different instances', function () {

    function SomeType() {
        this.test = "foo";
    }

    swiftcore.register("SomeType", SomeType);
    var instance1 = swiftcore.resolve("SomeType");
    var instance2 = swiftcore.resolve("SomeType");

    ok(instance1 !== undefined);
    ok(instance1.test === "foo");
    ok(instance2 !== undefined);
    ok(instance2.test === "foo");
    ok(instance1 !== instance2)
});

test('multiple resolves result in same instances with singleton option', function () {

    function SomeType() {
        this.test = "foo";
    }

    swiftcore.register("SomeType", SomeType, true);
    var instance1 = swiftcore.resolve("SomeType");
    var instance2 = swiftcore.resolve("SomeType");

    ok(instance1 !== undefined);
    ok(instance1.test === "foo");
    ok(instance2 !== undefined);
    ok(instance2.test === "foo");
    ok(instance1 === instance2)
});

test('can resolve types depending on other types', function () {

    function TypeA() {
    }

    function SomeType(options) {
        if (options.TypeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }

        this.test = "foo";
    }

    SomeType.dependencies = ["TypeA"];

    swiftcore.register("TypeA", TypeA);
    swiftcore.register("SomeType", SomeType);
    var instance = swiftcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('can resolve types depending on other types (3 levels)', function () {

    function TypeA() {
    }

    function TypeB(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }
    }

    TypeB.dependencies = ["typeA"];

    function TypeC(options) {
        if (options.typeB === undefined) {
            throw "missing argument [typeB]"
        }

        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }

        this.test = "foo";
    }

    TypeC.dependencies = ["typeB"];

    swiftcore.register("typeA", TypeA);
    swiftcore.register("typeB", TypeB);
    swiftcore.register("typeC").withType(TypeC);

    var instance = swiftcore.resolve("typeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

test('can resolve types depending on multiple other types', function () {

    var instancesOfTypeA = 0;

    function TypeA() {
        instancesOfTypeA++;
    }

    function TypeB(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }
    }

    TypeB.dependencies = ["typeA"];

    function TypeC(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (options.typeB === undefined) {
            throw "missing argument [typeB]"
        }

        if (Object.keys(options).length !== 2){
            throw "unexpected arguments"
        }

        this.test = "foo";
    }

    TypeC.dependencies = ["typeB", "typeA"];

    swiftcore.register("typeA", TypeA);
    swiftcore.register("typeB", TypeB);
    swiftcore.register("typeC", TypeC);

    var instance = swiftcore.resolve("typeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    equal(2, instancesOfTypeA);
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

    TypeB.dependencies = ["TypeA"];

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

    TypeC.dependencies = ["TypeB", "TypeA"];

    swiftcore.register("TypeA", TypeA, true);
    swiftcore.register("TypeB", TypeB, true);
    swiftcore.register("TypeC", TypeC, true);

    var instance = swiftcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    equal(3, creations);
});