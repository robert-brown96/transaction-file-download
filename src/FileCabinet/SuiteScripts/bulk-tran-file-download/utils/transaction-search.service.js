/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/format", "N/log", "N/search"], function (require, exports, format, log, search) {
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
            this.transactionSearchColStatus = search.createColumn({ name: "status" });
            this.transactionSearchColSubsidiary = search.createColumn({
                name: "subsidiary"
            });
            this.transactionSearchColNameNoHierarchy = search.createColumn({
                name: "namenohierarchy",
                join: "subsidiary"
            });
            this.transactionSearchColName = search.createColumn({
                name: "entity"
            });
            this.transactionSearchColDocumentNumber = search.createColumn({ name: "tranid" });
            this.transactionSearchColDate = search.createColumn({
                name: "trandate",
                sort: search.Sort.DESC
            });
            this.transactionSearchColAmount = search.createColumn({ name: "amount" });
            this.searchColumns = [
                this.transactionSearchColType,
                this.transactionSearchColStatus,
                this.transactionSearchColSubsidiary,
                this.transactionSearchColNameNoHierarchy,
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
            if (options.ALL_TRAN_TYPES ||
                options.TRAN_TYPES.length === 0) {
                this.transaction_types.push("creditmemo");
                this.transaction_types.push("invoice");
                // this.transaction_types.push("vendorbill");
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
        // private getStartDateFilter(v: Date): search.Filter {
        //     return search.createFilter({
        //         name: "trandate",
        //         operator: search.Operator.ONORAFTER,
        //         values: v
        //     });
        // }
        getEndDateFilter(v) {
            return search.createFilter({
                name: "trandate",
                operator: search.Operator.ONORBEFORE,
                values: format.format({
                    value: new Date(v),
                    type: format.Type.DATE
                })
            });
        }
        getCustomerFilter() {
            return search.createFilter({
                name: "name",
                operator: search.Operator.ANYOF,
                values: this.entity
            });
        }
        getSubsidiaryFilter() {
            return search.createFilter({
                name: "subsidiary",
                operator: search.Operator.ANYOF,
                values: [this.subsidiary]
            });
        }
        buildSearchFilters() {
            if (this.start_date) {
                const myNewFilter = search.createFilter({
                    name: "trandate",
                    operator: search.Operator.ONORAFTER,
                    values: format.format({
                        value: new Date(this.start_date),
                        type: format.Type.DATE
                    })
                });
                this.searchFilters.push(myNewFilter);
            }
            if (this.end_date) {
                const f = this.getEndDateFilter(this.end_date);
                this.searchFilters.push(f);
            }
            if (this.entity)
                this.searchFilters.push(this.getCustomerFilter());
            if (this.subsidiary)
                this.searchFilters.push(this.getSubsidiaryFilter());
            const statusFilter = this.getStatusFilter();
            if (statusFilter)
                this.searchFilters.push(statusFilter);
        }
        runSearch(pageSize) {
            this.buildSearchFilters();
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
            log.debug({
                title: "search check",
                details: JSON.stringify(searchObj)
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
                    const subsidiaryVal = res.getValue(this.transactionSearchColNameNoHierarchy);
                    const entityVal = res.getValue(this.transactionSearchColName);
                    const dateVal = res.getValue(this.transactionSearchColDate);
                    results.push({
                        id: parseInt(res.id),
                        type: res.getValue(this.transactionSearchColType) === "CustInvc"
                            ? "Invoice"
                            : "Credit Memo",
                        raw_type: res.getValue(this.transactionSearchColType) === "CustInvc"
                            ? "invoice"
                            : "creditmemo",
                        status: res.getText(this.transactionSearchColStatus),
                        subsidiary: subsidiaryVal,
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
            // if (this.transaction_types.includes("vendorbill"))
            //     vals.push("VendBill");
            return search.createFilter({
                name: "type",
                operator: search.Operator.ANYOF,
                values: vals
            });
        }
        getStatusFilter() {
            if (!this.transaction_status ||
                this.transaction_status.length === 0)
                return false;
            return search.createFilter({
                name: "status",
                operator: search.Operator.ANYOF,
                values: this.transaction_status
            });
        }
    }
    exports.TransactionSearchService = TransactionSearchService;
});
