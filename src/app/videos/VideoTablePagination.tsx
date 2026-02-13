"use client"

import { Button } from "@/components/button";
import { useVideoContext } from "@/context/VideoContext"
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

type PageItem = number | "...";

export default function VideoTablePagination() {
    const { filters, patchFilters, total } = useVideoContext()

    const totalPages = filters.pageSize === "ALL" ? 1 : Math.max(1, Math.ceil(total / (filters.pageSize as number)));
    const pageItems: PageItem[] = filters.pageSize === "ALL" ? [1] : makePageItems(totalPages, filters.page, 11);

    const goTo = (page: number) => patchFilters({ page });
    const canPrev = filters.page > 1;
    const canNext = filters.page < totalPages;

    function makePageItems(totalPages: number, current: number, maxNumeric = 11): PageItem[] {
        if (totalPages <= maxNumeric) {
            return range(1, totalPages)
        }

        const inner = maxNumeric - 2;
        let start = Math.max(2, current - Math.floor(inner / 2));
        const end = Math.min(totalPages - 1, start + inner - 1);

        start = Math.max(2, end - inner + 1);

        const items: PageItem[] = [1];

        if (start > 2) {
            items.push("...");
        }

        items.push(...range(start, end));

        if (end < totalPages - 1) {
            items.push("...");
        }

        items.push(totalPages);
        return items;
    }

    function range(a: number, b: number) {
        return Array.from({ length: b - a + 1 }, (_, i) => a + i)
    }

    return (
        <div className="flex w-full items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
                {total} resultado{total === 1 ? "" : "s"}
            </span>

            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => goTo(1)} disabled={!canPrev} aria-label="Primeira">
                    <FiChevronsLeft />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => goTo(filters.page - 1)} disabled={!canPrev} aria-label="Anterior">
                    <FiChevronLeft />
                </Button>
                {filters.pageSize !== "ALL" &&
                    pageItems.map((item, i) =>
                        item === "..." ? (
                            <span key={`dots-${i}`} className="px-2 text-sm text-muted-foreground select-none">
                                …
                            </span>
                        ) : (
                            <Button
                                key={item}
                                variant={item === filters.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => goTo(item)}
                                aria-current={item === filters.page ? "page" : undefined}
                            >
                                {item}
                            </Button>
                        )
                    )}
                <Button variant="secondary" size="sm" onClick={() => goTo(filters.page + 1)} disabled={!canNext} aria-label="Próxima">
                    <FiChevronRight />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => goTo(totalPages)} disabled={!canNext} aria-label="Última">
                    <FiChevronsRight />
                </Button>
            </div>
        </div>
    )
}