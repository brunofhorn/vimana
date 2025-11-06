export interface ITitlePage {
  title: string;
}

export interface Loadings {
  social: boolean;
  social_editing: boolean;
  social_deleting: boolean;
  video: boolean;
  video_editing: boolean; 
  video_deleting: boolean
  video_social_networks: boolean
}

export interface HandleLoadingParams {
  key: keyof Loadings;
  value: boolean;
}
