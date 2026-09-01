<?php

namespace App\Services;

use ZipArchive;
use SimpleXMLElement;
use Illuminate\Support\Facades\Log;

class DocumentAnalyzerService
{
    /**
     * Determine high-level category of the uploaded document.
     */
    public function detectFileType(string $extension, string $mimeType): string
    {
        $ext = strtolower(trim($extension, '.'));
        $mime = strtolower($mimeType);

        if ($ext === 'pdf' || str_contains($mime, 'pdf')) {
            return 'pdf';
        }

        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp']) || str_starts_with($mime, 'image/')) {
            return 'image';
        }

        if (in_array($ext, ['xls', 'xlsx', 'csv']) || str_contains($mime, 'spreadsheet') || str_contains($mime, 'excel')) {
            return 'excel';
        }

        if (in_array($ext, ['doc', 'docx']) || str_contains($mime, 'word')) {
            return 'word';
        }

        if (in_array($ext, ['ppt', 'pptx']) || str_contains($mime, 'presentation') || str_contains($mime, 'powerpoint')) {
            return 'powerpoint';
        }

        return 'other';
    }

    /**
     * Analyze file content and return rich metadata (such as worksheet names for Excel).
     */
    public function analyze(string $filePath, string $extension, string $mimeType): array
    {
        $fileType = $this->detectFileType($extension, $mimeType);
        $metadata = [];

        if ($fileType === 'excel') {
            $metadata['sheets'] = $this->extractExcelSheets($filePath, $extension);
            $metadata['sheet_count'] = count($metadata['sheets']);
        } elseif ($fileType === 'image') {
            if (file_exists($filePath)) {
                $info = @getimagesize($filePath);
                if ($info) {
                    $metadata['width'] = $info[0] ?? null;
                    $metadata['height'] = $info[1] ?? null;
                }
            }
        } elseif ($fileType === 'pdf') {
            $metadata['page_count'] = $this->estimatePdfPages($filePath);
        } elseif ($fileType === 'word') {
            $metadata = array_merge($metadata, $this->extractWordMetadata($filePath, $extension));
        } elseif ($fileType === 'powerpoint') {
            $metadata = array_merge($metadata, $this->extractPowerpointMetadata($filePath, $extension));
        }

        return [
            'file_type' => $fileType,
            'metadata' => $metadata,
        ];
    }

    /**
     * Extract worksheet names from an Excel file (.xlsx or .xls).
     */
    public function extractExcelSheets(string $filePath, string $extension): array
    {
        $ext = strtolower(trim($extension, '.'));

        if ($ext === 'xlsx' && class_exists('ZipArchive') && file_exists($filePath)) {
            $zip = new ZipArchive();
            if ($zip->open($filePath) === true) {
                $xmlString = $zip->getFromName('xl/workbook.xml');
                $zip->close();

                if ($xmlString) {
                    if (preg_match_all('/<[^>:]*sheet\b[^>]*\bname="([^"]+)"/i', $xmlString, $matches)) {
                        $sheets = array_values(array_filter(array_map('html_entity_decode', $matches[1])));
                        if (!empty($sheets)) {
                            return $sheets;
                        }
                    }
                }
            }
        }

        // Fallback for .xls, .csv or if no sheets could be parsed
        return ['Sheet1'];
    }

    /**
     * Extract Word document (.docx) metadata such as page count.
     */
    public function extractWordMetadata(string $filePath, string $extension): array
    {
        $ext = strtolower(trim($extension, '.'));
        if ($ext === 'docx' && class_exists('ZipArchive') && file_exists($filePath)) {
            $zip = new ZipArchive();
            if ($zip->open($filePath) === true) {
                $xmlString = $zip->getFromName('docProps/app.xml');
                $zip->close();

                if ($xmlString && preg_match('/<Pages>(\d+)<\/Pages>/i', $xmlString, $matches)) {
                    $pages = (int)$matches[1];
                    if ($pages > 0) {
                        return ['page_count' => $pages];
                    }
                }
            }
        }

        return ['page_count' => 1];
    }

    /**
     * Extract PowerPoint presentation (.pptx) metadata such as slide count.
     */
    public function extractPowerpointMetadata(string $filePath, string $extension): array
    {
        $ext = strtolower(trim($extension, '.'));
        if ($ext === 'pptx' && class_exists('ZipArchive') && file_exists($filePath)) {
            $zip = new ZipArchive();
            if ($zip->open($filePath) === true) {
                $xmlString = $zip->getFromName('docProps/app.xml');
                $zip->close();

                if ($xmlString && preg_match('/<Slides>(\d+)<\/Slides>/i', $xmlString, $matches)) {
                    $slides = (int)$matches[1];
                    if ($slides > 0) {
                        return ['page_count' => $slides, 'slide_count' => $slides];
                    }
                }
            }
        }

        return ['page_count' => 1, 'slide_count' => 1];
    }

    /**
     * PDF page count estimation reading both header and trailer xref blocks.
     */
    private function estimatePdfPages(string $filePath): int
    {
        if (!file_exists($filePath)) {
            return 1;
        }

        try {
            $fileSize = (int)@filesize($filePath);
            $content = @file_get_contents($filePath, false, null, 0, min($fileSize, 1024 * 1024));
            if ($fileSize > 1024 * 1024) {
                $tail = @file_get_contents($filePath, false, null, max(0, $fileSize - 512 * 1024), 512 * 1024);
                if ($tail) {
                    $content .= $tail;
                }
            }

            if ($content && preg_match_all("/\/Count\s+(\d+)/", $content, $matches)) {
                $max = max(array_map('intval', $matches[1]));
                if ($max > 0) {
                    return $max;
                }
            }
            if ($content && preg_match_all("/\/Type\s*\/Page\b/", $content, $matches)) {
                $count = count($matches[0]);
                if ($count > 0) {
                    return $count;
                }
            }
        } catch (\Throwable $e) {
            // fallback
        }

        return 1;
    }
}
