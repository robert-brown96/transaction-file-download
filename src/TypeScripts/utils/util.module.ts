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
import { IMrError, TSUITELET_METHOD } from "../globals";

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

    const typeVal = tranTypeA.type as any[];

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
