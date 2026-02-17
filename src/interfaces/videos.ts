import { ISocialNetwork } from "./social-networks";

export interface IVideo {
  id: string;
  title: string;
  description: string | null;
  tags?: string[] | null
  is_repost: boolean;
  is_sponsored: boolean;
  cover_image_url?: string | null
  raw_video_url?: string | null
  created_at: string | Date
  updated_at: string | Date
  links: IVideoLinks[];
}

export interface IVideoLinks {
  id: string;
  social_network: ISocialNetwork | null;
  social_network_id: string;
  url: string;
  video_id: string;
  posted_at: string | Date;
}

export interface CoverPreview {
  srcs: string[];
  alt: string;
}

export interface VideoCoverPreviewProps {
  coverPreview: CoverPreview | null;
  setCoverPreview: (coverPreview: CoverPreview | null) => void;
}

export interface VideoDeleteDialogProps {
  videoDeleting: IVideo | null 
  setVideoDeleting: (video: IVideo | null) => void
}

export interface VideoEditDialogProps {
  videoEditing: IVideo | null 
  setVideoEditing: (video: IVideo | null) => void
}

export type YesNoAll = "" | "S" | "N";

export type PageSize = 10 | 20 | 50 | 100 | "ALL";

export type VideoFilters = {
  query: string;
  social: string;
  postedDate: Date | null;
  publi: YesNoAll;
  repost: YesNoAll;
  order: "asc" | "desc";
  page: number;
  pageSize: PageSize;
};

export type VideoSocialPutPayload = {
  links: {
    id?: string;
    social_network_id: string;
    url: string;
    posted_at: string;
  }[];
};

export type VideoSocialLinkDTO = {
  id: string;
  social_network_id: string;
  url: string;
  posted_at: string;
  social_network: ISocialNetwork | null;
};

export type VideoSocialPutResponse = {
  video_id: string;
  links: VideoSocialLinkDTO[];
};
