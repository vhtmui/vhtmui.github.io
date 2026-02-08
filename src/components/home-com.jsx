"use client"

import * as React from "react"
import Link from "next/link";
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbEllipsis, BreadcrumbList } from "@/components/ui/breadcrumb";

export function Header() {
    return (
        <header className="h-14 flex flex-row items-center pr-4 pl-4 sticky top-0 z-10 backdrop-blur-sm border-b">
            <Nav />
            <ModeToggle />
        </header>
    );
}

export function Nav() {
    return (
        <div className="mr-auto">
            <Breadcrumb >
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/mac-converter">MAC Converter</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>
        </div>

    );
}


export function LinkCard({ className, href, children }) {
    return (
        <Button
            asChild
            variant="outline"
            className={`grow min-w-50 h-50 flex items-center justify-center ${className}`}
        >
            <Link href={href}>{children}</Link>
        </Button>
    );
}

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    function handleThemeChange() {
        if (theme === "system") {
            setTheme("light")
            return
        } else if (theme === "light") {
            setTheme("dark")
            return
        } else {
            setTheme("system")
            return
        }
    }

    return (
        <Button variant="outline" size="icon" onClick={() => handleThemeChange()}>
            <ThemeIcon theme={theme} />
        </Button>
    )
}

function ThemeIcon({ theme }) {
    if (theme === "light") {
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
    } else if (theme === "dark") {
        return <Moon className="h-[1.2rem] w-[1.2rem]" />
    } else {
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />
    }
}