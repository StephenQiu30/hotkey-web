declare namespace HotKeyAPI {
  type CreateMonitorRequest = {
    alert_enabled?: boolean;
    language?: string;
    name?: string;
    poll_interval_minutes?: number;
    query_text?: string;
    region?: string;
  };

  type ErrorBody = {
    code?: string;
    error?: string;
    request_id?: string;
  };

  type getMonitorParams = {
    /** Monitor ID */
    id: number;
  };

  type getMonitorTrendsParams = {
    /** Monitor ID */
    id: number;
    /** RFC3339 start time */
    since?: string;
  };

  type getTopicTrendsParams = {
    /** Topic ID */
    id: number;
    /** RFC3339 start time */
    since?: string;
  };

  type HealthBody = {
    status?: string;
  };

  type HealthResponse = {
    data?: HealthBody;
    request_id?: string;
  };

  type listPostsParams = {
    /** Monitor ID */
    id: number;
    /** Limit */
    limit?: number;
    /** Offset */
    offset?: number;
  };

  type listTopicsParams = {
    /** Monitor ID */
    id: number;
  };

  type LoginData = {
    token?: string;
    user?: UserData;
  };

  type LoginRequest = {
    email?: string;
    password?: string;
  };

  type LoginResponse = {
    data?: LoginData;
    request_id?: string;
  };

  type MarkNotificationReadData = {
    read?: boolean;
  };

  type markNotificationReadParams = {
    /** Notification ID */
    id: number;
  };

  type MarkNotificationReadResponse = {
    data?: MarkNotificationReadData;
    request_id?: string;
  };

  type MonitorData = {
    alert_enabled?: boolean;
    id?: number;
    language?: string;
    name?: string;
    poll_interval_minutes?: number;
    query_text?: string;
    region?: string;
    status?: string;
    user_id?: number;
  };

  type MonitorListResponse = {
    data?: MonitorData[];
    request_id?: string;
  };

  type MonitorResponse = {
    data?: MonitorData;
    request_id?: string;
  };

  type NotificationData = {
    alert_id?: number;
    channel?: string;
    created_at?: string;
    delivery_status?: string;
    id?: number;
    read_at?: string;
    user_id?: number;
  };

  type NotificationListResponse = {
    data?: NotificationData[];
    request_id?: string;
  };

  type PostListResponse = {
    data?: PostSummary[];
    request_id?: string;
  };

  type PostSummary = {
    author_handle?: string;
    author_name?: string;
    content_lang?: string;
    content_text?: string;
    final_score?: number;
    freshness_score?: number;
    heat_score?: number;
    id?: number;
    like_count?: number;
    matched_keywords?: string[];
    platform_post_id?: string;
    published_at?: string;
    quote_count?: number;
    relevance_score?: number;
    reply_count?: number;
    repost_count?: number;
    view_count?: number;
  };

  type RegisterRequest = {
    display_name?: string;
    email?: string;
    password?: string;
  };

  type TopicListResponse = {
    data?: TopicSummary[];
    request_id?: string;
  };

  type TopicSummary = {
    current_heat?: number;
    id?: number;
    post_count?: number;
    summary?: string;
    title?: string;
    trend_direction?: string;
  };

  type TrendListResponse = {
    data?: TrendPoint[];
    request_id?: string;
  };

  type TrendPoint = {
    heat_score?: number;
    time?: string;
    trend_direction?: string;
    trend_velocity?: number;
  };

  type updateMonitorParams = {
    /** Monitor ID */
    id: number;
  };

  type UpdateMonitorRequest = {
    alert_enabled?: boolean;
    language?: string;
    name?: string;
    poll_interval_minutes?: number;
    query_text?: string;
    region?: string;
    status?: string;
  };

  type UserData = {
    display_name?: string;
    email?: string;
    id?: number;
  };

  type UserResponse = {
    data?: UserData;
    request_id?: string;
  };
}
