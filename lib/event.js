/**
 * 模拟event
 *
 */
class MockEvent{
    constructor(){
        const eventTarget = document.createElement('div');
        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
    }
    generateEvent(s, args){
        let evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(s, false, false, args);
        return evt;
    }
}