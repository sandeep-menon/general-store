import { CircleX } from "lucide-react";
import { PropsWithChildren } from "react";

export default function ErrorAlert({ children }: PropsWithChildren) {
    return (
        <div role="alert" className="alert alert-error">
            <CircleX />
            <span>{children}</span>
        </div>
    )
}