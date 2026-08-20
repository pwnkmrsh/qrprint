const { execFile } = require("child_process");
const fs = require("fs");
const config = require("./config");

function findSumatraPdf() {
    const candidates = [
        config.pdfPrinterPath,
        "C:\\Users\\wrdmi\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
    ].filter(Boolean);

    return candidates.find((candidate) => fs.existsSync(candidate));
}

function rejectWithProcessDetails(reject, error, stdout, stderr) {
    if (!error) {
        return false;
    }

    const details = [
        error.message,
        error.code !== undefined ? `Exit code: ${error.code}` : null,
        stdout && `stdout: ${stdout.trim()}`,
        stderr && `stderr: ${stderr.trim()}`,
    ].filter(Boolean);

    error.message = details.join("\n");
    reject(error);
    return true;
}

function printFile(filePath) {

    return new Promise((resolve, reject) => {

        const printer = config.printerName;
        const sumatraPdf = findSumatraPdf();

        if (filePath.toLowerCase().endsWith(".pdf")) {
            if (!sumatraPdf) {
                reject(new Error(
                    "Cannot print PDF: install SumatraPDF or set PDF_PRINTER_PATH "
                    + "to SumatraPDF.exe in printer-agent/.env."
                ));
                return;
            }

            const psScript = `
$sumatraPdf = '${sumatraPdf.replace(/'/g, "''")}'
$printer = '${printer.replace(/'/g, "''")}'
$file = '${filePath.replace(/'/g, "''")}'

& $sumatraPdf -print-to $printer -silent $file
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
`;

            execFile(
                "powershell.exe",
                [
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-Command",
                    psScript,
                ],
                (error, stdout, stderr) => {
                    if (rejectWithProcessDetails(
                        reject,
                        error,
                        stdout,
                        stderr
                    )) {
                        return;
                    }

                    resolve({ stdout, stderr });
                }
            );
            return;
        }

        const psScript = `
$printer = '${printer.replace(/'/g, "''")}'
$file = '${filePath.replace(/'/g, "''")}'

Start-Process `
            + `-FilePath $file `
            + `-Verb PrintTo `
            + `-ArgumentList $printer `
            + `-PassThru `
            + `-Wait
`;

        execFile(
            "powershell.exe",
            [
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                psScript,
            ],
            (error, stdout, stderr) => {

                if (rejectWithProcessDetails(
                    reject,
                    error,
                    stdout,
                    stderr
                )) {
                    return;
                }

                resolve({
                    stdout,
                    stderr,
                });

            }
        );
    });
}

module.exports = {
    printFile,
};
