"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export default function ModeToggle() {
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