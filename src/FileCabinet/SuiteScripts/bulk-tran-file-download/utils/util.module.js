/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports", "N/log", "N/error"], function (require, exports, log, error) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSuiteletMethod = void 0;
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
});
