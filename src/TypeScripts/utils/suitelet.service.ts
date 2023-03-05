/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import { IPostServiceInit } from "../globals";
import search = require("N/search");

export class PostService {
    selectIndividual: boolean;
    includeTranPrintout: boolean;
    includeAllFiles: boolean;
    concatFiles: boolean;

    private searchFilters: search.Filter[] = [];

    private readonly transactionSearchColType =
        search.createColumn({
            name: "type"
        });
    private readonly searchType = search.Type.TRANSACTION;

    constructor(options: IPostServiceInit) {
        this.selectIndividual = options.selectIndividual;
        this.includeTranPrintout =
            options.includeTranPrintout;
        this.includeAllFiles = options.includeAllFiles;
        this.concatFiles = options.concatFiles;
    }
}
