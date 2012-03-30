
module("lightcore.fluentapi.tests");

test('can register types', function () {

    function SomeType() {
    }

    lightcore.register("SomeType").withType(SomeType);
    var registration = lightcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
});

test('can register types', function () {

    function SomeType() {
    }

    var instance = new SomeType();

    lightcore
        .register("SomeType")
        .withType(SomeType)
        .withInstance(instance);

    var registration = lightcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
    ok(registration.instance === instance);
});

test('can register types', function () {

    function SomeType() {
    }

    var instance = new SomeType();

    lightcore
        .register("SomeType")
        .withType(SomeType)
        .withInstance(instance)
        .asSingleton();

    var registration = lightcore.getRegistration("SomeType");
    ok(registration !== undefined);
    ok(registration.type === SomeType);
    ok(registration.instance === instance);
    ok(registration.singleton);
});

