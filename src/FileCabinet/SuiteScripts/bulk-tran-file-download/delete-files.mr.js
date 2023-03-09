/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log", "N/search", "N/file", "N/runtime", "./constants", "./utils/util.module"], function (require, exports, log, search, file, runtime, constants_1, util_module_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.map = exports.getInputData = void 0;
    function getInputData(context) {
        log.debug(`starting file delete`, context);
        const currentScriptRt = runtime.getCurrentScript();
        const deleteConsol = currentScriptRt.getParameter({
            name: constants_1.FILE_DELETE_MR_PARAMS.deleteConsol
        });
        if (deleteConsol) {
            const searchObj = search.create({
                type: "file",
                filters: [
                    [
                        "folder",
                        "anyof",
                        constants_1.INDVIDUAL_PDF_OUTPUT_FOLDER_ID,
                        constants_1.CONSOL_PDF_OUTPUT_FOLDER_ID
                    ]
                ],
                columns: ["name"]
            });
            return searchObj;
        }
        else {
            const searchObj = search.create({
                type: "file",
                filters: [
                    [
                        "folder",
                        "anyof",
                        constants_1.INDVIDUAL_PDF_OUTPUT_FOLDER_ID
                    ]
                ],
                columns: ["name"]
            });
            return searchObj;
        }
    }
    exports.getInputData = getInputData;
    function map(context) {
        log.debug("map", context);
        const searchResult = JSON.parse(context.value);
        const fileId = searchResult.id;
        file.delete({ id: fileId });
    }
    exports.map = map;
    function summarize(context) {
        log.debug("summary", context);
        const { mapErrors } = (0, util_module_1.summarizeLogger)({
            summary: context,
            logScriptName: "Delete Files MR"
        });
        log.audit("Count of Map Errors", mapErrors.length);
    }
    exports.summarize = summarize;
});
