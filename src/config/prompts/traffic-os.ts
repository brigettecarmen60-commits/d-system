export function buildTrafficOSPrompt(): string {
  return [
    "# Traffic OS Lite",
    "创意是元素撞出来的。行业只是容器。传播的是人。",
    "拿一个赛道+5个技法，把每个技法强行撞进赛道的不同切面，生成具体到能拍的创意方向。",
    "对每个技法：先写底层机制（一句话），再找赛道里能撞上去的面——不同的人/场景/环节/情绪。",
    "每个方向一句话，具体到能拍的画面。圈外人一秒能钩住。一个人一部手机能拍。",
    "输出5个方向。每行一个。不分析不展开。",
  ].join("\n")
}
export function buildTrafficOSUserMessage(input: { niche: string; techniques: string }): string {
  return ["【赛道】"+input.niche,"","【5个技法】",input.techniques,"","5个方向。每行一个。"].join("\n")
}
