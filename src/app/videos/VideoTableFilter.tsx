"use client"

import { Button } from "@/components/button"
import { IconSelect } from "@/components/icon-selector"
import { Input } from "@/components/input"
import { InputDatePicker } from "@/components/input-date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { getBrandIcon } from "@/components/social-icons"
import { useSocialNetworkContext } from "@/context/SocialNetworkContext"
import { useVideoContext } from "@/context/VideoContext"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { FiX } from "react-icons/fi"

type FormShape = { social: string };

export default function VideoTableFilter() {
    const { filters, patchFilters, clearFilters } = useVideoContext()
    const { socialNetworks } = useSocialNetworkContext()

    const form = useForm<FormShape>({
        defaultValues: { social: filters.social || "" },
    });
    const { control, setValue } = form;

    useEffect(() => {
        setValue("social", filters.social || "");
    }, [filters.social, setValue]);

    const socialItems = [
        { label: "Todas", value: "ALL" }, // sentinela não-vazia
        ...(socialNetworks ?? []).map((sn) => ({
            label: sn.name || "(sem nome)",
            value: sn.id,                         // usamos ID aqui
            Icon: getBrandIcon(sn.icon),
        })),
    ];

    return (
        <div className="flex flex-row mb-3 gap-2">
            <Input
                placeholder="Buscar por título, descrição, tag ou link do Drive..."
                value={filters.query}
                onChange={(e) => patchFilters({ query: e.target.value, page: 1 })}
                className="w-2/6"
            />

            <Controller
                name="social"
                control={control}
                render={({ field }) => (
                    <IconSelect
                        className="w-1/6"
                        items={socialItems}
                        selectedIcon={field.value === "" ? "ALL" : field.value}
                        onIconSelect={(v) => {
                            const mapped = v === "ALL" ? "" : v;
                            field.onChange(mapped);
                            patchFilters({ social: mapped, page: 1 });
                        }}
                        placeholder="Filtrar por rede social"
                    />
                )}
            />

            <div className="relative w-[200px]">
                <InputDatePicker value={filters.postedDate} onChange={(d) => patchFilters({ postedDate: d, page: 1 })} className="w-[200px]" />
                {filters.postedDate && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => patchFilters({ postedDate: null, page: 1 })}
                        aria-label="Limpar data"
                    >
                        <FiX className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Select
                value={filters.publi === "" ? "ALL" : filters.publi}
                onValueChange={(v) => patchFilters({ publi: v === "ALL" ? "" : (v as "S" | "N"), page: 1 })}
            >
                <SelectTrigger className="w-1/6">
                    <SelectValue placeholder="Publi" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="S">Sim</SelectItem>
                    <SelectItem value="N">Não</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.repost === "" ? "ALL" : filters.repost}
                onValueChange={(v) => patchFilters({ repost: v === "ALL" ? "" : (v as "S" | "N"), page: 1 })}
            >
                <SelectTrigger className="w-1/6">
                    <SelectValue placeholder="Repost" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="S">Sim</SelectItem>
                    <SelectItem value="N">Não</SelectItem>
                </SelectContent>
            </Select>

            <Button
                type="button"
                className="w-1/6"
                variant="outline"
                onClick={() => clearFilters()}
            >
                Limpar filtros
            </Button>
        </div>
    )
}