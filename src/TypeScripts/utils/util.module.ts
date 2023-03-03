/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import log = require("N/log");
import query = require("N/query");
import error = require("N/error");
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
