import { ITitlePage } from "@/interfaces/components";

export function TitlePage({ title }: ITitlePage) {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
        </div>
    )
}