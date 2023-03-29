/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import http = require("N/http");

export type TSUITELET_METHOD = "GET" | "POST";

export type TPicklistOption = {
    value: string;
    text: string;
};

export type TMap = {
    [id: string]: string;
};

export type TMapAny = {
    [id: string]:
        | string
        | string[]
        | boolean
        | number
        | number[]
        | Date;
};

export type TClientUrlParam = {
    [id: string]: string;
};

export type TSupportedTranType = "invoice" | "creditmemo";

export interface ITranPicklistOption {
    value: TSupportedTranType;
    text: string;
}

export interface ISCRIPT_RUN {
    scriptId: string;
    deploymentId: string;
}

export interface IMrError {
    asset: string;
    message: string;
    stage: "map" | "reduce";
}

export interface ISearchParameters {
    ALL_TRAN_TYPES: boolean;
    ALL_STATUSES: boolean;
    START_OBJ: IDateObj;
    END_DATE?: IDateObj;
    CUSTOMER?: number;
    SUBSIDIARY?: number;
    TRAN_TYPES: TSupportedTranType[];
    TRAN_STATUS: string[];
}

export interface ITransactionResult {
    id: number;
    type: string;
    raw_type: string;
    status: string;
    subsidiary: string;
    entity: number;
    trannumber: string;
    date: Date;
    amount: string;
    currency: string;
}

export interface IGetParams {
    pageId: number;
    scriptId: string;
    deploymentId: string;
    start?: Date;
    startObj: IDateObj;
    end?: IDateObj;
    customer?: string;
    subsidiary?: string;
    allTypesParam: boolean;
    allStatusParam: boolean;
    tranTypes: string[];
    tranStatuses: string[];
    selectTransactions: boolean;
}

export interface IPostServiceInit {
    selectIndividual: boolean;
    includeTranPrintout: boolean;
    includeAllFiles: boolean;
    concatFiles: boolean;
    request: http.ServerRequest;
}

export interface IProcessFileInit {
    selectIndividual: boolean;
    includeTranPrintout: boolean;
    includeAllFiles: boolean;
    concatFiles: boolean;
}

export interface IProcessFileValues {
    submitted_at: Date;
    process_options: IProcessFileInit;
    transaction_ids: number[];
}

export interface IDateObj {
    year: number;
    month: number;
    day: number;
}
