"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
            <AuthProvider>
                <TooltipProvider>
                    {children}
                    <Toaster />
                </TooltipProvider>
            </AuthProvider>
        </NextThemesProvider>
    );
}
