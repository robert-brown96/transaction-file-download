/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType ClientScript
 */

import { EntryPoints } from "N/types";
import url = require("N/url");
import currentRecord = require("N/currentRecord");
import { TRAN_SELECT_SUITELET } from "./constants";
// export function fieldChanged(context: EntryPoints.Client.fieldChangedContext): void {}

// export function lineinit(context: EntryPoints.Client.lineInitContext): void {}

export function pageInit(
    context: EntryPoints.Client.pageInitContext
): void {
    console.log(`page init start for ${context}`);
    const CR = currentRecord.get();
    console.log(CR);
    const startdate = CR.getValue({
        fieldId: "custpage_include_tran_pdf"
    });
    console.log(`start ${startdate}`);

    // disable transaction type field if all is selected
    const selectAllTransField = CR.getField({
        fieldId: "custpage_tran_type_all"
    });
    if (selectAllTransField) {
        const tranTypeField = CR.getField({
            fieldId: "custpage_tran_type"
        });
        tranTypeField.isDisabled = true;
    }
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
