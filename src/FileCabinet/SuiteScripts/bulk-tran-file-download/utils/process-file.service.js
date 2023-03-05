/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProcessFileService = void 0;
    class ProcessFileService {
        constructor(options) {
            this.transaction_ids = [];
            this.selectIndividual = options.selectIndividual;
            this.includeTranPrintout =
                options.includeTranPrintout ?? true;
            this.includeAllFiles =
                options.includeAllFiles ?? false;
            this.concatFiles = options.concatFiles ?? false;
        }
    }
    exports.ProcessFileService = ProcessFileService;
});
