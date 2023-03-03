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

export function fieldChanged(
    context: EntryPoints.Client.fieldChangedContext
): void {
    const changedField = context.fieldId;
    const cr = currentRecord.get();
    console.log(`changed field ${changedField}`);

    // switch through fields
    switch (changedField) {
        case SUITELET_FIELD_IDS.ALL_TRAN_TYPES: {
            //    const allTranTypes
            break;
        }
        default: {
            console.log(
                `no action for field ${changedField} - continuing`
            );
        }
    }
}

// export function lineinit(context: EntryPoints.Client.lineInitContext): void {}

export function pageInit(
    context: EntryPoints.Client.pageInitContext
): void {
    console.log(`page init start for ${context}`);
    const CR = currentRecord.get();

    // disable transaction type field if all is selected
    const selectAllTransField = CR.getField({
        fieldId: SUITELET_FIELD_IDS.ALL_TRAN_TYPES
    });
    const tranTypeField = CR.getField({
        fieldId: SUITELET_FIELD_IDS.TRAN_TYPES
    });
    if (selectAllTransField)
        tranTypeField.isDisabled = true;
    else tranTypeField.isDisabled = false;

    // disable transaction status field if all is selected
    const selectAllStatusField = CR.getField({
        fieldId: SUITELET_FIELD_IDS.ALL_STATUSES
    });
    const tranStatusField = CR.getField({
        fieldId: SUITELET_FIELD_IDS.TRAN_STATUS
    });
    if (selectAllStatusField)
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
