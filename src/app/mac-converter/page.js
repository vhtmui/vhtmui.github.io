"use client"

import { Input } from "@/components/ui/input";
import { useState } from "react";
export default function MacTrans() {
    const [macAddress, setMacAddress] = useState("");
    return (
        <main className="flex min-h-screen flex-col items-center gap-10 p-24">
            <TypographyH1 />
            <Input placeholder="MacAddress" className="min-w-60 max-w-[50%]" onChange={(e) => setMacAddress(e.target.value)} />
            <MacTransInput macAddress={macAddress} />
        </main>
    );

}


function MacTransInput({ macAddress }) {
    const cleanMac = macAddress.replace(/[^A-Fa-f0-9]/g, "");

    if (cleanMac.length !== 12) {
        return (
            <div className="text-red-500">
                请输入有效的 MAC 地址（12 个十六进制字符）
            </div>
        );
    }

    const upperMac = cleanMac.toUpperCase();

    const formatTwoDash = (mac) =>
        mac.match(/.{2}/g)?.join("-") || "";
    const formatTwoColon = (mac) =>
        mac.match(/.{2}/g)?.join(":") || "";
    const formatFourDash = (mac) =>
        mac.match(/.{4}/g)?.join("-") || "";
    const formatFourColon = (mac) =>
        mac.match(/.{4}/g)?.join(":") || "";

    return (
        <ul className="flex flex-col gap-4 mt-6">
            <li>
                <strong>IEEE EUI-48 Dash Format</strong> {formatTwoDash(upperMac)}
            </li>
            <li>
                <strong>格式2</strong> {formatTwoColon(upperMac)}
            </li>
            <li>
                <strong>格式3</strong> {formatFourDash(upperMac)}
            </li>
            <li>
                <strong>格式4</strong> {formatFourColon(upperMac)}
            </li>
        </ul>
    );
}

export function TypographyH1() {
    return (
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
            Mac Address Converter
        </h1>
    )
}
