declare namespace HotKeyAPI {
  type AuthenticatedUserData = {
    created_at?: string;
    display_name?: string;
    email?: string;
    email_verified_at?: string;
    id?: number;
    plan_type?: string;
    status?: string;
  };

  type AuthenticatedUserResponse = {
    code?: number;
    data?: AuthenticatedUserData;
    message?: string;
  };

  type AuthTokenData = {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    token_type?: string;
  };

  type AuthTokenResponse = {
    code?: number;
    data?: AuthTokenData;
    message?: string;
  };

  type CreateMonitorRequest = {
    alert_enabled?: boolean;
    language?: string;
    name?: string;
    poll_interval_minutes?: number;
    query_text?: string;
    region?: string;
  };

  type CreateReportRequest = {
    period_end?: string;
    period_start?: string;
    report_type?: string;
    send?: boolean;
  };

  type EmailRegisterRequest = {
    display_name: string;
    password: string;
    verification_ticket: string;
  };

  type ErrorBody = {
    code?: number;
    data?: any;
    message?: string;
  };

  type EventPlatformItem = {
    heat?: number;
    platform?: string;
    rank?: number;
    title?: string;
    url?: string;
  };

  type getHotEventParams = {
    /** Hot Event ID */
    id: number;
  };

  type getHotEventPostsParams = {
    /** Hot Event ID */
    id: number;
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

  type getReportHtmlParams = {
    /** Report ID */
    id: number;
  };

  type getReportParams = {
    /** Report ID */
    id: number;
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
    code?: number;
    data?: HealthBody;
    message?: string;
  };

  type HotEventDetail = {
    category?: string;
    first_seen_at?: string;
    heat_score?: number;
    id?: number;
    last_seen_at?: string;
    name?: string;
    platform?: string;
    platforms?: EventPlatformItem[];
    status?: string;
    summary?: string;
    trend?: string;
  };

  type HotEventItem = {
    category?: string;
    heat_score?: number;
    id?: number;
    name?: string;
    platform?: string;
    status?: string;
    summary?: string;
    trend?: string;
  };

  type HotEventListResponse = {
    code?: number;
    data?: HotEventItem[];
    message?: string;
    meta?: HotEventMeta;
  };

  type HotEventMeta = {
    total?: number;
  };

  type HotEventPostsResponse = {
    code?: number;
    data?: PostBrief[];
    message?: string;
  };

  type HotEventResponse = {
    code?: number;
    data?: HotEventDetail;
    message?: string;
  };

  type listHotEventsParams = {
    /** Status filter */
    status?: string;
    /** Platform filter */
    platform?: string;
    /** Sort field */
    sort?: string;
    /** Max results */
    limit?: number;
  };

  type listPostsParams = {
    /** Monitor ID */
    id: number;
    /** Limit */
    limit?: number;
    /** Offset */
    offset?: number;
  };

  type listReportsParams = {
    /** Max results */
    limit?: number;
    /** Offset */
    offset?: number;
    /** Filter by report type (daily|weekly) */
    report_type?: string;
  };

  type listTopicsParams = {
    /** Monitor ID */
    id: number;
  };

  type listTrendingParams = {
    /** Platform filter */
    platform?: string;
    /** Max results */
    limit?: number;
  };

  type LoginData = {
    token?: string;
    user?: UserData;
  };

  type LoginRequest = {
    email: string;
    password: string;
  };

  type LoginResponse = {
    code?: number;
    data?: LoginData;
    message?: string;
  };

  type MarkNotificationReadData = {
    read?: boolean;
  };

  type markNotificationReadParams = {
    /** Notification ID */
    id: number;
  };

  type MarkNotificationReadResponse = {
    code?: number;
    data?: MarkNotificationReadData;
    message?: string;
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
    code?: number;
    data?: MonitorData[];
    message?: string;
  };

  type MonitorResponse = {
    code?: number;
    data?: MonitorData;
    message?: string;
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
    code?: number;
    data?: NotificationData[];
    message?: string;
  };

  type PasswordResetRequest = {
    new_password: string;
    reset_token: string;
  };

  type PostBrief = {
    heat?: number;
    id?: number;
    platform?: string;
    seen_at?: string;
    title?: string;
    url?: string;
  };

  type PostListResponse = {
    code?: number;
    data?: PostSummary[];
    message?: string;
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

  type Report = {
    content?: string;
    created_at?: string;
    hotspot_count?: number;
    id?: number;
    period_end?: string;
    period_start?: string;
    report_type?: string;
    sent_at?: string;
    status?: string;
    subject?: string;
    summary?: string;
    updated_at?: string;
  };

  type ReportListResponse = {
    code?: number;
    data?: Report[];
    message?: string;
    page?: number;
    page_size?: number;
    total?: number;
  };

  type ReportResponse = {
    code?: number;
    data?: Report;
    message?: string;
  };

  type sendReportParams = {
    /** Report ID */
    id: number;
  };

  type TopicListResponse = {
    code?: number;
    data?: TopicSummary[];
    message?: string;
  };

  type TopicSummary = {
    current_heat?: number;
    id?: number;
    post_count?: number;
    summary?: string;
    title?: string;
    trend_direction?: string;
  };

  type TrendingItem = {
    heat?: number;
    platform?: string;
    rank?: number;
    title?: string;
    url?: string;
  };

  type TrendingListResponse = {
    code?: number;
    data?: TrendingItem[];
    message?: string;
  };

  type TrendListResponse = {
    code?: number;
    data?: TrendPoint[];
    message?: string;
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

  type VerificationConfirmRequest = {
    code: string;
    email: string;
    purpose: "register" | "reset_password";
  };

  type VerificationSendRequest = {
    email: string;
    purpose: "register" | "reset_password";
  };

  type VerificationSendResponse = {
    code?: number;
    data?: { email?: string };
    message?: string;
  };

  type VerificationTicketResponse = {
    code?: number;
    data?: { ticket?: string };
    message?: string;
  };
}
