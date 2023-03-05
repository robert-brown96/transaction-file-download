/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import { IProcessFileInit } from "../globals";
//import { TransactionSearchService } from "./transaction-search.service";
import file = require("N/file");
import log = require("N/log");
import {
    OUTPUT_FOLDER_ID,
    PROCESS_FILE_NAME_PREFIX
} from "../constants";
export class ProcessFileService {
    selectIndividual: boolean;
    includeTranPrintout: boolean;
    includeAllFiles: boolean;
    concatFiles: boolean;

    //  searchService: TransactionSearchService;

    private transaction_ids: number[] = [];

    constructor(options: IProcessFileInit) {
        this.selectIndividual = options.selectIndividual;
        this.includeTranPrintout =
            options.includeTranPrintout ?? true;
        this.includeAllFiles =
            options.includeAllFiles ?? false;
        this.concatFiles = options.concatFiles ?? false;
    }

    writeProcessFile(): void {
        const process_options = {
            selectIndividual: this.selectIndividual,
            includeTranPrintout: this.includeTranPrintout,
            includeAllFiles: this.includeAllFiles,
            concatFiles: this.concatFiles
        };

        const newFile = file.create({
            name: `${PROCESS_FILE_NAME_PREFIX}.txt`,
            fileType: file.Type.PLAINTEXT,
            contents: JSON.stringify({
                process_options,
                transaction_ids: this.transaction_ids
            })
        });
        newFile.folder = OUTPUT_FOLDER_ID;
        const newFileId = newFile.save();
        log.debug("newFileId", newFileId);
    }

    setTransactionIds(vals: number[]): void {
        this.transaction_ids.push(...vals);
    }
    getTransactionIds(): number[] {
        return this.transaction_ids;
    }
}
