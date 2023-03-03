/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */

import { EntryPoints } from "N/types";
import log = require("N/log");
import serverWidget = require("N/ui/serverWidget");
import { validateSuiteletMethod } from "./utils/util.module";
import { TransactionStatusService } from "./utils/tran-status-val.service";

export function onRequest(
    context: EntryPoints.Suitelet.onRequestContext
): void {
    log.debug("start suitelet", context);

    // destructure context
    const { request, response } = context;

    const method = validateSuiteletMethod(request.method);

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
            //const subsidiaryField =
            slForm.addField({
                id: "custpage_subsidiary",
                type: serverWidget.FieldType.SELECT,
                label: "Subsidiary",
                source: "subsidiary"
            });

            // transaction type and status fields
            const tranStatusService =
                new TransactionStatusService([]);

            const selectAllTransField = slForm.addField({
                type: serverWidget.FieldType.CHECKBOX,
                id: "custpage_tran_type_all",
                label: "All Types"
            });
            selectAllTransField.updateBreakType({
                breakType:
                    serverWidget.FieldBreakType.STARTCOL
            });
            selectAllTransField.defaultValue = "T";
            const tranTypeField = slForm.addField({
                id: "custpage_tran_type",
                type: serverWidget.FieldType.MULTISELECT,
                label: "Transaction Type"
            });

            tranStatusService
                .supportedTransValues()
                .forEach((e) =>
                    tranTypeField.addSelectOption(e)
                );

            const selectAllStatuses = slForm.addField({
                type: serverWidget.FieldType.CHECKBOX,
                id: "custpage_tran_statis_all",
                label: "All Transaction Statuses"
            });
            selectAllStatuses.defaultValue = "T";

            const statusField = slForm.addField({
                id: "custpage_status",
                type: serverWidget.FieldType.MULTISELECT,
                label: "Status"
            });

            tranStatusService
                .getUniqueValues()
                .forEach((e) =>
                    statusField.addSelectOption(e)
                );

            response.writePage(slForm);
        } catch (e) {
            log.error({
                title: "ERROR RENDERING SUITELET",
                details: e
            });
        }
    }
}
