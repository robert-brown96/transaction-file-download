/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/log", "N/query", "N/error", "N/search"], function (require, exports, log, query, error, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringToDateObj = exports.formatDateObjToString = exports.validateDateObj = exports.dateObjToFormattedString = exports.formatAMPM = exports.getTransactionType = exports.getScriptInternalId = exports.getParameterFromURL = exports.summarizeLogger = exports.queryReturn = exports.validateSuiteletMethod = void 0;
    /**
     *
     * @param tempMethod
     * @returns "GET"|"POST"
     */
    function validateSuiteletMethod(tempMethod) {
        // check the method is valid. if not get or post an error is thrown
        if (!["GET", "POST"].includes(tempMethod)) {
            log.debug({
                title: `check method fail ${tempMethod}`,
                details: tempMethod
            });
            log.error({
                title: "UNRECOGNIZED REQUEST METHOD",
                details: tempMethod
            });
            throw error.create({
                name: "INVALID_METHOD",
                message: `MUST PROVIDE GET OR POST AS A METHOD ${tempMethod}`
            });
        }
        return tempMethod;
    }
    exports.validateSuiteletMethod = validateSuiteletMethod;
    function queryReturn(ql) {
        try {
            const qlResults = query
                .runSuiteQL({ query: ql })
                .asMappedResults();
            log.debug({
                title: "queryReturn: results",
                details: qlResults
            });
            return { success: true, results: qlResults };
        }
        catch (e) {
            log.error({
                title: "queryReturn: ERROR",
                details: e
            });
            return {
                success: false,
                error_message: e,
                results: []
            };
        }
    }
    exports.queryReturn = queryReturn;
    function summarizeLogger(opts) {
        const { summary, logScriptName } = opts;
        const mapErrors = [];
        const reduceErrors = [];
        // For each error thrown during the map stage, log the error, the corresponding key,
        // and the execution number. The execution number indicates whether the error was
        // thrown during the first attempt to process the key, or during a
        // subsequent attempt.
        if (summary.mapSummary)
            summary.mapSummary.errors
                .iterator()
                .each(function (key, error, executionNo) {
                log.error({
                    title: "Map error for key: " +
                        key +
                        ", execution no.  " +
                        executionNo,
                    details: error
                });
                mapErrors.push({
                    asset: key,
                    message: error,
                    stage: "map"
                });
                return true;
            });
        // For each error thrown during the reduce stage, log the error, the corresponding
        // key, and the execution number. The execution number indicates whether the error was
        // thrown during the first attempt to process the key, or during a
        // subsequent attempt.
        if (summary.reduceSummary)
            summary.reduceSummary.errors
                .iterator()
                .each(function (key, error, executionNo) {
                log.error({
                    title: "Reduce error for key: " +
                        key +
                        ", execution no. " +
                        executionNo,
                    details: error
                });
                reduceErrors.push({
                    asset: key,
                    message: error,
                    stage: "reduce"
                });
                return true;
            });
        // log any errors
        log.audit({ title: "MAP ERRORS", details: mapErrors });
        log.audit({
            title: "REDUCE ERRORS",
            details: reduceErrors
        });
        log.audit({
            title: `COMPLETED SCRIPT ${logScriptName}`,
            details: {
                duration: summary.seconds,
                dateCreated: summary.dateCreated,
                usage: summary.usage,
                yields: summary.yields,
                concurrency: summary.concurrency
            }
        });
        return {
            mapErrors,
            reduceErrors
        };
    }
    exports.summarizeLogger = summarizeLogger;
    function getParameterFromURL(param) {
        const query = window.location.search.substring(1);
        const vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split("=");
            if (pair[0] == param) {
                return decodeURIComponent(pair[1]);
            }
        }
        throw error.create({
            name: "PARAMETER NOT FOUND",
            message: `param ${param} was not found in url`,
            notifyOff: true
        });
    }
    exports.getParameterFromURL = getParameterFromURL;
    /**
     * Returns the internal id of the given script
     *
     * @appliedtorecord script
     *
     * @param {Array} scriptId: identifier given to this script
     * @returns {Number|null}
     */
    const getScriptInternalId = (scriptId) => {
        let scriptInternalId = "";
        const scriptSearch = search.create({
            type: "script",
            columns: ["internalid"],
            filters: [
                ["scriptid", search.Operator.IS, scriptId]
            ]
        });
        const resultSet = scriptSearch
            .run()
            .getRange({ start: 0, end: 1000 });
        if (resultSet && resultSet.length > 0)
            scriptInternalId = resultSet[0].id;
        return scriptInternalId ? scriptInternalId : null;
    };
    exports.getScriptInternalId = getScriptInternalId;
    const getTransactionType = (transactionId) => {
        if (!transactionId)
            return "";
        const tranTypeA = search.lookupFields({
            type: search.Type.TRANSACTION,
            id: transactionId,
            columns: "type"
        });
        const typeVal = tranTypeA.type;
        log.debug({
            title: "TranType",
            details: typeVal[0].value
        });
        let tranType;
        if (typeVal[0].value == "SalesOrd") {
            tranType = "salesorder";
        }
        else if (typeVal[0].value == "CustInvc") {
            tranType = "invoice";
        }
        else {
            tranType = "creditmemo";
        }
        return tranType;
    };
    exports.getTransactionType = getTransactionType;
    function formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        const strTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
        return strTime;
    }
    exports.formatAMPM = formatAMPM;
    function dateObjToFormattedString(date) {
        try {
            const y = date.getFullYear();
            const m = date.getMonth();
            const d = date.getDate();
            const mm = m > 9 ? `${m}` : `0${m}`;
            const dd = d > 9 ? `${d}` : `0${d}`;
            return `${y}${mm}${dd}`;
        }
        catch (e) {
            log.debug("invalid date", date);
            return "";
        }
    }
    exports.dateObjToFormattedString = dateObjToFormattedString;
    function validateDateObj(obj) {
        try {
            if (typeof obj.year !== "number" ||
                obj.year === null) {
                log.debug("invalid year", obj.year);
                return false;
            }
            else if (typeof obj.month !== "number" ||
                obj.month === null) {
                log.debug("invalid month", obj.month);
                return false;
            }
            else if (typeof obj.day !== "number" ||
                obj.day === null) {
                log.debug("invalid day", obj.day);
                return false;
            }
            else
                return true;
        }
        catch (e) {
            return false;
        }
    }
    exports.validateDateObj = validateDateObj;
    function formatDateObjToString(v) {
        log.debug("check format", v);
        try {
            const y = v.year;
            const m = v.month;
            const d = v.day;
            const mm = m > 9 ? `${m}` : `0${m}`;
            const dd = d > 9 ? `${d}` : `0${d}`;
            return `${y}${mm}${dd}`;
        }
        catch (e) {
            log.debug("invalid date obj", v);
            return "";
        }
    }
    exports.formatDateObjToString = formatDateObjToString;
    function stringToDateObj(str) {
        try {
            const yyyy = str.substring(0, 4);
            const mm = str.substring(4, 6);
            const dd = str.substring(6, 8);
            const year = parseInt(yyyy);
            const month = parseInt(mm);
            const day = parseInt(dd);
            if (!year ||
                !month ||
                !day ||
                typeof year !== "number" ||
                typeof month !== "number" ||
                typeof day !== "number")
                return null;
            return { year, month, day };
        }
        catch (e) {
            log.debug("invalid datestring", str);
            return null;
        }
    }
    exports.stringToDateObj = stringToDateObj;
});
