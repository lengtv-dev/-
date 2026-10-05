export interface UserInfo {
  username: string;
  password?: string;
  message?: string;
  auth: number;
  status: string;
  exp_date?: string | number | null;
  is_trial?: string | number;
  active_cons?: string | number;
  created_at?: string | number;
  max_connections?: string | number;
  allowed_output_formats?: string[];
}

export interface ServerInfo {
  url?: string;
  port?: string;
  https_port?: string;
  server_protocol?: string;
  rtmp_port?: string;
  timezone?: string;
  time_now?: string;
}

export interface XtreamAuthResponse {
  user_info: UserInfo;
  server_info: ServerInfo;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id?: number | string;
}

export interface LiveStream {
  num?: number;
  name: string;
  stream_type?: string;
  stream_id: number | string;
  stream_icon?: string;
  epg_channel_id?: string;
  added?: string;
  category_id?: string;
  custom_sid?: string;
  tv_archive?: number;
  direct_source?: string;
  is_adult?: boolean;
}

export interface VodStream {
  num?: number;
  name: string;
  title?: string;
  stream_type?: string;
  stream_id: number | string;
  stream_icon?: string;
  rating?: string | number;
  rating_5based?: number;
  added?: string;
  category_id?: string;
  container_extension?: string;
  year?: string;
  is_adult?: boolean;
}

export interface SeriesItem {
  num?: number;
  name: string;
  title?: string;
  series_id: number | string;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  last_modified?: string;
  rating?: string;
  rating_5based?: number;
  category_id?: string;
  is_adult?: boolean;
  isCustom?: boolean;
  episodes?: Array<{ title: string; url: string; id?: string }>;
}

export interface Episode {
  id: string | number;
  episode_num?: number;
  title: string;
  container_extension?: string;
  info?: any;
  custom_sid?: string;
  direct_source?: string;
}

export interface EpgProgram {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  isNow?: boolean;
  progress?: number;
}

export interface WatchHistoryItem {
  id: string | number;
  name: string;
  kind: 'live' | 'vod' | 'series' | 'custom_series';
  cover?: string;
  pos: number;
  duration?: number;
  ts: number;
  epIndex?: number;
  ext?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  createdAt: number;
}
