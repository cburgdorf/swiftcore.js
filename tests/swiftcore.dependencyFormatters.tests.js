module("swiftcore.dependencyFormatters.tests",{
    setup: function(){
        swiftcore.defaultDependencyFormatter = swiftcore.dependencyFormatters.camelCase;
    },
    teardown:function(){
        swiftcore.defaultDependencyFormatter = swiftcore.dependencyFormatters.asIs;
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
    swiftcore.register("TypeA", TypeA);
    swiftcore.register("SomeType", SomeType);
    var instance = swiftcore.resolve("SomeType");
    ok(instance !== undefined);
    ok(instance.test === "foo");
});

