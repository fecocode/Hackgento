// REQUESTS

export type RAW_CREATE_USER_POST_REQUEST_BODY = {
  text: string;
  parent_post_id?: string,
}

export type RAW_EDIT_USER_POST_REQUEST_BODY = {
  id: string;
  text: string;
}

export type RAW_DELETE_USER_POST_REQUEST_BODY = {
  id: string;
}

export type RAW_GET_POST_BY_ID = {
  id: string;
}

// RESPONSES

export type RAW_USER_POST_RESPONSE_DATA = {
  id: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  deleted?: boolean;
  text: string;
  category?: string;
  user_id: string;
  author: {
    username: string;
    avatar: string;
  };
  fav_count: number;
  replies_count: number;
  parent_post_id?: string;
  replies?: RAW_USER_POST_RESPONSE_DATA[],
  parent_post?: RAW_USER_POST_RESPONSE_DATA,
  picture_url?: string;
}

export type PARTIAL_RAW_USER_POST_UPDATED_DATA = {
  text: string;
  picture_url?: string;
  category?: string | null;
  updated_at: Date;
}

export type RAW_NEW_FAV_STORED_RESPONSE = {
  created_at: Date,
  post_id: string,
  fav_count: number,
  id: string,
}

export type RAW_UNFAV_RESPONSE = {
  post_id: string,
  fav_count: number,
  id: string,
}

export type RAW_AUTHOR_RESPONSE_DATA = {
  id: string;
  username: string;
  avatar: string;
  followers: number;
  following: boolean;
  follow_me: boolean;
  posts: RAW_USER_POST_RESPONSE_DATA[];
}

export type RAW_USER_NOTIFICATION_DATA = {
  id: string;
  user_id: string;
  text: string;
  created_at: Date;
  link: string;
  image_url: string;
}