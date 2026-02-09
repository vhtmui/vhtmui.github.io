"use client"
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";

export default function CopyText({ text }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
    }
    const handleCopy = () => {
        copyToClipboard();
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div className="flex align-middle items-center">
            <span className="mr-auto">{text}</span>
            <Button onClick={handleCopy} variant="ghost" size="icon" disabled={copied || text.length === 0}>
                {copied ? <Check /> : <Copy />}
            </Button>
        </div>
    )
}