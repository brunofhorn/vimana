interface VideoSocialNetwork {
  id: string;
  url: string;
  socialNetwork: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface Video {
  id: string;
  title: string;
  description?: string | null;
  tags?: string[] | null; // <- agora array, não string
  cover_image_url?: string | null;
  raw_video_url?: string | null;
  created_at?: string; // ISO
  createdAt?: string; // se você cameliza em algum lugar
  socialNetworks?: Array<{
    id: string;
    url: string;
    socialNetwork?: { name: string; icon: string };
    social_network?: { name: string; icon: string };
  }>;
  links?: Video["socialNetworks"]; // fallback
}
