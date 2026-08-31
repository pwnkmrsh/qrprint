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
    Banknote,
    QrCode,
    Store,
    Phone,
    MapPin,
    Lock,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    Hash,
    BookOpen,
    ShieldCheck
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
    page_selection_type: 'all' | 'range' | 'odd' | 'even' | 'first';
    page_range: string;
    selected_sheets: string[];
    // Additional granular options
    margins: 'normal' | 'narrow' | 'wide';
    page_order: 'down_then_over' | 'over_then_down';
    gridlines: boolean;
    row_col_headers: boolean;
    image_position: 'center' | 'top' | 'bottom';
}

/**
 * Parse a page range string like "1-3, 5, 8-10" into a sorted unique array of page numbers.
 */
export function parsePageRangeString(rangeStr: string, totalPages?: number): number[] {
    if (!rangeStr || !rangeStr.trim()) return [];
    const parts = rangeStr.split(',');
    const pages = new Set<number>();

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        if (trimmed.includes('-')) {
            const [startStr, endStr] = trimmed.split('-');
            const start = parseInt(startStr.trim(), 10);
            const end = parseInt(endStr.trim(), 10);
            if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
                const maxPage = totalPages && totalPages > 0 ? Math.min(end, totalPages) : end;
                for (let p = Math.max(1, start); p <= maxPage; p++) {
                    pages.add(p);
                }
            }
        } else {
            const p = parseInt(trimmed, 10);
            if (!isNaN(p) && p > 0) {
                if (!totalPages || p <= totalPages) {
                    pages.add(p);
                }
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Validate a page range string and return structured status + parsed page numbers.
 */
export function validatePageRangeString(rangeStr: string, totalPages?: number): {
    isValid: boolean;
    message?: string;
    parsedPages: number[];
} {
    if (!rangeStr || !rangeStr.trim()) {
        return { isValid: false, message: 'Please enter page numbers or range (e.g. 1-3, 5)', parsedPages: [] };
    }

    const trimmed = rangeStr.trim();
    if (!/^[0-9\s,\-]+$/.test(trimmed)) {
        return { isValid: false, message: 'Only numbers, commas, and hyphens are allowed (e.g. 1-3, 5)', parsedPages: [] };
    }

    const parts = trimmed.split(',');
    for (const part of parts) {
        const p = part.trim();
        if (!p) continue;
        if (p.includes('-')) {
            const segments = p.split('-');
            if (segments.length !== 2) {
                return { isValid: false, message: `Invalid range format "${p}"`, parsedPages: [] };
            }
            const s = parseInt(segments[0].trim(), 10);
            const e = parseInt(segments[1].trim(), 10);
            if (isNaN(s) || isNaN(e) || s < 1 || e < s) {
                return { isValid: false, message: `Invalid range "${p}". Start page must be ≤ end page.`, parsedPages: [] };
            }
            if (totalPages && totalPages > 0 && s > totalPages) {
                return { isValid: false, message: `Page ${s} exceeds total document pages (${totalPages})`, parsedPages: [] };
            }
        } else {
            const val = parseInt(p, 10);
            if (isNaN(val) || val < 1) {
                return { isValid: false, message: `Invalid page number "${p}"`, parsedPages: [] };
            }
            if (totalPages && totalPages > 0 && val > totalPages) {
                return { isValid: false, message: `Page ${val} exceeds total document pages (${totalPages})`, parsedPages: [] };
            }
        }
    }

    const parsedPages = parsePageRangeString(trimmed, totalPages);
    if (parsedPages.length === 0) {
        return { isValid: false, message: 'No valid pages found in range', parsedPages: [] };
    }

    return { isValid: true, parsedPages };
}

/**
 * Calculate effective page count for an uploaded file based on its print preferences.
 */
export function calculateEffectivePages(file: UploadedFile): number {
    if (file.file_type === 'excel') {
        return Math.max(1, file.selected_sheets.length);
    }
    const total = file.metadata?.page_count || 1;

    if (file.page_selection_type === 'first') {
        return 1;
    }
    if (file.page_selection_type === 'odd') {
        return Math.ceil(total / 2);
    }
    if (file.page_selection_type === 'even') {
        return Math.max(1, Math.floor(total / 2));
    }
    if (file.page_selection_type === 'range') {
        if (!file.page_range || !file.page_range.trim()) {
            return total;
        }
        const parsed = parsePageRangeString(file.page_range, total > 1 ? total : undefined);
        return parsed.length > 0 ? parsed.length : total;
    }
    return total;
}

/**
 * Return resolved page_range string for submission / printer agent.
 */
export function getComputedPageRangeString(file: UploadedFile): string | null {
    if (file.file_type === 'excel') {
        return null;
    }
    if (file.page_selection_type === 'first') {
        return '1';
    }
    if (file.page_selection_type === 'odd') {
        return 'odd';
    }
    if (file.page_selection_type === 'even') {
        return 'even';
    }
    if (file.page_selection_type === 'range') {
        return file.page_range.trim() || null;
    }
    return null;
}

interface MultiPrintProps {
    qrPrint: {
        id: number;
        title: string;
        token: string;
        is_active: boolean;
        upload_url: string;
        create_session_url: string;
        logo_url?: string | null;
        mobile_number?: string | null;
        address?: string | null;
    };
    shopSettings?: {
        shop_name?: string;
        bw_price_per_page: number;
        color_price_per_page: number;
        scanner_price_per_page: number;
        online_payment_enabled: boolean;
        counter_payment_enabled: boolean;
        show_currency: boolean;
        currency_symbol: string;
        payment_modes: string[];
    };
    limits: {
        max_files: number;
        max_file_size_mb: number;
        allowed_extensions: string[];
    };
}

export default function MultiPrint({ qrPrint, shopSettings, limits }: MultiPrintProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Pricing & Settings
    const sym = shopSettings?.show_currency !== false ? (shopSettings?.currency_symbol || '₹') : '';
    const bwRate = shopSettings?.bw_price_per_page ?? 2.0;
    const colorRate = shopSettings?.color_price_per_page ?? 10.0;
    const scannerRate = shopSettings?.scanner_price_per_page ?? 5.0;
    const canCounter = shopSettings?.counter_payment_enabled !== false;
    const canOnline = shopSettings?.online_payment_enabled !== false;

    // Selected Payment Method ('counter' | 'online')
    const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>(canCounter ? 'counter' : 'online');

    // Active sheet selection modal state
    const [activeSheetModalFileIndex, setActiveSheetModalFileIndex] = useState<number | null>(null);

    // Preview modal state
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

    // Expanded advanced settings per file index
    const [expandedAdvancedIndexes, setExpandedAdvancedIndexes] = useState<number[]>([]);

    const toggleAdvanced = (index: number) => {
        setExpandedAdvancedIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

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
                    selected_sheets: doc.file_type === 'excel' && detectedSheets.length > 0 ? [detectedSheets[0]] : [],
                    margins: 'normal',
                    page_order: 'down_then_over',
                    gridlines: false,
                    row_col_headers: false,
                    image_position: 'center',
                };
            });

            setFiles((prev) => [...prev, ...newFiles]);
        } catch (err: any) {
            setGlobalError(err.message || 'Failed to upload files. Please try again.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    // Remove single file
    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Update single file option
    const updateFileOption = <K extends keyof UploadedFile>(
        index: number,
        key: K,
        value: UploadedFile[K]
    ) => {
        setFiles((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    // Apply settings of one file to all uploaded files
    const applyToAllFiles = (sourceIndex: number) => {
        const source = files[sourceIndex];
        setFiles((prev) =>
            prev.map((file) => ({
                ...file,
                copies: source.copies,
                orientation: source.orientation,
                color_mode: source.color_mode,
                paper_size: source.paper_size,
                scaling: source.scaling,
                duplex: source.duplex,
                page_selection_type: source.page_selection_type,
                page_range: source.page_range,
                margins: source.margins,
            }))
        );
    };

    // Helper: Calculate pages for a single file using effective page calculations
    const getFilePageCount = (file: UploadedFile): number => {
        return calculateEffectivePages(file);
    };

    // Helper: Calculate cost for a single file
    const getFileCost = (file: UploadedFile): number => {
        const pages = getFilePageCount(file);
        const rate = file.color_mode === 'color' ? colorRate : bwRate;
        return pages * file.copies * rate;
    };

    // Helper: Calculate total estimated cost
    const calculateTotalCost = (): number => {
        return files.reduce((sum, file) => sum + getFileCost(file), 0);
    };

    // Helper: Calculate total impressions
    const calculateTotalImpressions = (): number => {
        return files.reduce((sum, file) => sum + getFilePageCount(file) * file.copies, 0);
    };

    // Sheet selection helpers
    const activeSheetModalFile =
        activeSheetModalFileIndex !== null ? files[activeSheetModalFileIndex] : null;

    const toggleSheetSelection = (sheetName: string) => {
        if (activeSheetModalFileIndex === null) return;
        const current = files[activeSheetModalFileIndex].selected_sheets;
        const updated = current.includes(sheetName)
            ? current.filter((s) => s !== sheetName)
            : [...current, sheetName];
        updateFileOption(activeSheetModalFileIndex, 'selected_sheets', updated);
    };

    const selectAllSheets = () => {
        if (activeSheetModalFileIndex === null) return;
        const all = files[activeSheetModalFileIndex].metadata?.sheets || ['Sheet1'];
        updateFileOption(activeSheetModalFileIndex, 'selected_sheets', [...all]);
    };

    const clearAllSheets = () => {
        if (activeSheetModalFileIndex === null) return;
        updateFileOption(activeSheetModalFileIndex, 'selected_sheets', []);
    };

    // Validate before print
    const validateBeforePrint = (): boolean => {
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.file_type === 'excel' && f.selected_sheets.length === 0) {
                setGlobalError(`Please select at least one sheet for "${f.original_name}".`);
                return false;
            }
            if (f.page_selection_type === 'range') {
                const totalDocPages = f.metadata?.page_count;
                const validation = validatePageRangeString(f.page_range, totalDocPages);
                if (!validation.isValid) {
                    setGlobalError(`"${f.original_name}": ${validation.message}`);
                    return false;
                }
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
            payment_method: paymentMethod,
            files: files.map((file) => ({
                document_id: file.id,
                copies: file.copies,
                orientation: file.orientation,
                color_mode: file.color_mode,
                paper_size: file.paper_size,
                scaling: file.scaling,
                duplex: file.duplex,
                page_range: getComputedPageRangeString(file),
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
                return <FileText className="size-5 text-rose-500" />;
            case 'excel':
                return <FileSpreadsheet className="size-5 text-emerald-600" />;
            case 'image':
                return <ImageIcon className="size-5 text-purple-500" />;
            case 'word':
                return <FileType2 className="size-5 text-blue-600" />;
            case 'powerpoint':
                return <Presentation className="size-5 text-amber-600" />;
            default:
                return <FileText className="size-5 text-muted-foreground" />;
        }
    };

    const totalCalculatedCost = calculateTotalCost();
    const totalImpressions = calculateTotalImpressions();

    if (qrPrint.is_active === false) {
        return (
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-16 px-4 flex items-center justify-center">
                <Card className="max-w-md w-full border border-border shadow-lg rounded-3xl p-8 text-center space-y-6 bg-card">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600">
                        <AlertCircle className="size-8" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            QR Print Inactive
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This QR Print Point (<strong>{qrPrint.title}</strong>) is currently inactive. Please ask the shop owner to reactivate it.
                        </p>
                    </div>

                    <div className="pt-2 border-t border-border">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            QR Print Setup
                        </span>
                    </div>
                </Card>
            </main>
        );
    }

    return (
        <>
            <Head title={`QR Print | ${qrPrint.title}`} />
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-6 px-4 sm:px-6 pb-36">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header Banner with Shop Branding & Live Rate Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                        <div className="flex items-center gap-3">
                            {qrPrint.logo_url ? (
                                <div className="size-12 rounded-xl border bg-background p-1.5 shadow-xs flex items-center justify-center shrink-0">
                                    <img src={qrPrint.logo_url} alt={qrPrint.title} className="size-full object-contain rounded-lg" />
                                </div>
                            ) : (
                                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs shrink-0">
                                    <Printer className="size-6" />
                                </span>
                            )}
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    {qrPrint.title}
                                </h1>
                                {(qrPrint.mobile_number || qrPrint.address) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        {qrPrint.mobile_number && <span>📞 {qrPrint.mobile_number}</span>}
                                        {qrPrint.address && <span className="truncate max-w-[220px]">📍 {qrPrint.address}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Pricing Rate Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-2.5 py-1 rounded-lg border bg-card text-xs font-semibold shadow-2xs">
                                ⬛ B/W: <span className="text-primary font-bold">{sym}{Number(bwRate).toFixed(2)}/pg</span>
                            </div>
                            <div className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/5 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-2xs">
                                🎨 Color: <span className="font-bold">{sym}{Number(colorRate).toFixed(2)}/pg</span>
                            </div>
                        </div>
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
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors">
                                        <FileUp className="size-4" />
                                        + Select Documents to Print
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        Supported: PDF, Excel, Word, PowerPoint, JPG, PNG, WEBP
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
                                    Uploaded Documents ({files.length} of {limits.max_files})
                                </h2>
                                <span className="text-xs text-muted-foreground font-medium">
                                    Per-document print options
                                </span>
                            </div>

                            <div className="space-y-4">
                                {files.map((file, index) => {
                                    const detectedSheets = file.metadata?.sheets || [];
                                    const hasSheets = file.file_type === 'excel' && detectedSheets.length > 0;
                                    const fileCost = getFileCost(file);
                                    const filePages = getFilePageCount(file);

                                    return (
                                        <Card key={file.id} className="border border-border shadow-xs overflow-hidden">
                                            {/* File Header */}
                                            <CardHeader className="bg-muted/20 border-b p-3.5 sm:p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 rounded-lg bg-background border shrink-0">
                                                            {getFileIcon(file.file_type)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <CardTitle className="text-sm sm:text-base truncate font-bold text-foreground">
                                                                {file.original_name}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                                                                <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                                <span>·</span>
                                                                <span className="capitalize">{file.file_type}</span>
                                                                <span>·</span>
                                                                <span>{filePages} {filePages === 1 ? 'page' : 'pages'}</span>
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {/* Price Tag Pill */}
                                                        <Badge variant="outline" className="text-xs font-bold py-1 px-2.5 bg-primary/10 text-primary border-primary/20">
                                                            {sym}{fileCost.toFixed(2)}
                                                        </Badge>

                                                        {/* Preview Button */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => setPreviewFile(file)}
                                                            title="Preview File"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>

                                                        {/* Apply to All */}
                                                        {files.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs gap-1 hidden sm:flex"
                                                                onClick={() => applyToAllFiles(index)}
                                                                title="Apply these settings to all files"
                                                            >
                                                                <Copy className="size-3.5" />
                                                                Apply to All
                                                            </Button>
                                                        )}

                                                        {/* Delete File */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemoveFile(index)}
                                                            title="Remove file"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            {/* Print Configuration Controls */}
                                            <CardContent className="p-4 space-y-4 text-xs">
                                                {/* Basic Specs Grid: Copies | Color Mode | Orientation | Paper Size */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {/* Copies */}
                                                    <div className="space-y-1">
                                                        <label className="font-semibold text-muted-foreground">Copies</label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={20}
                                                            value={file.copies}
                                                            onChange={(e) =>
                                                                updateFileOption(
                                                                    index,
                                                                    'copies',
                                                                    Math.max(1, parseInt(e.target.value, 10) || 1)
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                        />
                                                    </div>

                                                    {/* Color Mode */}
                                                    <div className="space-y-1">
                                                        <label className="font-semibold text-muted-foreground">Color Mode</label>
                                                        <select
                                                            value={file.color_mode}
                                                            onChange={(e) =>
                                                                updateFileOption(
                                                                    index,
                                                                    'color_mode',
                                                                    e.target.value as 'bw' | 'color'
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="bw">Black & White ({sym}{Number(bwRate).toFixed(2)}/pg)</option>
                                                            <option value="color">Full Color ({sym}{Number(colorRate).toFixed(2)}/pg)</option>
                                                        </select>
                                                    </div>

                                                    {/* Orientation */}
                                                    <div className="space-y-1">
                                                        <label className="font-semibold text-muted-foreground">Orientation</label>
                                                        <select
                                                            value={file.orientation}
                                                            onChange={(e) =>
                                                                updateFileOption(
                                                                    index,
                                                                    'orientation',
                                                                    e.target.value as 'auto' | 'portrait' | 'landscape'
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="auto">Auto Detect</option>
                                                            <option value="portrait">Portrait</option>
                                                            <option value="landscape">Landscape</option>
                                                        </select>
                                                    </div>

                                                    {/* Paper Size */}
                                                    <div className="space-y-1">
                                                        <label className="font-semibold text-muted-foreground">Paper Size</label>
                                                        <select
                                                            value={file.paper_size}
                                                            onChange={(e) =>
                                                                updateFileOption(
                                                                    index,
                                                                    'paper_size',
                                                                    e.target.value as 'A4' | 'A3' | 'Letter' | 'Legal'
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="A4">A4</option>
                                                            <option value="A3">A3</option>
                                                            <option value="Letter">Letter</option>
                                                            <option value="Legal">Legal</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Second Row: Sides (Duplex) & Pages to Print */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                                                    {/* Duplex Sided */}
                                                    <div className="space-y-1">
                                                        <label className="font-semibold text-muted-foreground">Sides</label>
                                                        <select
                                                            value={file.duplex}
                                                            onChange={(e) =>
                                                                updateFileOption(
                                                                    index,
                                                                    'duplex',
                                                                    e.target.value as 'off' | 'long_edge' | 'short_edge'
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="off">Single Sided</option>
                                                            <option value="long_edge">2-Sided (Flip on Long Edge)</option>
                                                            <option value="short_edge">2-Sided (Flip on Short Edge)</option>
                                                        </select>
                                                    </div>

                                                    {/* Pages Selection Option */}
                                                    <div className="space-y-1">
                                                        <label className="font-semibold text-muted-foreground flex items-center justify-between">
                                                            <span className="flex items-center gap-1.5">
                                                                <BookOpen className="size-3.5 text-primary" />
                                                                Pages to Print
                                                            </span>
                                                            {file.metadata?.page_count && file.metadata.page_count > 1 && (
                                                                <span className="text-[10px] text-muted-foreground font-normal">
                                                                    Total {file.metadata.page_count} pages
                                                                </span>
                                                            )}
                                                        </label>
                                                        <select
                                                            value={file.page_selection_type}
                                                            onChange={(e) =>
                                                                updateFileOption(
                                                                    index,
                                                                    'page_selection_type',
                                                                    e.target.value as 'all' | 'range' | 'odd' | 'even' | 'first'
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="all">
                                                                All Pages {file.metadata?.page_count ? `(1-${file.metadata.page_count})` : ''}
                                                            </option>
                                                            <option value="range">Custom Page Range (e.g. 1-3, 5)</option>
                                                            <option value="odd">Odd Pages Only (1, 3, 5...)</option>
                                                            <option value="even">Even Pages Only (2, 4, 6...)</option>
                                                            <option value="first">First Page Only (Page 1)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Custom Page Range Input & Presets (when 'range' is selected) */}
                                                {file.page_selection_type === 'range' && (() => {
                                                    const totalDocPages = file.metadata?.page_count;
                                                    const validation = file.page_range ? validatePageRangeString(file.page_range, totalDocPages) : null;

                                                    return (
                                                        <div className="p-3 rounded-lg border bg-primary/5 border-primary/20 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                                <label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                                                    <Hash className="size-3.5 text-primary" />
                                                                    Specify Page Numbers / Ranges
                                                                </label>
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    e.g. <span className="font-mono text-foreground font-semibold">1-3, 5, 8-10</span>
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. 1-3, 5"
                                                                    value={file.page_range}
                                                                    onChange={(e) => updateFileOption(index, 'page_range', e.target.value)}
                                                                    className={`w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono shadow-xs focus:outline-none focus:ring-2 ${
                                                                        validation && !validation.isValid
                                                                            ? 'border-destructive focus:ring-destructive text-destructive'
                                                                            : 'border-input focus:ring-ring'
                                                                    }`}
                                                                />
                                                                {file.page_range && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                                        onClick={() => updateFileOption(index, 'page_range', '')}
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {/* Quick Selection Chips */}
                                                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-1">
                                                                    Presets:
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateFileOption(index, 'page_range', '1')}
                                                                    className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted transition-colors"
                                                                >
                                                                    Page 1
                                                                </button>
                                                                {totalDocPages && totalDocPages >= 3 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateFileOption(
                                                                                index,
                                                                                'page_range',
                                                                                `1-${Math.min(3, totalDocPages)}`
                                                                            )
                                                                        }
                                                                        className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted transition-colors"
                                                                    >
                                                                        Pages 1-{Math.min(3, totalDocPages)}
                                                                    </button>
                                                                )}
                                                                {totalDocPages && totalDocPages >= 5 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateFileOption(
                                                                                index,
                                                                                'page_range',
                                                                                `1-${Math.min(5, totalDocPages)}`
                                                                            )
                                                                        }
                                                                        className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted transition-colors"
                                                                    >
                                                                        Pages 1-{Math.min(5, totalDocPages)}
                                                                    </button>
                                                                )}
                                                                {totalDocPages && totalDocPages > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateFileOption(
                                                                                index,
                                                                                'page_range',
                                                                                `1-${totalDocPages}`
                                                                            )
                                                                        }
                                                                        className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted transition-colors"
                                                                    >
                                                                        All (1-{totalDocPages})
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Live Real-Time Validation Feedback Pill */}
                                                            {validation && (
                                                                <div className="pt-1">
                                                                    {validation.isValid ? (
                                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                                                                            <CheckCircle2 className="size-3.5 shrink-0" />
                                                                            <span>
                                                                                {validation.parsedPages.length} {validation.parsedPages.length === 1 ? 'page' : 'pages'} selected: [{validation.parsedPages.join(', ')}]
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                                                                            <AlertCircle className="size-3.5 shrink-0" />
                                                                            <span>{validation.message}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Information badges for Odd / Even / First page modes */}
                                                {file.page_selection_type === 'odd' && (
                                                    <div className="p-2.5 rounded-lg border bg-muted/40 text-xs flex items-center justify-between text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <BookOpen className="size-3.5 text-primary" />
                                                            Odd numbered pages only (1, 3, 5, 7...)
                                                        </span>
                                                        <span className="font-semibold text-foreground">
                                                            {filePages} {filePages === 1 ? 'page' : 'pages'}
                                                        </span>
                                                    </div>
                                                )}
                                                {file.page_selection_type === 'even' && (
                                                    <div className="p-2.5 rounded-lg border bg-muted/40 text-xs flex items-center justify-between text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <BookOpen className="size-3.5 text-primary" />
                                                            Even numbered pages only (2, 4, 6, 8...)
                                                        </span>
                                                        <span className="font-semibold text-foreground">
                                                            {filePages} {filePages === 1 ? 'page' : 'pages'}
                                                        </span>
                                                    </div>
                                                )}
                                                {file.page_selection_type === 'first' && (
                                                    <div className="p-2.5 rounded-lg border bg-muted/40 text-xs flex items-center justify-between text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <BookOpen className="size-3.5 text-primary" />
                                                            First page only
                                                        </span>
                                                        <span className="font-semibold text-foreground">1 page</span>
                                                    </div>
                                                )}

                                                {/* Excel Sheet Selection CTA */}
                                                {hasSheets && (
                                                    <div className="space-y-1 pt-1 border-t border-border">
                                                        <label className="font-semibold text-muted-foreground">Excel Worksheets</label>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-between h-9 text-xs border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                                                            onClick={() => setActiveSheetModalFileIndex(index)}
                                                        >
                                                            <span className="flex items-center gap-1.5 truncate">
                                                                <FileSpreadsheet className="size-3.5" />
                                                                {file.selected_sheets.length === 0
                                                                    ? 'Select sheets to print'
                                                                    : `${file.selected_sheets.length} sheet(s) selected`}
                                                            </span>
                                                            <Badge variant="secondary" className="text-[10px] ml-2">
                                                                Change
                                                            </Badge>
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Collapsible Advanced Print Preferences (Scaling, Margins, Image Position) */}
                                                <div className="pt-2 border-t border-border">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleAdvanced(index)}
                                                        className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            <SlidersHorizontal className="size-3.5 text-primary" />
                                                            Advanced Print Preferences (Scaling & Margins)
                                                        </span>
                                                        {expandedAdvancedIndexes.includes(index) ? (
                                                            <ChevronUp className="size-3.5" />
                                                        ) : (
                                                            <ChevronDown className="size-3.5" />
                                                        )}
                                                    </button>

                                                    {expandedAdvancedIndexes.includes(index) && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-1 border-t border-dashed animate-in fade-in duration-200">
                                                            {/* Scaling */}
                                                            <div className="space-y-1">
                                                                <label className="font-semibold text-muted-foreground">Page Scaling</label>
                                                                <select
                                                                    value={file.scaling}
                                                                    onChange={(e) =>
                                                                        updateFileOption(
                                                                            index,
                                                                            'scaling',
                                                                            e.target.value as UploadedFile['scaling']
                                                                        )
                                                                    }
                                                                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                                >
                                                                    <option value="actual">Actual Size (100%)</option>
                                                                    <option value="fit_to_page">Fit to Printable Page</option>
                                                                    <option value="shrink_to_fit">Shrink to Fit</option>
                                                                    {file.file_type === 'excel' && (
                                                                        <>
                                                                            <option value="fit_columns">Fit All Columns on 1 Page</option>
                                                                            <option value="fit_rows">Fit All Rows on 1 Page</option>
                                                                        </>
                                                                    )}
                                                                    {file.file_type === 'image' && (
                                                                        <option value="fill_page">Fill Entire Page</option>
                                                                    )}
                                                                </select>
                                                            </div>

                                                            {/* Margins */}
                                                            <div className="space-y-1">
                                                                <label className="font-semibold text-muted-foreground">Margins</label>
                                                                <select
                                                                    value={file.margins}
                                                                    onChange={(e) =>
                                                                        updateFileOption(
                                                                            index,
                                                                            'margins',
                                                                            e.target.value as 'normal' | 'narrow' | 'wide'
                                                                        )
                                                                    }
                                                                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                                >
                                                                    <option value="normal">Normal (Standard)</option>
                                                                    <option value="narrow">Narrow (More Content)</option>
                                                                    <option value="wide">Wide (Spacious)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Payment Options Selection Box */}
                            <Card className="border border-border shadow-xs overflow-hidden">
                                <CardHeader className="bg-muted/15 border-b pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Banknote className="size-4 text-primary" />
                                        Select Payment Method
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose how you would like to pay for your print order.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Option 1: Pay at Counter */}
                                        {canCounter && (
                                            <label
                                                onClick={() => setPaymentMethod('counter')}
                                                className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                                                    paymentMethod === 'counter'
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-input bg-card hover:bg-muted/30'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="counter"
                                                    checked={paymentMethod === 'counter'}
                                                    onChange={() => setPaymentMethod('counter')}
                                                    className="sr-only"
                                                />
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                                    <Store className="size-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm text-foreground">
                                                            Pay at Shop Counter
                                                        </span>
                                                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">
                                                            Cash / UPI
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Spools job to printer immediately. Pay in cash or QR at counter when collecting printout.
                                                    </p>
                                                </div>
                                            </label>
                                        )}

                                        {/* Option 2: Pay Online */}
                                        {canOnline && (
                                            <label
                                                onClick={() => setPaymentMethod('online')}
                                                className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                                                    paymentMethod === 'online'
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-input bg-card hover:bg-muted/30'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="online"
                                                    checked={paymentMethod === 'online'}
                                                    onChange={() => setPaymentMethod('online')}
                                                    className="sr-only"
                                                />
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                                                    <QrCode className="size-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm text-foreground">
                                                            Pay Online (UPI / Card)
                                                        </span>
                                                        <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 font-bold">
                                                            Instant
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Fast digital payment via GPay, PhonePe, Paytm, BHIM UPI, or Cards.
                                                    </p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Print Queue Summary Card */}
                            <Card className="shadow-xs border bg-muted/10">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Printer className="size-4 text-primary" />
                                            Order & Pricing Summary
                                        </span>
                                        <Badge variant="outline" className="text-xs font-semibold">
                                            {files.length} {files.length === 1 ? 'file' : 'files'} · ~{totalImpressions} impressions
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3 text-xs">
                                    <div className="space-y-1.5 text-muted-foreground">
                                        {files.map((file) => (
                                            <div key={file.id} className="flex justify-between items-center">
                                                <span className="font-medium text-foreground truncate max-w-[260px] sm:max-w-md">
                                                    {file.original_name} ({file.copies}x · {file.color_mode.toUpperCase()})
                                                </span>
                                                <span className="font-semibold text-foreground shrink-0">
                                                    {sym}{getFileCost(file).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-3 border-t border-border flex justify-between items-center text-sm font-bold text-foreground">
                                        <span>Total Calculated Amount</span>
                                        <span className="text-2xl font-black text-primary">
                                            {sym}{totalCalculatedCost.toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Sticky Bottom Action Bar */}
                {files.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t p-3 sm:p-4 shadow-lg">
                        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground font-medium">
                                    Total ({files.length} files) · {paymentMethod === 'counter' ? 'Pay at Counter' : 'Online Payment'}
                                </div>
                                <div className="text-xl sm:text-2xl font-black text-primary">
                                    {sym}{totalCalculatedCost.toFixed(2)}
                                </div>
                            </div>

                            <Button
                                className="w-full sm:w-auto min-w-[240px] text-base font-bold shadow-md py-6 gap-2 rounded-xl"
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
                                        {paymentMethod === 'counter'
                                            ? `🖨️ Pay at Counter & Print (${sym}${totalCalculatedCost.toFixed(2)})`
                                            : `💳 Pay Online & Print (${sym}${totalCalculatedCost.toFixed(2)})`}
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
