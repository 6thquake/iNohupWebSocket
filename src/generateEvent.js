module.exports = function(s, args) {
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(s, false, false, args);
    return evt;
};