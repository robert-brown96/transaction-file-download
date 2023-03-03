/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */
define(["require", "exports", "N/log", "N/ui/serverWidget", "./utils/util.module"], function (require, exports, log, serverWidget, util_module_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        log.debug("start suitelet", context);
        // destructure context
        const { request, response } = context;
        const method = (0, util_module_1.validateSuiteletMethod)(request.method);
        if (method === "GET") {
            try {
                const slForm = serverWidget.createForm({
                    title: "Download Transaction Files in Bulk"
                });
                // Create fields for filtering transactions
                // Start Date
                slForm.addField({
                    id: "custpage_tran_start_date",
                    type: serverWidget.FieldType.DATE,
                    label: "Earliest Tran Date"
                });
                // End Date
                slForm.addField({
                    id: "custpage_tran_end_date",
                    type: serverWidget.FieldType.DATE,
                    label: "Latest Tran Date"
                });
                // customer
                const customerField = slForm.addField({
                    id: "custpage_customer",
                    type: serverWidget.FieldType.SELECT,
                    label: "Customer",
                    source: "customer"
                });
                customerField.defaultValue = "";
                // Subsidiary
                const subsidiaryField = slForm.addField({
                    id: "custpage_subsidiary",
                    type: serverWidget.FieldType.SELECT,
                    label: "Subsidiary",
                    source: "subsidiary"
                });
                subsidiaryField.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                response.writePage(slForm);
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
});
