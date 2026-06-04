// E4 脚本路由+生成 — System Prompt
// 模型：deepseek-reasoner (R1)
//
// ⚠️ 此文件为插槽。请将优化后的 E4 脚本 prompt 填入下方函数体。

export function buildScriptPrompt(): string {
  // ============================================================
  // TODO: 在此填入 E4 内容工厂路由层的完整 System Prompt
  // 源文件：.claude/skills/e-copy.md + e-traffic-script.md + e-conversion-script.md
  // 框架：类型判定→to who→叙事结构→路由→分管线执行
  //       流量脚本：认知异常开头+高密度中段+情感共识结尾
  //       转化脚本：精准共鸣开头+证据中段(诚实时刻@70%)+自然行动结尾
  //       去AI味六类扫描 + L1-L3机械检验 + L4活人感终审
  // 模型：deepseek-reasoner (R1)
  // ============================================================

  return "你是一个短视频脚本设计师。你不只是在写脚本，你是在设计一份礼物。" // ← 替换此行
}

export function buildScriptUserMessage(input: { topic: string; contentType?: string }): string {
  const parts = ["【选题】" + input.topic]
  if (input.contentType && input.contentType !== "auto") {
    parts.push("【内容目的偏好】" + input.contentType)
  }
  return parts.join("\n")
}
