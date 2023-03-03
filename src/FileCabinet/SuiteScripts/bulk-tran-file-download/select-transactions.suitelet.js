/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */
define(["require", "exports", "N/log", "N/ui/serverWidget", "./utils/util.module", "./utils/tran-status-val.service", "./constants"], function (require, exports, log, serverWidget, util_module_1, tran_status_val_service_1, constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        log.debug("start suitelet", context);
        // destructure context
        const { request, response } = context;
        const method = (0, util_module_1.validateSuiteletMethod)(request.method);
        if (method === "GET") {
            try {
                const formRes = _get();
                response.writePage(formRes);
            }
            catch (e) {
                log.error({
                    title: "ERROR RENDERING SUITELET",
                    details: e
                });
            }
        }
    }
    exports.onRequest = onRequest;
    const _get = () => {
        const slForm = serverWidget.createForm({
            title: "Download Transaction Files in Bulk"
        });
        slForm.clientScriptModulePath = "./tran-sl.client.js";
        // field groups
        slForm.addFieldGroup({
            id: "filters_group",
            label: "Transaction Filters"
        });
        slForm.addFieldGroup({
            id: "file_options_group",
            label: "File Download Options"
        });
        // Create fields for filtering transactions
        const includePdfField = slForm.addField({
            type: serverWidget.FieldType.CHECKBOX,
            id: constants_1.SUITELET_FIELD_IDS.INCLUDE_PDF,
            label: "Include Transaction Printout",
            container: "file_options_group"
        });
        includePdfField.defaultValue = "T";
        const includeAllFilesField = slForm.addField({
            type: serverWidget.FieldType.CHECKBOX,
            id: constants_1.SUITELET_FIELD_IDS.INCLUDE_ALL_FILES,
            label: "Include All Transaction Files",
            container: "file_options_group"
        });
        includeAllFilesField.defaultValue = "F";
        const joinPdfFilesField = slForm.addField({
            type: serverWidget.FieldType.CHECKBOX,
            id: constants_1.SUITELET_FIELD_IDS.JOIN_PDFS,
            label: "Concatenate PDFs",
            container: "file_options_group"
        });
        joinPdfFilesField.defaultValue = "F";
        // Start Date
        const startDateField = slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.START_DATE,
            type: serverWidget.FieldType.DATE,
            label: "Earliest Tran Date",
            container: "filters_group"
        });
        startDateField.defaultValue =
            new Date();
        // End Date
        slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.END_DATE,
            type: serverWidget.FieldType.DATE,
            label: "Latest Tran Date",
            container: "filters_group"
        });
        // customer
        const customerField = slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.CUSTOMER,
            type: serverWidget.FieldType.SELECT,
            label: "Customer",
            source: "customer",
            container: "filters_group"
        });
        customerField.defaultValue = "";
        // Subsidiary
        //const subsidiaryField =
        slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.SUBSIDIARY,
            type: serverWidget.FieldType.SELECT,
            label: "Subsidiary",
            source: "subsidiary",
            container: "filters_group"
        });
        // transaction type and status fields
        const tranStatusService = new tran_status_val_service_1.TransactionStatusService([]);
        const selectAllTransField = slForm.addField({
            type: serverWidget.FieldType.CHECKBOX,
            id: constants_1.SUITELET_FIELD_IDS.ALL_TRAN_TYPES,
            label: "All Types",
            container: "filters_group"
        });
        selectAllTransField.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });
        selectAllTransField.defaultValue = "T";
        const tranTypeField = slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.TRAN_TYPES,
            type: serverWidget.FieldType.MULTISELECT,
            label: "Transaction Type",
            container: "filters_group"
        });
        tranStatusService
            .supportedTransValues()
            .forEach((e) => tranTypeField.addSelectOption(e));
        const selectAllStatuses = slForm.addField({
            type: serverWidget.FieldType.CHECKBOX,
            id: constants_1.SUITELET_FIELD_IDS.ALL_STATUSES,
            label: "All Transaction Statuses",
            container: "filters_group"
        });
        selectAllStatuses.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });
        selectAllStatuses.defaultValue = "T";
        const statusField = slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.TRAN_STATUS,
            type: serverWidget.FieldType.MULTISELECT,
            label: "Status",
            container: "filters_group"
        });
        tranStatusService
            .getUniqueValues()
            .forEach((e) => statusField.addSelectOption(e));
        return slForm;
    };
});
