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
import redirect = require("N/redirect");
import serverWidget = require("N/ui/serverWidget");
//import search = require("N/search");
import {
    dateObjToFormattedString,
    formatDateObjToString,
    getScriptInternalId,
    stringToDateObj,
    validateDateObj,
    validateSuiteletMethod
} from "./utils/util.module";
import { TransactionStatusService } from "./utils/tran-status-val.service";
import {
    FILE_DOWNLOAD_MR,
    SUITELET_FIELD_IDS,
    SUITELET_SUBLIST_FIELD_IDS,
    SUITELET_SUBLIST_ID
} from "./constants";
import { TransactionSearchService } from "./utils/transaction-search.service";
import { IGetParams, IPostServiceInit } from "./globals";
import { PostService } from "./utils/suitelet.service";

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

            const start =
                request.parameters.start ??
                dateObjToFormattedString(new Date());
            log.debug("check start", start);
            // form value parameters
            const startObj = stringToDateObj(start);
            log.debug("check start", startObj);

            const end = stringToDateObj(
                request.parameters.end
            );
            log.debug("check end", end);

            const customer = request.parameters.customer;

            const subsidiary =
                request.parameters.subsidiary;

            const allTypesParam =
                request.parameters.allTypes === "false"
                    ? false
                    : true;

            const allStatusParam =
                request.parameters.allStatus === "false"
                    ? false
                    : true;

            let tranTypes = request.parameters.typeArr;
            tranTypes = tranTypes
                ? JSON.parse(tranTypes)
                : [];

            let tranStatuses = request.parameters.statusArr;
            tranStatuses = tranStatuses
                ? JSON.parse(tranStatuses)
                : [];
            tranStatuses = tranStatuses.filter(
                (x: string) => x && x !== ""
            );
            log.debug(
                `status param is ${tranStatuses}`,
                tranStatuses[0]
            );

            // select individual params
            const selectTransactions =
                request.parameters.selectIndividual ===
                "true"
                    ? true
                    : false;
            const formRes = _get({
                pageId,
                scriptId,
                deploymentId,
                start,
                startObj,
                allTypesParam,
                allStatusParam,
                tranTypes,
                tranStatuses,
                selectTransactions,
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
    } else {
        log.audit("post sl", context.request);

        // get download options
        const includeTranPrintout =
            context.request.parameters[
                SUITELET_FIELD_IDS.INCLUDE_PDF
            ] === "T"
                ? true
                : false;
        log.debug(
            "includeTranPrintout",
            includeTranPrintout
        );

        const includeAllFiles =
            context.request.parameters[
                SUITELET_FIELD_IDS.INCLUDE_ALL_FILES
            ] === "T"
                ? true
                : false;
        log.debug("includeAllFiles", includeAllFiles);
        const concatFiles =
            context.request.parameters[
                SUITELET_FIELD_IDS.JOIN_PDFS
            ] === "T"
                ? true
                : false;
        log.debug("concatFiles", concatFiles);

        // check if selected or full search
        const selectIndividual =
            context.request.parameters[
                SUITELET_FIELD_IDS.INCLUDE_SELECTED
            ] === "T"
                ? true
                : false;
        log.debug("select individual", selectIndividual);

        _post({
            includeAllFiles,
            includeTranPrintout,
            selectIndividual,
            concatFiles,
            request
        });

        // send to map reduce status page if success
        redirect.toTaskLink({
            id: "LIST_MAPREDUCESCRIPTSTATUS",
            parameters: {
                scripttype: getScriptInternalId(
                    FILE_DOWNLOAD_MR.scriptId
                )
            }
        });
    }
}

const _get = ({
    pageId,
    scriptId,
    deploymentId,
    startObj,
    end,
    customer,
    subsidiary,
    allTypesParam,
    allStatusParam,
    selectTransactions,
    tranTypes,
    tranStatuses
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
    includeAllFilesField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.HIDDEN
    });

    const joinPdfFilesField = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.JOIN_PDFS,
        label: "Concatenate PDFs",
        container: "file_options_group"
    });
    joinPdfFilesField.defaultValue = "F";
    log.debug("date fields get", startObj);
    // Start Date
    const startDateField = slForm.addField({
        id: SUITELET_FIELD_IDS.START_DATE,
        type: serverWidget.FieldType.DATE,
        label: "Earliest Tran Date",
        container: "filters_group"
    });
    startDateField.defaultValue = new Date(
        startObj.year,
        startObj.month,
        startObj.day
    ) as unknown as string;
    log.debug("check start date", startDateField);
    startDateField.isMandatory = true;
    const startDateStringField = slForm.addField({
        id: SUITELET_FIELD_IDS.START_OBJ,
        type: serverWidget.FieldType.TEXT,
        label: "Earliest Tran Datestring",
        container: "filters_group"
    });

    startDateStringField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.HIDDEN
    });
    startDateStringField.defaultValue =
        formatDateObjToString(startObj);

    // End Date
    const endDateField = slForm.addField({
        id: SUITELET_FIELD_IDS.END_DATE,
        type: serverWidget.FieldType.DATE,
        label: "Latest Tran Date",
        container: "filters_group"
    });
    const endDateStringField = slForm.addField({
        id: SUITELET_FIELD_IDS.END_OBJ,
        type: serverWidget.FieldType.TEXT,
        label: "Latest Tran Datestring",
        container: "filters_group"
    });
    endDateStringField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.HIDDEN
    });
    const dateObjCheck = validateDateObj(end);
    if (end && dateObjCheck) {
        log.debug("check end date", end);
        try {
            endDateField.defaultValue = new Date(
                end.year,
                end.month,
                end.day
            ) as unknown as string;
            log.debug("passed end date", end);
            endDateStringField.defaultValue =
                formatDateObjToString(end);
        } catch (e) {
            log.debug("end date failed", end);
        }
    }

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

    const tranTypeChecked =
        TransactionStatusService.stringToTranTypes(
            tranTypes
        );
    // transaction type and status fields
    const tranStatusService = new TransactionStatusService(
        tranTypeChecked
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

    if (tranTypeChecked.length > 0 && !allTypesParam)
        tranTypeField.defaultValue = tranTypeChecked;
    else if (tranTypeChecked.length === 0 && !allTypesParam)
        tranTypeField.defaultValue = [
            "invoice",
            "creditmemo"
        ];
    else tranTypeField.defaultValue = [];

    const selectAllStatuses = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.ALL_STATUSES,
        label: "All Transaction Statuses",
        container: "filters_group"
    });
    selectAllStatuses.updateBreakType({
        breakType: serverWidget.FieldBreakType.STARTCOL
    });
    selectAllStatuses.defaultValue =
        allStatusParam === false ? "F" : "T";

    const statusField = slForm.addField({
        id: SUITELET_FIELD_IDS.TRAN_STATUS,
        type: serverWidget.FieldType.MULTISELECT,
        label: "Status",
        container: "filters_group"
    });

    tranStatusService
        .getUniqueValues()
        .forEach((e) => statusField.addSelectOption(e));

    if (tranStatuses.length > 0 && !allStatusParam)
        statusField.defaultValue = tranStatuses;
    else statusField.defaultValue = [];

    // create sublist for transactions
    const tranSublist = slForm.addSublist({
        id: SUITELET_SUBLIST_ID,
        label: "Transaction Sublist",
        type: serverWidget.SublistType.LIST
    });

    if (selectTransactions) tranSublist.addMarkAllButtons();

    // sublist fields
    const processSublistField = tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.process,
        label: "Process",
        type: serverWidget.FieldType.CHECKBOX
    });
    if (!selectTransactions)
        processSublistField.updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.DISABLED
        });
    else
        processSublistField.updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.NORMAL
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

    const currencyField = tranSublist.addField({
        id: SUITELET_SUBLIST_FIELD_IDS.currency,
        label: "Currency",
        type: serverWidget.FieldType.SELECT,
        source: "currency"
    });
    currencyField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE
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
        START_OBJ: startObj,
        ALL_STATUSES: allStatusParam,
        ALL_TRAN_TYPES: allTypesParam,
        TRAN_TYPES: tranTypeChecked,
        TRAN_STATUS: tranStatuses,
        ...(end && { END_DATE: end }),
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

    // const resultCountField = slForm.addField({
    //     id: SUITELET_FIELD_IDS.TRAN_COUNT,
    //     label: "Total Transaction Count",
    //     type: serverWidget.FieldType.INTEGER,
    //     container: "navigation_group"
    // });

    // resultCountField.defaultValue = (pageCount *
    //     PAGE_SIZE) as unknown as string;
    // resultCountField.updateDisplayType({
    //     displayType: serverWidget.FieldDisplayType.INLINE
    // });
    // resultCountField.updateBreakType({
    //     breakType: serverWidget.FieldBreakType.STARTCOL
    // });

    const onlySelectedField = slForm.addField({
        type: serverWidget.FieldType.CHECKBOX,
        id: SUITELET_FIELD_IDS.INCLUDE_SELECTED,
        label: "Only Include Selected Transactions",
        container: "navigation_group"
    });
    onlySelectedField.defaultValue =
        selectTransactions === false ? "F" : "T";
    onlySelectedField.updateBreakType({
        breakType: serverWidget.FieldBreakType.STARTCOL
    });
    onlySelectedField.setHelpText({
        help: "Unchecking this box will process only checked transactions"
    });
    slForm.addField({
        id: "custpage_select_help_html",
        type: serverWidget.FieldType.INLINEHTML,
        label: " ",
        container: "navigation_group"
    }).defaultValue = `<p style='font-size:12px'>Check this box to select individual Transactions</p><br><br>`;

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
            tranSublist.setSublistValue({
                id: SUITELET_SUBLIST_FIELD_IDS.currency,
                value: res.currency as unknown as string,
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

const _post = ({
    selectIndividual,
    includeTranPrintout,
    includeAllFiles,
    concatFiles,
    request
}: IPostServiceInit) => {
    const postService = new PostService({
        selectIndividual,
        includeAllFiles,
        includeTranPrintout,
        concatFiles,
        request
    });

    log.debug("PostService", postService);

    // submit only selected transactions
    if (selectIndividual) {
        // get selected ids
        const idRes = postService.getSelectedIds();
        postService.processFileService.setTransactionIds(
            idRes
        );
        log.debug("idRes", idRes);

        const resultFile =
            postService.processFileService.writeProcessFile();
        const submittedTaskId =
            postService.invokeMapReduce(resultFile);
        log.debug("my submittedTaskId", submittedTaskId);
    } else {
        // run search for ids
        log.debug(
            "find filters",
            postService.selectIndividual
        );

        const start =
            request.parameters[
                SUITELET_FIELD_IDS.START_OBJ
            ];
        const startObj = stringToDateObj(start);
        log.debug("check start", startObj);

        const end = stringToDateObj(
            request.parameters[SUITELET_FIELD_IDS.END_OBJ]
        );
        log.debug("check end", end);

        const customer =
            request.parameters[SUITELET_FIELD_IDS.CUSTOMER];

        const subsidiary =
            request.parameters[
                SUITELET_FIELD_IDS.SUBSIDIARY
            ];

        const allTypesParam =
            request.parameters[
                SUITELET_FIELD_IDS.ALL_TRAN_TYPES
            ] === "false"
                ? false
                : true;

        const allStatusParam =
            request.parameters[
                SUITELET_FIELD_IDS.ALL_STATUSES
            ] === "false"
                ? false
                : true;

        const tranTypesRaw =
            request.parameters[
                SUITELET_FIELD_IDS.TRAN_TYPES
            ];

        const tranStatusRaw =
            request.parameters[
                SUITELET_FIELD_IDS.TRAN_STATUS
            ];
        const searchService = new TransactionSearchService({
            START_OBJ: startObj,
            ALL_STATUSES: allStatusParam,
            ALL_TRAN_TYPES: allTypesParam,
            TRAN_TYPES: tranTypesRaw,
            TRAN_STATUS: tranStatusRaw,
            ...(end && { END_DATE: end }),
            ...(customer && {
                CUSTOMER: parseInt(customer)
            }),
            ...(subsidiary && {
                SUBSIDIARY: parseInt(subsidiary)
            })
        });
        const idResults = searchService.searchAllIds();
        postService.processFileService.setTransactionIds(
            idResults
        );
        log.debug("my search service", idResults);
        const resultFile =
            postService.processFileService.writeProcessFile();

        const submittedTaskId =
            postService.invokeMapReduce(resultFile);
        log.debug("my submittedTaskId", submittedTaskId);
    }
};
