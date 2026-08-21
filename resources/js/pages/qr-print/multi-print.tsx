import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    Check,
    CheckCircle2,
    Copy,
    Eye,
    FileCheck,
    FileSpreadsheet,
    FileText,
    FileType2,
    FileUp,
    Grid,
    ImageIcon,
    Layers,
    LayoutGrid,
    Loader2,
    Maximize2,
    Palette,
    Presentation,
    Printer,
    Settings,
    Sparkles,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import React, { ChangeEvent, useState } from 'react';

export type FileType = 'pdf' | 'image' | 'excel' | 'word' | 'powerpoint' | 'other';

export interface UploadedFile {
    id: number;
    original_name: string;
    file_size: number;
    file_type: FileType;
    file_url: string;
    metadata: {
        sheets?: string[];
        sheet_count?: number;
        page_count?: number;
        width?: number;
        height?: number;
    };
    // Per-file print configuration
    copies: number;
    orientation: 'auto' | 'portrait' | 'landscape';
    color_mode: 'bw' | 'color';
    paper_size: 'A4' | 'A3' | 'Letter' | 'Legal';
    scaling: 'actual' | 'fit_to_page' | 'shrink_to_fit' | 'fit_columns' | 'fit_rows' | 'fill_page';
    duplex: 'off' | 'long_edge' | 'short_edge';
    page_selection_type: 'all' | 'range';
    page_range: string;
    selected_sheets: string[];
    // Additional granular options
    margins: 'normal' | 'narrow' | 'wide';
    page_order: 'down_then_over' | 'over_then_down';
    gridlines: boolean;
    row_col_headers: boolean;
    image_position: 'center' | 'top' | 'bottom';
}

interface MultiPrintProps {
    qrPrint: {
        id: number;
        title: string;
        token: string;
        upload_url: string;
        create_session_url: string;
    };
    limits: {
        max_files: number;
        max_file_size_mb: number;
        allowed_extensions: string[];
    };
}

export default function MultiPrint({ qrPrint, limits }: MultiPrintProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Active sheet selection modal state
    const [activeSheetModalFileIndex, setActiveSheetModalFileIndex] = useState<number | null>(null);

    // Preview modal state
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

    // Handle File Upload
    const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > limits.max_files) {
            setGlobalError(`You can upload a maximum of ${limits.max_files} files per print session.`);
            return;
        }

        // Validate file size and extensions
        for (const file of selectedFiles) {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            if (!limits.allowed_extensions.includes(ext)) {
                setGlobalError(`File "${file.name}" has an unsupported format. Supported: ${limits.allowed_extensions.join(', ')}`);
                return;
            }
            if (file.size > limits.max_file_size_mb * 1024 * 1024) {
                setGlobalError(`File "${file.name}" exceeds the maximum allowed size of ${limits.max_file_size_mb} MB.`);
                return;
            }
        }

        setGlobalError(null);
        setIsUploading(true);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('documents[]', file);
        });

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        try {
            const response = await fetch(qrPrint.upload_url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to upload files.');
            }

            // Map incoming documents to UploadedFile with default print options
            const newFiles: UploadedFile[] = data.documents.map((doc: any) => {
                const detectedSheets = doc.metadata?.sheets || [];
                return {
                    id: doc.id,
                    original_name: doc.original_name,
                    file_size: doc.file_size,
                    file_type: doc.file_type,
                    file_url: doc.file_url,
                    metadata: doc.metadata || {},
                    copies: 1,
                    orientation: 'auto',
                    color_mode: 'bw',
                    paper_size: 'A4',
                    scaling: doc.file_type === 'excel' ? 'fit_to_page' : 'actual',
                    duplex: 'off',
                    page_selection_type: 'all',
                    page_range: '',
                    selected_sheets: detectedSheets.length > 0 ? [detectedSheets[0]] : ['Sheet1'], // default to first sheet
                    margins: 'normal',
                    page_order: 'down_then_over',
                    gridlines: false,
                    row_col_headers: false,
                    image_position: 'center',
                };
            });

            setFiles((prev) => [...prev, ...newFiles]);
        } catch (err: any) {
            setGlobalError(err.message || 'Unable to upload files. Please try again.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    // Remove file
    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Reorder files
    const moveFile = (index: number, direction: 'up' | 'down') => {
        setFiles((prev) => {
            const copy = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= copy.length) return prev;
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            return copy;
        });
    };

    // Update single file configuration
    const updateFileConfig = (index: number, updates: Partial<UploadedFile>) => {
        setFiles((prev) =>
            prev.map((file, i) => (i === index ? { ...file, ...updates } : file))
        );
    };

    // Sheet Selection Modal Helpers
    const activeSheetModalFile = activeSheetModalFileIndex !== null ? files[activeSheetModalFileIndex] : null;

    const toggleSheetSelection = (sheetName: string) => {
        if (activeSheetModalFileIndex === null || !activeSheetModalFile) return;
        const current = activeSheetModalFile.selected_sheets;
        const next = current.includes(sheetName)
            ? current.filter((s) => s !== sheetName)
            : [...current, sheetName];
        updateFileConfig(activeSheetModalFileIndex, { selected_sheets: next });
    };

    const selectAllSheets = () => {
        if (activeSheetModalFileIndex === null || !activeSheetModalFile) return;
        const allSheets = activeSheetModalFile.metadata?.sheets || [];
        updateFileConfig(activeSheetModalFileIndex, { selected_sheets: allSheets });
    };

    const clearAllSheets = () => {
        if (activeSheetModalFileIndex === null || !activeSheetModalFile) return;
        updateFileConfig(activeSheetModalFileIndex, { selected_sheets: [] });
    };

    // Total estimated page impressions
    const calculateEstimatedPages = () => {
        return files.reduce((sum, file) => {
            let pages = 1;
            if (file.file_type === 'excel') {
                pages = Math.max(1, file.selected_sheets.length);
            } else if (file.file_type === 'pdf') {
                pages = file.metadata?.page_count || 1;
            }
            return sum + pages * file.copies;
        }, 0);
    };

    // Validate all files before creating session
    const validateBeforePrint = (): boolean => {
        for (const file of files) {
            if (file.file_type === 'excel' && (!file.selected_sheets || file.selected_sheets.length === 0)) {
                setGlobalError(`Please select at least one sheet for "${file.original_name}".`);
                return false;
            }
        }
        setGlobalError(null);
        return true;
    };

    // Handle "Print All"
    const handlePrintAll = async () => {
        if (!validateBeforePrint()) return;
        if (files.length === 0) return;

        setIsCreatingSession(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        const payload = {
            files: files.map((file) => ({
                document_id: file.id,
                copies: file.copies,
                orientation: file.orientation,
                color_mode: file.color_mode,
                paper_size: file.paper_size,
                scaling: file.scaling,
                duplex: file.duplex,
                page_range: file.page_selection_type === 'range' ? file.page_range : null,
                selected_sheets: file.file_type === 'excel' ? file.selected_sheets : null,
                print_options: {
                    margins: file.margins,
                    page_order: file.page_order,
                    gridlines: file.gridlines,
                    row_col_headers: file.row_col_headers,
                    image_position: file.image_position,
                },
            })),
        };

        try {
            const response = await fetch(qrPrint.create_session_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to initialize print session.');
            }

            // Navigate to live session tracking
            if (data.status_url) {
                router.visit(data.status_url);
            }
        } catch (err: any) {
            setGlobalError(err.message || 'Error creating print jobs.');
            setIsCreatingSession(false);
        }
    };

    const getFileIcon = (type: FileType) => {
        switch (type) {
            case 'pdf':
                return <FileText className="size-5 text-red-500" />;
            case 'excel':
                return <FileSpreadsheet className="size-5 text-emerald-600" />;
            case 'image':
                return <ImageIcon className="size-5 text-blue-500" />;
            case 'word':
                return <FileType2 className="size-5 text-sky-600" />;
            case 'powerpoint':
                return <Presentation className="size-5 text-amber-600" />;
            default:
                return <FileText className="size-5 text-muted-foreground" />;
        }
    };

    const estimatedImpressions = calculateEstimatedPages();

    return (
        <>
            <Head title={`QR Print | ${qrPrint.title}`} />
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-6 px-4 sm:px-6 pb-28">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                                    <Printer className="size-5" />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        QR Print
                                    </h1>
                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                        Upload documents and configure how you want them printed.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="w-fit text-xs font-normal py-1 px-3 bg-card">
                            <Sparkles className="size-3.5 text-primary mr-1" />
                            {qrPrint.title}
                        </Badge>
                    </div>

                    {/* Global Error Banner */}
                    {globalError && (
                        <Alert variant="destructive" className="animate-in fade-in">
                            <AlertCircle className="size-4" />
                            <AlertTitle>Notice</AlertTitle>
                            <AlertDescription>{globalError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Upload Zone */}
                    <Card className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors shadow-xs">
                        <CardContent className="p-6 text-center">
                            <label className="cursor-pointer flex flex-col items-center justify-center space-y-3">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <UploadCloud className="size-7 animate-bounce" />
                                </div>
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors">
                                        <FileUp className="size-4" />
                                        + Add Files
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        Supported: PDF, Excel, Word, PowerPoint, JPG, PNG
                                    </p>
                                    <p>
                                        Up to {limits.max_files} files · Maximum {limits.max_file_size_mb} MB per file
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.csv,.doc,.docx,.ppt,.pptx"
                                    onChange={handleFilesSelected}
                                    disabled={isUploading || files.length >= limits.max_files}
                                    className="sr-only"
                                />
                            </label>

                            {isUploading && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-primary">
                                    <Loader2 className="size-4 animate-spin" />
                                    Analyzing & uploading files…
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Uploaded File Cards */}
                    {files.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <LayoutGrid className="size-4 text-primary" />
                                    Uploaded Files ({files.length} of {limits.max_files})
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    Independent settings per file
                                </span>
                            </div>

                            <div className="space-y-4">
                                {files.map((file, index) => {
                                    const detectedSheets = file.metadata?.sheets || [];
                                    const hasSheets = file.file_type === 'excel' && detectedSheets.length > 0;

                                    return (
                                        <Card key={file.id} className="shadow-xs border overflow-hidden">
                                            {/* File Header Bar */}
                                            <div className="bg-muted/30 border-b px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card border shadow-xs">
                                                        {getFileIcon(file.file_type)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm truncate text-foreground">
                                                                {index + 1}. {file.original_name}
                                                            </span>
                                                            <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0 shrink-0">
                                                                {file.file_type}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                                            {file.file_type === 'excel' && ` · ${detectedSheets.length} sheet${detectedSheets.length === 1 ? '' : 's'}`}
                                                            {file.file_type === 'pdf' && ` · ${file.metadata?.page_count || 1} page${(file.metadata?.page_count || 1) === 1 ? '' : 's'}`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card Action Controls */}
                                                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                                    {/* Preview Button */}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs gap-1"
                                                        onClick={() => setPreviewFile(file)}
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Preview
                                                    </Button>

                                                    {/* Reorder Buttons */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        disabled={index === 0}
                                                        onClick={() => moveFile(index, 'up')}
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        disabled={index === files.length - 1}
                                                        onClick={() => moveFile(index, 'down')}
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="size-3.5" />
                                                    </Button>

                                                    {/* Remove Button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeFile(index)}
                                                        title="Remove File"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <CardContent className="p-4 sm:p-5 space-y-4">
                                                {/* Excel Worksheet Selection Block */}
                                                {file.file_type === 'excel' && (
                                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2.5">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <FileSpreadsheet className="size-4 text-emerald-600" />
                                                                <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-300">
                                                                    Worksheets to Print:
                                                                </span>
                                                                <span className="text-xs text-muted-foreground font-normal">
                                                                    ({detectedSheets.length} found)
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                                                onClick={() => setActiveSheetModalFileIndex(index)}
                                                            >
                                                                <Settings className="size-3 mr-1" />
                                                                Configure Sheets ({file.selected_sheets.length})
                                                            </Button>
                                                        </div>

                                                        {/* Selected sheet badges preview */}
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            {file.selected_sheets.length === 0 ? (
                                                                <span className="text-xs font-medium text-destructive flex items-center gap-1">
                                                                    <AlertCircle className="size-3" />
                                                                    No sheet selected! Please click "Configure Sheets".
                                                                </span>
                                                            ) : (
                                                                file.selected_sheets.map((sheet) => (
                                                                    <Badge
                                                                        key={sheet}
                                                                        variant="secondary"
                                                                        className="text-xs bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/20"
                                                                    >
                                                                        <Check className="size-3 mr-1 text-emerald-600" />
                                                                        {sheet}
                                                                    </Badge>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* PDF Page Range Block */}
                                                {file.file_type === 'pdf' && (
                                                    <div className="grid gap-3 sm:grid-cols-2 rounded-lg bg-muted/20 p-3 border text-xs">
                                                        <div>
                                                            <label className="font-medium text-foreground block mb-1.5">
                                                                Page Selection
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateFileConfig(index, { page_selection_type: 'all' })}
                                                                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium ${
                                                                        file.page_selection_type === 'all'
                                                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                                            : 'border-input bg-card'
                                                                    }`}
                                                                >
                                                                    All Pages
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateFileConfig(index, { page_selection_type: 'range' })}
                                                                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium ${
                                                                        file.page_selection_type === 'range'
                                                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                                            : 'border-input bg-card'
                                                                    }`}
                                                                >
                                                                    Page Range
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {file.page_selection_type === 'range' && (
                                                            <div>
                                                                <label className="font-medium text-foreground block mb-1.5">
                                                                    Specify Range (e.g. 1-3, 5, 8-10)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="1-3,5"
                                                                    value={file.page_range}
                                                                    onChange={(e) => updateFileConfig(index, { page_range: e.target.value })}
                                                                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Print Settings Grid */}
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                                                    {/* Copies */}
                                                    <div className="space-y-1.5">
                                                        <label className="font-medium text-foreground">Copies (1-20)</label>
                                                        <div className="flex items-center gap-1.5">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-7"
                                                                onClick={() => updateFileConfig(index, { copies: Math.max(1, file.copies - 1) })}
                                                                disabled={file.copies <= 1}
                                                            >
                                                                -
                                                            </Button>
                                                            <span className="w-10 text-center font-bold text-sm">
                                                                {file.copies}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-7"
                                                                onClick={() => updateFileConfig(index, { copies: Math.min(20, file.copies + 1) })}
                                                                disabled={file.copies >= 20}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Orientation */}
                                                    <div className="space-y-1.5">
                                                        <label className="font-medium text-foreground">Orientation</label>
                                                        <select
                                                            value={file.orientation}
                                                            onChange={(e) => updateFileConfig(index, { orientation: e.target.value as any })}
                                                            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                        >
                                                            <option value="auto">Auto</option>
                                                            <option value="portrait">Portrait</option>
                                                            <option value="landscape">Landscape</option>
                                                        </select>
                                                    </div>

                                                    {/* Color Mode */}
                                                    <div className="space-y-1.5">
                                                        <label className="font-medium text-foreground">Color Mode</label>
                                                        <select
                                                            value={file.color_mode}
                                                            onChange={(e) => updateFileConfig(index, { color_mode: e.target.value as any })}
                                                            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary font-medium"
                                                        >
                                                            <option value="bw">Black & White (B&W)</option>
                                                            <option value="color">Color</option>
                                                        </select>
                                                    </div>

                                                    {/* Paper Size */}
                                                    <div className="space-y-1.5">
                                                        <label className="font-medium text-foreground">Paper Size</label>
                                                        <select
                                                            value={file.paper_size}
                                                            onChange={(e) => updateFileConfig(index, { paper_size: e.target.value as any })}
                                                            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                        >
                                                            <option value="A4">A4</option>
                                                            <option value="A3">A3</option>
                                                            <option value="Letter">Letter</option>
                                                            <option value="Legal">Legal</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Advanced/Specific File Options */}
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1 text-xs border-t">
                                                    {/* Scaling */}
                                                    <div className="space-y-1.5">
                                                        <label className="font-medium text-foreground">Scaling</label>
                                                        <select
                                                            value={file.scaling}
                                                            onChange={(e) => updateFileConfig(index, { scaling: e.target.value as any })}
                                                            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                        >
                                                            <option value="actual">Actual Size</option>
                                                            <option value="fit_to_page">Fit to Page</option>
                                                            {file.file_type === 'excel' && (
                                                                <>
                                                                    <option value="fit_columns">Fit All Columns to One Page</option>
                                                                    <option value="fit_rows">Fit All Rows to One Page</option>
                                                                </>
                                                            )}
                                                            {file.file_type === 'pdf' && (
                                                                <option value="shrink_to_fit">Shrink to Fit</option>
                                                            )}
                                                            {file.file_type === 'image' && (
                                                                <option value="fill_page">Fill Page</option>
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* Duplex */}
                                                    <div className="space-y-1.5">
                                                        <label className="font-medium text-foreground">Duplex (Double Sided)</label>
                                                        <select
                                                            value={file.duplex}
                                                            onChange={(e) => updateFileConfig(index, { duplex: e.target.value as any })}
                                                            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                        >
                                                            <option value="off">Off (Single Sided)</option>
                                                            <option value="long_edge">Long Edge (Booklet)</option>
                                                            <option value="short_edge">Short Edge (Calendar)</option>
                                                        </select>
                                                    </div>

                                                    {/* Excel Extra Checkboxes */}
                                                    {file.file_type === 'excel' && (
                                                        <div className="flex items-center gap-4 pt-4 sm:col-span-2 lg:col-span-1">
                                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={file.gridlines}
                                                                    onChange={(e) => updateFileConfig(index, { gridlines: e.target.checked })}
                                                                    className="size-3.5 rounded text-primary"
                                                                />
                                                                <span className="text-foreground">Gridlines</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={file.row_col_headers}
                                                                    onChange={(e) => updateFileConfig(index, { row_col_headers: e.target.checked })}
                                                                    className="size-3.5 rounded text-primary"
                                                                />
                                                                <span className="text-foreground">Headers</span>
                                                            </label>
                                                        </div>
                                                    )}

                                                    {/* Image Position */}
                                                    {file.file_type === 'image' && (
                                                        <div className="space-y-1.5">
                                                            <label className="font-medium text-foreground">Image Position</label>
                                                            <select
                                                                value={file.image_position}
                                                                onChange={(e) => updateFileConfig(index, { image_position: e.target.value as any })}
                                                                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                            >
                                                                <option value="center">Center</option>
                                                                <option value="top">Top</option>
                                                                <option value="bottom">Bottom</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Print Queue Summary Card */}
                            <Card className="shadow-sm border bg-muted/10">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Printer className="size-4 text-primary" />
                                            Print Summary
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {files.length} {files.length === 1 ? 'file' : 'files'} · ~{estimatedImpressions} impressions
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2 text-xs">
                                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                                        {files.map((file, i) => (
                                            <li key={file.id} className="leading-relaxed">
                                                <span className="font-semibold text-foreground">{file.original_name}</span>
                                                {' — '}
                                                {file.file_type === 'excel' && (
                                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                                                        Sheet: {file.selected_sheets.join(', ') || 'None'} ·{' '}
                                                    </span>
                                                )}
                                                <span className="capitalize">{file.orientation}</span> ·{' '}
                                                <span>{file.color_mode === 'bw' ? 'B&W' : 'Color'}</span> ·{' '}
                                                <span>{file.paper_size}</span> ·{' '}
                                                <span>{file.copies} {file.copies === 1 ? 'copy' : 'copies'}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Sticky Bottom Action Bar */}
                {files.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t p-3 sm:p-4 shadow-lg">
                        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
                            <div className="hidden sm:block">
                                <div className="text-sm font-semibold text-foreground">
                                    {files.length} {files.length === 1 ? 'file ready' : 'files ready'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Independent print settings applied
                                </div>
                            </div>

                            <Button
                                className="w-full sm:w-auto min-w-[240px] text-base font-bold shadow-md py-6 gap-2"
                                size="lg"
                                onClick={handlePrintAll}
                                disabled={isCreatingSession || files.length === 0}
                            >
                                {isCreatingSession ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Dispatching Print Jobs…
                                    </>
                                ) : (
                                    <>
                                        <Printer className="size-5" />
                                        🖨️ Print All ({files.length})
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Excel Worksheet Selection Dialog */}
                <Dialog
                    open={activeSheetModalFileIndex !== null}
                    onOpenChange={(open) => !open && setActiveSheetModalFileIndex(null)}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="size-5 text-emerald-600" />
                                Select Worksheets to Print
                            </DialogTitle>
                            <DialogDescription>
                                Workbook: <span className="font-semibold text-foreground">{activeSheetModalFile?.original_name}</span>
                                <br />
                                {activeSheetModalFile?.metadata?.sheets?.length || 0} sheets found. Only selected sheets will be printed.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            {/* Select / Clear All Buttons */}
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-xs text-muted-foreground">
                                    {activeSheetModalFile?.selected_sheets.length || 0} selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={selectAllSheets}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground"
                                        onClick={clearAllSheets}
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>

                            {/* Sheet Checkbox List */}
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                {(activeSheetModalFile?.metadata?.sheets || ['Sheet1']).map((sheet) => {
                                    const isSelected = activeSheetModalFile?.selected_sheets.includes(sheet);
                                    return (
                                        <label
                                            key={sheet}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors text-sm ${
                                                isSelected
                                                    ? 'border-emerald-500 bg-emerald-500/10 font-medium text-emerald-950 dark:text-emerald-200'
                                                    : 'border-input hover:bg-muted/40 text-foreground'
                                            }`}
                                            onClick={() => toggleSheetSelection(sheet)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span>{sheet}</span>
                                            </div>
                                            {isSelected && <Check className="size-4 text-emerald-600" />}
                                        </label>
                                    );
                                })}
                            </div>

                            {activeSheetModalFile && activeSheetModalFile.selected_sheets.length === 0 && (
                                <p className="text-xs text-destructive font-medium flex items-center gap-1 pt-1">
                                    <AlertCircle className="size-3.5" />
                                    Please select at least one sheet to print.
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setActiveSheetModalFileIndex(null)}
                                disabled={activeSheetModalFile?.selected_sheets.length === 0}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Preview Modal */}
                <Dialog open={previewFile !== null} onOpenChange={(open) => !open && setPreviewFile(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="size-4 text-primary" />
                                {previewFile?.original_name}
                            </DialogTitle>
                            <DialogDescription>
                                Type: {previewFile?.file_type} · Size: {previewFile ? (previewFile.file_size / 1024 / 1024).toFixed(2) : 0} MB
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            {previewFile?.file_type === 'pdf' ? (
                                <iframe
                                    src={previewFile.file_url}
                                    title={previewFile.original_name}
                                    className="w-full h-96 rounded-md border"
                                />
                            ) : previewFile?.file_type === 'image' ? (
                                <img
                                    src={previewFile.file_url}
                                    alt={previewFile.original_name}
                                    className="mx-auto max-h-96 object-contain rounded-md border"
                                />
                            ) : previewFile?.file_type === 'excel' ? (
                                <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                                    <p className="text-xs font-semibold text-foreground">
                                        Detected Sheets in this Workbook:
                                    </p>
                                    <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                                        {(previewFile.metadata?.sheets || ['Sheet1']).map((s) => (
                                            <li key={s}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    Preview is not available for this document type in browser. It will be converted & printed cleanly by the local print agent.
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPreviewFile(null)}>
                                Close Preview
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </>
    );
}
