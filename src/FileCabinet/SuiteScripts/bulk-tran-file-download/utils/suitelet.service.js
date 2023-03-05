/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/log", "N/search", "../constants"], function (require, exports, log, search, constants_1) {
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
    }
    exports.PostService = PostService;
});
