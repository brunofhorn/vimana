"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { useVideoContext } from "@/context/VideoContext";

type OrderValue = "asc" | "desc";

export default function VideoTableOrder() {
    const { filters, patchFilters } = useVideoContext();
    return (
        <div className="my-4">
            <Select
                value={filters.order}
                onValueChange={(v) => patchFilters({ order: v as OrderValue, page: 1 })}
            >
                <SelectTrigger className="w-[350px]">
                    <SelectValue placeholder="Ordenar por cadastro" />
                </SelectTrigger>
                <SelectContent className="max-h-80 p-0 bg-white text-slate-900 border-slate-200">
                    <SelectItem value="desc" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Últimos cadastrados (mais novos)</SelectItem>
                    <SelectItem value="asc" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Primeiros cadastrados (mais antigos)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}