(function () {

    // Defer Qunit so RequireJS can work its magic and resolve all modules.
    QUnit.config.autostart = false;

    // Configure RequireJS so it resolves relative module paths from the `src`
    // folder.
    require.config({
        baseUrl: "../src",
    });

    // A list of all QUnit test Modules.  Make sure you include the `.js` 
    // extension so RequireJS resolves them as relative paths rather than using
    // the `baseUrl` value supplied above.
    var testModules = [
        "base/classTest.js",
        "base/nodeTest.js",
        "base/templateTest.js",
        "comTest.js"
    ];

    // Resolve all testModules and then start the Test Runner.
    require(testModules, function () {
        QUnit.load();
        QUnit.start();
    });
}());
