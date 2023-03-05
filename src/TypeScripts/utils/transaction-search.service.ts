/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import {
    ISearchParameters,
    ITransactionResult,
    TSupportedTranType
} from "../globals";
import format = require("N/format");
import log = require("N/log");
import search = require("N/search");

export class TransactionSearchService {
    start_date: Date;
    end_date?: Date;
    entity?: number;
    subsidiary?: number;
    transaction_types: TSupportedTranType[] = [];
    transaction_status: string[] = [];

    private searchFilters: search.Filter[] = [];

    private transactionSearchColType = search.createColumn({
        name: "type"
    });
    private transactionSearchColStatus =
        search.createColumn({ name: "status" });
    private transactionSearchColSubsidiary =
        search.createColumn({
            name: "subsidiary"
        });
    private transactionSearchColNameNoHierarchy =
        search.createColumn({
            name: "namenohierarchy",
            join: "subsidiary"
        });
    private transactionSearchColName = search.createColumn({
        name: "entity"
    });
    private transactionSearchColDocumentNumber =
        search.createColumn({ name: "tranid" });
    private transactionSearchColDate = search.createColumn({
        name: "trandate",
        sort: search.Sort.DESC
    });
    private transactionSearchColAmount =
        search.createColumn({ name: "amount" });

    private readonly searchColumns: search.Column[] = [
        this.transactionSearchColType,
        this.transactionSearchColStatus,
        this.transactionSearchColSubsidiary,
        this.transactionSearchColNameNoHierarchy,
        this.transactionSearchColName,
        this.transactionSearchColDocumentNumber,
        this.transactionSearchColDate,
        this.transactionSearchColAmount
    ];
    private readonly searchType = search.Type.TRANSACTION;

    constructor(options: ISearchParameters) {
        // set base properties
        this.start_date = options.START_DATE;
        this.end_date = options.END_DATE;
        this.entity = options.CUSTOMER;
        this.subsidiary = options.SUBSIDIARY;

        // get transaction types property
        if (options.ALL_TRAN_TYPES) {
            this.transaction_types.push("creditmemo");
            this.transaction_types.push("invoice");
            // this.transaction_types.push("vendorbill");
        } else {
            this.transaction_types.push(
                ...options.TRAN_TYPES
            );
        }

        this.transaction_status.push(
            ...options.TRAN_STATUS
        );

        // initial filters
        this.searchFilters.push(
            ...[
                search.createFilter({
                    name: "mainline",
                    operator: search.Operator.IS,
                    values: "T"
                }),
                this.getTranTypeFilter()
            ]
        );
    }

    // private getStartDateFilter(v: Date): search.Filter {
    //     return search.createFilter({
    //         name: "trandate",
    //         operator: search.Operator.ONORAFTER,
    //         values: v
    //     });
    // }

    private getEndDateFilter(v: Date): search.Filter {
        return search.createFilter({
            name: "trandate",
            operator: search.Operator.ONORBEFORE,
            values: format.format({
                value: new Date(v),
                type: format.Type.DATE
            })
        });
    }

    public runSearch(pageSize: number) {
        if (this.start_date) {
            log.debug(
                "setting start param",
                this.start_date
            );
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

    public fetchSearchResult({
        pagedData,
        pageIndex
    }: {
        pagedData: search.PagedData;
        pageIndex: number;
    }): ITransactionResult[] {
        try {
            const searchPage = pagedData.fetch({
                index: pageIndex
            });

            const results: ITransactionResult[] = [];

            searchPage.data.forEach((res) => {
                const subsidiaryVal = res.getValue(
                    this.transactionSearchColNameNoHierarchy
                );
                const entityVal = res.getValue(
                    this.transactionSearchColName
                );
                const dateVal = res.getValue(
                    this.transactionSearchColDate
                );
                results.push({
                    id: parseInt(res.id),
                    type:
                        res.getValue(
                            this.transactionSearchColType
                        ) === "CustInvc"
                            ? "Invoice"
                            : "Credit Memo",
                    raw_type:
                        res.getValue(
                            this.transactionSearchColType
                        ) === "CustInvc"
                            ? "invoice"
                            : "creditmemo",
                    status: res.getText(
                        this.transactionSearchColStatus
                    ) as string,
                    subsidiary: subsidiaryVal as string,
                    entity:
                        typeof entityVal === "number"
                            ? entityVal
                            : parseInt(entityVal as string),
                    trannumber: res.getValue(
                        this
                            .transactionSearchColDocumentNumber
                    ) as string,
                    date:
                        typeof dateVal === "string"
                            ? new Date(dateVal)
                            : (dateVal as unknown as Date),
                    amount: res.getValue(
                        this.transactionSearchColAmount
                    ) as string
                });
                return true;
            });

            return results;
        } catch (e) {
            log.error({
                title: "ERROR GETTING SEARCH RESULTS",
                details: e
            });
            return [];
        }
    }

    private getTranTypeFilter(): search.Filter {
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
}
