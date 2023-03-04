/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */
define(["require", "exports", "N/log", "N/ui/serverWidget", "./utils/util.module", "./utils/tran-status-val.service", "./constants", "./utils/transaction-search.service"], function (require, exports, log, serverWidget, util_module_1, tran_status_val_service_1, constants_1, transaction_search_service_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    const PAGE_SIZE = 50;
    function onRequest(context) {
        log.debug("start suitelet", context);
        // destructure context
        const { request, response } = context;
        const method = (0, util_module_1.validateSuiteletMethod)(request.method);
        if (method === "GET") {
            try {
                // page id parameter
                const pageId = parseInt(request.parameters.page);
                const formRes = _get({ pageId });
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
    const _get = ({ pageId }) => {
        const slForm = serverWidget.createForm({
            title: "Download Transaction Files in Bulk"
        });
        slForm.clientScriptModulePath = "./tran-sl.client.js";
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
        // create sublist for transactions
        const tranSublist = slForm.addSublist({
            id: "custpage_tran_list",
            label: "Transaction Sublist",
            type: serverWidget.SublistType.LIST
        });
        tranSublist.addMarkAllButtons();
        // sublist fields
        tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.process,
            label: "Process",
            type: serverWidget.FieldType.CHECKBOX
        });
        tranSublist
            .addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.id,
            label: "Internal ID",
            type: serverWidget.FieldType.TEXT
        })
            .updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.type,
            label: "Type",
            type: serverWidget.FieldType.TEXT
        });
        const sublistStatusField = tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.status,
            label: "Status",
            type: serverWidget.FieldType.SELECT
        });
        tranStatusService
            .getUniqueValues()
            .forEach((e) => sublistStatusField.addSelectOption(e));
        const subsidiarySublistField = tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.subsidiary,
            label: "Subsidiary",
            type: serverWidget.FieldType.SELECT,
            source: "subsidiary"
        });
        subsidiarySublistField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        const entityField = tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.entity,
            label: "Entity",
            type: serverWidget.FieldType.TEXT
        });
        entityField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.trannumber,
            label: "Document Number",
            type: serverWidget.FieldType.TEXT
        });
        tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.date,
            label: "Date",
            type: serverWidget.FieldType.TEXT
        });
        tranSublist.addField({
            id: constants_1.SUITELET_SUBLIST_FIELD_IDS.amount,
            label: "Amount",
            type: serverWidget.FieldType.CURRENCY
        });
        const tranSearchService = new transaction_search_service_1.TransactionSearchService({
            START_DATE: new Date(),
            ALL_STATUSES: true,
            ALL_TRAN_TYPES: true,
            TRAN_TYPES: [],
            TRAN_STATUS: []
        });
        const transactionSearchPageData = tranSearchService.runSearch(PAGE_SIZE);
        const pageCount = Math.ceil(transactionSearchPageData.count / PAGE_SIZE);
        log.debug("search pageCount", pageCount);
        // Set pageId to correct value if out of index
        if (!pageId || pageId < 0)
            pageId = 0;
        else if (pageId >= pageCount)
            pageId = pageCount - 1;
        // Add drop-down and options to navigate to specific page
        const selectOptions = slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.PAGE_ID,
            label: "Page Index",
            type: serverWidget.FieldType.SELECT,
            container: "navigation_group"
        });
        const resultCountField = slForm.addField({
            id: constants_1.SUITELET_FIELD_IDS.TRAN_COUNT,
            label: "Total Transaction Count",
            type: serverWidget.FieldType.INTEGER,
            container: "navigation_group"
        });
        resultCountField.defaultValue = (pageCount *
            PAGE_SIZE);
        resultCountField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        resultCountField.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });
        for (let i = 0; i < pageCount; i++) {
            if (i == pageId)
                selectOptions.addSelectOption({
                    value: "pageid_" + i,
                    text: i * PAGE_SIZE +
                        1 +
                        " - " +
                        (i + 1) * PAGE_SIZE,
                    isSelected: true
                });
            else
                selectOptions.addSelectOption({
                    value: "pageid_" + i,
                    text: i * PAGE_SIZE +
                        1 +
                        " - " +
                        (i + 1) * PAGE_SIZE
                });
        }
        // get page of data that will be shown
        const pageResults = tranSearchService.fetchSearchResult({
            pagedData: transactionSearchPageData,
            pageIndex: pageId
        });
        let line = 0;
        pageResults.forEach((res) => {
            log.debug({
                title: `result ${line}`,
                details: res
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.process,
                value: "F",
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.id,
                value: res.id,
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.type,
                value: res.type,
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.status,
                value: res.status,
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.subsidiary,
                value: res.subsidiary,
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.entity,
                value: res.entity,
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.trannumber,
                value: res.trannumber,
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.date,
                value: new Date(res.date),
                line
            });
            tranSublist.setSublistValue({
                id: constants_1.SUITELET_SUBLIST_FIELD_IDS.amount,
                value: res.amount,
                line
            });
            line++;
        });
        return slForm;
    };
});
