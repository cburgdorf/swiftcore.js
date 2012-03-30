
module("swiftcore.fluentapi.tests");

test('can register types', function () {

    function SomeType() {
    }

    swiftcore.register("SomeType").withType(SomeType);
    var registration = swiftcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
});

test('can register types', function () {

    function SomeType() {
    }

    var instance = new SomeType();

    swiftcore
        .register("SomeType")
        .withType(SomeType)
        .withInstance(instance);

    var registration = swiftcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
    ok(registration.instance === instance);
    ok(registration.isInitialized);

});

test('can register types', function () {

    function SomeType() {
    }

    var instance = new SomeType();

    swiftcore
        .register("SomeType")
        .withType(SomeType)
        .withInstance(instance)
        .asSingleton();

    var registration = swiftcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
    ok(registration.instance === instance);
    ok(registration.singleton);
});

