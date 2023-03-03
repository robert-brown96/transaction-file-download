/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType ClientScript
 */

import { EntryPoints } from "N/types";

// export function fieldChanged(context: EntryPoints.Client.fieldChangedContext): void {}

// export function lineinit(context: EntryPoints.Client.lineInitContext): void {}

export function pageInit(
    context: EntryPoints.Client.pageInitContext
): void {
    console.log(`page init start for ${context}`);
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
export function resetFilterParams() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.onbeforeunload = function () {};
}
