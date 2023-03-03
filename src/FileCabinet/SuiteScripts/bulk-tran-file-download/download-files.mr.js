/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log"], function (require, exports, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    function getInputData(context) {
        log.debug(`starting file download`, context);
    }
    exports.getInputData = getInputData;
    function map(context) {
        log.debug("map", context);
    }
    exports.map = map;
    function reduce(context) {
        log.debug("reduce", context);
    }
    exports.reduce = reduce;
    function summarize(context) {
        log.debug("summary", context);
    }
    exports.summarize = summarize;
});
