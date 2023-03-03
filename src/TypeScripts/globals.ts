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

export enum ESupportedTranType {
    INVOICE = "invoice",
    CREDIT = "creditmemo",
    VENDOR_BILL = "vendorbill"
}
