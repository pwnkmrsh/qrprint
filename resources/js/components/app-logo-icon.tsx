import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" fill="none">
            {/* Outer Purple Squircle */}
            <rect x="10" y="10" width="120" height="120" rx="26" fill="#6A1B9A" />
            {/* White Inner Card */}
            <rect x="26" y="26" width="88" height="88" rx="14" fill="#FFFFFF" />
            
            {/* Top-Left QR Marker */}
            <rect x="39" y="39" width="26" height="26" rx="4" fill="none" stroke="#6A1B9A" strokeWidth="4.5" />
            
            {/* Top-Right QR Marker */}
            <rect x="75" y="39" width="26" height="26" rx="4" fill="none" stroke="#6A1B9A" strokeWidth="4.5" />
            
            {/* Bottom-Left QR Marker */}
            <rect x="39" y="75" width="26" height="26" rx="4" fill="none" stroke="#6A1B9A" strokeWidth="4.5" />
            
            {/* Bottom-Right QR Pixel Pattern */}
            <rect x="75" y="75" width="13" height="13" rx="2" fill="#6A1B9A" />
            <rect x="93" y="75" width="8" height="8" rx="1.5" fill="#6A1B9A" />
            <rect x="75" y="93" width="7" height="7" rx="1.5" fill="#6A1B9A" />
            <rect x="85" y="85" width="16" height="16" rx="2" fill="#6A1B9A" />
        </svg>
    );
}
