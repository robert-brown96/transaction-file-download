/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import { ISCRIPT_RUN } from "./globals";

export const TRAN_SELECT_SUITELET: ISCRIPT_RUN = {
    scriptId: "customscript_scgtfd_select_suitelet",
    deploymentId: "customdeploy_scgtfd_select_suitelet"
};

export const SUITELET_FIELD_IDS = {
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

export const SUITELET_SUBLIST_FIELD_IDS = {
    process: "process",
    id: "custpage_sublist_internal_id",
    type: "type",
    status: "status",
    subsidiary: "subsidiary",
    entity: "entity",
    trannumber: "trannumber",
    date: "date",
    amount: "amount",
    tran_link: "tran_link"
};

export const OUTPUT_FOLDER_ID = 1264907;
