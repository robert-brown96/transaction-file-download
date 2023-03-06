/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType MapReduceScript
 */

import { EntryPoints } from "N/types";
import log = require("N/log");
import search = require("N/search");
import file = require("N/file");
import runtime = require("N/runtime");
import {
    CONSOL_PDF_OUTPUT_FOLDER_ID,
    FILE_DELETE_MR_PARAMS,
    INDVIDUAL_PDF_OUTPUT_FOLDER_ID
} from "./constants";
import { summarizeLogger } from "./utils/util.module";
export function getInputData(
    context: EntryPoints.MapReduce.getInputDataContext
): search.Search {
    log.debug(`starting file delete`, context);

    const currentScriptRt = runtime.getCurrentScript();
    const deleteConsol = currentScriptRt.getParameter({
        name: FILE_DELETE_MR_PARAMS.deleteConsol
    });

    if (deleteConsol) {
        const searchObj = search.create({
            type: "file",
            filters: [
                [
                    "folder",
                    "anyof",
                    INDVIDUAL_PDF_OUTPUT_FOLDER_ID,
                    CONSOL_PDF_OUTPUT_FOLDER_ID
                ]
            ],
            columns: ["name"]
        });

        return searchObj;
    } else {
        const searchObj = search.create({
            type: "file",
            filters: [
                [
                    "folder",
                    "anyof",
                    INDVIDUAL_PDF_OUTPUT_FOLDER_ID
                ]
            ],
            columns: ["name"]
        });

        return searchObj;
    }
}

export function map(
    context: EntryPoints.MapReduce.mapContext
): void {
    log.debug("map", context);

    const searchResult = JSON.parse(context.value);
    const fileId = searchResult.id;

    file.delete({ id: fileId });
}

export function summarize(
    context: EntryPoints.MapReduce.summarizeContext
): void {
    log.debug("summary", context);

    const { mapErrors } = summarizeLogger({
        summary: context,
        logScriptName: "Delete Files MR"
    });

    log.audit("Count of Map Errors", mapErrors.length);
}
