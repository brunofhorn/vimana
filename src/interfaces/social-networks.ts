import { SocialNetworksFormCreateValues } from "@/schemas/social";
import { UseFormReturn } from "react-hook-form";
import { IconType } from "react-icons";
import { FiVideo } from "react-icons/fi";
import {
  SiFacebook,
  SiInstagram,
  SiKuaishou,
  SiLinkedin,
  SiPinterest,
  SiSnapchat,
  SiThreads,
  SiTiktok,
  SiX,
  SiYoutube,
} from "react-icons/si";

export interface ISocialNetwork {
  id: string;
  name: string;
  url: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export type SocialNetworkUpdateInput = {
  id: string;
  data: SocialNetworksFormCreateValues;
};

export interface SocialNetworkFormProps {
  form: UseFormReturn<SocialNetworksFormCreateValues>;
  onSubmit: (socialData: SocialNetworksFormCreateValues) => Promise<void>;
}

export type SocialNetworkEditDialogProps = {
  editing: ISocialNetwork | null;
  setEditing: (social: ISocialNetwork | null) => void;
};

export interface SocialNetworkDeleteDialogProps {
  deleting: ISocialNetwork | null;
  setDeleting: (social: ISocialNetwork | null) => void;
}

export const SOCIAL_ICON_MAP: Record<string, IconType> = {
  Instagram: SiInstagram,
  Tiktok: SiTiktok,
  Pinterest: SiPinterest,
  Youtube: SiYoutube,
  Linkedin: SiLinkedin,
  Twitter: SiX,
  Threads: SiThreads,
  Facebook: SiFacebook,
  Snapchat: SiSnapchat,
  Kwai: SiKuaishou,
  Gotchosen: FiVideo,
};
