/**
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransactionStatusService = void 0;
    class TransactionStatusService {
        constructor(initVals) {
            this.transactionTypes = [];
            if (!initVals || initVals.length === 0) {
                // add all tran types
                const t = this.supportedTransValues();
                const v = t.map((x) => x.value);
                this.transactionTypes.push(...v);
            }
            this.transactionTypes.push(...initVals);
        }
        supportedTransValues() {
            return [
                { text: "Invoice", value: "invoice" },
                { text: "Credit Memo", value: "creditmemo" }
                //  { text: "Bill", value: "vendorbill" }
            ];
        }
        getUniqueValues() {
            const allStatuses = [];
            //invoice status values
            if (this.transactionTypes.includes("invoice"))
                allStatuses.push(...this.invoiceStatus());
            //credit status values
            if (this.transactionTypes.includes("creditmemo"))
                allStatuses.push(...this.creditStatus());
            // //credit status values
            // if (this.transactionTypes.includes("vendorbill"))
            //     allStatuses.push(...this.vendorBillStatus());
            return [...new Set(allStatuses)];
        }
        invoiceStatus() {
            return [
                { value: "CustInvc:A", text: "Invoice:Open" },
                {
                    value: "CustInvc:B",
                    text: "Invoice:Paid In Full"
                },
                { value: "@ALL@", text: "Invoice:All" }
            ];
        }
        creditStatus() {
            return [
                {
                    value: "CustCred:A",
                    text: "Credit Memo:Open"
                },
                {
                    value: "CustCred:B",
                    text: "Credit Memo:Fully Applied"
                },
                { value: "@ALL@", text: "Credit Memo:All" }
            ];
        }
        vendorBillStatus() {
            return [
                { value: "VendBill:A", text: "Bill:Open" },
                {
                    value: "VendBill:B",
                    text: "Bill:Paid In Full"
                },
                { value: "VendBill:C", text: "Bill:Cancelled" },
                {
                    value: "VendBill:D",
                    text: "Bill:Pending Approval"
                },
                { value: "VendBill:E", text: "Bill:Rejected" },
                { value: "@ALL@", text: "Bill:All" }
            ];
        }
    }
    exports.TransactionStatusService = TransactionStatusService;
});
