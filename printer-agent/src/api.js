const axios = require("axios");
const config = require("./config");

const client = axios.create({
    baseURL: config.laravelUrl,
    timeout: 15000,
    headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.agentToken}`,
    },
});

async function getJobs() {
    const response = await client.get(
        "/api/print-agent/jobs",
        {
            params: {
                agent_id: config.agentId,
            },
        }
    );

    return response.data.jobs || [];
}

async function completeJob(jobId) {
    await client.post(
        `/api/print-agent/jobs/${jobId}/complete`
    );
}

async function failJob(jobId, error) {
    await client.post(
        `/api/print-agent/jobs/${jobId}/failed`,
        {
            error_message: error.message,
        }
    );
}

module.exports = {
    getJobs,
    completeJob,
    failJob,
};