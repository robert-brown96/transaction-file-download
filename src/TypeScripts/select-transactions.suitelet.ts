/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */

import { EntryPoints } from "N/types";
import log = require("N/log");
import format = require("N/format");
import url = require("N/url");
import serverWidget = require("N/ui/serverWidget");
//import search = require("N/search");
import { validateSuiteletMethod } from "./utils/util.module";
import { TransactionStatusService } from "./utils/tran-status-val.service";
import {
    SUITELET_FIELD_IDS,
    SUITELET_SUBLIST_FIELD_IDS
} from "./constants";
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
            // log entry params
            log.audit({
                title: "entry parameters",
                details: request.parameters
            });

            // page id parameter
            const pageId = parseInt(
                request.parameters.page
            );

            // script id params
            const scriptId =
                context.request.parameters.script;
            const deploymentId =
                context.request.parameters.deploy;

            // form value parameters
            const start =
                request.parameters.start ?? new Date();

            const end = request.parameters.end;

            const customer = request.parameters.customer;

            const subsidiary =
                request.parameters.subsidiary;

            const allTypesParam =
                request.parameters.allTypes === "false"
                    ? false
                    : true;

            const tranTypes = request.parameters.typeArr;
            const tranTypeParsed = tranTypes
                ? JSON.parse(tranTypes)
                : [];
            log.debug(
                `type param is ${tranTypes}`,
                tranTypeParsed[0]
            );
            const formRes = _get({
                pageId,
                scriptId,
                deploymentId,
                start,
                allTypesParam,
                ...(end && { end }),
                ...(customer && { customer }),
                ...(subsidiary && { subsidiary })
            });
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
    pageId,
    scriptId,
    deploymentId,
    start,
    end,
    customer,
    subsidiary,
    allTypesParam
}: IGetParams): serverWidget.Form => {
    log.debug("start get", scriptId + deploymentId);

    const slForm = serverWidget.createForm({
        title: "Download Transaction Files in Bulk"
    });

    slForm.addSubmitButton({ label: "Download Files" });

    slForm.clientScriptModulePath = "./tran-sl.client.js";

    // add reset button
    slForm.addButton({
        id: "custpage_reset",
        label: "Reset Filters",
        functionName: `resetFilterParams`
    });

    // field groups
    slForm.addFieldGroup({
        id: "navigation_group",
        label: "Select"
    });
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
    startDateField.defaultValue = new Date(
        start
    ) as unknown as string;
    startDateField.isMandatory = true;
    // End Date
    const endDateField = slForm.addField({
        id: SUITELET_FIELD_IDS.END_DATE,
        type: serverWidget.FieldType.DATE,
        label: "Latest Tran Date",
        container: "filters_group"
    });
    if (end)
        endDateField.defaultValue = new Date(
            end
        ) as unknown as string;

    // customer
    const customerField = slForm.addField({
        id: SUITELET_FIELD_IDS.CUSTOMER,
        type: serverWidget.FieldType.SELECT,
        label: "Customer",
        source: "customer",
        container: "filters_group"
    });
    customerField.defaultValue = customer ? customer : "";

    // Subsidiary
    const subsidiaryField = slForm.addField({
        id: SUITELET_FIELD_IDS.SUBSIDIARY,
        type: serverWidget.FieldType.SELECT,
        label: "Subsidiary",
        source: "subsidiary",
        container: "filters_group"
    });
    subsidiaryField.defaultValue = subsidiary ?? "";

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
    selectAllTransField.defaultValue =
        allTypesParam === false ? "F" : "T";
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
        id: SUITELET_SUBLIST_FIELD_IDS.process,
        label: "Process",
        type: serverWidget.FieldType.CHECKBOX
    });

    tranSublist
        .addField({
            id: SUITELET_SUBLIST_FIELD_IDS.id,
            label: "Internal ID",
            type: serverWidget.FieldType.TEXT
        })
        .updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.HIDDEN
        });

    tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.type,
        label: "Type",
        type: serverWidget.FieldType.TEXT
    });

    const sublistStatusField = tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.status,
        label: "Status",
        type: serverWidget.FieldType.TEXT
    });
    sublistStatusField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE
    });

    const subsidiarySublistField = tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.subsidiary,
        label: "Subsidiary",
        type: serverWidget.FieldType.TEXT
    });
    subsidiarySublistField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE
    });

    const entityField = tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.entity,
        label: "Entity",
        type: serverWidget.FieldType.SELECT,
        source: "customer"
    });
    entityField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE
    });

    tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.trannumber,
        label: "Document Number",
        type: serverWidget.FieldType.TEXT
    });
    tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.date,
        label: "Date",
        type: serverWidget.FieldType.TEXT
    });
    tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.amount,
        label: "Amount",
        type: serverWidget.FieldType.CURRENCY
    });
    tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.tran_link,
        label: "Transaction",
        type: serverWidget.FieldType.TEXT
    });

    const tranSearchService = new TransactionSearchService({
        START_DATE: new Date(start),
        ALL_STATUSES: true,
        ALL_TRAN_TYPES: true,
        TRAN_TYPES: [],
        TRAN_STATUS: [],
        ...(end && { END_DATE: new Date(end) }),
        ...(customer && { CUSTOMER: parseInt(customer) }),
        ...(subsidiary && {
            SUBSIDIARY: parseInt(subsidiary)
        })
    });
    const transactionSearchPageData =
        tranSearchService.runSearch(PAGE_SIZE);

    const pageCount = Math.ceil(
        transactionSearchPageData.count / PAGE_SIZE
    );
    log.debug("search pageCount", pageCount);

    // Set pageId to correct value if out of index
    if (!pageId || pageId < 0) pageId = 0;
    else if (pageId >= pageCount) pageId = pageCount - 1;

    // if (pageId != 0) {
    //     tranSublist.addButton({
    //         id: "custpage_previous",
    //         label: "Previous",
    //         functionName:
    //             "getSuiteletPage(" +
    //             scriptId +
    //             ", " +
    //             deploymentId +
    //             ", " +
    //             (pageId - 1) +
    //             ")"
    //     });
    // }

    // if (pageId != pageCount - 1 && pageCount !== 0) {
    //     tranSublist.addButton({
    //         id: "custpage_next",
    //         label: "Next",
    //         functionName:
    //             "getSuiteletPage(" +
    //             scriptId +
    //             ", " +
    //             deploymentId +
    //             ", " +
    //             (pageId + 1) +
    //             ")"
    //     });
    // }

    // Add drop-down and options to navigate to specific page
    const selectOptions = slForm.addField({
        id: SUITELET_FIELD_IDS.PAGE_ID,
        label: "Page Index",
        type: serverWidget.FieldType.SELECT,
        container: "navigation_group"
    });

    slForm.addField({
        id: "custpage_page_num_html",
        type: serverWidget.FieldType.INLINEHTML,
        label: " ",
        container: "navigation_group"
    }).defaultValue = `<p style='font-size:14px'>Viewing Page ${
        pageId + 1
    } of ${pageCount}</p><br><br>`;

    const resultCountField = slForm.addField({
        id: SUITELET_FIELD_IDS.TRAN_COUNT,
        label: "Total Transaction Count",
        type: serverWidget.FieldType.INTEGER,
        container: "navigation_group"
    });

    resultCountField.defaultValue = (pageCount *
        PAGE_SIZE) as unknown as string;
    resultCountField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE
    });
    resultCountField.updateBreakType({
        breakType: serverWidget.FieldBreakType.STARTCOL
    });

    const onlySelectedField = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.INCLUDE_ALL,
        label: "Only Include Selected Transactions",
        container: "navigation_group"
    });
    onlySelectedField.defaultValue = "F";
    onlySelectedField.updateBreakType({
        breakType: serverWidget.FieldBreakType.STARTCOL
    });
    onlySelectedField.setHelpText({
        help: "Checking this box will process only checked transactions"
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

    if (pageCount > 0) {
        // get page of data that will be shown
        const pageResults =
            tranSearchService.fetchSearchResult({
                pagedData: transactionSearchPageData,
                pageIndex: pageId
            });

        let line = 0;
        pageResults.forEach((res) => {
            // log.debug({
            //     title: `result sublist value ${line}`,
            //     details: res
            // });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.process,
                value: "F",
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.id,
                value: res.id as unknown as string,
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.type,
                value: res.type,
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.status,
                value: res.status,
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.subsidiary,
                value: res.subsidiary as unknown as string,
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.entity,
                value: res.entity as unknown as string,
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.trannumber,
                value: res.trannumber,
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.date,
                value: format.format({
                    value: new Date(res.date),
                    type: format.Type.DATE
                }),
                line
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.amount,
                value: res.amount as unknown as string,
                line
            });

            const tranUrl = url.resolveRecord({
                recordId: res.id,
                recordType: res.raw_type
            });
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.tran_link,
                value: `<a href="${tranUrl}">Link</a>`,
                line
            });

            line++;
        });
    }

    return slForm;
};
