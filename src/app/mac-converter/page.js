"use client"

import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react";
import CopyText from "@/components/copy-text";
import { TriangleAlert } from "lucide-react";

export default function MacConverter() {
    return (
        <main className="flex min-h-screen flex-col items-center gap-10 p-24">
            <h1 className="scroll-m-20 text-center text-2xl font-extrabold tracking-tight text-balance">Mac Address Converter</h1>
            <MacInput />
        </main>
    );
}

function MacInput() {
    const [macAddress, setMacAddress] = useState("");

    const cleanMac = macAddress.replace(/[^A-Fa-f0-9]/g, "");

    const upperMac = cleanMac.toUpperCase();

    const warning = cleanMac.length !== 12 ?
        <InputGroupAddon align="inline-end" className="text-red-500 flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger><TriangleAlert className="w-4 h-4" /></TooltipTrigger>
                <TooltipContent>
                    <p className="text-red-500 font-medium">Over Length</p>
                </TooltipContent>
            </Tooltip>
        </InputGroupAddon> : null;

    const output = cleanMac.length > 0 ? <ul className="flex flex-col gap-2 mt-6">
        <li>
            <CopyText text={macFormatter(upperMac, 2, "-")} />
        </li>
        <li><Separator /></li>
        <li>
            <CopyText text={macFormatter(upperMac, 2, ":")} />
        </li>
        <li><Separator /></li>
        <li>
            <CopyText text={macFormatter(upperMac, 4, "-")} />
        </li>
        <li><Separator /></li>
        <li>
            <CopyText text={macFormatter(upperMac, 4, ":")} />
        </li>
    </ul> : null;

    return (
        <div>
            <InputGroup>
                <InputGroupInput name="macAddress" placeholder="MacAddress" className="min-w-60 max-w-80" onChange={(e) => setMacAddress(e.target.value)} />
                {warning}
            </InputGroup>
            {output}
        </div>
    );

}


function macFormatter(macStr, eachEount, separator) {
    macStr = macStr.replace(/[^A-Fa-f0-9]/g, "").slice(0, 12).toUpperCase();

    let output = String();

    for (let i = 0; i < macStr.length; i += 1) {
        output += macStr[i];
        if (i % eachEount === eachEount - 1 && i !== macStr.length - 1) {
            output += separator;
        }

    }

    return output;
}

