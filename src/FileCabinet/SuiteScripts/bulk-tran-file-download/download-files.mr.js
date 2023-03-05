/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log", "N/runtime", "N/file", "N/error", "N/render", "./constants", "./utils/util.module"], function (require, exports, log, runtime, file, error, render, constants_1, util_module_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    function getInputData(context) {
        log.debug(`starting file download`, context);
        try {
            const fileData = getProcessFileContent();
            return fileData.transaction_ids;
        }
        catch (e) {
            log.error("Error in getInputData", e);
            return [];
        }
    }
    exports.getInputData = getInputData;
    function map(context) {
        log.debug("map", context);
        const transactionId = context.value;
        log.debug("map transactionId", transactionId);
        // v1 only write tran id to reduce
        context.write({ key: transactionId, value: "" });
    }
    exports.map = map;
    function reduce(context) {
        log.debug("reduce", context);
        const tranId = context.key;
        const pdfFile = render.transaction({
            entityId: parseInt(tranId),
            printMode: "PDF"
        });
        log.debug("created pdfFile", pdfFile);
        pdfFile.folder = constants_1.INDVIDUAL_PDF_OUTPUT_FOLDER_ID;
        pdfFile.isOnline = true;
        const savedFileId = pdfFile.save();
        log.debug("created pdfFile savedFileId", savedFileId);
        context.write({
            key: "new_ids",
            value: String(savedFileId)
        });
    }
    exports.reduce = reduce;
    function summarize(context) {
        log.debug("summary", context);
        const { mapErrors, reduceErrors } = (0, util_module_1.summarizeLogger)({
            summary: context,
            logScriptName: "Download Files MR"
        });
        log.audit("Count of Map Errors", mapErrors.length);
        log.audit("Count of Reduce Errors", reduceErrors.length);
        try {
            const tranIds = [];
            context.output.iterator().each((key, value) => {
                log.debug(`key ${key}`, `value ${value}`);
                tranIds.push(parseInt(value));
                return true;
            });
            log.debug("all pdf ids", tranIds);
        }
        catch (e) {
            log.error(`error consolidating pdfs`, e);
        }
    }
    exports.summarize = summarize;
    const getProcessFileContent = () => {
        const currentScriptRt = runtime.getCurrentScript();
        const inputFileId = currentScriptRt.getParameter({
            name: constants_1.FILE_DOWNLOAD_MR_PARAMS.fileId
        });
        if (!inputFileId ||
            (typeof inputFileId !== "string" &&
                typeof inputFileId !== "number"))
            throw error.create({
                name: "MISSING_FILE_INPUT",
                message: `input file id submission of ${inputFileId} is invalid`
            });
        const fileObj = file.load({ id: inputFileId });
        const contents = fileObj.getContents();
        const parsedContent = contents
            ? JSON.parse(contents)
            : {};
        log.debug(`loaded file contents`, contents);
        log.debug(`loaded file tran ids`, parsedContent.transaction_ids);
        return parsedContent;
    };
});
