/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/file", "N/log", "../constants"], function (require, exports, file, log, constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProcessFileService = void 0;
    class ProcessFileService {
        constructor(options) {
            //  searchService: TransactionSearchService;
            this.transaction_ids = [];
            this.selectIndividual = options.selectIndividual;
            this.includeTranPrintout =
                options.includeTranPrintout ?? true;
            this.includeAllFiles =
                options.includeAllFiles ?? false;
            this.concatFiles = options.concatFiles ?? false;
        }
        writeProcessFile() {
            const process_options = {
                selectIndividual: this.selectIndividual,
                includeTranPrintout: this.includeTranPrintout,
                includeAllFiles: this.includeAllFiles,
                concatFiles: this.concatFiles
            };
            const newFile = file.create({
                name: `${constants_1.PROCESS_FILE_NAME_PREFIX}.txt`,
                fileType: file.Type.PLAINTEXT,
                contents: JSON.stringify({
                    submitted_at: new Date(),
                    process_options,
                    transaction_ids: this.transaction_ids
                })
            });
            newFile.folder = constants_1.OUTPUT_FOLDER_ID;
            const newFileId = newFile.save();
            log.debug("newFileId", newFileId);
        }
        setTransactionIds(vals) {
            this.transaction_ids.push(...vals);
        }
        getTransactionIds() {
            return this.transaction_ids;
        }
    }
    exports.ProcessFileService = ProcessFileService;
});
