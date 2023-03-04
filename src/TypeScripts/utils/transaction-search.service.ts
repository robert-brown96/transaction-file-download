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
        search.createColumn({ name: "statusref" });
    private transactionSearchColSubsidiary =
        search.createColumn({ name: "subsidiary" });
    private transactionSearchColName = search.createColumn({
        name: "entity"
    });
    private transactionSearchColDocumentNumber =
        search.createColumn({ name: "tranid" });
    private transactionSearchColDate = search.createColumn({
        name: "trandate"
    });
    private transactionSearchColAmount =
        search.createColumn({ name: "amount" });

    private readonly searchColumns: search.Column[] = [
        this.transactionSearchColType,
        this.transactionSearchColStatus,
        this.transactionSearchColSubsidiary,
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
            this.transaction_types.push("vendorbill");
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

    public runSearch(pageSize: number) {
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
                    this.transactionSearchColSubsidiary
                );
                const entityVal = res.getValue(
                    this.transactionSearchColName
                );
                const dateVal = res.getValue(
                    this.transactionSearchColDate
                );
                results.push({
                    id: parseInt(res.id),
                    type: res.getValue(
                        this.transactionSearchColType
                    ) as string,
                    status: res.getValue(
                        this.transactionSearchColStatus
                    ) as string,
                    subsidiary:
                        typeof subsidiaryVal === "number"
                            ? subsidiaryVal
                            : parseInt(
                                  subsidiaryVal as string
                              ),
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
        if (this.transaction_types.includes("vendorbill"))
            vals.push("VendBill");

        return search.createFilter({
            name: "type",
            operator: search.Operator.ANYOF,
            values: vals
        });
    }
}
