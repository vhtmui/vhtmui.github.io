import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LinkCard({ className, href, children }) {
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