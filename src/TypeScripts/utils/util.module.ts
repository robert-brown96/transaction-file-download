/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import log = require("N/log");
import error = require("N/error");
import { TSUITELET_METHOD } from "../globals";

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
