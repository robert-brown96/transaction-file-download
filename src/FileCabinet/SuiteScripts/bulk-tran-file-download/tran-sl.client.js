/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType ClientScript
 */
define(["require", "exports", "N/url", "N/currentRecord", "./constants"], function (require, exports, url, currentRecord, constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resetFilterParams = exports.pageInit = void 0;
    // export function fieldChanged(context: EntryPoints.Client.fieldChangedContext): void {}
    // export function lineinit(context: EntryPoints.Client.lineInitContext): void {}
    function pageInit(context) {
        console.log(`page init start for ${context}`);
        const CR = currentRecord.get();
        // disable transaction type field if all is selected
        const selectAllTransField = CR.getField({
            fieldId: constants_1.SUITELET_FIELD_IDS.ALL_TRAN_TYPES
        });
        const tranTypeField = CR.getField({
            fieldId: constants_1.SUITELET_FIELD_IDS.TRAN_TYPES
        });
        if (selectAllTransField)
            tranTypeField.isDisabled = true;
        else
            tranTypeField.isDisabled = false;
        // disable transaction status field if all is selected
        const selectAllStatusField = CR.getField({
            fieldId: constants_1.SUITELET_FIELD_IDS.ALL_STATUSES
        });
        const tranStatusField = CR.getField({
            fieldId: constants_1.SUITELET_FIELD_IDS.TRAN_STATUS
        });
        if (selectAllStatusField)
            tranStatusField.isDisabled = true;
        else
            tranStatusField.isDisabled = false;
    }
    exports.pageInit = pageInit;
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
    function resetFilterParams() {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        window.onbeforeunload = function () { };
        window.location = url.resolveScript({
            scriptId: constants_1.TRAN_SELECT_SUITELET.scriptId,
            deploymentId: constants_1.TRAN_SELECT_SUITELET.deploymentId
        });
    }
    exports.resetFilterParams = resetFilterParams;
});
