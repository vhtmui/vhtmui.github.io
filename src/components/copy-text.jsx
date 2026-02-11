"use client"
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";

export default function CopyText({ text }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = async () => {
        if (navigator.clipboard) {
            // 使用现代 Clipboard API
            try {
                await navigator.clipboard.writeText(text);
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
        } else {
            // 降级到传统方法
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
            document.body.removeChild(textArea);
        }
    };
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