/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */

import { EntryPoints } from "N/types";
import log = require("N/log");
import serverWidget = require("N/ui/serverWidget");
//import search = require("N/search");
import { validateSuiteletMethod } from "./utils/util.module";
import { TransactionStatusService } from "./utils/tran-status-val.service";
import { SUITELET_FIELD_IDS } from "./constants";
import { TransactionSearchService } from "./utils/transaction-search.service";
import { IGetParams } from "./globals";

const PAGE_SIZE = 50;

export function onRequest(
    context: EntryPoints.Suitelet.onRequestContext
): void {
    log.debug("start suitelet", context);

    // destructure context
    const { request, response } = context;

    const method = validateSuiteletMethod(request.method);

    if (method === "GET") {
        try {
            // page id parameter
            const pageId = parseInt(
                request.parameters.page
            );
            const formRes = _get({ pageId });
            response.writePage(formRes);
        } catch (e) {
            log.error({
                title: "ERROR RENDERING SUITELET",
                details: e
            });
        }
    }
}

const _get = ({
    pageId
}: IGetParams): serverWidget.Form => {
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
        id: SUITELET_FIELD_IDS.INCLUDE_PDF,
        label: "Include Transaction Printout",
        container: "file_options_group"
    });
    includePdfField.defaultValue = "T";

    const includeAllFilesField = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.INCLUDE_ALL_FILES,
        label: "Include All Transaction Files",
        container: "file_options_group"
    });
    includeAllFilesField.defaultValue = "F";

    const joinPdfFilesField = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.JOIN_PDFS,
        label: "Concatenate PDFs",
        container: "file_options_group"
    });
    joinPdfFilesField.defaultValue = "F";

    // Start Date
    const startDateField = slForm.addField({
        id: SUITELET_FIELD_IDS.START_DATE,
        type: serverWidget.FieldType.DATE,
        label: "Earliest Tran Date",
        container: "filters_group"
    });
    startDateField.defaultValue =
        new Date() as unknown as string;
    // End Date
    slForm.addField({
        id: SUITELET_FIELD_IDS.END_DATE,
        type: serverWidget.FieldType.DATE,
        label: "Latest Tran Date",
        container: "filters_group"
    });

    // customer
    const customerField = slForm.addField({
        id: SUITELET_FIELD_IDS.CUSTOMER,
        type: serverWidget.FieldType.SELECT,
        label: "Customer",
        source: "customer",
        container: "filters_group"
    });
    customerField.defaultValue = "";

    // Subsidiary
    //const subsidiaryField =
    slForm.addField({
        id: SUITELET_FIELD_IDS.SUBSIDIARY,
        type: serverWidget.FieldType.SELECT,
        label: "Subsidiary",
        source: "subsidiary",
        container: "filters_group"
    });

    // transaction type and status fields
    const tranStatusService = new TransactionStatusService(
        []
    );

    const selectAllTransField = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.ALL_TRAN_TYPES,
        label: "All Types",
        container: "filters_group"
    });
    selectAllTransField.updateBreakType({
        breakType: serverWidget.FieldBreakType.STARTCOL
    });
    selectAllTransField.defaultValue = "T";
    const tranTypeField = slForm.addField({
        id: SUITELET_FIELD_IDS.TRAN_TYPES,
        type: serverWidget.FieldType.MULTISELECT,
        label: "Transaction Type",
        container: "filters_group"
    });

    tranStatusService
        .supportedTransValues()
        .forEach((e) => tranTypeField.addSelectOption(e));

    const selectAllStatuses = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.ALL_STATUSES,
        label: "All Transaction Statuses",
        container: "filters_group"
    });
    selectAllStatuses.updateBreakType({
        breakType: serverWidget.FieldBreakType.STARTCOL
    });
    selectAllStatuses.defaultValue = "T";

    const statusField = slForm.addField({
        id: SUITELET_FIELD_IDS.TRAN_STATUS,
        type: serverWidget.FieldType.MULTISELECT,
        label: "Status",
        container: "filters_group"
    });

    tranStatusService
        .getUniqueValues()
        .forEach((e) => statusField.addSelectOption(e));

    // create sublist for transactions
    const tranSublist = slForm.addSublist({
        id: "custpage_tran_list",
        label: "Transaction Sublist",
        type: serverWidget.SublistType.LIST
    });

    tranSublist.addMarkAllButtons();

    // sublist fields
    tranSublist.addField({
        id: "process",
        label: "Process",
        type: serverWidget.FieldType.CHECKBOX
    });

    tranSublist
        .addField({
            id: "custpage_sublist_internal_id",
            label: "Internal ID",
            type: serverWidget.FieldType.TEXT
        })
        .updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.HIDDEN
        });

    tranSublist.addField({
        id: "type",
        label: "Type",
        type: serverWidget.FieldType.TEXT
    });

    const sublistStatusField = tranSublist.addField({
        id: "status",
        label: "Status",
        type: serverWidget.FieldType.SELECT
    });

    tranStatusService
        .getUniqueValues()
        .forEach((e) =>
            sublistStatusField.addSelectOption(e)
        );

    tranSublist.addField({
        id: "subsidiary",
        label: "Subsidiary",
        type: serverWidget.FieldType.SELECT,
        source: "subsidiary"
    });

    tranSublist.addField({
        id: "entity",
        label: "entity",
        type: serverWidget.FieldType.TEXT
    });

    tranSublist.addField({
        id: "trannumber",
        label: "Document Number",
        type: serverWidget.FieldType.TEXT
    });
    tranSublist.addField({
        id: "date",
        label: "Date",
        type: serverWidget.FieldType.DATE
    });
    tranSublist.addField({
        id: "amount",
        label: "Amount",
        type: serverWidget.FieldType.CURRENCY
    });

    const tranSearchService = new TransactionSearchService({
        START_DATE: new Date(),
        ALL_STATUSES: true,
        ALL_TRAN_TYPES: true,
        TRAN_TYPES: [],
        TRAN_STATUS: []
    });
    const transactionSearchService =
        tranSearchService.runSearch(PAGE_SIZE);

    const pageCount = Math.ceil(
        transactionSearchService.count / PAGE_SIZE
    );
    log.debug("search pageCount", pageCount);

    // Set pageId to correct value if out of index
    if (!pageId || pageId < 0) pageId = 0;
    else if (pageId >= pageCount) pageId = pageCount - 1;

    // Add drop-down and options to navigate to specific page
    const selectOptions = slForm.addField({
        id: "custpage_page_id",
        label: "Page Index",
        type: serverWidget.FieldType.SELECT
    });

    for (let i = 0; i < pageCount; i++) {
        if (i == pageId)
            selectOptions.addSelectOption({
                value: "pageid_" + i,
                text:
                    i * PAGE_SIZE +
                    1 +
                    " - " +
                    (i + 1) * PAGE_SIZE,
                isSelected: true
            });
        else
            selectOptions.addSelectOption({
                value: "pageid_" + i,
                text:
                    i * PAGE_SIZE +
                    1 +
                    " - " +
                    (i + 1) * PAGE_SIZE
            });
    }

    return slForm;
};
