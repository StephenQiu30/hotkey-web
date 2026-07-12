const ERROR_MESSAGES: Partial<Record<HotKeyAPI.ErrorCode, string>> = {
  AUTH_INVALID_INPUT: "输入信息有误，请检查后重试",
  AUTH_INVALID_CREDENTIALS: "邮箱或密码错误",
  AUTH_EMAIL_ALREADY_REGISTERED: "该邮箱已注册",
  AUTH_VERIFICATION_INVALID: "验证码错误，请重新输入",
  AUTH_VERIFICATION_EXPIRED: "验证已过期，请重新开始",
  AUTH_VERIFICATION_TOO_MANY_ATTEMPTS: "验证码错误次数过多，请重新发送",
  AUTH_VERIFICATION_SEND_TOO_FREQUENT: "验证码发送过于频繁，请稍后再试",
  AUTH_SESSION_EXPIRED: "登录已过期，请重新登录",
  AUTH_SESSION_REVOKED: "登录状态已失效，请重新登录",
  AUTH_TOKEN_INVALID: "登录状态无效，请重新登录",
  AUTH_TOKEN_REUSED: "检测到异常会话，请重新登录",
  AUTH_ACCOUNT_DISABLED: "账户已被禁用",
  AUTH_PASSWORD_POLICY_VIOLATION: "密码强度不足（至少8位，包含字母和数字）",
  BAD_REQUEST: "请求参数有误",
  UNAUTHORIZED: "请先登录",
  FORBIDDEN: "无权限执行此操作",
  NOT_FOUND: "请求的内容不存在",
  CONFLICT: "当前状态存在冲突",
  RATE_LIMITED: "操作过于频繁，请稍后再试",
  SERVICE_UNAVAILABLE: "服务暂时不可用，请稍后重试",
  INTERNAL_ERROR: "操作失败，请稍后重试",
};

export function errorMessage(errorCode?: HotKeyAPI.ErrorCode): string {
  return (errorCode && ERROR_MESSAGES[errorCode]) || "操作失败，请稍后重试";
}
