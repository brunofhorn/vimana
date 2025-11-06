"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { useVideoContext } from "@/context/VideoContext";
import { PageSize } from "@/interfaces/videos";

export default function VideoTablePageSize(){
    const { filters, patchFilters } = useVideoContext()

    return (
        <div className="my-4">
            <Select value={String(filters.pageSize)} onValueChange={(value) => patchFilters({ pageSize: value as PageSize, page: 1 })}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                    <SelectItem value={String(n)} key={n}>{n}</SelectItem>
                ))}
                <SelectItem value="ALL">Todos</SelectItem>
              </SelectContent>
            </Select>
        </div>
    )
}