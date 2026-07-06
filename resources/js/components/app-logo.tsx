import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg border border-amber-400/20 bg-black shadow-sm">
                <AppLogoIcon className="size-full object-cover" />
            </div>
            <div className="ml-3 grid flex-1 text-left">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-base font-bold tracking-tight text-transparent">
                    RK Carwash
                </span>
                <span className="truncate text-xs font-medium text-muted-foreground">
                    Management System
                </span>
            </div>
        </>
    );
}
