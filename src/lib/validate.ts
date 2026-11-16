// 前端即时校验：与后端规则同语义（后端仍为唯一裁决方），仅用于输入期提示，
// 避免把明显非法的输入送到服务端才报错。
export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

// Java 版玩家名：3-16 位字母/数字/下划线（与 shared/mc.ValidPlayerName 同规则）。
export function isValidPlayerName(v: string): boolean {
  return /^[A-Za-z0-9_]{3,16}$/.test(v);
}
