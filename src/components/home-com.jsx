"use client"

import * as React from "react"
import { usePathname } from "next/navigation";
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
    const pathnames = ['/'].concat(usePathname().split("/").filter(Boolean));

    const items = pathnames.map((pathname, index) => {

        const name = pathname === "/" ? "Home" : pathname;

        const innerItem = index === pathnames.length - 1 ? <BreadcrumbPage>
            {name}
        </BreadcrumbPage> : <BreadcrumbLink asChild>
            <Link href={`/${pathname}`}>{name}</Link>
        </BreadcrumbLink>

        return (
            <React.Fragment key={index}>
                <BreadcrumbItem >
                    {innerItem}
                </BreadcrumbItem>
                {index !== pathnames.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
        );
    });

    return (
        <div className="mr-auto">
            <Breadcrumb >
                <BreadcrumbList>
                    {items}
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
            className={`text-2xl font-bold grow min-w-50 max-w-1/1 h-50 flex items-center justify-center whitespace-normal text-center ${className}`}
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
        <Button variant="outline" size="icon" onClick={handleThemeChange}>
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