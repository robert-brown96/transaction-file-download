/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import { IPostServiceInit } from "../globals";
import log = require("N/log");
import search = require("N/search");
import http = require("N/http");
import {
    SUITELET_SUBLIST_FIELD_IDS,
    SUITELET_SUBLIST_ID
} from "../constants";
import { ProcessFileService } from "./process-file.service";
export class PostService {
    selectIndividual: boolean;
    includeTranPrintout: boolean;
    includeAllFiles: boolean;
    concatFiles: boolean;
    request: http.ServerRequest;

    processFileService: ProcessFileService;

    private searchFilters: search.Filter[] = [];

    // private readonly transactionSearchColType =
    //     search.createColumn({
    //         name: "type"
    //     });
    // private readonly searchType = search.Type.TRANSACTION;

    constructor(options: IPostServiceInit) {
        this.selectIndividual = options.selectIndividual;
        this.includeTranPrintout =
            options.includeTranPrintout;
        this.includeAllFiles = options.includeAllFiles;
        this.concatFiles = options.concatFiles;
        this.request = options.request;

        this.processFileService = new ProcessFileService({
            selectIndividual: options.selectIndividual,
            includeTranPrintout:
                options.includeTranPrintout,
            includeAllFiles: options.includeAllFiles,
            concatFiles: options.concatFiles
        });

        this.searchFilters.push(
            search.createFilter({
                name: "mainline",
                operator: search.Operator.IS,
                values: "T"
            })
        );
    }

    getSelectedIds(): number[] {
        const request = this.request;
        const lineItemCount = request.getLineCount({
            group: SUITELET_SUBLIST_ID
        });
        const resultIds: number[] = [];

        for (
            let line = 0;
            lineItemCount !== 0 && line < lineItemCount;
            line++
        ) {
            const processVal = request.getSublistValue({
                group: SUITELET_SUBLIST_ID,
                line,
                name: SUITELET_SUBLIST_FIELD_IDS.process
            });
            log.debug(
                `process value for line ${line}`,
                processVal
            );
            if (processVal === "T") {
                //c
                const tranId = request.getSublistValue({
                    group: SUITELET_SUBLIST_ID,
                    line,
                    name: SUITELET_SUBLIST_FIELD_IDS.id
                });
                resultIds.push(parseInt(tranId));
            }
        }
        return resultIds;
    }
}
