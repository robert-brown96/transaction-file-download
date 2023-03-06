/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/log", "N/runtime", "N/file", "N/error", "N/render", "N/xml", "./constants", "./utils/util.module"], function (require, exports, log, runtime, file, error, render, xml, constants_1, util_module_1) {
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
        const fileContent = getProcessFileContent();
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
        if (fileContent.process_options.concatFiles) {
            // get xml for concat data
            const fileObj = file.load({ id: savedFileId });
            const xmlData = xml.escape({
                xmlText: fileObj.url
            });
            context.write({
                key: String(savedFileId),
                value: xmlData
            });
        }
        else
            context.write({
                key: String(savedFileId),
                value: ""
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
        const fileContent = getProcessFileContent();
        if (fileContent.process_options.concatFiles) {
            try {
                const tranIds = [];
                const xmlStrings = [
                    '<?xml version="1.0"?>\n<!DOCTYPE pdf.html PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">',
                    "<pdfset>"
                ];
                context.output.iterator().each((key, value) => {
                    log.debug(`key ${key}`, `value ${value}`);
                    tranIds.push(parseInt(key));
                    xmlStrings.push("<pdf src='" + value + "'/>");
                    return true;
                });
                log.debug("xml string array", xmlStrings);
                xmlStrings.push("</pdfset>");
                const consolPdf = render.xmlToPdf({
                    xmlString: xmlStrings.join("\n")
                });
                consolPdf.name = `${constants_1.CONSOL_FILE_NAME_PREFIX}_${new Date().toISOString()}.pdf.html`;
                consolPdf.folder = constants_1.CONSOL_PDF_OUTPUT_FOLDER_ID;
                const consolFileId = consolPdf.save();
                log.debug({
                    title: "SAVED CONSOLIDATED FILE",
                    details: consolFileId
                });
            }
            catch (e) {
                log.error(`error consolidating pdfs`, e);
            }
        }
        else {
            const fileIds = [];
            context.output.iterator().each((key, value) => {
                log.debug(`key ${key}`, `value ${value}`);
                fileIds.push(parseInt(key));
                return true;
            });
            log.audit("Successful Processing", `Processed ${fileIds.length} files`);
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
        return parsedContent;
    };
});
