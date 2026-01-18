import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden shadow-sm">
                <AppLogoIcon className="size-full object-contain" />
            </div>
            <div className="ml-3 grid flex-1 text-left">
                <span className="truncate text-base font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Carwash App
                </span>
                <span className="truncate text-xs text-muted-foreground font-medium">
                    Management System
                </span>
            </div>
        </>
    );
}
