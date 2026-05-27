/**
 * POE2 国服攻略站 - 真实游戏数据
 * 数据来源: POE2 Wiki (poe2wiki.net)
 */

// ===== 12职业完整数据 =====
const CLASSES = [
    {
        id: 1, name: "勇士", enName: "Warrior",
        attrs: "力量", attrIcon: "💪",
        desc: "专精锤、剑、盾牌与战吼技能的近战战士，拥有卓越的防御与控制能力。",
        weapon: "锤/剑/盾", difficulty: "中等",
        ascendancies: [
            { name: "泰坦 Titan", desc: "极致力量，碎甲与重击", tier: "T0" },
            { name: "战争使者 Warbringer", desc: "战吼辅助，团队增益", tier: "T1" },
            { name: "基塔瓦铁匠 Smith of Kitava", desc: "铸造大师，装备强化", tier: "T2" }
        ]
    },
    {
        id: 2, name: "野蛮人", enName: "Marauder",
        attrs: "力量", attrIcon: "💪",
        desc: "专精斧类武器的重型战士，以压倒性的力量粉碎敌人。",
        weapon: "斧", difficulty: "简单",
        ascendancies: [
            { name: "泰坦 Titan", desc: "极致力量，碎甲与重击", tier: "T0" },
            { name: "战争使者 Warbringer", desc: "战吼辅助，团队增益", tier: "T1" },
            { name: "基塔瓦铁匠 Smith of Kitava", desc: "铸造大师，装备强化", tier: "T2" }
        ]
    },
    {
        id: 3, name: "游侠", enName: "Ranger",
        attrs: "敏捷", attrIcon: "🏹",
        desc: "专精弓类武器的远程杀手，以高机动性和精准射击著称。",
        weapon: "弓", difficulty: "中等",
        ascendancies: [
            { name: "死亡之眼 Deadeye", desc: "远程暴击，箭矢穿透", tier: "T0" },
            { name: "寻路者 Pathfinder", desc: "药剂精通，持续输出", tier: "T1" }
        ]
    },
    {
        id: 4, name: "猎人", enName: "Huntress",
        attrs: "敏捷", attrIcon: "🏹",
        desc: "专精长矛与自然之力的敏捷战士，可召唤灵魂与自然精灵。",
        weapon: "长矛", difficulty: "中等",
        ascendancies: [
            { name: "仪式师 Ritualist", desc: "自然之力，召唤与图腾", tier: "T0" },
            { name: "亚马逊 Amazon", desc: "长矛精通，高级连击", tier: "T1" },
            { name: "灵魂行者 Spirit Walker", desc: "灵魂护甲，闪避流", tier: "T2" }
        ]
    },
    {
        id: 5, name: "女巫", enName: "Witch",
        attrs: "智力", attrIcon: "🔮",
        desc: "专精亡灵召唤与混沌魔法的神秘法师，拥有强大的亡灵军团。",
        weapon: "法杖", difficulty: "中等",
        ascendancies: [
            { name: "地狱师 Infernalist", desc: "地狱之火，恶魔契约", tier: "T0" },
            { name: "血法师 Blood Mage", desc: "生命转伤，极限爆发", tier: "T1" },
            { name: "亡灵法师 Lich", desc: "不死之身，亡者大军", tier: "T2" }
        ]
    },
    {
        id: 6, name: "女术士", enName: "Sorceress",
        attrs: "智力", attrIcon: "⚡",
        desc: "专精元素魔法的纯法系职业，冰、火、电三系精通。",
        weapon: "法杖/魔杖", difficulty: "简单",
        ascendancies: [
            { name: "风暴编织者 Stormweaver", desc: "冰火双修，元素爆发", tier: "T0" },
            { name: "时魔 Chronomancer", desc: "时间操控，减速控制", tier: "T1" },
            { name: "VARAS之徒 Disciple of Varashta", desc: "暗影魔法，穿透护盾", tier: "T2" }
        ]
    },
    {
        id: 7, name: "决斗家", enName: "Duelist",
        attrs: "力量/敏捷", attrIcon: "⚔️",
        desc: "专精剑类武器的双持近战，以灵活的剑术和高速连击见长。",
        weapon: "剑", difficulty: "中等",
        ascendancies: [
            { name: "剑圣", desc: "双持剑术，极速连击", tier: "T1" },
            { name: "冠军", desc: "剑盾防御，稳定输出", tier: "T1" },
            { name: "剑术宗师", desc: "剑类精通，暴击强化", tier: "T2" }
        ]
    },
    {
        id: 8, name: "佣兵", enName: "Mercenary",
        attrs: "力量/敏捷", attrIcon: "🔫",
        desc: "专精弩与手雷的多功能职业，拥有范围控制与灵活战术。",
        weapon: "弩/手雷", difficulty: "简单",
        ascendancies: [
            { name: "女巫猎人 Witchhunter", desc: "驱魔法术，反魔法特攻", tier: "T0" },
            { name: "宝石军团 Gemling Legionnaire", desc: "技能宝石强化，多重施法", tier: "T1" },
            { name: "战术家 Tactician", desc: "战术增益，团队核心", tier: "T1" }
        ]
    },
    {
        id: 9, name: "暗影", enName: "Shadow",
        attrs: "敏捷/智力", attrIcon: "🗡️",
        desc: "专精匕首与陷阱的刺客职业，以高爆发和灵活机动著称。",
        weapon: "匕首/陷阱", difficulty: "困难",
        ascendancies: [
            { name: "刺客 Assassin", desc: "匕首暴击，极限秒杀", tier: "T0" },
            { name: "陷阱师 Trap", desc: "地雷与陷阱，范围伤害", tier: "T1" },
            { name: "暗影大师", desc: "隐匿暗杀，毒素伤害", tier: "T2" }
        ]
    },
    {
        id: 10, name: "武僧", enName: "Monk",
        attrs: "敏捷/智力", attrIcon: "👊",
        desc: "专精空手与长棍的武斗家，以连击和闪避反击为核心。",
        weapon: "空手/长棍", difficulty: "中等",
        ascendancies: [
            { name: "祈求者 Invoker", desc: "神圣武技，光明祝福", tier: "T0" },
            { name: "查育拉信徒 Acolyte of Chayula", desc: "异界力量，生命偷取", tier: "T1" },
            { name: "武斗家 Martial Artist", desc: "连击精通，拳脚功夫", tier: "T1" }
        ]
    },
    {
        id: 11, name: "圣堂武士", enName: "Templar",
        attrs: "力量/智力", attrIcon: "⛪",
        desc: "专精连枷与神圣魔法的混合职业，拥有治疗与护盾能力。",
        weapon: "连枷", difficulty: "简单",
        ascendancies: [
            { name: "圣殿骑士", desc: "神圣护盾，团队保护", tier: "T1" },
            { name: "审判者", desc: "神圣伤害，净化敌人", tier: "T1" },
            { name: "守护者", desc: "生命增强，坚韧不拔", tier: "T2" }
        ]
    },
    {
        id: 12, name: "德鲁伊", enName: "Druid",
        attrs: "力量/智力", attrIcon: "🌿",
        desc: "专精变形与自然魔法的万能职业，可变身为熊或狼进行战斗。",
        weapon: "双手武器", difficulty: "困难",
        ascendancies: [
            { name: "萨满 Shaman", desc: "图腾与自然之力", tier: "T0" },
            { name: "先知 Oracle", desc: "预言与秘法", tier: "T1" }
        ]
    }
];

// ===== 章节剧情数据 =====
const ACTS = [
    { id: 1, name: "第一章", area: "Ogham", desc: "在 Ogham 村庄醒来，面对最初的危险与试炼", level: "1-12", boss: "Doryani" },
    { id: 2, name: "第二章", area: "Vastiri", desc: "穿越 Vastiri 沙漠，探索古老废墟", level: "13-24", boss: "一章节Boss" },
    { id: 3, name: "第三章", area: "Aggorat", desc: "深入 Aggorat 了解瓦尔克拉斯的神秘历史", level: "25-36", boss: "一章节Boss" },
    { id: 4, name: "第四章", area: "Ngamakanui", desc: "进入 Ngamakanui 热带丛林，迎接终极挑战", level: "37-50", boss: "一章节Boss" },
    { id: 5, name: "幕间 1", area: "Holten的诅咒", desc: "临时章节，填充EA期间的内容空白", level: "51-55", boss: "诅咒者" },
    { id: 6, name: "幕间 2", area: "被盗的Barya", desc: "围绕被盗金币展开的支线故事", level: "56-60", boss: "一章节Boss" },
    { id: 7, name: "幕间 3", area: "Doryani的应急", desc: "最终幕间，揭示更多背景故事", level: "61-65", boss: "一章节Boss" },
    { id: 8, name: "终章", area: "瓦尔克拉斯", desc: "进入终章，完成EA剧情线", level: "65+", boss: "终焉Boss" }
];

// ===== 地图数据（来源POE2 Wiki）=====
const MAPS = [
    { id: 1, name: "Alpine Ridge", cnName: "高山脊", tier: 1, biome: "Mountain", boss: "Gelida, the Frost-Tongue", difficulty: "★" },
    { id: 2, name: "Augury", cnName: "神谕", tier: 1, biome: "Grass/Forest/Swamp", boss: "Jiquani's Machinarium", difficulty: "★" },
    { id: 3, name: "Azmerian Ranges", cnName: "Azmeri山脉", tier: 2, biome: "Mountain/Forest", boss: "Morwyn, the Kinslayer", difficulty: "★" },
    { id: 4, name: "Backwash", cnName: "回水湾", tier: 2, biome: "Forest/Swamp", boss: "Yaota, the Loathsome", difficulty: "★" },
    { id: 5, name: "Bastille", cnName: "巴士底狱", tier: 3, biome: "Fortification", boss: "Veynar, the Frostbane", difficulty: "★★" },
    { id: 6, name: "Bloodwood", cnName: "血木林", tier: 3, biome: "Forest", boss: "Gorian, the Moving Earth", difficulty: "★★" },
    { id: 7, name: "Blooming Field", cnName: "绽放原野", tier: 4, biome: "Forest/Grass", boss: "The Black Crow", difficulty: "★★" },
    { id: 8, name: "Bluff", cnName: "悬崖", tier: 4, biome: "Grass", boss: "Gressor-Kul, the Apex", difficulty: "★★" },
    { id: 9, name: "Burial Bog", cnName: "埋葬沼泽", tier: 5, biome: "Swamp", boss: "Grudgelash, Vile Ent", difficulty: "★★" },
    { id: 10, name: "Caldera", cnName: "火山口", tier: 5, biome: "Lava", boss: "The Ravenous Fang", difficulty: "★★★" },
    { id: 11, name: "Canyon", cnName: "大峡谷", tier: 6, biome: "Desert", boss: "Morvak, the Infernal", difficulty: "★★★" },
    { id: 12, name: "Cenotes", cnName: "地下井", tier: 6, biome: "Mountain", boss: "Bahlak, the Sky Seer", difficulty: "★★★" },
    { id: 13, name: "Cliffside", cnName: "悬崖边", tier: 7, biome: "Mountain", boss: "Arastas / Brakkus, the Juggernaut", difficulty: "★★★" },
    { id: 14, name: "Confluence", cnName: "汇流", tier: 7, biome: "City", boss: "Manassa, the Serpent Queen", difficulty: "★★★" },
    { id: 15, name: "Creek", cnName: "小溪", tier: 8, biome: "Forest", boss: "Tierney, the Hateful", difficulty: "★★★" },
    { id: 16, name: "Crimson Shores", cnName: "赤红海岸", tier: 8, biome: "Water", boss: "Volkhar, the Emberborn", difficulty: "★★★★" },
    { id: 17, name: "Crypt", cnName: "地牢", tier: 9, biome: "Desert/Grass", boss: "Meltwax, Mockery of Faith", difficulty: "★★★★" },
    { id: 18, name: "Decay", cnName: "腐败之地", tier: 9, biome: "Grass/Forest/Swamp", boss: "The Fungus Behemoth", difficulty: "★★★★" },
    { id: 19, name: "Digsite", cnName: "挖掘现场", tier: 10, biome: "Desert", boss: "Aurelian, the Grand Adjudicator", difficulty: "★★★★" },
    { id: 20, name: "Epitaph", cnName: "墓志铭", tier: 10, biome: "Crypt", boss: "Saphira, The Dread Consort", difficulty: "★★★★★" }
];

// ===== 技能分类数据 =====
const SKILL_CATEGORIES = [
    {
        id: 1, name: "攻击技能", icon: "⚔️",
        skills: ["Default Attack 默认攻击", "Cyclone 旋风斩", "Lacerate 撕裂", "Sunder 猛击", "Leap Slam 跃击", "Ground Slam 地面猛击", "Heavy Strike 重击", "Cleave 横扫"]
    },
    {
        id: 2, name: "法术技能", icon: "🔥",
        skills: ["Fireball 火球", "Ice Nova 冰爆", "Lightning Bolt 闪电", "Frost Bomb 冰霜炸弹", "Spark 电弧", "Incinerate 烈焰", "Frostbite 冰冻", "Conductivity 传导"]
    },
    {
        id: 3, name: "诅咒技能", icon: "💀",
        skills: ["Enfeeble 衰弱", "Temporal Chains 时间锁链", "Elemental Weakness 元素虚弱", "Despair 绝望", "Poisonous Vine 毒藤"]
    },
    {
        id: 4, name: "召唤技能", icon: "💀",
        skills: ["Summon Skeleton 召唤骷髅", "Raise Zombie 唤起僵尸", "Summon Holy Relic 召唤圣物", "Animate Guardian 活力守卫", "Raise Spectre 唤起魔像"]
    },
    {
        id: 5, name: "图腾技能", icon: "🗼",
        skills: ["Sigil of Power 力量印记", "Summon Roaring Pit", "Stone Golem 石魔像", "Flame Golem 火焰魔像"]
    },
    {
        id: 6, name: "陷阱与地雷", icon: "💣",
        skills: ["Fire Trap 火陷阱", "Lightning Trap 闪电陷阱", "Lethal Mine 致命地雷", "Cluster Trap 集束陷阱"]
    },
    {
        id: 7, name: "战吼技能", icon: "📢",
        skills: ["Seismic Cry 地震之吼", "Intimidating Cry 威吓战吼", "Battle Cry 战斗怒吼", "Ancestral Cry 先祖之吼"]
    },
    {
        id: 8, name: "防御技能", icon: "🛡️",
        skills: ["Raise Shield 举起盾牌", "Parry 格挡", "Dodge Roll 闪避翻滚", "Guard"]
    },
    {
        id: 9, name: "光环技能", icon: "✨",
        skills: ["Haste 急速", "Discipline 纪律", "Determination 决心", "Grace 优雅", "Hatred 仇恨", "Wrath 怒火", "Anger 愤怒"]
    },
    {
        id: 10, name: "持续伤害", icon: "☠️",
        skills: ["Scorching Ray 灼烧射线", "Fire Exposure 火焰暴露", "Corrosive Roar 腐蚀咆哮", "Venom Gyre 毒蛇牙"]
    }
];

// ===== 天赋树系统 =====
const PASSIVE_INFO = {
    totalPoints: 123,
    levelPoints: 99,
    questPoints: 24,
    keystones: ["Vaal Pact", "Ancestral Commander", "Avatar of Fire", "CI"],
    note: "天赋树分为三大区域：西南(力量)、东南(敏捷)、北部(智力)。德鲁伊进阶职业「先知」拥有专属天赋节点。"
};

// ===== 物品分类 =====
// ===== 物品分类 =====
const ITEM_CATEGORIES = [
    { id: 1, name: "武器", icon: "⚔️", sub: ["剑 Swords", "斧 Axes", "锤 Maces", "弓 Bows", "弩 Crossbows", "法杖 Staves", "魔杖 Wands", "匕首 Daggers", "长矛 Spears", "连枷 Flails", "长棍 Quarterstaffs"] },
    { id: 2, name: "护甲", icon: "🛡️", sub: ["胸甲 Body Armours", "头盔 Helmets", "手套 Gloves", "靴子 Boots", "盾牌 Shields", "护肩pauldrons"] },
    { id: 3, name: "首饰", icon: "💍", sub: ["戒指 Rings", "项链 Amulets", "腰带 Belts"] },
    { id: 4, name: "其他", icon: "🎒", sub: ["药剂 Flasks", "珠宝 Jewels", "宝石 Skill Gems", "地图 Waystones"] }
];

// ===== 药剂分类 =====
const FLASKS = [
    { name: "生命药剂", icon: "❤️", effect: "立即恢复生命值" },
    { name: "法力药剂", icon: "💙", effect: "立即恢复法力值" },
    { name: "敏捷药剂", icon: "💚", effect: "增加敏捷属性" },
    { name: "力量药剂", icon: "❤️‍🔥", effect: "增加力量属性" },
    { name: "智力药剂", icon: "💜", effect: "增加智力属性" },
    { name: "攻击药剂", icon: "⚔️", effect: "增加攻击速度" },
    { name: "防御药剂", icon: "🛡️", effect: "增加护甲/闪避" }
];

// ===== 热门BD数据（真实化）=====
const BUILDS = [
    {
        id: 1, name: "风暴编织者 冰火风暴 [女术士]",
        class: "女术士", classEn: "Sorceress",
        tag: "meta", tier: "T0",
        difficulty: "中等", cost: "中等",
        description: "Stormweaver 进阶 + 冰火双修，利用冰环与火球的元素联动实现大范围清图与强力Boss战。终极天赋「元素集中」让伤害达到峰值。",
        tags: ["元素", "冰", "火", "清图", "Boss"],
        updateDate: "2025-05-26"
    },
    {
        id: 2, name: "死亡之眼 箭雨 [游侠]",
        class: "游侠", classEn: "Ranger",
        tag: "meta", tier: "T0",
        difficulty: "简单", cost: "低",
        description: "Deadeye 进阶配合多重投射辅助，远程火力全覆盖。穿甲天赋使后期高护甲敌人也能被有效击杀。新手首选流派。",
        tags: ["远程", "弓箭", "清图", "新手"],
        updateDate: "2025-05-25"
    },
    {
        id: 3, name: "泰坦 旋风斩 [勇士]",
        class: "勇士", classEn: "Warrior",
        tag: "meta", tier: "T0",
        difficulty: "简单", cost: "低",
        description: "Titan 进阶 + 旋风斩为核心，护甲带来的坚固体感让生存无忧。战吼辅助提供额外增伤与团队效果。刷图稳定舒适。",
        tags: ["近战", "旋风斩", "护甲", "新手"],
        updateDate: "2025-05-24"
    },
    {
        id: 4, name: "女巫猎人 弩炮 [佣兵]",
        class: "佣兵", classEn: "Mercenary",
        tag: "league", tier: "T1",
        difficulty: "中等", cost: "中等",
        description: "Witchhunter 进阶 + 弩系技能组合，驱魔特效对带有魔法护盾的敌人有额外克制。手雷提供优秀的AOE清图能力。",
        tags: ["弩", "范围", "驱魔"],
        updateDate: "2025-05-23"
    },
    {
        id: 5, name: "地狱师 地狱火 [女巫]",
        class: "女巫", classEn: "Witch",
        tag: "meta", tier: "T0",
        difficulty: "困难", cost: "高",
        description: "Infernalist 进阶 + 恶魔契约，以生命值为代价换取极高的魔法伤害。配合「鲜血与信仰」天赋实现极限爆发。",
        tags: ["召唤", "火焰", "高伤害", "后期"],
        updateDate: "2025-05-26"
    },
    {
        id: 6, name: "祈求者 神圣武技 [武僧]",
        class: "武僧", classEn: "Monk",
        tag: "budget", tier: "T1",
        difficulty: "中等", cost: "低",
        description: "Invoker 进阶将神圣力量融入武技，造成光属性额外伤害同时获得生命偷取。成本低且持续输出能力强。",
        tags: ["武技", "神圣", "生命偷取"],
        updateDate: "2025-05-22"
    },
    {
        id: 7, name: "血法师 冰刺连发 [女术士]",
        class: "女术士", classEn: "Sorceress",
        tag: "league", tier: "T1",
        difficulty: "中等", cost: "中等",
        description: "利用 Blood Mage 的生命转伤机制，将法术伤害与生命消耗完美结合。配合能量护盾实现攻防一体的玩法。",
        tags: ["冰法", "生命转伤", "护盾"],
        updateDate: "2025-05-21"
    },
    {
        id: 8, name: "寻路者 毒雨弓 [猎人]",
        class: "猎人", classEn: "Huntress",
        tag: "meta", tier: "T1",
        difficulty: "中等", cost: "低",
        description: "Pathfinder 进阶 + 药剂精通，利用毒雨叠加持续伤害。自动喝药机制大幅提升生存，是赛季开荒的上佳选择。",
        tags: ["弓箭", "毒伤", "持续伤害", "开荒"],
        updateDate: "2025-05-25"
    }
];

// ===== 新手指南（基于真实系统）=====
const GUIDES = [
    {
        id: 1,
        title: "从零开始：流放之路2新手完全入门指南",
        category: "入门必读", icon: "🌟",
        description: "角色创建→天赋加点→技能搭配→章节推进，手把手带你走完第一周目。详解与POE1的区别与核心改进。",
        date: "2025-05-26", views: 28600
    },
    {
        id: 2,
        title: "12大职业全解析：属性、武器与进阶推荐",
        category: "职业指南", icon: "🎭",
        description: "详细解析每个职业的主属性、武器专精、进阶分支与上手难度。帮助你选择最适合自己游戏风格的职业。",
        date: "2025-05-25", views: 19200
    },
    {
        id: 3,
        title: "天赋树系统详解：123点天赋如何分配",
        category: "核心系统", icon: "🌳",
        description: "深度解析天赋树三大区域（力量/敏捷/智力）、属性点旅行节点、小型/著名天赋、关键天赋与进阶天赋树。",
        date: "2025-05-24", views: 15800
    },
    {
        id: 4,
        title: "技能宝石系统：获取、升级与辅助链接",
        category: "技能系统", icon: "💎",
        description: "技能宝石等级机制、辅助宝石链接规则、不同颜色链接的获取方式，以及如何构建技能组合。",
        date: "2025-05-23", views: 14300
    },
    {
        id: 5,
        title: "装备系统入门：基底类型、词缀与工艺制作",
        category: "装备系统", icon: "⚔️",
        description: "详解POE2的装备体系：武器护甲的基底类型、词缀系统、以及如何使用工艺台制作装备。",
        date: "2025-05-22", views: 12700
    },
    {
        id: 6,
        title: "地图系统入门：Waystone机制与终局内容",
        category: "终局指南", icon: "🗺️",
        description: "Waystone的等级、词缀与完成机制；地图Boss与图腾挑战；终局内容的核心循环与刷图策略。",
        date: "2025-05-21", views: 11600
    },
    {
        id: 7,
        title: "资源系统：生命、法力、能量护盾与灵魂",
        category: "核心系统", icon: "💪",
        description: "四大资源系统的作用机制与相互关系；生命偷取与能量护盾再生的策略选择。",
        date: "2025-05-20", views: 9800
    },
    {
        id: 8,
        title: "国服专属内容与注意事项",
        category: "国服指南", icon: "🇨🇳",
        description: "国服与全球服的差异对比：服务器选择、延迟优化、翻译差异与本土化活动参与指南。",
        date: "2025-05-19", views: 22400
    }
];

// ===== 实用工具 =====
// ===== 实用工具 =====
const TOOLS = [
    { id: 1, name: "天赋模拟器", icon: "🌳", desc: "可视化天赋树加点，支持方案保存与链接分享", status: "开发中", url: "#" },
    { id: 2, name: "技能宝石数据库", icon: "💎", desc: "全技能宝石查询：等级需求、属性、辅助链接", status: "可用", url: "#" },
    { id: 3, name: "BD造价估算", icon: "💰", desc: "根据选定职业和装备等级估算成型成本", status: "开发中", url: "#" },
    { id: 4, name: "地图词缀查询", icon: "🗺️", desc: "Waystone词缀效果大全与过滤建议", status: "可用", url: "#" },
    { id: 5, name: "物品基底对比", icon: "⚔️", desc: "各武器/护甲基底属性对比与最优选择建议", status: "可用", url: "#" },
    { id: 6, name: "进阶职业对比", icon: "🎭", desc: "36个进阶职业效果一览与配装建议", status: "可用", url: "#" }
];

// ===== 资讯数据 =====
// ===== 资讯数据 =====
const NEWS = [
    {
        id: 1,
        title: "0.3.0 第三教条更新：第四章与终局内容正式上线",
        date: "2025-05-27",
        tag: "版本更新", tagColor: "#e74c3c",
        preview: "第三教条内容更新带来了完整的第四章剧情、两个全新进阶职业「先知 Oracle」与「萨满 Shaman」，以及地图系统的大规模扩展..."
    },
    {
        id: 2,
        title: "德鲁伊职业正式登场：变形流与自然魔法双路线解析",
        date: "2025-05-25",
        tag: "新内容", tagColor: "#2ecc71",
        preview: "0.4.0版本新增的德鲁伊职业引爆玩家社区，本文深入解析熊形态与狼形态的玩法差异，以及两个进阶职业的核心机制..."
    },
    {
        id: 3,
        title: "赛季联赛预告：裂痕回响赛季核心机制抢先看",
        date: "2025-05-23",
        tag: "联赛预告", tagColor: "#9b59b6",
        preview: "下一个赛季将以「裂痕回响」为核心机制，引入全新的回响词缀系统，让地图词缀的构建策略迎来革命性变化..."
    },
    {
        id: 4,
        title: "国服开服庆典：专属时装与限定物品获取指南",
        date: "2025-05-20",
        tag: "国服活动", tagColor: "#f39c12",
        preview: "国服专属开服庆典活动期间，登录即送限定时装「瓦尔克拉斯行者」，完成章节任务还可领取专属暗金装备..."
    },
    {
        id: 5,
        title: "全职业T0 BD排行：当前版本强度评级与造价分析",
        date: "2025-05-22",
        tag: "攻略精选", tagColor: "#3498db",
        preview: "基于最新版本数据，综合考虑刷图效率、Boss战能力与造价成本，排出当前版本各职业的最优Build选择..."
    }
];

// ===== 站点统计 =====
const SITE_STATS = {
    builds: 150, items: 2000, guides: 80, updates: 45
};

// ===== 搜索索引 =====
// ===== 搜索索引 =====
const SEARCH_INDEX = [
    ...BUILDS.map(b => ({ type: "BD", title: b.name, desc: b.description, url: "#builds" })),
    ...GUIDES.map(g => ({ type: "攻略", title: g.title, desc: g.description, url: "#guides" })),
    ...TOOLS.filter(t => t.status === "可用").map(t => ({ type: "工具", title: t.name, desc: t.desc, url: "#tools" })),
    ...CLASSES.map(c => ({ type: "职业", title: c.name, desc: c.desc, url: "#classes" })),
    { type: "系统", title: "天赋树", desc: "123点天赋分配，力量/敏捷/智力三大区域", url: "#guides" },
    { type: "系统", title: "技能宝石", desc: "主动技能、辅助宝石、链接机制", url: "#skills" },
    { type: "系统", title: "地图系统", desc: "Waystone等级、词缀与终局内容", url: "#maps" }
];