function generateScriptText(fn) {

    // fn is going to be interpreted as a quoted string literal. As such, we need
    // to escape double-quotes in the string, and either:
    // (a) strip newlines and comments, or
    // (b) replace newlines with the character sequence "\n" (a slash followed by
    //     an n) and allow comments to be parsed as part of the function.

    // (a):
    // var fnText = fn.toString()
    //   .replace(/"/g, '\\"')                         // Escape double-quotes.
    //   .replace(/[/][/].*\r?\n/g, ' ')               // Rmv single-line comments.
    //   .replace(/\r?\n|\r/g, ' ')                    // Rmv newlines.
    //   .replace(/[/][*]((?![*][/]).)*[*][/]/g, ' '); // Rmv multi-line comments.

    // (b):
    var fnText = fn.toString()
        .replace(/"/g, '\\"')           // Escape double-quotes.
        .replace(/(\r?\n|\r)/g, '\\n'); // Insert newlines correctly.

    var scriptText =
        '(function() {\n' +
        '  var script = document.createElement("script");\n' +
        '  script.innerHTML = "(function() { (' + fnText + ')(); })()" \n'+
        '  document.body.appendChild(script);\n' +
        '})()';
    return scriptText;
}

function nameGuestWindow() {
    window.name = "packaged-app";
    console.log("new injected script", window.location.href);
}

window.addEventListener('load', function() {
    var webview = window.document.querySelector('#main');

    webview.addEventListener('loadstart', function (e) {
        webview.executeScript({ code: generateScriptText(nameGuestWindow) });
    });
});