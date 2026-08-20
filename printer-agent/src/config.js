require("dotenv").config();

module.exports = {
    laravelUrl: process.env.LARAVEL_URL,
    agentId: process.env.AGENT_ID,
    agentToken: process.env.AGENT_TOKEN,
    printerName: process.env.PRINTER_NAME,
    pdfPrinterPath: process.env.PDF_PRINTER_PATH,
    pollInterval: Number(process.env.POLL_INTERVAL || 3000),
};
