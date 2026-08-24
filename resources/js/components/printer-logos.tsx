import React from 'react';

interface PrinterLogoProps {
    brand: string;
    className?: string;
}

export function PrinterBrandLogo({ brand, className = "h-5 w-auto" }: PrinterLogoProps) {
    switch (brand) {
        case 'HP':
            return (
                <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="50" fill="#0096D6" />
                    <path
                        d="M38.5 76.5L46.8 33.5H39.2L37.8 41H31.5L34.8 23.5H48.8L44.8 44.2C46.5 41.5 49.5 39.5 53.5 39.5C59.5 39.5 62.5 44 61.2 51C59.8 58.5 54.5 64.5 47.8 64.5C45.2 64.5 43.2 63.5 42.2 61.8L38.5 76.5ZM47.2 56.5C49.8 56.5 52.2 54 52.8 49.8C53.2 46.8 52 45 49.5 45C47 45 44.5 47.5 43.8 51.5C43.5 54.8 44.8 56.5 47.2 56.5Z"
                        fill="white"
                    />
                    <path
                        d="M62.5 76.5L70.8 33.5H63.2L61.8 41H55.5L58.8 23.5H72.8L70.2 37C72 34.2 75.2 32.5 79.2 32.5C85.2 32.5 88.2 37 86.8 44C85.5 51.5 80.2 57.5 73.5 57.5C71 57.5 69 56.5 68 54.8L62.5 76.5ZM73 49.5C75.5 49.5 78 47 78.5 43C79 40 77.8 38 75.2 38C72.8 38 70.2 40.5 69.5 44.5C69.2 47.8 70.5 49.5 73 49.5Z"
                        fill="white"
                    />
                </svg>
            );

        case 'Canon':
            return (
                <svg viewBox="0 0 160 36" className={className} fill="#CC0000" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26.5 4.8C18.2 4.8 11.5 10.2 11.5 18.2C11.5 26.2 18.2 31.6 26.5 31.6C32.8 31.6 37.8 28.5 40 23.8L31.8 21.2C30.8 23.5 28.8 24.8 26.5 24.8C22.2 24.8 18.8 21.8 18.8 18.2C18.8 14.6 22.2 11.6 26.5 11.6C28.8 11.6 30.8 12.9 31.8 15.2L40 12.6C37.8 7.9 32.8 4.8 26.5 4.8Z" />
                    <path d="M49 5.2L38 31.2H45.5L47.5 26.2H56.5L58.5 31.2H66L55 5.2H49ZM52 13.5L54.8 20.8H49.2L52 13.5Z" />
                    <path d="M68 5.2V31.2H75.5V14.8L84.8 31.2H92V5.2H84.5V21.6L75.2 5.2H68Z" />
                    <path d="M107.5 4.8C98.8 4.8 92.5 10.5 92.5 18.2C92.5 25.9 98.8 31.6 107.5 31.6C116.2 31.6 122.5 25.9 122.5 18.2C122.5 10.5 116.2 4.8 107.5 4.8ZM107.5 24.8C103 24.8 99.8 21.8 99.8 18.2C99.8 14.6 103 11.6 107.5 11.6C112 11.6 115.2 14.6 115.2 18.2C115.2 21.8 112 24.8 107.5 24.8Z" />
                    <path d="M125 5.2V31.2H132.5V14.8L141.8 31.2H149V5.2H141.5V21.6L132.2 5.2H125Z" />
                </svg>
            );

        case 'Epson':
            return (
                <svg viewBox="0 0 140 32" className={className} fill="#002060" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="25" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="28" letterSpacing="1.5">
                        EPSON
                    </text>
                </svg>
            );

        case 'Brother':
            return (
                <svg viewBox="0 0 140 32" className={className} fill="#002F6C" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="24" letterSpacing="-0.5">
                        brother
                    </text>
                </svg>
            );

        case 'Xerox':
            return (
                <svg viewBox="0 0 130 32" className={className} fill="#D9272E" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="24" fontFamily="'Trebuchet MS', Arial, sans-serif" fontWeight="800" fontSize="25" letterSpacing="0.5">
                        xerox
                    </text>
                </svg>
            );

        case 'Konica Minolta':
            return (
                <svg viewBox="0 0 170 32" className={className} fill="#005BAB" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="13" fill="#005BAB" />
                    <path d="M7 16C7 11 11 7 16 7C21 7 25 11 25 16" stroke="white" strokeWidth="2.5" fill="none" />
                    <path d="M10 16C10 13 13 10 16 10C19 10 22 13 22 16" stroke="white" strokeWidth="2" fill="none" />
                    <text x="36" y="22" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="15" fill="#005BAB" letterSpacing="-0.3">
                        KONICA MINOLTA
                    </text>
                </svg>
            );

        case 'Ricoh':
            return (
                <svg viewBox="0 0 120 32" className={className} fill="#CE1126" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="24" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="27" letterSpacing="1">
                        RICOH
                    </text>
                </svg>
            );

        case 'Kyocera':
            return (
                <svg viewBox="0 0 150 32" className={className} fill="#E60012" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4L24 10V22L14 28L4 22V10L14 4Z" fill="#E60012" />
                    <path d="M14 8L20 12V20L14 24L8 20V12L14 8Z" fill="white" />
                    <text x="32" y="23" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="18" fill="#0B2545" letterSpacing="0.5">
                        KYOCERA
                    </text>
                </svg>
            );

        case 'Samsung':
            return (
                <svg viewBox="0 0 145 32" className={className} fill="#1428A0" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="23" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="22" letterSpacing="2.5">
                        SAMSUNG
                    </text>
                </svg>
            );

        case 'Pantum':
            return (
                <svg viewBox="0 0 130 32" className={className} fill="#E60000" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="23" letterSpacing="1.5">
                        PANTUM
                    </text>
                </svg>
            );

        case 'TVS Electronics':
            return (
                <svg viewBox="0 0 150 32" className={className} fill="#0B2545" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="4" width="42" height="24" rx="4" fill="#00ABE4" />
                    <text x="5" y="22" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="17" fill="white">
                        TVS
                    </text>
                    <text x="48" y="22" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="13" fill="#0B2545">
                        ELECTRONICS
                    </text>
                </svg>
            );

        case 'Toshiba':
            return (
                <svg viewBox="0 0 140 32" className={className} fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="24" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="24" letterSpacing="0.8">
                        TOSHIBA
                    </text>
                </svg>
            );

        default:
            return (
                <span className="font-bold text-sm tracking-tight text-foreground">
                    {brand}
                </span>
            );
    }
}
