declare namespace HotKeyAPI {
  type AiAnalysisRead = {
    /** Created At */
    created_at: string;
    /** Hotspot Id */
    hotspot_id: number;
    /** Id */
    id: number;
    /** Importance */
    importance: string;
    /** Is Real */
    is_real: boolean | null;
    /** Keyword Mentioned */
    keyword_mentioned: boolean;
    /** Model Name */
    model_name: string | null;
    /** Quick Understanding */
    quick_understanding?: string[];
    /** Raw Response */
    raw_response: Record<string, any>;
    /** Relevance Reason */
    relevance_reason: string | null;
    /** Relevance Score */
    relevance_score: string;
    /** Summary */
    summary: string | null;
    /** Topic Ideas */
    topic_ideas?: TopicIdeaRead[];
    /** Updated At */
    updated_at: string;
  };

  type AnalyticsSentimentPoint = {
    /** Count */
    count: number;
    /** Importance */
    importance: string;
  };

  type AnalyticsSentimentResponse = {
    /** By Importance */
    by_importance: AnalyticsSentimentPoint[];
    /** Period Days */
    period_days: number;
    /** Total */
    total: number;
  };

  type AnalyticsSourceResponse = {
    /** Items */
    items: AnalyticsSourceStat[];
    /** Limit */
    limit: number;
    /** Period Days */
    period_days: number;
  };

  type AnalyticsSourceStat = {
    /** Active Count */
    active_count: number;
    /** Filtered Count */
    filtered_count: number;
    /** Hotspot Count */
    hotspot_count: number;
    /** Source Id */
    source_id: number;
    /** Source Name */
    source_name: string;
  };

  type AnalyticsTrendPoint = {
    /** Active Count */
    active_count: number;
    /** Date */
    date: string;
    /** Filtered Count */
    filtered_count: number;
    /** Total Count */
    total_count: number;
  };

  type AnalyticsTrendResponse = {
    /** Period Days */
    period_days: number;
    /** Points */
    points: AnalyticsTrendPoint[];
  };

  type AuthResponse = {
    /** Access Token */
    access_token: string;
    /** Token Type */
    token_type?: string;
    user: UserRead;
  };

  type CheckRunCreate = {
    /** Trigger Type */
    trigger_type?: string;
  };

  type CheckRunRead = {
    /** Created At */
    created_at: string;
    /** Error Summary */
    error_summary: string | null;
    /** Failure Count */
    failure_count: number;
    /** Finished At */
    finished_at: string | null;
    /** Id */
    id: number;
    /** Started At */
    started_at: string;
    /** Status */
    status: string;
    /** Success Count */
    success_count: number;
    /** Trigger Type */
    trigger_type: string;
    /** Updated At */
    updated_at: string;
  };

  type deleteKeywordApiKeywordsKeywordIdDeleteParams = {
    keyword_id: number;
  };

  type deleteSourceApiSourcesSourceIdDeleteParams = {
    source_id: number;
  };

  type EmailLoginRequest = {
    /** Email */
    email: string;
    /** Password */
    password: string;
  };

  type EmailRegisterRequest = {
    /** Display Name */
    display_name?: string | null;
    /** Email */
    email: string;
    /** Password */
    password: string;
  };

  type getCheckRunApiCheckRunsRunIdGetParams = {
    run_id: number;
  };

  type getHotspotApiHotspotsHotspotIdGetParams = {
    hotspot_id: number;
  };

  type getReportApiReportsReportIdGetParams = {
    report_id: number;
  };

  type getReportHtmlApiReportsReportIdHtmlGetParams = {
    report_id: number;
  };

  type GitHubAuthInitResponse = {
    /** Authorization Url */
    authorization_url: string;
  };

  type githubCallbackApiAuthGithubCallbackGetParams = {
    code?: string | null;
    state?: string | null;
  };

  type HotspotRead = {
    ai_analysis?: AiAnalysisRead | null;
    /** Author */
    author: string | null;
    /** Cluster Id */
    cluster_id?: string | null;
    /** Created At */
    created_at: string;
    /** Fetched At */
    fetched_at: string;
    /** Id */
    id: number;
    keyword?: KeywordRead | null;
    /** Keyword Id */
    keyword_id: number | null;
    /** Published At */
    published_at: string | null;
    /** Rank Score */
    rank_score?: number;
    /** Raw Payload */
    raw_payload: Record<string, any>;
    /** Snippet */
    snippet: string | null;
    source?: SourceRead | null;
    /** Source Id */
    source_id: number;
    /** Status */
    status: string;
    /** Title */
    title: string;
    /** Trend Score */
    trend_score?: number;
    /** Updated At */
    updated_at: string;
    /** Url */
    url: string;
  };

  type HTTPValidationError = {
    /** Detail */
    detail?: ValidationError[];
  };

  type KeywordCreate = {
    /** Enabled */
    enabled?: boolean;
    /** Keyword */
    keyword: string;
    /** Priority */
    priority?: number;
    /** Query Template */
    query_template?: string | null;
  };

  type KeywordRead = {
    /** Created At */
    created_at: string;
    /** Enabled */
    enabled?: boolean;
    /** Id */
    id: number;
    /** Keyword */
    keyword: string;
    /** Priority */
    priority?: number;
    /** Query Template */
    query_template?: string | null;
    /** Updated At */
    updated_at: string;
  };

  type keywordRssRssKeywordKeywordNameGetParams = {
    keyword_name: string;
    limit?: number;
    token?: string | null;
  };

  type KeywordUpdate = {
    /** Enabled */
    enabled?: boolean | null;
    /** Keyword */
    keyword?: string | null;
    /** Priority */
    priority?: number | null;
    /** Query Template */
    query_template?: string | null;
  };

  type listCheckRunsApiCheckRunsGetParams = {
    limit?: number;
    offset?: number;
  };

  type listHotspotsApiHotspotsGetParams = {
    keyword_id?: number | null;
    source_id?: number | null;
    importance?: string | null;
    published_from?: string | null;
    published_to?: string | null;
    sort?: string;
    limit?: number;
    offset?: number;
  };

  type listNotificationsApiNotificationsGetParams = {
    status?: string | null;
    limit?: number;
    offset?: number;
  };

  type listReportsApiReportsGetParams = {
    report_type?: "daily" | "weekly" | null;
    limit?: number;
    offset?: number;
  };

  type MiniappLoginRequest = {
    /** Avatar Url */
    avatar_url?: string | null;
    /** Display Name */
    display_name?: string | null;
    /** Openid */
    openid: string;
    /** Provider */
    provider: string;
  };

  type ReportCreate = {
    /** Period Start */
    period_start?: string | null;
    /** Report Type */
    report_type?: "daily" | "weekly";
    /** Send */
    send?: boolean;
  };

  type ReportRead = {
    /** Content */
    content: string;
    /** Created At */
    created_at: string;
    /** Hotspot Count */
    hotspot_count: number;
    /** Id */
    id: number;
    /** Period End */
    period_end: string;
    /** Period Start */
    period_start: string;
    /** Report Type */
    report_type: string;
    /** Sent At */
    sent_at: string | null;
    /** Status */
    status: string;
    /** Subject */
    subject: string;
    /** Summary */
    summary: string | null;
    /** Updated At */
    updated_at: string;
  };

  type SearchCreate = {
    /** Limit */
    limit?: number;
    /** Query */
    query: string;
    /** Source Types */
    source_types?: string[] | null;
  };

  type SearchRead = {
    /** Errors */
    errors: string[];
    /** Items */
    items: SearchResultRead[];
    /** Query */
    query: string;
  };

  type SearchResultRead = {
    /** Author */
    author: string | null;
    /** Importance */
    importance: string;
    /** Keyword Mentioned */
    keyword_mentioned: boolean;
    /** Published At */
    published_at: string | null;
    /** Raw Payload */
    raw_payload: Record<string, any>;
    /** Relevance Reason */
    relevance_reason: string;
    /** Relevance Score */
    relevance_score: number;
    /** Snippet */
    snippet: string | null;
    /** Source Id */
    source_id: number;
    /** Source Name */
    source_name: string;
    /** Source Type */
    source_type: string;
    /** Status */
    status: string;
    /** Summary */
    summary: string;
    /** Title */
    title: string;
    /** Url */
    url: string;
  };

  type sendExistingReportApiReportsReportIdSendPostParams = {
    report_id: number;
  };

  type sentimentApiAnalyticsSentimentGetParams = {
    days?: number;
  };

  type SettingRead = {
    /** Created At */
    created_at: string;
    /** Description */
    description: string | null;
    /** Key */
    key: string;
    /** Updated At */
    updated_at: string;
    /** Value */
    value: Record<string, any>;
  };

  type SettingUpsert = {
    /** Description */
    description?: string | null;
    /** Value */
    value?: Record<string, any>;
  };

  type SourceCreate = {
    /** Config */
    config?: Record<string, any>;
    /** Enabled */
    enabled?: boolean;
    /** Name */
    name: string;
    /** Source Type */
    source_type: string;
  };

  type SourceRead = {
    /** Config */
    config?: Record<string, any>;
    /** Created At */
    created_at: string;
    /** Enabled */
    enabled?: boolean;
    /** Id */
    id: number;
    /** Name */
    name: string;
    /** Source Type */
    source_type: string;
    /** Updated At */
    updated_at: string;
  };

  type sourcesApiAnalyticsSourcesGetParams = {
    days?: number;
    limit?: number;
  };

  type SourceUpdate = {
    /** Config */
    config?: Record<string, any> | null;
    /** Enabled */
    enabled?: boolean | null;
    /** Name */
    name?: string | null;
    /** Source Type */
    source_type?: string | null;
  };

  type toggleKeywordApiKeywordsKeywordIdTogglePostParams = {
    keyword_id: number;
  };

  type toggleSourceApiSourcesSourceIdTogglePostParams = {
    source_id: number;
  };

  type TokenRefreshResponse = {
    /** Access Token */
    access_token: string;
    /** Token Type */
    token_type?: string;
    user: UserRead;
  };

  type TopicIdeaRead = {
    /** Angle */
    angle?: string;
    /** Format */
    format?: string;
    /** Rationale */
    rationale?: string;
    /** Title */
    title: string;
  };

  type trendApiAnalyticsTrendGetParams = {
    days?: number;
  };

  type trendingRssRssTrendingGetParams = {
    limit?: number;
  };

  type updateKeywordApiKeywordsKeywordIdPatchParams = {
    keyword_id: number;
  };

  type updateSourceApiSourcesSourceIdPatchParams = {
    source_id: number;
  };

  type upsertSettingApiSettingsKeyPutParams = {
    key: string;
  };

  type UserRead = {
    /** Avatar Url */
    avatar_url: string | null;
    /** Created At */
    created_at: string;
    /** Display Name */
    display_name?: string | null;
    /** Email */
    email: string | null;
    /** Github Id */
    github_id?: number | null;
    /** Github Login */
    github_login?: string | null;
    /** Github Name */
    github_name: string | null;
    /** Id */
    id: number;
    /** Is Active */
    is_active: boolean;
    /** Last Login At */
    last_login_at: string | null;
    /** Platform Openid */
    platform_openid?: string | null;
    /** Platform Provider */
    platform_provider?: string | null;
    /** Updated At */
    updated_at: string;
  };

  type userRssRssUserUserIdGetParams = {
    user_id: number;
    limit?: number;
    token?: string | null;
  };

  type ValidationError = {
    /** Context */
    ctx?: Record<string, any>;
    /** Input */
    input?: any;
    /** Location */
    loc: (string | number)[];
    /** Message */
    msg: string;
    /** Error Type */
    type: string;
  };
}
