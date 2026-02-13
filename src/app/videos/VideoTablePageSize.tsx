"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { useVideoContext } from "@/context/VideoContext";
import { PageSize } from "@/interfaces/videos";

export default function VideoTablePageSize(){
    const { filters, patchFilters } = useVideoContext()

    return (
        <div className="my-4">
            <Select value={String(filters.pageSize)} onValueChange={(value) => patchFilters({ pageSize: value as PageSize, page: 1 })}>
              <SelectTrigger className="w-30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80 p-0 bg-white text-slate-900 border-slate-200">
                {[10, 20, 50, 100].map((n) => (
                    <SelectItem value={String(n)} key={n}  className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">{n}</SelectItem>
                ))}
                <SelectItem value="ALL" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Todos</SelectItem>
              </SelectContent>
            </Select>
        </div>
    )
}