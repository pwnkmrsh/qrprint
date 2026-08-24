import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ position }: { position?: 'left' | 'right' }) {
    return (
        <div className={`flex items-center gap-2.5 ${position === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl shadow-xs">
                <AppLogoIcon className="size-full" />
            </div>
            <div className={`flex items-center text-lg leading-none font-black tracking-tight ${position === 'right' ? 'mr-1 text-right' : 'ml-0.5 text-left'}`}>
                <span className="text-[#6A1B9A] dark:text-[#A855F7]">Print</span>
                <span className="text-[#0088FF] dark:text-[#38BDF8] ml-0.5">Setu</span>
            </div>
        </div>
    );
}
