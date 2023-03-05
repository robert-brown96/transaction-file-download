/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */

import { EntryPoints } from "N/types";
import log = require("N/log");
import runtime = require("N/runtime");
import file = require("N/file");
import error = require("N/error");
import { FILE_DOWNLOAD_MR_PARAMS } from "./constants";

export function getInputData(
    context: EntryPoints.MapReduce.getInputDataContext
): void {
    log.debug(`starting file download`, context);

    const currentScriptRt = runtime.getCurrentScript();
    const inputFileId = currentScriptRt.getParameter({
        name: FILE_DOWNLOAD_MR_PARAMS.fileId
    });
    if (!inputFileId)
        throw error.create({
            name: "MISSING_FILE_INPUT",
            message: `input file id submission of ${inputFileId} is invalid`
        });
    if (
        inputFileId &&
        (typeof inputFileId === "string" ||
            typeof inputFileId === "number")
    ) {
        const fileObj = file.load({ id: inputFileId });

        let contents = fileObj.getContents();
        contents = contents ? JSON.parse(contents) : null;

        log.debug(`loaded file contents`, contents);
    } else return;
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
