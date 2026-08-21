const fs = require("fs");
const path = require("path");
const axios = require("axios");

const config = require("./config");

const {
    getJobs,
    completeJob,
    failJob,
    reportCapabilities,
} = require("./api");

const {
    printFile,
} = require("./printer");

const downloadDirectory = path.join(
    __dirname,
    "..",
    "downloads"
);

function describeError(error) {
    if (!error.response) {
        return error.message;
    }

    const responseData = error.response.data;
    const responseBody = typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData);

    return `${error.message} (${error.response.status}): ${responseBody}`;
}

if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory, {
        recursive: true,
    });
}

async function downloadFile(url, filename) {
    const filePath = path.join(
        downloadDirectory,
        filename
    );

    const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
            Authorization: `Bearer ${config.agentToken}`,
        },
    });

    fs.writeFileSync(
        filePath,
        response.data
    );

    return filePath;
}

async function processJob(job) {
    console.log(
        `----------------------------------------\nProcessing print job: #${job.id} (${job.uuid})`
    );
    console.log(
        `File: ${job.original_name} [${job.file_type || "pdf"}]`
    );
    console.log(
        `Settings: ${job.copies}x | ${job.color_mode?.toUpperCase() || "BW"} | ${job.paper_size || "A4"} | ${job.orientation || "auto"}`
    );
    if (job.selected_sheets && job.selected_sheets.length > 0) {
        console.log(`Excel Worksheets: [${job.selected_sheets.join(", ")}]`);
    }

    try {
        const extension = path.extname(job.original_name || "");
        const filename = `job-${job.id}-${Date.now()}${extension || ".pdf"}`;

        const filePath = await downloadFile(
            job.file_url,
            filename
        );

        // Execute print with full per-job configuration
        await printFile(filePath, job);

        await completeJob(job.id);

        console.log(
            `✓ Successfully Printed: #${job.id} (${job.uuid})`
        );

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (cleanupErr) {
            // silent cleanup error
        }

    } catch (error) {
        console.error(
            `✗ Print failed for job #${job.id}:`,
            error.message
        );

        await failJob(
            job.id,
            error
        );
    }
}

async function poll() {
    try {
        const jobs = await getJobs();

        for (const job of jobs) {
            await processJob(job);
        }

    } catch (error) {
        console.error(
            "Agent connection error:",
            describeError(error)
        );
    }

    setTimeout(
        poll,
        config.pollInterval
    );
}

console.log("=================================");
console.log(" MynaTech Local Printer Agent");
console.log("=================================");
console.log(`Server: ${config.laravelUrl}`);
console.log(`Agent: ${config.agentId}`);
console.log(`Printer: ${config.printerName}`);
console.log("Multi-file Excel/PDF/Image workflow active");
console.log("Agent started...\n");

// Announce capabilities
reportCapabilities({
    agent_id: config.agentId,
    printer_name: config.printerName,
    capabilities: {
        color: true,
        duplex: true,
        paper_sizes: ["A4", "A3", "Letter", "Legal"],
        excel_sheet_isolation: true,
    },
});

poll();
