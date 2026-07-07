export function buildTrafficOSPrompt(): string {
  return [
    "# Traffic OS Lite",
    "创意是元素撞出来的。行业只是容器。传播的是人。",
    "拿一个赛道+5个技法，把每个技法强行撞进赛道的不同切面，生成具体到能拍的创意方向。",
    "对每个技法：先写底层机制（一句话），再找赛道里能撞上去的面——不同的人/场景/环节/情绪。",
    "每个方向一句话，但必须是一个能让人停下来的画面。格式：「核心画面——为什么停」。例：让体能教练蒙眼跳完十个跳绳，他歪歪扭扭摔倒第三次后突然说——我终于知道小孩为什么讨厌标准动作了。",
    "输出5个方向。每行一个。每个必须带钩子——看完第一句就想点进去。",
  ].join("\n")
}
export function buildTrafficOSUserMessage(input: { niche: string; techniques: string }): string {
  return ["【赛道】"+input.niche,"","【5个技法】",input.techniques,"","5个方向。每行一个。"].join("\n")
}
