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

export type TSupportedTranType =
    | "invoice"
    | "creditmemo"
    | "vendorbill";

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
