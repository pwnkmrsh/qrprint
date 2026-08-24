const { execFile, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const config = require("./config");

function findSumatraPdf() {
    const candidates = [
        config.pdfPrinterPath,
        "C:\\Users\\wrdmi\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
    ].filter(Boolean);

    return candidates.find((candidate) => fs.existsSync(candidate));
}

function buildSumatraSettings(options = {}) {
    const parts = [];

    // Copies (e.g. 2x)
    if (options.copies && options.copies > 1) {
        parts.push(`${options.copies}x`);
    }

    // Page Range (e.g. 1-3,5)
    if (options.page_range && options.page_range.trim() !== "") {
        parts.push(options.page_range.trim().replace(/\s+/g, ""));
    }

    // Color / Monochrome
    if (options.color_mode === "bw") {
        parts.push("monochrome");
    } else if (options.color_mode === "color") {
        parts.push("color");
    }

    // Paper Size (e.g. paper=A4)
    if (options.paper_size) {
        parts.push(`paper=${options.paper_size}`);
    }

    // Scaling
    if (options.scaling === "fit_to_page" || options.scaling === "fit") {
        parts.push("fit");
    } else if (options.scaling === "shrink_to_fit" || options.scaling === "shrink") {
        parts.push("shrink");
    } else if (options.scaling === "actual") {
        parts.push("noscale");
    }

    // Duplex
    if (options.duplex === "long_edge") {
        parts.push("duplex");
    } else if (options.duplex === "short_edge") {
        parts.push("duplexshort");
    } else if (options.duplex === "off") {
        parts.push("simplex");
    }

    return parts.join(",");
}

function runPowerShellScript(psScript) {
    return new Promise((resolve, reject) => {
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
                if (error) {
                    const details = [
                        error.message,
                        error.code !== undefined ? `Exit code: ${error.code}` : null,
                        stdout && `stdout: ${stdout.trim()}`,
                        stderr && `stderr: ${stderr.trim()}`,
                    ].filter(Boolean);
                    error.message = details.join("\n");
                    return reject(error);
                }
                resolve({ stdout, stderr });
            }
        );
    });
}

/**
 * Print Image file (.jpg, .jpeg, .png, .bmp, .gif, .webp, .tiff)
 * using .NET System.Drawing.Printing.PrintDocument (Native Windows Graphics Spooler)
 */
function printImageFile(filePath, printer, options = {}) {
    const copies = Math.max(1, parseInt(options.copies, 10) || 1);
    const orientation = options.orientation || "auto";
    const colorMode = options.color_mode || "bw";
    const isGrayscale = colorMode === "bw";

    const psImageScript = `
Add-Type -AssemblyName System.Drawing

$printer = '${printer.replace(/'/g, "''")}'
$file = '${filePath.replace(/'/g, "''")}'

if (-not (Test-Path $file)) {
    throw "Image file does not exist: $file"
}

$img = [System.Drawing.Image]::FromFile($file)
$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.PrinterSettings.PrinterName = $printer
$doc.PrinterSettings.Copies = ${copies}

# Orientation Handling
if ('${orientation}' -eq 'landscape') {
    $doc.DefaultPageSettings.Landscape = $true
} elseif ('${orientation}' -eq 'portrait') {
    $doc.DefaultPageSettings.Landscape = $false
} else {
    # Auto orientation based on image dimensions
    $doc.DefaultPageSettings.Landscape = ($img.Width -gt $img.Height)
}

$doc.add_PrintPage({
    param($sender, $ev)
    $g = $ev.Graphics
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $pb = $ev.MarginBounds
    if ($pb.Width -le 0 -or $pb.Height -le 0) {
        $pb = $ev.PageBounds
    }

    $ratio = $img.Width / $img.Height
    $pageRatio = $pb.Width / $pb.Height

    # Fit image to page margins preserving aspect ratio
    if ($ratio -gt $pageRatio) {
        $w = $pb.Width
        $h = [int]($pb.Width / $ratio)
    } else {
        $h = $pb.Height
        $w = [int]($pb.Height * $ratio)
    }

    $x = $pb.Left + [int](($pb.Width - $w) / 2)
    $y = $pb.Top + [int](($pb.Height - $h) / 2)

    # Grayscale conversion if monochrome requested
    if (${isGrayscale ? "$true" : "$false"}) {
        $matrix = New-Object System.Drawing.Imaging.ColorMatrix
        $matrix.Matrix00 = 0.299
        $matrix.Matrix01 = 0.299
        $matrix.Matrix02 = 0.299
        $matrix.Matrix10 = 0.587
        $matrix.Matrix11 = 0.587
        $matrix.Matrix12 = 0.587
        $matrix.Matrix20 = 0.114
        $matrix.Matrix21 = 0.114
        $matrix.Matrix22 = 0.114
        $matrix.Matrix33 = 1.0

        $attr = New-Object System.Drawing.Imaging.ImageAttributes
        $attr.SetColorMatrix($matrix)
        $destRect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
        $g.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
        $attr.Dispose()
    } else {
        $g.DrawImage($img, $x, $y, $w, $h)
    }

    $ev.HasMorePages = $false
})

try {
    $doc.Print()
} finally {
    $doc.Dispose()
    $img.Dispose()
}
`;
    return runPowerShellScript(psImageScript);
}

/**
 * Main Print Execution Dispatcher
 */
async function printFile(filePath, job = {}) {
    const printer = job.printer_name || config.printerName;
    const sumatraPdf = findSumatraPdf();
    const ext = path.extname(filePath).toLowerCase();

    // 1. EXCEL WORKBOOK PRINTING WITH SHEET ISOLATION
    if ([".xlsx", ".xls", ".csv"].includes(ext)) {
        const tempPdfPath = path.join(
            path.dirname(filePath),
            `excel-render-${Date.now()}-${Math.floor(Math.random() * 1000)}.pdf`
        );

        const selectedSheets = Array.isArray(job.selected_sheets) && job.selected_sheets.length > 0
            ? job.selected_sheets
            : [];

        const orientationParam = job.orientation || "auto";
        const gridlinesParam = job.print_options?.gridlines ? "$true" : "$false";
        const fitToPageParam = ["fit_to_page", "fit_columns", "fit_rows"].includes(job.scaling) ? "$true" : "$false";
        const sheetsArrayPs = selectedSheets.map((s) => `'${s.replace(/'/g, "''")}'`).join(",");

        const psConvertScript = `
$filePath = '${filePath.replace(/'/g, "''")}'
$tempPdf = '${tempPdfPath.replace(/'/g, "''")}'
$requestedSheets = @(${sheetsArrayPs})

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wb = $excel.Workbooks.Open($filePath, [Type]::Missing, $true)
    $sheetsToExport = @()
    foreach ($sheet in $wb.Sheets) {
        if ($requestedSheets.Count -eq 0 -or $requestedSheets -contains $sheet.Name) {
            if ('${orientationParam}' -eq 'landscape') { $sheet.PageSetup.Orientation = 2 }
            elseif ('${orientationParam}' -eq 'portrait') { $sheet.PageSetup.Orientation = 1 }

            if (${gridlinesParam}) { $sheet.PageSetup.PrintGridlines = $true }
            if (${fitToPageParam}) {
                $sheet.PageSetup.Zoom = $false
                $sheet.PageSetup.FitToPagesWide = 1
                $sheet.PageSetup.FitToPagesTall = 1
            }
            $sheetsToExport += $sheet.Name
        }
    }

    if ($sheetsToExport.Count -eq 0) {
        throw "None of the selected worksheets were found in the workbook."
    }

    $wb.Sheets([string[]]$sheetsToExport).Select()
    $excel.ActiveSheet.ExportAsFixedFormat(0, $tempPdf)
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
`;

        try {
            await runPowerShellScript(psConvertScript);

            if (fs.existsSync(tempPdfPath)) {
                // Print the generated PDF containing ONLY the selected sheets
                await printPdfFile(tempPdfPath, printer, sumatraPdf, job);
                try { fs.unlinkSync(tempPdfPath); } catch (e) {}
                return;
            }
        } catch (excelError) {
            console.warn(`Excel COM conversion failed: ${excelError.message}. Attempting fallback print.`);
        }
    }

    // 2. WORD DOCUMENT PRINTING (DOC / DOCX)
    if ([".docx", ".doc"].includes(ext)) {
        const tempPdfPath = path.join(
            path.dirname(filePath),
            `word-render-${Date.now()}-${Math.floor(Math.random() * 1000)}.pdf`
        );

        const psWordScript = `
$filePath = '${filePath.replace(/'/g, "''")}'
$tempPdf = '${tempPdfPath.replace(/'/g, "''")}'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($filePath, [Type]::Missing, $true)
    $doc.ExportAsFixedFormat($tempPdf, 17) # 17 = wdExportFormatPDF
    $doc.Close([Type]::Missing)
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
`;
        try {
            await runPowerShellScript(psWordScript);
            if (fs.existsSync(tempPdfPath)) {
                await printPdfFile(tempPdfPath, printer, sumatraPdf, job);
                try { fs.unlinkSync(tempPdfPath); } catch (e) {}
                return;
            }
        } catch (wordError) {
            console.warn(`Word COM conversion failed: ${wordError.message}. Using fallback.`);
        }
    }

    // 3. POWERPOINT PRESENTATION PRINTING (PPT / PPTX)
    if ([".pptx", ".ppt"].includes(ext)) {
        const tempPdfPath = path.join(
            path.dirname(filePath),
            `ppt-render-${Date.now()}-${Math.floor(Math.random() * 1000)}.pdf`
        );

        const psPptScript = `
$filePath = '${filePath.replace(/'/g, "''")}'
$tempPdf = '${tempPdfPath.replace(/'/g, "''")}'

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open($filePath, $true, $true, $false)
    $pres.SaveAs($tempPdf, 32) # 32 = ppSaveAsPDF
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
`;
        try {
            await runPowerShellScript(psPptScript);
            if (fs.existsSync(tempPdfPath)) {
                await printPdfFile(tempPdfPath, printer, sumatraPdf, job);
                try { fs.unlinkSync(tempPdfPath); } catch (e) {}
                return;
            }
        } catch (pptError) {
            console.warn(`PowerPoint COM conversion failed: ${pptError.message}. Using fallback.`);
        }
    }

    // 4. IMAGE PRINTING (.jpg, .jpeg, .png, .bmp, .gif, .webp, .tif, .tiff)
    if ([".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tif", ".tiff", ".ico"].includes(ext)) {
        return await printImageFile(filePath, printer, job);
    }

    // 5. PDF PRINTING VIA SUMATRAPDF
    if (ext === ".pdf") {
        if (!sumatraPdf) {
            throw new Error(
                "Cannot print PDF: install SumatraPDF or set PDF_PRINTER_PATH in printer-agent/.env."
            );
        }
        return await printPdfFile(filePath, printer, sumatraPdf, job);
    }

    // 6. GENERIC FALLBACK FOR OTHER FILE TYPES
    try {
        const psPrintScript = `
$printer = '${printer.replace(/'/g, "''")}'
$file = '${filePath.replace(/'/g, "''")}'

Start-Process -FilePath $file -Verb PrintTo -ArgumentList $printer -PassThru -Wait
`;
        return await runPowerShellScript(psPrintScript);
    } catch (fallbackErr) {
        // If Shell PrintTo verb fails, try mspaint or System.Drawing
        return await printImageFile(filePath, printer, job);
    }
}

/**
 * Print a PDF with SumatraPDF applying all command-line print settings
 */
function printPdfFile(filePath, printer, sumatraPdf, options = {}) {
    const settingsStr = buildSumatraSettings(options);
    const settingsArg = settingsStr ? `-print-settings "${settingsStr}"` : "";

    const psScript = `
$sumatraPdf = '${sumatraPdf.replace(/'/g, "''")}'
$printer = '${printer.replace(/'/g, "''")}'
$file = '${filePath.replace(/'/g, "''")}'

& $sumatraPdf -print-to $printer ${settingsArg} -silent $file
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
`;
    return runPowerShellScript(psScript);
}

module.exports = {
    printFile,
};
