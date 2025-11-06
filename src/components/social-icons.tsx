import { SOCIAL_ICON_MAP } from "@/interfaces/social-networks";
import { IconType } from "react-icons";
import { FiVideo } from "react-icons/fi";

export const getBrandIcon = (name?: string): IconType =>
    (name && SOCIAL_ICON_MAP[name]) || FiVideo
