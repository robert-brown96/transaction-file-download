/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

export type TSUITELET_METHOD = "GET" | "POST";

export type TPicklistOption = {
    value: string;
    text: string;
};

export type TMap = {
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
    START_DATE: Date;
    END_DATE?: Date;
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
}

export interface IGetParams {
    pageId: number;
    scriptId: string;
    deploymentId: string;
}
