/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType ClientScript
 */
define(["require", "exports", "N/url", "N/currentRecord", "./constants", "./utils/util.module"], function (require, exports, url, currentRecord, constants_1, util_module_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSuiteletPage = exports.resetFilterParams = exports.pageInit = exports.fieldChanged = void 0;
    function fieldChanged(context) {
        const changedField = context.fieldId;
        const cr = currentRecord.get();
        console.log(`changed field ${changedField}`);
        // switch through fields
        switch (changedField) {
            case "custpage_page_id": {
                const pageIdVal = context.currentRecord.getValue({
                    fieldId: "custpage_page_id"
                });
                const pageId = parseInt(pageIdVal.split("_")[1]);
                document.location = url.resolveScript({
                    scriptId: (0, util_module_1.getParameterFromURL)("script"),
                    deploymentId: (0, util_module_1.getParameterFromURL)("deploy"),
                    params: { page: pageId }
                });
                break;
            }
            case constants_1.SUITELET_FIELD_IDS.ALL_TRAN_TYPES: {
                const allTranTypes = cr.getValue({
                    fieldId: constants_1.SUITELET_FIELD_IDS.ALL_TRAN_TYPES
                });
                const tranTypeField = cr.getField({
                    fieldId: constants_1.SUITELET_FIELD_IDS.TRAN_TYPES
                });
                if (allTranTypes) {
                    // disable transaction select
                    tranTypeField.isDisabled = true;
                }
                else {
                    // enable transaction select
                    tranTypeField.isDisabled = false;
                }
                break;
            }
            case constants_1.SUITELET_FIELD_IDS.ALL_STATUSES: {
                const allTranStatus = cr.getValue({
                    fieldId: constants_1.SUITELET_FIELD_IDS.ALL_STATUSES
                });
                const tranStatusField = cr.getField({
                    fieldId: constants_1.SUITELET_FIELD_IDS.TRAN_STATUS
                });
                if (allTranStatus) {
                    // disable transaction select
                    tranStatusField.isDisabled = true;
                }
                else {
                    // enable transaction select
                    tranStatusField.isDisabled = false;
                }
                break;
            }
            default: {
                console.log(`no action for field ${changedField} - continuing`);
            }
        }
    }
    exports.fieldChanged = fieldChanged;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function getSuiteletPage(suiteletScriptId, suiteletDeploymentId, pageId) {
        document.location = url.resolveScript({
            scriptId: suiteletScriptId,
            deploymentId: suiteletDeploymentId,
            params: { page: pageId }
        });
    }
    exports.getSuiteletPage = getSuiteletPage;
});
