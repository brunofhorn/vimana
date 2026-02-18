"use client"

import { Button } from "@/components/button"
import { IconSelect } from "@/components/icon-selector"
import { Input } from "@/components/input"
import { InputDatePicker } from "@/components/input-date-picker"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/select"
import { getBrandIcon } from "@/components/social-icons"
import { useSocialNetworkContext } from "@/context/SocialNetworkContext"
import { useVideoContext } from "@/context/VideoContext"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { FiX } from "react-icons/fi"
import { SocialFilterMode } from "@/interfaces/videos"

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
        { label: "Todas", value: "ALL" },
        ...(socialNetworks ?? []).map((sn) => ({
            label: sn.name || "(sem nome)",
            value: sn.id,
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
                        className="w-1/6 placeholder:text-white text-white"
                        items={socialItems}
                        selectedIcon={field.value === "" ? "ALL" : field.value}
                        onIconSelect={(v) => {
                            const mapped = v === "ALL" ? "" : v;
                            field.onChange(mapped);
                            patchFilters({
                                social: mapped,
                                socialMode: "HAS",
                                page: 1,
                            });
                        }}
                        placeholder="Filtrar por rede social"
                    />
                )}
            />

            <Select
                value={filters.socialMode}
                onValueChange={(v) =>
                    patchFilters({
                        socialMode: v as SocialFilterMode,
                        page: 1,
                    })
                }
                disabled={!filters.social}
            >
                <SelectTrigger className="w-1/6 placeholder:text-white text-white">
                    <SelectValue placeholder="Status da rede" />
                </SelectTrigger>
                <SelectContent className="max-h-80 p-0 bg-white text-slate-900 border-slate-200">
                    <SelectGroup>
                        <SelectLabel>Status na rede</SelectLabel>
                        <SelectItem value="HAS" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">
                            Com postagem
                        </SelectItem>
                        <SelectItem value="MISSING" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">
                            Sem postagem
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <div className="relative w-[200px]">
                <InputDatePicker value={filters.postedDate} onChange={(d) => patchFilters({ postedDate: d, page: 1 })} className="w-50" />
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
                <SelectTrigger className="w-1/6 placeholder:text-white text-white">
                    <SelectValue placeholder="Publi" />
                </SelectTrigger>
                <SelectContent className="max-h-80 p-0 bg-white text-slate-900 border-slate-200">
                    <SelectGroup>
                        <SelectLabel>É uma publi?</SelectLabel>
                        <SelectItem value="ALL" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Todos</SelectItem>
                        <SelectItem value="S" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Sim</SelectItem>
                        <SelectItem value="N" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Não</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Select
                value={filters.repost === "" ? "ALL" : filters.repost}
                onValueChange={(v) => patchFilters({ repost: v === "ALL" ? "" : (v as "S" | "N"), page: 1 })}
            >
                <SelectTrigger className="w-1/6 placeholder:text-white text-white">
                    <SelectValue placeholder="Repost" />
                </SelectTrigger>
                <SelectContent className="max-h-80 p-0 bg-white text-slate-900 border-slate-200">
                    <SelectGroup>
                        <SelectLabel>É um repost?</SelectLabel>
                        <SelectItem value="ALL" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Todos</SelectItem>
                        <SelectItem value="S" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Sim</SelectItem>
                        <SelectItem value="N" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Não</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Button
                type="button"
                className="w-1/6"
                variant="secondary"
                onClick={() => clearFilters()}
            >
                Limpar filtros
            </Button>
        </div>
    )
}
