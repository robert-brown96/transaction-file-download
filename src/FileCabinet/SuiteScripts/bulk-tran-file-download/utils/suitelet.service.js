/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/log", "N/search", "N/task", "../constants", "./process-file.service"], function (require, exports, log, search, task, constants_1, process_file_service_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostService = void 0;
    class PostService {
        // private readonly transactionSearchColType =
        //     search.createColumn({
        //         name: "type"
        //     });
        // private readonly searchType = search.Type.TRANSACTION;
        constructor(options) {
            this.searchFilters = [];
            this.selectIndividual = options.selectIndividual;
            this.includeTranPrintout =
                options.includeTranPrintout;
            this.includeAllFiles = options.includeAllFiles;
            this.concatFiles = options.concatFiles;
            this.request = options.request;
            this.processFileService = new process_file_service_1.ProcessFileService({
                selectIndividual: options.selectIndividual,
                includeTranPrintout: options.includeTranPrintout,
                includeAllFiles: options.includeAllFiles,
                concatFiles: options.concatFiles
            });
            this.searchFilters.push(search.createFilter({
                name: "mainline",
                operator: search.Operator.IS,
                values: "T"
            }));
        }
        getSelectedIds() {
            const request = this.request;
            const lineItemCount = request.getLineCount({
                group: constants_1.SUITELET_SUBLIST_ID
            });
            const resultIds = [];
            for (let line = 0; lineItemCount !== 0 && line < lineItemCount; line++) {
                const processVal = request.getSublistValue({
                    group: constants_1.SUITELET_SUBLIST_ID,
                    line,
                    name: constants_1.SUITELET_SUBLIST_FIELD_IDS.process
                });
                log.debug(`process value for line ${line}`, processVal);
                if (processVal === "T") {
                    //c
                    const tranId = request.getSublistValue({
                        group: constants_1.SUITELET_SUBLIST_ID,
                        line,
                        name: constants_1.SUITELET_SUBLIST_FIELD_IDS.id
                    });
                    resultIds.push(parseInt(tranId));
                }
            }
            return resultIds;
        }
        invokeMapReduce(fileId) {
            const mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: constants_1.FILE_DOWNLOAD_MR.scriptId,
                deploymentId: constants_1.FILE_DOWNLOAD_MR.deploymentId
            });
            // TODO: find out error when using variable object key for params
            mrTask.params = {
                custscript_scgtfd_mr_process_file_id: fileId
            };
            return mrTask.submit();
        }
    }
    exports.PostService = PostService;
});
