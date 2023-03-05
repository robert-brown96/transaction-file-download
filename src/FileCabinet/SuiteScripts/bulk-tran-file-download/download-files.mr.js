/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log", "N/runtime", "N/file", "./constants"], function (require, exports, log, runtime, file, constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    function getInputData(context) {
        log.debug(`starting file download`, context);
        const currentScriptRt = runtime.getCurrentScript();
        const inputFileId = currentScriptRt.getParameter({
            name: constants_1.FILE_DOWNLOAD_MR_PARAMS.fileId
        });
        if (inputFileId &&
            (typeof inputFileId === "string" ||
                typeof inputFileId === "number")) {
            const fileObj = file.load({ id: inputFileId });
            let contents = fileObj.getContents();
            contents = contents ? JSON.parse(contents) : null;
            log.debug(`loaded file contents`, contents);
        }
        else
            return;
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
