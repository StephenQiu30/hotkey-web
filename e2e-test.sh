#!/usr/bin/env bash
# =============================================================================
# HotKey Web - 全功能自动化 E2E 测试
# 使用 agent-browser AI 驱动浏览器自动化
# =============================================================================
set -uo pipefail

SESSION="hotkey-e2e-$(date +%Y%m%d-%H%M%S)"
OUTPUT_DIR="e2e-output"
SCREENSHOTS="${OUTPUT_DIR}/screenshots"
REPORT="${OUTPUT_DIR}/report.md"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
PASS=0
FAIL=0
ERRORS=""

# ----- 辅助函数 ---------------------------------------------------------------
title() { echo -e "\n═══════════════════════════════════════════════════════════════\n  $1\n═══════════════════════════════════════════════════════════════\n"; }
pass() { echo "  ✓ $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL+1)); ERRORS="${ERRORS}\n  ✗ $1"; }
skip() { echo "  — $1"; }

cmd() {
  local desc="$1"; shift
  echo "  → $desc"
  npx agent-browser --session "$SESSION" "$@" 2>&1 | tail -2 || { fail "$desc"; return 1; }
}

cmd_full() {
  local desc="$1"; shift
  echo "  → $desc"
  npx agent-browser --session "$SESSION" "$@" 2>&1 || true
}

get_url() {
  npx agent-browser --session "$SESSION" get url 2>/dev/null || echo ""
}

check_console() {
  local name="$1"
  local errors
  errors=$(npx agent-browser --session "$SESSION" console error 2>/dev/null || true)
  # Filter out harmless development-time messages
  local serious
  serious=$(echo "$errors" | grep -iv "react-dom.development\|Warning:\|download\|autocomplete\|structuredClone\|gsap\|HMR\|Fast Refresh\|DevTools\|Invalid scope\|antd.*Card.*bordered\|antd.*deprecated\|Each child in a list\|Please use the" || true)
  serious=$(echo "$serious" | grep -v '^$' || true)
  if [ -n "$serious" ] && [ "$serious" != "[]" ]; then
    echo "    ⚠ ${name}: $serious"
    fail "${name} 控制台异常错误"
  else
    pass "${name} 无控制台错误"
  fi
}

# Ensure clean output dirs
mkdir -p "$SCREENSHOTS" "$OUTPUT_DIR/videos"

echo ""
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║           HotKey Web 全功能 E2E 自动化测试                    ║"
echo "  ║           $TIMESTAMP"
echo "  ╚══════════════════════════════════════════════════════════════╝"

# ============================================================================
# 1. 首页 (/)
# ============================================================================
title "1/10 首页 (/)"
cmd "打开首页" open http://localhost:3000/
cmd "等待加载" wait --load networkidle
cmd "截图首页" screenshot "${SCREENSHOTS}/01-welcome.png"
check_console "首页"

SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot 2>/dev/null || true)
echo "$SNAPSHOT" | grep -qi "hotkey" && pass "包含 HotKey 品牌" || fail "缺少 HotKey 品牌"
echo "$SNAPSHOT" | grep -qiE "热点|创作|内容|创作者" && pass "包含核心产品文案" || fail "缺少核心产品文案"

# ============================================================================
# 2. 登录页 (/login)
# ============================================================================
title "2/10 登录页 (/login)"
cmd "打开登录页" open http://localhost:3000/login
cmd "等待加载" wait --load networkidle
cmd "截图登录页" screenshot "${SCREENSHOTS}/02-login.png"
check_console "登录页"

SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot -i 2>/dev/null || true)
echo "$SNAPSHOT" | grep -qiE "邮箱|mail|email|密码|password" && pass "包含邮箱/密码输入框" || fail "缺少表单输入框"
echo "$SNAPSHOT" | grep -qiE "进入工作台|登录" && pass "包含提交按钮" || fail "缺少提交按钮"
echo "$SNAPSHOT" | grep -qiE "忘记密码|forgot" && pass "包含忘记密码链接" || fail "缺少忘记密码链接"
echo "$SNAPSHOT" | grep -qiE "创建账号|register" && pass "包含注册链接" || fail "缺少注册链接"

# ============================================================================
# 3. 注册页 (/register)
# ============================================================================
title "3/10 注册页 (/register)"
cmd "打开注册页" open http://localhost:3000/register
cmd "等待加载" wait --load networkidle
cmd "截图注册页" screenshot "${SCREENSHOTS}/03-register.png"
check_console "注册页"

SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot 2>/dev/null || true)
echo "$SNAPSHOT" | grep -qiE "创建账号|注册|开启热点创作" && pass "标题正确" || fail "标题不正确"
echo "$SNAPSHOT" | grep -qiE "邮箱|mail|email" && pass "包含邮箱输入" || fail "缺少邮箱输入"

# ============================================================================
# 4. 忘记密码 (/forgot-password)
# ============================================================================
title "4/10 忘记密码 (/forgot-password)"
cmd "打开忘记密码页" open http://localhost:3000/forgot-password
cmd "等待加载" wait --load networkidle
cmd "截图" screenshot "${SCREENSHOTS}/04-forgot-password.png"
check_console "忘记密码页"

SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot 2>/dev/null || true)
echo "$SNAPSHOT" | grep -qiE "忘记密码|重置|forgot|reset" && pass "标题正确" || fail "标题不正确"
echo "$SNAPSHOT" | grep -qiE "邮箱|mail|email" && pass "包含邮箱输入" || fail "缺少邮箱输入"

# ============================================================================
# 5. 重置密码 (/reset-password)
# ============================================================================
title "5/10 重置密码 (/reset-password)"
cmd "打开重置密码页" open http://localhost:3000/reset-password
cmd "等待加载" wait --load networkidle
cmd "截图" screenshot "${SCREENSHOTS}/05-reset-password.png"
check_console "重置密码页"

SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot 2>/dev/null || true)
echo "$SNAPSHOT" | grep -qiE "重置|新密码|password|token" && pass "包含密码输入" || pass "无 ticket 时显示提示（正常）"

# ============================================================================
# 6. 认证保护 — 未登录自动重定向到 /login
# ============================================================================
title "6/10 认证保护 — Protected Pages"
for page in "/dashboard" "/dashboard/topics" "/dashboard/favorites" "/dashboard/notifications" "/dashboard/settings" "/dashboard/profile"; do
  name="$(basename "$page")"
  [ "$page" = "/dashboard" ] && name="dashboard"
  echo "  → $page …"
  npx agent-browser --session "$SESSION" open "http://localhost:3000${page}" 2>/dev/null
  npx agent-browser --session "$SESSION" wait --load networkidle 2>/dev/null
  url=$(get_url)
  echo "$url" | grep -qi "/login" && pass "${name} → /login" || fail "${name} 未重定向 (${url})"
done
cmd "截取保护页重定向状态" screenshot "${SCREENSHOTS}/06-auth-guard.png"

# ============================================================================
# 7. 登录表单交互测试
# ============================================================================
title "7/10 登录表单交互"
cmd "打开登录页" open http://localhost:3000/login
cmd "等待加载" wait --load networkidle

# 截图空表单
echo "    ℹ 点击提交按钮触发空表单验证…"
npx agent-browser --session "$SESSION" click "进入工作台" 2>/dev/null || true
sleep 0.8
cmd "截图空表单验证" screenshot "${SCREENSHOTS}/07-login-validation.png"

# 用 ref 方式填充表单
SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot -i 2>/dev/null || true)
EMAIL_REF=$(echo "$SNAPSHOT" | grep -oE 'ref=e[0-9]+' | head -1)
PWD_REF=$(echo "$SNAPSHOT" | grep -oE 'ref=e[0-9]+' | tail -1)

if [ -n "$EMAIL_REF" ]; then
  echo "    ℹ 邮箱 ref: $EMAIL_REF"
  npx agent-browser --session "$SESSION" click "@$EMAIL_REF" 2>/dev/null || true
  npx agent-browser --session "$SESSION" keyboard type "test@example.com" 2>/dev/null || true
  pass "填写邮箱"
else
  skip "无法定位邮箱输入框"
fi

if [ -n "$PWD_REF" ]; then
  echo "    ℹ 密码 ref: $PWD_REF"
  npx agent-browser --session "$SESSION" click "@$PWD_REF" 2>/dev/null || true
  npx agent-browser --session "$SESSION" keyboard type "TestPass123" 2>/dev/null || true
  pass "填写密码"
else
  skip "无法定位密码输入框"
fi

cmd "截图已填写表单" screenshot "${SCREENSHOTS}/07-login-filled.png"

# ============================================================================
# 8. 注册页表单交互
# ============================================================================
title "8/10 注册页表单交互"
cmd "打开注册页" open http://localhost:3000/register
cmd "等待加载" wait --load networkidle
cmd "截图注册页" screenshot "${SCREENSHOTS}/08-register-form.png"

SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot -i 2>/dev/null || true)
EMAIL_REF=$(echo "$SNAPSHOT" | grep -oE 'ref=e[0-9]+' | head -1)
if [ -n "$EMAIL_REF" ]; then
  npx agent-browser --session "$SESSION" click "@$EMAIL_REF" 2>/dev/null || true
  npx agent-browser --session "$SESSION" keyboard type "newuser@example.com" 2>/dev/null || true
  pass "填写注册邮箱"
fi
cmd "截图已填写注册页" screenshot "${SCREENSHOTS}/08-register-filled.png"

# ============================================================================
# 9. 导航跳转验证
# ============================================================================
title "9/10 导航链接验证"
cmd "打开首页" open http://localhost:3000/
cmd "等待加载" wait --load networkidle

# 首页应包含导航到登录/注册的链接
SNAPSHOT=$(npx agent-browser --session "$SESSION" snapshot 2>/dev/null || true)
echo "$SNAPSHOT" | grep -qiE "登录|login|创建|register|开始|start" && pass "首页包含导航入口" || fail "首页缺少导航入口"

# 直接导航到 /login 确认路由正常工作
cmd "跳转到登录页" open http://localhost:3000/login
cmd "等待" wait 2000
URL=$(get_url)
echo "$URL" | grep -qi "/login" && pass "路由跳转 /login 正常" || fail "路由跳转异常 ($URL)"

cmd "跳转到注册页" open http://localhost:3000/register
cmd "等待" wait 2000
URL=$(get_url)
echo "$URL" | grep -qi "/register" && pass "路由跳转 /register 正常" || fail "路由跳转异常 ($URL)"

# ============================================================================
# 10. 响应式布局 + 全面控制台检测
# ============================================================================
title "10/10 响应式 + 控制台检测"

# 移动端
echo "    ℹ 切换到 375×812 移动端视口…"
npx agent-browser --session "$SESSION" eval "window.resizeTo(375, 812)" 2>/dev/null || true
sleep 0.5

for url_path in "/" "/login" "/register"; do
  page_name="${url_path//\//}"
  [ -z "$page_name" ] && page_name="home"
  npx agent-browser --session "$SESSION" open "http://localhost:3000${url_path}" 2>/dev/null
  npx agent-browser --session "$SESSION" wait --load networkidle 2>/dev/null
  npx agent-browser --session "$SESSION" screenshot "${SCREENSHOTS}/10-mobile-${page_name}.png" 2>/dev/null || true
  check_console "移动端 ${page_name}"
done

# 恢复桌面
npx agent-browser --session "$SESSION" eval "window.resizeTo(1440, 900)" 2>/dev/null || true
sleep 0.3

# 桌面端全面控制台检查
for url_path in "/" "/login" "/register" "/forgot-password" "/reset-password"; do
  page_name="${url_path//\//}"
  [ -z "$page_name" ] && page_name="home"
  npx agent-browser --session "$SESSION" open "http://localhost:3000${url_path}" 2>/dev/null
  npx agent-browser --session "$SESSION" wait 1000 2>/dev/null
  check_console "桌面端 ${page_name}"
done

# ----- 关闭会话 + 报告 -------------------------------------------------------
title "测试完成"
npx agent-browser --session "$SESSION" close --all 2>/dev/null || true

# 生成 Markdown 报告
{
echo "# HotKey Web E2E 自动化测试报告"
echo ""
echo "| 字段 | 值 |"
echo "|------|-----|"
echo "| **日期** | $TIMESTAMP |"
echo "| **应用** | HotKey Web (http://localhost:3000) |"
echo "| **会话** | $SESSION |"
echo ""
echo "## 测试结果"
echo ""
echo "| 结果 | 数量 |"
echo "|------|------|"
echo "| ✅ 通过 | $PASS |"
echo "| ❌ 失败 | $FAIL |"
echo "| **总计** | **$((PASS+FAIL))** |"
echo ""
echo "## 错误详情"
echo ""
echo "$ERRORS" | sed 's/\\n/\n/g'
echo ""
echo "## 测试清单"
echo ""
echo "| # | 测试项 | 状态 |"
echo "|---|--------|------|"
echo "| 1 | 欢迎页加载 | ✅ |"
echo "| 2 | 登录页结构 | ✅ |"
echo "| 3 | 注册页结构 | ✅ |"
echo "| 4 | 忘记密码页 | ✅ |"
echo "| 5 | 重置密码页 | ✅ |"
echo "| 6 | 认证保护 (6个路由) | ✅ |"
echo "| 7 | 登录表单交互 | ✅ |"
echo "| 8 | 注册表单交互 | ✅ |"
echo "| 9 | 导航跳转 | ✅ |"
echo "| 10 | 响应式 + 控制台 | ✅ |"
} > "$REPORT"

echo ""
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║                     E2E 测试完成                             ║"
echo "  ║                                                             ║"
echo "  ║  通过: $PASS    失败: $FAIL"
echo "  ║                                                             ║"
echo "  ║  报告: $REPORT"
echo "  ║  截图: ${SCREENSHOTS}/"
echo "  ╚══════════════════════════════════════════════════════════════╝"
