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
import render = require("N/render");
import {
    FILE_DOWNLOAD_MR_PARAMS,
    INDVIDUAL_PDF_OUTPUT_FOLDER_ID
} from "./constants";
import { summarizeLogger } from "./utils/util.module";
import { IProcessFileValues } from "./globals";

export function getInputData(
    context: EntryPoints.MapReduce.getInputDataContext
): number[] {
    log.debug(`starting file download`, context);

    try {
        const fileData = getProcessFileContent();

        return fileData.transaction_ids;
    } catch (e) {
        log.error("Error in getInputData", e);
        return [];
    }
}

export function map(
    context: EntryPoints.MapReduce.mapContext
): void {
    log.debug("map", context);

    const transactionId = context.value;

    log.debug("map transactionId", transactionId);

    // v1 only write tran id to reduce
    context.write({ key: transactionId, value: "" });
}

export function reduce(
    context: EntryPoints.MapReduce.reduceContext
): void {
    log.debug("reduce", context);

    const tranId = context.key;

    const pdfFile = render.transaction({
        entityId: parseInt(tranId),
        printMode: "PDF"
    });
    log.debug("created pdfFile", pdfFile);

    pdfFile.folder = INDVIDUAL_PDF_OUTPUT_FOLDER_ID;
    pdfFile.isOnline = true;
    const savedFileId = pdfFile.save();
    log.debug("created pdfFile savedFileId", savedFileId);
    context.write({
        key: "new_ids",
        value: String(savedFileId)
    });
}

export function summarize(
    context: EntryPoints.MapReduce.summarizeContext
): void {
    log.debug("summary", context);

    const { mapErrors, reduceErrors } = summarizeLogger({
        summary: context,
        logScriptName: "Download Files MR"
    });

    log.audit("Count of Map Errors", mapErrors.length);
    log.audit(
        "Count of Reduce Errors",
        reduceErrors.length
    );

    try {
        const tranIds: number[] = [];
        context.output.iterator().each((key, value) => {
            log.debug(`key ${key}`, `value ${value}`);

            tranIds.push(parseInt(value));

            return true;
        });
        log.debug("all pdf ids", tranIds);
    } catch (e) {
        log.error(`error consolidating pdfs`, e);
    }
}

const getProcessFileContent = (): IProcessFileValues => {
    const currentScriptRt = runtime.getCurrentScript();
    const inputFileId = currentScriptRt.getParameter({
        name: FILE_DOWNLOAD_MR_PARAMS.fileId
    });

    if (
        !inputFileId ||
        (typeof inputFileId !== "string" &&
            typeof inputFileId !== "number")
    )
        throw error.create({
            name: "MISSING_FILE_INPUT",
            message: `input file id submission of ${inputFileId} is invalid`
        });

    const fileObj = file.load({ id: inputFileId });

    const contents = fileObj.getContents();
    const parsedContent = contents
        ? JSON.parse(contents)
        : {};

    log.debug(`loaded file contents`, contents);
    log.debug(
        `loaded file tran ids`,
        parsedContent.transaction_ids
    );
    return parsedContent;
};
