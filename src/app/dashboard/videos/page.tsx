"use client" 

import { Video } from "@/interfaces/videos"
import { VideosTable } from "./VideoTable"
import { useEffect, useState } from "react"

export default function Videos() {
    const [videos, setVideos] = useState<Video[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    async function fetchVideos() {
        try {
            const response = await fetch("/api/video", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })

            if (!response.ok) throw new Error("Falha ao buscar redes sociais")
            const data = (await response.json()) as Video[]
            setVideos(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchVideos()
    }, [])

    return (
        <VideosTable
            data={videos}
            query={searchTerm}
            onDelete={async (video) => {
                const res = await fetch(`/api/video/${video.id}`, { method: "DELETE" })
                if (!res.ok) throw new Error("Falha ao excluir vídeo")
                // exemplo de atualização local:
                // setVideos((prev) => prev.filter((v) => v.id !== video.id))
            }}
        />
    )
}