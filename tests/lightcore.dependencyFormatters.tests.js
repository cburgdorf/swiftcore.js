module("lightcore.dependencyFormatters.tests",{
    setup: function(){
        lightcore.defaultDependencyFormatter = lightcore.dependencyFormatters.camelCase;
    },
    teardown:function(){
        lightcore.defaultDependencyFormatter = lightcore.dependencyFormatters.asIs;
    }
});

test('can resolve types depending on other types', function () {

    function TypeA() {
    }

    function SomeType(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
        }
        this.test = "foo";

        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }
    }

    SomeType.requires = ["TypeA"];
    lightcore.register("TypeA", TypeA);
    lightcore.register("SomeType", SomeType);
    var instance = lightcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

