/**
 * Stable ErrorCode-to-UI mapping.
 *
 * Backend error codes are stable identifiers (never localised strings).
 * The UI branches on `code`, not on the `message` field.
 */

/** Known error codes returned by the HotKey API. */
export enum ErrorCode {
  // Auth
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_EMAIL_NOT_VERIFIED = "AUTH_EMAIL_NOT_VERIFIED",
  AUTH_EMAIL_ALREADY_VERIFIED = "AUTH_EMAIL_ALREADY_VERIFIED",
  AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_INVALID_REFRESH = "AUTH_INVALID_REFRESH",
  AUTH_INVALID_TICKET = "AUTH_INVALID_TICKET",
  AUTH_TICKET_EXPIRED = "AUTH_TICKET_EXPIRED",
  AUTH_WEAK_PASSWORD = "AUTH_WEAK_PASSWORD",
  AUTH_EMAIL_TAKEN = "AUTH_EMAIL_TAKEN",
  AUTH_RATE_LIMITED = "AUTH_RATE_LIMITED",

  // Verification
  VERIFICATION_CODE_INVALID = "VERIFICATION_CODE_INVALID",
  VERIFICATION_CODE_EXPIRED = "VERIFICATION_CODE_EXPIRED",
  VERIFICATION_RATE_LIMITED = "VERIFICATION_RATE_LIMITED",
  VERIFICATION_HOURLY_LIMIT = "VERIFICATION_HOURLY_LIMIT",

  // General
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/** Maps an error code to a human-readable field-level message. */
export function errorMessage(code?: string): string {
  switch (code) {
    case ErrorCode.AUTH_INVALID_CREDENTIALS:
      return "邮箱或密码错误";
    case ErrorCode.AUTH_EMAIL_NOT_VERIFIED:
      return "请先验证邮箱地址";
    case ErrorCode.AUTH_EMAIL_ALREADY_VERIFIED:
      return "该邮箱已验证";
    case ErrorCode.AUTH_INVALID_TOKEN:
    case ErrorCode.AUTH_TOKEN_EXPIRED:
      return "登录已过期，请重新登录";
    case ErrorCode.AUTH_INVALID_REFRESH:
      return "会话已过期，请重新登录";
    case ErrorCode.AUTH_INVALID_TICKET:
    case ErrorCode.AUTH_TICKET_EXPIRED:
      return "验证已过期，请重新开始";
    case ErrorCode.AUTH_WEAK_PASSWORD:
      return "密码强度不足（至少8位，含大小写字母和数字）";
    case ErrorCode.AUTH_EMAIL_TAKEN:
      return "该邮箱已注册";
    case ErrorCode.AUTH_RATE_LIMITED:
      return "操作过于频繁，请稍后再试";
    case ErrorCode.VERIFICATION_CODE_INVALID:
      return "验证码错误，请重新输入";
    case ErrorCode.VERIFICATION_CODE_EXPIRED:
      return "验证码已过期，请重新发送";
    case ErrorCode.VERIFICATION_RATE_LIMITED:
    case ErrorCode.VERIFICATION_HOURLY_LIMIT:
      return "验证码发送过于频繁，请稍后再试";
    case "BAD_REQUEST":
      return "输入格式有误，请检查后重试";
    default:
      return "操作失败，请稍后再试";
  }
}
