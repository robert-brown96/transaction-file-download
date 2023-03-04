/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/log", "N/search"], function (require, exports, log, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransactionSearchService = void 0;
    class TransactionSearchService {
        constructor(options) {
            this.transaction_types = [];
            this.transaction_status = [];
            this.searchFilters = [];
            this.transactionSearchColType = search.createColumn({
                name: "type"
            });
            this.transactionSearchColStatus = search.createColumn({ name: "statusref" });
            this.transactionSearchColSubsidiary = search.createColumn({ name: "subsidiary" });
            this.transactionSearchColName = search.createColumn({
                name: "entity"
            });
            this.transactionSearchColDocumentNumber = search.createColumn({ name: "tranid" });
            this.transactionSearchColDate = search.createColumn({
                name: "trandate"
            });
            this.transactionSearchColAmount = search.createColumn({ name: "amount" });
            this.searchColumns = [
                this.transactionSearchColType,
                this.transactionSearchColStatus,
                this.transactionSearchColSubsidiary,
                this.transactionSearchColName,
                this.transactionSearchColDocumentNumber,
                this.transactionSearchColDate,
                this.transactionSearchColAmount
            ];
            this.searchType = search.Type.TRANSACTION;
            // set base properties
            this.start_date = options.START_DATE;
            this.end_date = options.END_DATE;
            this.entity = options.CUSTOMER;
            this.subsidiary = options.SUBSIDIARY;
            // get transaction types property
            if (options.ALL_TRAN_TYPES) {
                this.transaction_types.push("creditmemo");
                this.transaction_types.push("invoice");
                this.transaction_types.push("vendorbill");
            }
            else {
                this.transaction_types.push(...options.TRAN_TYPES);
            }
            this.transaction_status.push(...options.TRAN_STATUS);
            // initial filters
            this.searchFilters.push(...[
                search.createFilter({
                    name: "mainline",
                    operator: search.Operator.IS,
                    values: "T"
                }),
                this.getTranTypeFilter()
            ]);
        }
        runSearch(pageSize) {
            const searchObj = search.create({
                type: this.searchType,
                filters: this.searchFilters,
                columns: this.searchColumns,
                settings: [
                    search.createSetting({
                        name: "consolidationtype",
                        value: "NONE"
                    })
                ]
            });
            return searchObj.runPaged({ pageSize });
        }
        fetchSearchResult({ pagedData, pageIndex }) {
            try {
                const searchPage = pagedData.fetch({
                    index: pageIndex
                });
                const results = [];
                searchPage.data.forEach((res) => {
                    const subsidiaryVal = res.getValue(this.transactionSearchColSubsidiary);
                    const entityVal = res.getText(this.transactionSearchColName);
                    const dateVal = res.getValue(this.transactionSearchColDate);
                    results.push({
                        id: parseInt(res.id),
                        type: res.getValue(this.transactionSearchColType),
                        status: res.getValue(this.transactionSearchColStatus),
                        subsidiary: typeof subsidiaryVal === "number"
                            ? subsidiaryVal
                            : parseInt(subsidiaryVal),
                        entity: typeof entityVal === "number"
                            ? entityVal
                            : parseInt(entityVal),
                        trannumber: res.getValue(this
                            .transactionSearchColDocumentNumber),
                        date: typeof dateVal === "string"
                            ? new Date(dateVal)
                            : dateVal,
                        amount: res.getValue(this.transactionSearchColAmount)
                    });
                    return true;
                });
                return results;
            }
            catch (e) {
                log.error({
                    title: "ERROR GETTING SEARCH RESULTS",
                    details: e
                });
                return [];
            }
        }
        getTranTypeFilter() {
            const vals = [];
            if (this.transaction_types.includes("invoice"))
                vals.push("CustInvc");
            if (this.transaction_types.includes("creditmemo"))
                vals.push("CustCred");
            if (this.transaction_types.includes("vendorbill"))
                vals.push("VendBill");
            return search.createFilter({
                name: "type",
                operator: search.Operator.ANYOF,
                values: vals
            });
        }
    }
    exports.TransactionSearchService = TransactionSearchService;
});
