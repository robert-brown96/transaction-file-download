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
            const subsidiaryField = slForm.addField({
                id: "custpage_subsidiary",
                type: serverWidget.FieldType.SELECT,
                label: "Subsidiary",
                source: "subsidiary"
            });
            subsidiaryField.updateBreakType({
                breakType:
                    serverWidget.FieldBreakType.STARTCOL
            });

            // transaction type and status fields
            const tranTypeField = slForm.addField({
                id: "custpage_tran_type",
                type: serverWidget.FieldType.SELECT,
                label: "Transaction Type"
            });

            const statusField = slForm.addField({
                id: "custpage_status",
                type: serverWidget.FieldType.SELECT,
                label: "Status"
            });

            response.writePage(slForm);
        } catch (e) {
            log.error({
                title: "ERROR RENDERING SUITELET",
                details: e
            });
        }
    }
}
