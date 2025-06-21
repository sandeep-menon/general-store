import { CircleX } from "lucide-react";
import { PropsWithChildren } from "react";

export default function ErrorMessage({ children }: PropsWithChildren) {
    return (
        <p className="label text-red-400"><CircleX />{children}</p>
    )
}