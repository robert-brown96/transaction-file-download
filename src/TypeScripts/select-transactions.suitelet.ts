/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */

import { EntryPoints } from "N/types";
import log = require("N/log");

export function onRequest(
    context: EntryPoints.Suitelet.onRequestContext
): void {
    log.debug("start suitelet", context);
}
