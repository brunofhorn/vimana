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
                <SelectContent>
                    <SelectItem value="desc">Últimos cadastrados (mais novos)</SelectItem>
                    <SelectItem value="asc">Primeiros cadastrados (mais antigos)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}