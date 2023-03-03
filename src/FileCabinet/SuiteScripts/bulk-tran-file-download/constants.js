/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SUITELET_FIELD_IDS = exports.TRAN_SELECT_SUITELET = void 0;
    exports.TRAN_SELECT_SUITELET = {
        scriptId: "customscript_scgtfd_select_suitelet",
        deploymentId: "customdeploy_scgtfd_select_suitelet"
    };
    exports.SUITELET_FIELD_IDS = {
        INCLUDE_PDF: "custpage_include_tran_pdf",
        INCLUDE_ALL_FILES: "custpage_include_all_files",
        START_DATE: "custpage_tran_start_date",
        END_DATE: "custpage_tran_end_date",
        CUSTOMER: "custpage_customer",
        SUBSIDIARY: "custpage_subsidiary",
        ALL_TRAN_TYPES: "custpage_tran_type_all",
        TRAN_TYPES: "custpage_tran_type",
        ALL_STATUSES: "custpage_tran_status_all",
        TRAN_STATUS: "custpage_status"
    };
});
