# HotKey 工作台方案 2 — Design QA

- Source visual truth: `/Users/stephenqiu/.codex/generated_images/019fca8b-32dc-78e0-ab7c-61b52dd860f8/exec-26a1195a-1082-4cea-9532-1aff4c0066d4.png`
- Normalized source: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/08-reference-normalized-1440.png`
- Implementation screenshot: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/15-official-components-1440.png`
- Full-view comparison: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/16-comparison-official-components.png`
- Focused header comparison: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/13-comparison-focus-header.png`
- Focused evidence comparison: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/14-comparison-focus-evidence.png`
- Responsive evidence: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/10-implementation-mobile-390.png`
- Viewport: 1440 × 1024 CSS px; mobile check 390 × 844 CSS px
- Pixel dimensions: source 1487 × 1058, normalized to 1440 × 1024; implementation 1440 × 1024
- Density normalization: both comparison inputs are 1× and 1440 × 1024 after proportional source normalization
- State: authenticated administrator, dashboard, evidence tab selected, AI assistant collapsed
- Browser: agent-browser headed session selected by the user

## Findings

- No actionable P0/P1/P2 differences remain.
- [Expected data constraint] The design reference depicts six fully populated evidence rows, while the live API currently returns six event members whose content details are unreadable. The implementation deliberately shows the truthful Chinese state “已读取 0 条，6 条暂不可读” instead of fabricating sources or claims.
- [Expected data constraint] The live event does not currently provide `title_zh`, intelligence entities, or verified claims. The implementation falls back to the source-language title, keeps all surrounding explanatory UI in Chinese, and conditionally omits empty entity/claim sections.

## Required Fidelity Surfaces

- Fonts and typography: passed. The existing Geist/SF/Segoe stack is preserved; headline scale, weight, line-height, metadata size, and Chinese hierarchy match the selected direction without introducing a new font dependency.
- Spacing and layout rhythm: passed. The page uses the selected 58/42 desktop split, restrained 48 px outer rhythm, hairline section dividers, compact metadata, and a single full-width assistant bar. The mobile layout collapses to one column without horizontal overflow.
- Colors and visual tokens: passed. Existing blue/white tokens remain the base; green is limited to running/readable states and amber to unavailable evidence. Borders and shadows are reduced relative to the prior page.
- Image quality and asset fidelity: passed. The selected design contains no photographic or illustrative assets. Existing brand artwork and the repository's Lucide icon system are reused; no placeholder, CSS drawing, handcrafted SVG, or fake raster asset was introduced.
- Copy and content: passed with the live-data constraints above. Navigation, explanations, empty states, actions, and status language are Chinese-first and describe actual API state.

## Interaction And Browser Verification

- Primary navigation renders with 工作台、采集内容、报告中心、发布订阅.
- Administrator-only 热点监控 and 来源管理 are available from the secondary 管理 menu.
- 信号、证据、报告 tabs switch correctly.
- AI 情报助手 expands and collapses; 提取实体 and 生成摘要 remain wired to the generated OpenAPI client.
- 查看完整报告 and evidence reading paths remain real links.
- Browser page errors: none.
- Console: no new dashboard runtime errors; only development/HMR messages and stale warnings from previously visited authentication routes were present in the long-lived session.

## Comparison History

### Pass 1

- [P1] The primary report CTA stretched across the left column because it inherited the cross-axis size of a column flex container.
- Fix: added an explicit `self-start` constraint so the button returns to a compact primary action.
- Evidence before fix: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/09-comparison-pass-1.png`

### Pass 2

- The CTA is compact, the two-column balance matches the visual target, and no P0/P1/P2 issue remains.
- Post-fix evidence: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/12-comparison-pass-2.png`

### Pass 3

- Replaced custom interactive primitives with the repository's official `Button`, `Badge`, `Separator`, `DropdownMenu`, and `Avatar` components without changing the selected layout.
- Verified that focus treatment, control sizing, navigation hierarchy, two-column proportions, and responsive behavior did not regress.
- Evidence: `/Users/stephenqiu/Desktop/StephenQiu/HotKey/hotkey-web/product-design-output/admin-dashboard-redesign-20260804/screenshots/16-comparison-official-components.png`

## Follow-up Polish

- [P3] When the backend begins returning `title_zh`, entities, claims, and readable content details, the live page will naturally fill the corresponding selected-design regions without frontend changes.

## Implementation Checklist

- [x] Preserve existing OpenAPI-generated service calls and permissions.
- [x] Replace KPI/card-heavy hierarchy with an event/evidence split workspace.
- [x] Keep AI assistance compact and user-controlled.
- [x] Move operational navigation into a secondary administrator menu.
- [x] Verify desktop and mobile layouts, primary interactions, typecheck, generated API contract, full tests, and production build.

final result: passed
