#swiftcore.js - Lightweight and flexible dependency injection for JavaScript



##What's the point? Isn't IOC unnecessary with dynamic languages like JavaScript?

Naaah, not really! It just happens that mocking dependencies is *easier* with dynamic languages.
Still IOC makes the whole process even more easy, maintainable and transparent. If you would like to read up
on the topic I highly recommend to read this blog posting: http://coffeescripter.com/2010/08/dependency-injection-and-ioc-in-javascript/

##Ok, fine. How can I use it?

Well tests say more a thousand words so look at this:

```JavaScript
test('can resolve types depending on other types (3 levels)', function () {

    function TypeA() {
    }

    //with the default setup swiftcore will inject dependencies as one object with properties.
    //However one of the strengths of swiftcore is to be highly flexible, so if you rather would like to
    //have your types invoked with multiple parameters instead of one configuration object, that's pretty easy, too!
    function TypeB(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
        }

        //We also make sure that swiftcore didn't inject more things than necessary
        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }
    }

    //This is a key point! You need to provide a "dependencies" property with an array that names all the
    //dependencies. This way minification won't get into your way. If you like to read up on the topic
    //there is a pretty good article at the AngularJS documentation that covers the topic:
    //http://docs.angularjs.org/#!/guide/dev_guide.di.understanding_di
    //AngularJS also provides a dependency injection mechanism that works pretty much the same as swiftcore.js.

    //So at this point we essentially say "TypeB has a dependency on TypeA"

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

    //here we say TypeC depends on TypeB. So we made up a chain from TypeC to TypeB to TypeA
    TypeC.dependencies = ["typeB"];

    //Now lets register our constructor functions together with a name to resolve them later
    swiftcore.register("typeA", TypeA);
    swiftcore.register("typeB", TypeB);

    //you can also use the fluent API if that makes you feel more fancy
    swiftcore.register("typeC").withType(TypeC);

    var instance = swiftcore.resolve("typeC");
    ok(instance !== undefined);
    //at this point we know that everything went well and the dependencies have been injected. Otherwise we
    //wouldn't have reached this point
    ok(instance.test === "foo");
});
```

##Can I have more than one dependency?

Sure, man! That's the whole point. Look at this:

```JavaScript
test('can resolve types depending on multiple other types', function () {

    var instancesOfTypeA = 0;

    function TypeA() {
        instancesOfTypeA++;
    }

    //TypeB depends on TypeA - same as before
    function TypeB(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
        }

        if (Object.keys(options).length !== 1){
            throw "unexpected arguments"
        }
    }

    TypeB.dependencies = ["typeA"];

    //TypeC depends on TypeA and TypeB
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

    //All we have to do is to put another name into our array of dependencies
    TypeC.dependencies = ["typeB", "typeA"];

    swiftcore.register("typeA", TypeA);
    swiftcore.register("typeB", TypeB);
    swiftcore.register("typeC", TypeC);

    var instance = swiftcore.resolve("typeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    //This is a key point! We also tracked how many instances of TypeA have been created. There are two
    //because TypeB depends on TypeA and TypeC also depends on TypeA (together with TypeB)
    //In the next example you will see that you can also register types as singletons.
    equal(2, instancesOfTypeA);
});
```

##So, how do I use singletons?

```JavaScript
test('nested singletons are only created once', function () {

    var instancesOfTypeA = 0;

    function TypeA() {
        instancesOfTypeA++;
    }

    function TypeB(options) {
        if (options.typeA === undefined) {
            throw "missing argument [typeA]"
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

        this.test = "foo";
    }

    TypeC.dependencies = ["typeB", "typeA"];

    //The "asSingleton()" tells swiftcore to only create the instance once and reuse the same single instance
    //each time one wants to resolve "typeA"
    swiftcore.register("typeA").withType(TypeA).asSingleton();

    //We could have also registered it in this fashion but the fluent way is more descriptive
    //swiftcore.register("TypeA", TypeA, true);
    swiftcore.register("typeB", TypeB);
    swiftcore.register("typeC", TypeC);

    var instance = swiftcore.resolve("TypeC");
    ok(instance !== undefined);
    ok(instance.test === "foo");
    //This is the interesting part. In contrast to the previous example, the constructor function of TypeA was only called once
    equal(1, instancesOfTypeA);
});
```

##This all looks good but I dislike that you invoke functions with one single configuration object instead of multiple parameters

Hey, that's cool with me! Swiftcore was designed with the [open closed principle](http://en.wikipedia.org/wiki/Open/closed_principle) in mind.
You can trivially extend it to your needs!

Let's take the example of above and say you would rather have your constructor function called with multiple parameters.
Swiftcore comes with a concept of instance providers. This means swiftcore itself does not even know what it exactly means
to "create an instance of something". What it does know is when to ask the current instance provider for a new instance.
The default instance provider looks like this:

```JavaScript
swiftcore.instanceProvider.constructorBased = function(registration, dependencies){

    //depenencies is the configuration object with all dependencies already resolved
    var instance = new registration.type(dependencies);
    //instance provider should set the isInitialized flat to true to tell swiftcore that the instance has been created
    registration.isInitialized = true;

    //return the created instance
    return instance;
};
```

I leave it as an exercise to you to come up with an instance provider that does invoke the constructor function with atomic parameters.
All you then have to do is to tell swiftcore to use your custom instance provider:

```JavaScript
swiftcore.defaultInstanceProvider = myCustomInstanceProvider;
```

##What's left to say

All current features are backed by tests and its a good starting point to look at the tests in order to get used to swiftcore's features:
https://github.com/cburgdorf/swiftcore.js/tree/master/tests

The projects is MIT licensed and accepts pull requests

It's very small. The minified source is less than 3.4 kb.












