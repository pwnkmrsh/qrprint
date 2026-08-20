const fs = require("fs");
const path = require("path");
const axios = require("axios");

const config = require("./config");

const {
    getJobs,
    completeJob,
    failJob,
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
            Authorization:
                `Bearer ${config.agentToken}`,
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
        `Processing print job: ${job.uuid}`
    );

    try {

        const extension = path.extname(job.original_name || "");
        const filename = `job-${job.id}${extension || ".pdf"}`;

        const filePath = await downloadFile(
            job.file_url,
            filename
        );

        await printFile(filePath);

        await completeJob(job.id);

        console.log(
            `✓ Printed: ${job.uuid}`
        );

        fs.unlinkSync(filePath);

    } catch (error) {

        console.error(
            `✗ Print failed: ${job.uuid}`,
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

console.log(
    "================================="
);

console.log(
    " MynaTech Local Printer Agent"
);

console.log(
    "================================="
);

console.log(
    `Server: ${config.laravelUrl}`
);

console.log(
    `Agent: ${config.agentId}`
);

console.log(
    `Printer: ${config.printerName}`
);

console.log(
    "Agent started..."
);

poll();
