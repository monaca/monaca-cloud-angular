/**
 * Push Notification
 */
monaca.cloud.Push = {};
monaca.cloud.Push.callback = null;
monaca.cloud.Push.send = function(data) {
    if (typeof monaca.cloud.Push.callback === "function") {
        monaca.cloud.Push.callback(data);
    }
    document.addEventListener("DOMContentLoaded", function() {
        if (typeof monaca.cloud.Push.callback === "function") {
            monaca.cloud.Push.callback(data);
        } else {
            console.warn("Invalid push callback is specified.");
        }
    });
};
monaca.cloud.Push.setHandler = function(fn) {
    if (typeof fn !== "function") {
        console.warn("Push callback must be a function");
    } else {
        monaca.cloud.Push.callback = fn;
    }
};
