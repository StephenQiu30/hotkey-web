/// <reference path="../src/services/hotkey/hotkey-server/typings.d.ts" />

type HotspotItem = HotKeyAPI.HotspotRead & {
  saved: boolean;
};

const topicIdeas: HotKeyAPI.TopicIdeaRead[] = [
  {
    title: "3 分钟看懂 AI agent 工作流为什么又火了",
    angle: "从创作者日常生产效率切入，拆解新工具链的可复制价值。",
    format: "短视频脚本",
    rationale: "适合快速承接技术圈热度，并转成普通用户能理解的内容。",
  },
  {
    title: "普通创作者如何用 agent 搭一个热点监控台",
    angle: "用低门槛案例解释工具组合、素材流和选题判断。",
    format: "图文教程",
    rationale: "能自然引导收藏、关注和后续系列内容。",
  },
];

const hotspots: HotspotItem[] = [
  {
    id: 101,
    title: "AI agent 工作流成为创作者工具新热点",
    url: "https://example.com/agent-workflow",
    source_id: 1,
    keyword_id: 1,
    author: "GitHub Trending",
    snippet: "多个开源项目开始围绕 agent 工作流提供模板、调度和内容生产插件。",
    published_at: "2026-05-24T09:00:00Z",
    fetched_at: "2026-05-24T09:20:00Z",
    status: "active",
    cluster_id: "ai-agent-workflow",
    rank_score: 91,
    trend_score: 78,
    raw_payload: {},
    created_at: "2026-05-24T09:20:00Z",
    updated_at: "2026-05-24T09:20:00Z",
    ai_analysis: {
      id: 1,
      hotspot_id: 101,
      is_real: true,
      relevance_score: "92.00",
      relevance_reason: "与创作者工具和自动化内容生产高度相关。",
      keyword_mentioned: true,
      importance: "high",
      summary: "AI agent 工具链正在从开发者圈扩散到内容生产流程。",
      quick_understanding: ["热度来自开源工具集中发布。", "创作者可把它转化为效率工具教程。", "适合做系列化选题。"],
      topic_ideas: topicIdeas,
      model_name: "local-fallback",
      raw_response: {},
      created_at: "2026-05-24T09:20:00Z",
      updated_at: "2026-05-24T09:20:00Z",
    },
    saved: true,
  },
  {
    id: 102,
    title: "搜索 API 聚合让小团队也能做热点雷达",
    url: "https://example.com/search-api-radar",
    source_id: 2,
    keyword_id: 2,
    author: "Hacker News",
    snippet: "公开搜索和 RSS 源组合降低了热点采集门槛。",
    published_at: "2026-05-24T08:10:00Z",
    fetched_at: "2026-05-24T08:30:00Z",
    status: "active",
    cluster_id: "public-source-radar",
    rank_score: 82,
    trend_score: 66,
    raw_payload: {},
    created_at: "2026-05-24T08:30:00Z",
    updated_at: "2026-05-24T08:30:00Z",
    ai_analysis: null,
    saved: false,
  },
  {
    id: 103,
    title: "小程序提醒成为热点跟进的轻量入口",
    url: "https://example.com/miniapp-alert",
    source_id: 3,
    keyword_id: 3,
    author: "RSS",
    snippet: "内容团队希望在手机端快速查看收藏和提醒状态。",
    published_at: "2026-05-24T07:40:00Z",
    fetched_at: "2026-05-24T07:50:00Z",
    status: "active",
    cluster_id: "miniapp-alert",
    rank_score: 74,
    trend_score: 58,
    raw_payload: {},
    created_at: "2026-05-24T07:50:00Z",
    updated_at: "2026-05-24T07:50:00Z",
    ai_analysis: null,
    saved: false,
  },
];

const trendPoints = [34, 42, 40, 58, 64, 73, 88];
const selected = hotspots[0];

// Generated client source: src/services/hotkey/hotkey-server
export default function CreatorWorkbenchPage() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">HotKey</div>
        <nav className="nav-list" aria-label="主导航">
          <a className="active">热点榜单</a>
          <a>趋势分析</a>
          <a>收藏关注</a>
          <a>通知配置</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>内容创作者工作台</h1>
            <p>聚合公开源热点，快速理解事件，并生成可执行选题。</p>
          </div>
          <div className="search-box">搜索热点、关键词、来源</div>
        </header>

        <div className="summary-grid">
          <Metric label="今日热点" value="128" delta="+24%" />
          <Metric label="高相关热点" value="36" delta="+11%" />
          <Metric label="已收藏" value="18" delta="+5" />
          <Metric label="待提醒" value="7" delta="今日" />
        </div>

        <div className="main-grid">
          <section className="panel ranking-panel">
            <div className="panel-head">
              <h2>热点榜单</h2>
              <span>rank_score_desc</span>
            </div>
            <div className="hotspot-list">
              {hotspots.map((item, index) => (
                <article className={index === 0 ? "hotspot-row selected" : "hotspot-row"} key={item.id}>
                  <span className="rank">{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.snippet}</p>
                    <div className="row-meta">
                      <span>{item.author}</span>
                      <span>热度 {item.trend_score}</span>
                      <span>排行 {item.rank_score}</span>
                    </div>
                  </div>
                  <button className={item.saved ? "icon-button saved" : "icon-button"} aria-label="收藏关注">
                    {item.saved ? "已" : "+"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel detail-panel">
            <div className="panel-head">
              <h2>快速理解</h2>
              <span>{selected.cluster_id}</span>
            </div>
            <h3>{selected.title}</h3>
            <p className="detail-summary">{selected.ai_analysis?.summary}</p>
            <ul className="understanding-list">
              {selected.ai_analysis?.quick_understanding?.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <div className="panel-head nested">
              <h2>内容选题</h2>
              <button>生成选题</button>
            </div>
            <div className="idea-list">
              {selected.ai_analysis?.topic_ideas?.map((idea) => (
                <article className="idea-card" key={idea.title}>
                  <h4>{idea.title}</h4>
                  <p>{idea.angle}</p>
                  <div>
                    <span>{idea.format}</span>
                    <span>{idea.rationale}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="insight-grid">
          <section className="panel">
            <div className="panel-head">
              <h2>趋势分析</h2>
              <span>7 日</span>
            </div>
            <div className="trend-chart" aria-label="趋势曲线">
              {trendPoints.map((value, index) => (
                <i key={index} style={{ height: `${value}%` }} />
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>来源分布</h2>
              <span>公开源</span>
            </div>
            <div className="source-bars">
              <SourceBar label="GitHub Trending" value={46} />
              <SourceBar label="Hacker News" value={32} />
              <SourceBar label="RSS" value={22} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
    </section>
  );
}

function SourceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="source-row">
      <span>{label}</span>
      <b>{value}%</b>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}
