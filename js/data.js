/**
 * POE2 国服攻略站 - 数据层
 */

// ===== 热门BD数据 =====
const BUILDS = [
    {
        id: 1,
        name: "冰霜爆破 [冰剑] 伤害爆炸",
        class: "巫师",
        tag: "meta",
        tier: "T0",
        difficulty: "中等",
        cost: "中等",
        description: "利用冰霜爆破的连锁机制配合冰剑的高额冰伤，实现屏幕全清。当前赛季最强清图BD之一。",
        tags: ["冰伤", "清图", "法师"],
        updateDate: "2025-05-20"
    },
    {
        id: 2,
        name: "旋风斩 [战士] 无脑刷图",
        class: "战士",
        tag: "meta",
        tier: "T0",
        difficulty: "简单",
        cost: "低",
        description: "经典旋风斩玩法，操作简单，生存能力强。适合新手入门，低成本即可成型。",
        tags: ["近战", "清图", "新手友好"],
        updateDate: "2025-05-22"
    },
    {
        id: 3,
        name: "毒雨 [游侠] 持续伤害之王",
        class: "游侠",
        tag: "league",
        tier: "T1",
        difficulty: "中等",
        cost: "中等",
        description: "毒雨叠加机制让持续伤害飙升，Boss战表现优秀。联赛热门BD，造价适中。",
        tags: ["毒伤", "持续伤害", "游侠"],
        updateDate: "2025-05-18"
    },
    {
        id: 4,
        name: "电弧 [女巫] 低成本开荒神技",
        class: "女巫",
        tag: "budget",
        tier: "T1",
        difficulty: "简单",
        cost: "极低",
        description: "电弧自带连锁，无需太多装备支持即可高效清图。联盟开荒首选，后期也可转型。",
        tags: ["电伤", "开荒", "低成本"],
        updateDate: "2025-05-15"
    },
    {
        id: 5,
        name: "召唤灵体 [死灵] 安全挂机",
        class: "死灵",
        tag: "meta",
        tier: "T1",
        difficulty: "简单",
        cost: "高",
        description: "召唤流以安全著称，灵体召唤伤害优秀。适合不喜欢复杂操作、追求稳定刷图的玩家。",
        tags: ["召唤", "安全", "高成本"],
        updateDate: "2025-05-21"
    },
    {
        id: 6,
        name: "分裂箭 [猎人] 箭雨倾泻",
        class: "猎人",
        tag: "league",
        tier: "T2",
        difficulty: "中等",
        cost: "低",
        description: "分裂箭配合多重投射和箭雨辅助，火力覆盖范围极广。性价比极高的刷图BD。",
        tags: ["投射", "弓箭", "刷图"],
        updateDate: "2025-05-17"
    },
    {
        id: 7,
        name: "烈焰冲刺 [武僧] 速度与激情",
        class: "武僧",
        tag: "budget",
        tier: "T2",
        difficulty: "中等",
        cost: "低",
        description: "利用冲刺技能的高机动性配合火焰伤害，既快又猛。新手也能快速上手的BD。",
        tags: ["火焰", "高机动", "新手友好"],
        updateDate: "2025-05-19"
    },
    {
        id: 8,
        name: "暗影打击 [刺客] 暴击之王",
        class: "刺客",
        tag: "meta",
        tier: "T0",
        difficulty: "困难",
        cost: "高",
        description: "极限暴击流，一刀一个小朋友。需要较高装备投入，但成型后伤害无与伦比。",
        tags: ["暴击", "高伤害", "后期"],
        updateDate: "2025-05-23"
    }
];

// ===== 新手指南 =====
const GUIDES = [
    {
        id: 1,
        title: "从零开始：流放之路2新手完全指南",
        category: "入门",
        icon: "🌟",
        description: "从角色创建到第一个赛季，手把手教你入门流放之路2国服。",
        date: "2025-05-20",
        views: 12500
    },
    {
        id: 2,
        title: "天赋树入门：核心概念与加点思路",
        category: "系统",
        icon: "🌳",
        description: "详解天赋树机制，教你如何规划适合自己的加点路线。",
        date: "2025-05-18",
        views: 8900
    },
    {
        id: 3,
        title: "装备系统详解：基底、词缀与工艺",
        category: "装备",
        icon: "⚔️",
        description: "一文看懂POE2装备系统，从基底选择到词缀打造全攻略。",
        date: "2025-05-15",
        views: 10200
    },
    {
        id: 4,
        title: "货币系统与交易入门指南",
        category: "经济",
        icon: "💰",
        description: "详解国服货币体系与交易机制，教你合理理财不亏钱。",
        date: "2025-05-12",
        views: 7800
    },
    {
        id: 5,
        title: "赛季/联盟玩法详解",
        category: "系统",
        icon: "📅",
        description: "赛季机制、奖励与玩法攻略，帮你规划赛季目标。",
        date: "2025-05-10",
        views: 6500
    },
    {
        id: 6,
        title: "技能宝石搭配入门",
        category: "技能",
        icon: "💎",
        description: "理解技能宝石系统，学会合理的辅助搭配与链接策略。",
        date: "2025-05-08",
        views: 9100
    }
];

// ===== 地图数据 =====
const MAPS = [
    { id: 1, name: "幽暗森林", tier: 1, boss: "腐化树精", difficulty: "★" },
    { id: 2, name: "沉没之城", tier: 3, boss: "深渊守卫", difficulty: "★★" },
    { id: 3, name: "熔岩矿洞", tier: 5, boss: "炎魔领主", difficulty: "★★" },
    { id: 4, name: "冰川裂隙", tier: 8, boss: "霜巨人王", difficulty: "★★★" },
    { id: 5, name: "虚空领域", tier: 10, boss: "虚空之王", difficulty: "★★★★" },
    { id: 6, name: "绝望深渊", tier: 12, boss: "绝望领主", difficulty: "★★★★" },
    { id: 7, name: "永恒殿堂", tier: 15, boss: "殿堂守卫者", difficulty: "★★★★★" },
    { id: 8, name: "终焉之地", tier: 16, boss: "终焉之主", difficulty: "★★★★★" }
];

// ===== 实用工具 =====
const TOOLS = [
    { id: 1, name: "天赋模拟器", icon: "🌳", desc: "在线模拟天赋加点，支持方案保存与分享", status: "可用", url: "#" },
    { id: 2, name: "交易助手", icon: "🔄", desc: "快速查询装备市场价格与走势", status: "可用", url: "#" },
    { id: 3, name: "伤害计算器", icon: "💥", desc: "精确计算DPS、生存等核心属性", status: "开发中", url: "#" },
    { id: 4, name: "造价估算", icon: "💰", desc: "BD造价估算，帮你规划投资方案", status: "可用", url: "#" },
    { id: 5, name: "词缀数据库", icon: "📜", desc: "全词缀查询与筛选工具", status: "可用", url: "#" },
    { id: 6, name: "技能树浏览器", icon: "🌿", desc: "可视化浏览所有技能及其联动关系", status: "开发中", url: "#" }
];

// ===== 资讯数据 =====
const NEWS = [
    {
        id: 1,
        title: "0.2.0 版本更新公告：新职业、新技能与平衡性调整",
        date: "2025-05-25",
        tag: "版本更新",
        tagColor: "#e74c3c",
        preview: "本次更新带来了全新的武僧职业转职分支，以及超过20个技能的平衡性调整..."
    },
    {
        id: 2,
        title: "新赛季联赛预告：裂痕回响即将开启",
        date: "2025-05-23",
        tag: "联赛活动",
        tagColor: "#9b59b6",
        preview: "下个赛季将回归裂痕机制，同时加入全新的回响词缀系统..."
    },
    {
        id: 3,
        title: "国服专属活动：开服庆典奖励领取指南",
        date: "2025-05-20",
        tag: "活动",
        tagColor: "#f39c12",
        preview: "为庆祝国服正式开服，官方准备了丰富的登录奖励和限时活动..."
    },
    {
        id: 4,
        title: "社区精选：本周最佳BD分享合集",
        date: "2025-05-18",
        tag: "社区",
        tagColor: "#2ecc71",
        preview: "本周社区投票评选出最受欢迎的5个BD构建，涵盖各个职业..."
    }
];

// ===== 站点统计 =====
const SITE_STATS = {
    builds: 150,
    items: 2000,
    guides: 80,
    updates: 45
};

// ===== 搜索索引 =====
const SEARCH_INDEX = [
    ...BUILDS.map(b => ({ type: 'BD', title: b.name, desc: b.description, url: '#builds' })),
    ...GUIDES.map(g => ({ type: '指南', title: g.title, desc: g.description, url: '#guides' })),
    ...TOOLS.map(t => ({ type: '工具', title: t.name, desc: t.desc, url: '#tools' }))
];