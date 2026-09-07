import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { QrCode, Printer } from 'lucide-react';

interface PosterProps {
    shopName: string;
    qrUrl: string;
    printToken: string;
    printUrl?: string;
}

export default function Poster({ shopName, qrUrl, printToken, printUrl }: PosterProps) {
    useEffect(() => {
        // Trigger window print after content loads
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const displayUrl = printUrl || (typeof window !== 'undefined' ? `${window.location.origin}/print/${printToken}` : `/print/${printToken}`);

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-between p-8 sm:p-12 font-sans relative overflow-hidden select-none print:p-0 print:m-0 print:bg-white print:text-black">
            <Head title={`Print Poster - ${shopName}`} />

            {/* Decorative Top Border (Aesthetic Ribbon) */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-primary via-sky-500 to-indigo-600 print:hidden" />

            {/* Main Poster Container */}
            <div className="w-full max-w-[700px] flex-1 flex flex-col justify-between border-4 border-slate-950 p-8 sm:p-10 rounded-3xl relative bg-white my-auto shadow-2xl print:border-4 print:border-black print:shadow-none print:rounded-none print:p-8 print:max-w-none print:w-full print:h-full">

                {/* Header Section */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider print:border-black print:bg-transparent">
                        <QrCode className="h-4 w-4 text-primary print:text-black" />
                        <span>QR Print Setu</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 uppercase leading-none mt-2">
                        QR Scan करो, <br />
                        <span className="text-primary print:text-black font-extrabold text-5xl sm:text-6xl">Print करो</span>
                    </h1>

                    <p className="text-base sm:text-lg font-bold text-slate-700 tracking-wide">
                        मोबाइल से प्रिंट करें, तुरंत!
                    </p>
                </div>

                {/* QR Code Container */}
                <div className="my-8 flex flex-col items-center justify-center space-y-4">
                    <div className="relative p-6 border-4 border-slate-950 rounded-3xl bg-white shadow-lg print:shadow-none print:border-3">
                        <img
                            src={qrUrl}
                            alt="QR Print Point QR Code"
                            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] object-contain"
                        />
                        {/* Centered Logo Badge in QR container */}
                        <div className="absolute inset-0 m-auto h-12 w-12 rounded-xl bg-slate-950 text-white flex items-center justify-center border-4 border-white shadow-md">
                            <Printer className="h-5 w-5 text-white" />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Direct Link or Scan</span>
                        <div className="text-xs font-mono font-bold text-primary print:text-black select-all">
                            {displayUrl}
                        </div>
                    </div>
                </div>

                {/* Shop Name Display */}
                <div className="text-center py-4 bg-slate-100 border-2 border-slate-950 rounded-2xl print:bg-transparent print:border-black">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Welcome To</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950 px-4 mt-0.5 uppercase tracking-wide">
                        {shopName}
                    </h3>
                </div>

                {/* Features & Steps */}
                <div className="mt-8 grid grid-cols-3 gap-3 border-t-2 border-slate-950 pt-8 print:pt-6">
                    <div className="flex flex-col items-center text-center space-y-1.5">
                        <div className="h-9 w-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
                            1
                        </div>
                        <span className="text-[11px] sm:text-xs font-black uppercase text-slate-950 leading-tight">
                            Scan QR
                        </span>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-1.5">
                        <div className="h-9 w-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
                            2
                        </div>
                        <span className="text-[11px] sm:text-xs font-black uppercase text-slate-950 leading-tight">
                            Upload File
                        </span>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-1.5">
                        <div className="h-9 w-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
                            3
                        </div>
                        <span className="text-[11px] sm:text-xs font-black uppercase text-slate-950 leading-tight">
                            Get Print
                        </span>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="mt-6 text-center text-[10px] sm:text-xs font-bold text-slate-600 border-t border-slate-200 pt-4 print:pt-3">
                    ❌ No WhatsApp • ❌ No Pendrive • ❌ No File Transfer
                </div>
            </div>

            {/* Print Instructions Banner (Only visible on screen) */}
            <div className="mt-8 flex items-center gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200 max-w-[500px] text-xs text-slate-600 print:hidden">
                <Printer className="h-5 w-5 text-primary shrink-0" />
                <div>
                    <p className="font-semibold text-slate-900">Printing Tips:</p>
                    <p>Select <strong className="text-slate-950">A4 size</strong> and <strong className="text-slate-950">Color mode</strong> in the print prompt. For best durability, print on cardstock paper or laminate this poster.</p>
                </div>
            </div>
        </div>
    );
}
