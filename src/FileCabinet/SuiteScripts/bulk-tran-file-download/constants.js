/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PROCESS_FILE_NAME_PREFIX = exports.OUTPUT_FOLDER_ID = exports.SUITELET_SUBLIST_ID = exports.SUITELET_SUBLIST_FIELD_IDS = exports.SUITELET_FIELD_IDS = exports.FILE_DOWNLOAD_MR_PARAMS = exports.FILE_DOWNLOAD_MR = exports.TRAN_SELECT_SUITELET = void 0;
    exports.TRAN_SELECT_SUITELET = {
        scriptId: "customscript_scgtfd_select_suitelet",
        deploymentId: "customdeploy_scgtfd_select_suitelet"
    };
    exports.FILE_DOWNLOAD_MR = {
        scriptId: "customscript_scgtfd_download_files",
        deploymentId: "customdeploy_scgtfd_download_files"
    };
    exports.FILE_DOWNLOAD_MR_PARAMS = {
        fileId: "custscript_scgtfd_mr_process_file_id"
    };
    exports.SUITELET_FIELD_IDS = {
        ALL_TRAN_TYPES: "custpage_tran_type_all",
        ALL_STATUSES: "custpage_tran_status_all",
        INCLUDE_PDF: "custpage_include_tran_pdf",
        INCLUDE_ALL_FILES: "custpage_include_all_files",
        JOIN_PDFS: "custpage_join_pdfs",
        START_DATE: "custpage_tran_start_date",
        END_DATE: "custpage_tran_end_date",
        CUSTOMER: "custpage_customer",
        SUBSIDIARY: "custpage_subsidiary",
        TRAN_TYPES: "custpage_tran_type",
        TRAN_STATUS: "custpage_status",
        PAGE_ID: "custpage_page_id",
        TRAN_COUNT: "custpage_count",
        INCLUDE_SELECTED: "custpage_use_all"
    };
    exports.SUITELET_SUBLIST_FIELD_IDS = {
        process: "process",
        id: "custpage_sublist_internal_id",
        type: "type",
        status: "status",
        subsidiary: "subsidiary",
        entity: "entity",
        trannumber: "trannumber",
        date: "date",
        currency: "currency",
        amount: "amount",
        tran_link: "tran_link"
    };
    exports.SUITELET_SUBLIST_ID = "custpage_tran_list";
    exports.OUTPUT_FOLDER_ID = 1264907;
    exports.PROCESS_FILE_NAME_PREFIX = "download_process_file";
});
