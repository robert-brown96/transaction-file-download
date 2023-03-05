/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log", "N/runtime", "N/file", "N/error", "N/render", "./constants"], function (require, exports, log, runtime, file, error, render, constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    function getInputData(context) {
        log.debug(`starting file download`, context);
        const currentScriptRt = runtime.getCurrentScript();
        const inputFileId = currentScriptRt.getParameter({
            name: constants_1.FILE_DOWNLOAD_MR_PARAMS.fileId
        });
        if (!inputFileId)
            throw error.create({
                name: "MISSING_FILE_INPUT",
                message: `input file id submission of ${inputFileId} is invalid`
            });
        if (inputFileId &&
            (typeof inputFileId === "string" ||
                typeof inputFileId === "number")) {
            const fileObj = file.load({ id: inputFileId });
            const contents = fileObj.getContents();
            const parsedContent = contents
                ? JSON.parse(contents)
                : null;
            log.debug(`loaded file contents`, contents);
            log.debug(`loaded file tran ids`, parsedContent.transaction_ids);
            return parsedContent.transaction_ids;
        }
        else
            return;
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
    }
    exports.summarize = summarize;
});
