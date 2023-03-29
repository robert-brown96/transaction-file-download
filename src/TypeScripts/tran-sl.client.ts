/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType ClientScript
 */

import { EntryPoints } from "N/types";
import url = require("N/url");
import currentRecord = require("N/currentRecord");
import {
    SUITELET_FIELD_IDS,
    TRAN_SELECT_SUITELET
} from "./constants";
import {
    dateObjToFormattedString,
    getParameterFromURL
} from "./utils/util.module";
import { TMapAny } from "./globals";

export function fieldChanged(
    context: EntryPoints.Client.fieldChangedContext
): void {
    let refreshSuitelet = false;
    const changedField = context.fieldId;
    const cr = currentRecord.get();
    console.log(`changed field ${changedField}`);

    const params: TMapAny = {};

    let newPageId: number;

    params.start = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.START_OBJ
    });
    console.log(`start date ${params.start}`);

    params.end = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.END_OBJ
    });
    console.log(`end date ${params.end}`);

    params.customer =
        cr.getValue({
            fieldId: SUITELET_FIELD_IDS.CUSTOMER
        }) || "";
    params.subsidiary =
        cr.getValue({
            fieldId: SUITELET_FIELD_IDS.SUBSIDIARY
        }) || "";
    params.allTypes = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.ALL_TRAN_TYPES
    });
    params.allStatus = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.ALL_STATUSES
    });
    params.typeArr = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.TRAN_TYPES
    });
    params.statusArr = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.TRAN_STATUS
    });

    params.selectIndividual = cr.getValue({
        fieldId: SUITELET_FIELD_IDS.INCLUDE_SELECTED
    });
    console.log(
        `start changed: ${
            changedField === SUITELET_FIELD_IDS.START_DATE
        }`
    );
    // switch through fields
    console.log(
        `params before switch ${JSON.stringify(params)}`
    );
    switch (changedField) {
        case "custpage_page_id": {
            const pageIdVal =
                context.currentRecord.getValue({
                    fieldId: "custpage_page_id"
                }) as string;
            newPageId = parseInt(pageIdVal.split("_")[1]);

            params.page = newPageId;
            refreshSuitelet = true;

            // document.location = url.resolveScript({
            //     scriptId: getParameterFromURL("script"),
            //     deploymentId: getParameterFromURL("deploy"),
            //     params: { page: newPageId }
            // });
            break;
        }
        case SUITELET_FIELD_IDS.ALL_TRAN_TYPES: {
            const allTranTypes = cr.getValue({
                fieldId: SUITELET_FIELD_IDS.ALL_TRAN_TYPES
            });
            const tranTypeField = cr.getField({
                fieldId: SUITELET_FIELD_IDS.TRAN_TYPES
            });
            if (allTranTypes) {
                // disable transaction select
                tranTypeField.isDisabled = true;

                // reset transaction type filter
                params.typeArr = [];
            } else {
                // enable transaction select
                tranTypeField.isDisabled = false;
            }
            refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.ALL_STATUSES: {
            const allTranStatus = cr.getValue({
                fieldId: SUITELET_FIELD_IDS.ALL_STATUSES
            });
            const tranStatusField = cr.getField({
                fieldId: SUITELET_FIELD_IDS.TRAN_STATUS
            });
            if (allTranStatus) {
                // disable transaction select
                tranStatusField.isDisabled = true;
            } else {
                // enable transaction select
                tranStatusField.isDisabled = false;
            }
            refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.START_DATE: {
            const startDate = cr.getValue({
                fieldId: SUITELET_FIELD_IDS.START_DATE
            }) as unknown as Date;
            const newStart =
                dateObjToFormattedString(startDate);
            params.start = newStart;
            cr.setValue({
                fieldId: SUITELET_FIELD_IDS.START_OBJ,
                value: newStart
            });
            console.log(`new start: ${params.start}`);
            //refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.END_DATE: {
            const endDate = cr.getValue({
                fieldId: SUITELET_FIELD_IDS.END_DATE
            }) as unknown as Date;
            const newEnd =
                dateObjToFormattedString(endDate);
            params.end = newEnd;
            cr.setValue({
                fieldId: SUITELET_FIELD_IDS.END_OBJ,
                value: newEnd
            });
            // refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.CUSTOMER: {
            refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.SUBSIDIARY: {
            refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.TRAN_STATUS: {
            refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.TRAN_TYPES: {
            refreshSuitelet = true;
            break;
        }
        case SUITELET_FIELD_IDS.INCLUDE_SELECTED: {
            refreshSuitelet = false;
            break;
        }
        default: {
            console.log(
                `no action for field ${changedField} - continuing`
            );
        }
    }
    console.log(`new params ${JSON.stringify(params)}`);

    if (refreshSuitelet) {
        // base parameters for suitelet refresh retrieve
        const scriptId = getParameterFromURL("script");
        const deploymentId = getParameterFromURL("deploy");

        params.typeArr = JSON.stringify(params.typeArr);
        params.statusArr = JSON.stringify(params.statusArr);

        window.onbeforeunload = null;
        document.location = url.resolveScript({
            scriptId,
            deploymentId,
            params: params
        });
    }
}

// export function lineinit(context: EntryPoints.Client.lineInitContext): void {}

export function pageInit(
    context: EntryPoints.Client.pageInitContext
): void {
    console.log(`page init start for ${context}`);
    const CR = currentRecord.get();

    // disable transaction type field if all is selected
    // const selectAllTransField = CR.getField({
    //     fieldId: SUITELET_FIELD_IDS.ALL_TRAN_TYPES
    // });
    const selectAllTransVal = CR.getValue({
        fieldId: SUITELET_FIELD_IDS.ALL_TRAN_TYPES
    });

    const tranTypeField = CR.getField({
        fieldId: SUITELET_FIELD_IDS.TRAN_TYPES
    });
    console.log(
        `tran type field val: ${selectAllTransVal}`
    );
    if (selectAllTransVal) tranTypeField.isDisabled = true;
    else tranTypeField.isDisabled = false;

    // disable transaction status field if all is selected
    const selectAllStatusValue = CR.getValue({
        fieldId: SUITELET_FIELD_IDS.ALL_STATUSES
    });
    const tranStatusField = CR.getField({
        fieldId: SUITELET_FIELD_IDS.TRAN_STATUS
    });
    if (selectAllStatusValue)
        tranStatusField.isDisabled = true;
    else tranStatusField.isDisabled = false;
}

// export function postSourcing(context: EntryPoints.Client.postSourcingContext): void {}

// export function saveRecord(context: EntryPoints.Client.saveRecordContext): void {}

// export function sublistChanged(context: EntryPoints.Client.sublistChangedContext): void {}

// export function validateDelete(context: EntryPoints.Client.validateDeleteContext): void {}

// export function validateField(context: EntryPoints.Client.validateFieldContext): void {}

// export function validateInsert(context: EntryPoints.Client.validateInsertContext): void {}

// export function validateLine(context: EntryPoints.Client.validateLineContext): void {}

// export function localizationContextEnter(context: any): void {}

// export function localizationContextExit(context: any): void {}

///////////////////     CUSTOM FUNCTIONS    ///////////////////

/**
 * resets full suitelet
 */
export function resetFilterParams() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.onbeforeunload = function () {};

    window.location = url.resolveScript({
        scriptId: TRAN_SELECT_SUITELET.scriptId,
        deploymentId: TRAN_SELECT_SUITELET.deploymentId
    }) as unknown as Location;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSuiteletPage(
    suiteletScriptId: string,
    suiteletDeploymentId: string,
    pageId: string
) {
    document.location = url.resolveScript({
        scriptId: suiteletScriptId,
        deploymentId: suiteletDeploymentId,
        params: { page: pageId }
    });
}
