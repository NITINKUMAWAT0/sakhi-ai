'use client'
import { createContext, useState } from "react";

interface NavigationContextType {
    isMobileNavOpen: boolean;
    setIsMobileNavOpen: (open: boolean) => void;
    closeMobileNav: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
    undefined
)

export function NavigationProvider(
    {
        children
    }: {
        children: React.ReactNode;
    }
) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const closeMobileNav = () => setIsMobileNavOpen(false)
    return <NavigationContext value={{isMobileNavOpen, setIsMobileNavOpen, closeMobileNav}}>
        {children}
    </NavigationContext>
}