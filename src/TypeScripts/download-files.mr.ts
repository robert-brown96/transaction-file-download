/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */

import { EntryPoints } from "N/types";
import log = require("N/log");

export function getInputData(
    context: EntryPoints.MapReduce.getInputDataContext
): void {
    log.debug(`starting file download`, context);
}

export function map(
    context: EntryPoints.MapReduce.mapContext
): void {
    log.debug("map", context);
}

export function reduce(
    context: EntryPoints.MapReduce.reduceContext
): void {
    log.debug("reduce", context);
}

export function summarize(
    context: EntryPoints.MapReduce.summarizeContext
): void {
    log.debug("summary", context);
}
