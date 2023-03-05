/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import { IProcessFileInit } from "../globals";

export class ProcessFileService {
    selectIndividual: boolean;
    includeTranPrintout: boolean;
    includeAllFiles: boolean;
    concatFiles: boolean;

    transaction_ids: number[] = [];

    constructor(options: IProcessFileInit) {
        this.selectIndividual = options.selectIndividual;
        this.includeTranPrintout =
            options.includeTranPrintout ?? true;
        this.includeAllFiles =
            options.includeAllFiles ?? false;
        this.concatFiles = options.concatFiles ?? false;
    }
}
