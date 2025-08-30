// social-icons.ts (util opcional)
import type { IconType } from "react-icons"
import { FiVideo } from "react-icons/fi"
import {
    SiInstagram,
    SiTiktok,
    SiPinterest,
    SiYoutube,
    SiLinkedin,
    SiX,
    SiThreads,
    SiFacebook,
    SiKuaishou, // Kwai
} from "react-icons/si"

export const SOCIAL_ICON_MAP: Record<string, IconType> = {
    Instagram: SiInstagram,
    Tiktok: SiTiktok,
    Pinterest: SiPinterest,
    Youtube: SiYoutube,
    Linkedin: SiLinkedin,
    Twitter: SiX,   // troque por SiX se quiser
    Threads: SiThreads,
    Facebook: SiFacebook,
    Kwai: SiKuaishou,
    Video: FiVideo,       // fallback
}

export const getBrandIcon = (name?: string): IconType =>
    (name && SOCIAL_ICON_MAP[name]) || FiVideo
