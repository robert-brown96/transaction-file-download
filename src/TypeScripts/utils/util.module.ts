/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import log = require("N/log");
import query = require("N/query");
import error = require("N/error");
import search = require("N/search");

import { EntryPoints } from "N/types";
import {
    IDateObj,
    IMrError,
    TSUITELET_METHOD
} from "../globals";

/**
 *
 * @param tempMethod
 * @returns "GET"|"POST"
 */
export function validateSuiteletMethod(
    tempMethod: string
): TSUITELET_METHOD {
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
    return tempMethod as TSUITELET_METHOD;
}

export function queryReturn(ql: string): {
    results: {
        [fieldId: string]: string | number | boolean;
    }[];
    success: boolean;
    error_message?: error.SuiteScriptError;
} {
    try {
        const qlResults = query
            .runSuiteQL({ query: ql })
            .asMappedResults();
        log.debug({
            title: "queryReturn: results",
            details: qlResults
        });
        return { success: true, results: qlResults };
    } catch (e) {
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

export function summarizeLogger(opts: {
    summary: EntryPoints.MapReduce.summarizeContext;
    logScriptName: string;
}): {
    mapErrors: IMrError[];
    reduceErrors: IMrError[];
} {
    const { summary, logScriptName } = opts;

    const mapErrors: IMrError[] = [];
    const reduceErrors: IMrError[] = [];

    // For each error thrown during the map stage, log the error, the corresponding key,
    // and the execution number. The execution number indicates whether the error was
    // thrown during the first attempt to process the key, or during a
    // subsequent attempt.
    if (summary.mapSummary)
        summary.mapSummary.errors
            .iterator()
            .each(function (key, error, executionNo) {
                log.error({
                    title:
                        "Map error for key: " +
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
                    title:
                        "Reduce error for key: " +
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

export function getParameterFromURL(param: string): string {
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

/**
 * Returns the internal id of the given script
 *
 * @appliedtorecord script
 *
 * @param {Array} scriptId: identifier given to this script
 * @returns {Number|null}
 */
export const getScriptInternalId = (scriptId: string) => {
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

export const getTransactionType = (
    transactionId: string | number
) => {
    if (!transactionId) return "";
    const tranTypeA = search.lookupFields({
        type: search.Type.TRANSACTION,
        id: transactionId,
        columns: "type"
    });

    const typeVal = tranTypeA.type as unknown as {
        value: string;
    }[];

    log.debug({
        title: "TranType",
        details: typeVal[0].value
    });
    let tranType;
    if (typeVal[0].value == "SalesOrd") {
        tranType = "salesorder";
    } else if (typeVal[0].value == "CustInvc") {
        tranType = "invoice";
    } else {
        tranType = "creditmemo";
    }

    return tranType;
};

export function formatAMPM(date: Date) {
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime =
        hours + ":" + minutes + ":" + seconds + " " + ampm;
    return strTime;
}

export function dateObjToFormattedString(
    date: Date
): string {
    try {
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();

        const mm = m > 9 ? `${m}` : `0${m}`;
        const dd = d > 9 ? `${d}` : `0${d}`;

        return `${y}${mm}${dd}`;
    } catch (e) {
        log.debug("invalid date", date);
        return "";
    }
}

export function validateDateObj(obj: IDateObj): boolean {
    try {
        if (
            typeof obj.year !== "number" ||
            obj.year === null
        ) {
            log.debug("invalid year", obj.year);
            return false;
        } else if (
            typeof obj.month !== "number" ||
            obj.month === null
        ) {
            log.debug("invalid month", obj.month);
            return false;
        } else if (
            typeof obj.day !== "number" ||
            obj.day === null
        ) {
            log.debug("invalid day", obj.day);
            return false;
        } else return true;
    } catch (e) {
        return false;
    }
}
export function formatDateObjToString(v: IDateObj): string {
    log.debug("check format", v);
    try {
        const y = v.year;
        const m = v.month;
        const d = v.day;
        const mm = m > 9 ? `${m}` : `0${m}`;
        const dd = d > 9 ? `${d}` : `0${d}`;

        return `${y}${mm}${dd}`;
    } catch (e) {
        log.debug("invalid date obj", v);
        return "";
    }
}

export function stringToDateObj(str: string): IDateObj {
    try {
        const yyyy = str.substring(0, 4);
        const mm = str.substring(4, 6);
        const dd = str.substring(6, 8);

        const year = parseInt(yyyy);
        const month = parseInt(mm);
        const day = parseInt(dd);

        return { year, month, day };
    } catch (e) {
        log.debug("invalid datestring", str);
        return null;
    }
}
