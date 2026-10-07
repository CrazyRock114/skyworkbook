/* Hand-curated game & quiz content. All facts sourced from the two workbooks;
   source strings use: 教材 p.X（PDF Y）/ P2 p.X（PDF Y） printed page numbers. */
window.CURATED = {};

/* ---------- Memory match sets (term <-> definition) ---------- */
CURATED.MEMORY_SETS = [
  { id: "enzymes", name: "消化酶 Digestive Enzymes", emoji: "🧪", pairs: [
    ["Amylase 淀粉酶", "Starch → Maltose 淀粉→麦芽糖"],
    ["Protease 蛋白酶", "Protein → Amino acids 蛋白→氨基酸"],
    ["Lipase 脂肪酶", "Lipid → Fatty acids + glycerol 脂肪→脂肪酸+甘油"],
    ["Maltase 麦芽糖酶", "Maltose → Glucose 麦芽糖→葡萄糖"],
    ["Pepsin 胃蛋白酶", "Works in acid, pH 2 (stomach) 在酸性胃中工作"],
    ["Trypsin 胰蛋白酶", "Works in alkaline small intestine 在碱性小肠工作"]
  ]},
  { id: "vessels", name: "血管 Blood Vessels", emoji: "🫀", pairs: [
    ["Artery 动脉", "Away from heart, thick wall 离心·厚壁·高压"],
    ["Vein 静脉", "Toward heart, has valves 回心·有瓣膜·低压"],
    ["Capillary 毛细血管", "One cell thick, exchange site 一细胞厚·物质交换"],
    ["Aorta 主动脉", "Largest artery, leaves left ventricle 最大动脉·出左心室"],
    ["Vena cava 腔静脉", "Returns blood to right atrium 回右心房"],
    ["Pulmonary artery 肺动脉", "Deoxygenated blood → lungs 缺氧血→肺"],
    ["Pulmonary vein 肺静脉", "Oxygenated blood → left atrium 充氧血→左心房"]
  ]},
  { id: "hormones", name: "腺体与激素 Glands & Hormones", emoji: "⚖️", pairs: [
    ["Adrenal glands 肾上腺", "Adrenaline 肾上腺素"],
    ["Pancreas 胰腺", "Insulin & glucagon 胰岛素与胰高血糖素"],
    ["Thyroid 甲状腺", "Thyroxine 甲状腺素"],
    ["Ovaries 卵巢", "Oestrogen 雌激素"],
    ["Testes 睾丸", "Testosterone 睾酮"],
    ["Pituitary 垂体", "The 'master gland' 主腺"]
  ]},
  { id: "blood", name: "血液成分 Blood Components", emoji: "🩸", pairs: [
    ["Red blood cell 红细胞", "Carries oxygen (haemoglobin) 运氧"],
    ["White blood cell 白细胞", "Fights infection 对抗感染"],
    ["Platelet 血小板", "Blood clotting 凝血"],
    ["Plasma 血浆", "Carries dissolved substances 运输溶解物"],
    ["Antigen 抗原", "On pathogen, triggers immunity 病原表面·触发免疫"],
    ["Fibrin 纤维蛋白", "Insoluble mesh from fibrinogen 不溶网状物"]
  ]},
  { id: "cycle", name: "月经周期激素 Cycle Hormones", emoji: "🌙", pairs: [
    ["FSH 促卵泡激素", "Stimulates follicle growth 促卵泡生长"],
    ["LH 黄体生成素", "Surge triggers ovulation 峰值触发排卵"],
    ["Oestrogen 雌激素", "Repairs & thickens lining 修复增厚内膜"],
    ["Progesterone 孕酮", "Maintains uterus lining 维持内膜"],
    ["Menstruation 月经", "Days 1-5, lining sheds 内膜脱落"],
    ["Ovulation 排卵", "Around day 14 约第14天"]
  ]},
  { id: "digestion", name: "消化器官 Digestive Organs", emoji: "🍽️", pairs: [
    ["Liver 肝脏", "Produces bile 产生胆汁"],
    ["Gall bladder 胆囊", "Stores bile 储存胆汁"],
    ["Pancreas 胰腺", "Digestive enzymes + alkali 消化酶+碱液"],
    ["Salivary glands 唾液腺", "Saliva with amylase 唾液含淀粉酶"],
    ["Small intestine 小肠", "Absorption via villi 绒毛吸收营养"],
    ["Large intestine 大肠", "Absorbs water, stores faeces 吸水·储粪"]
  ]}
];

/* ---------- Sequence / ordering challenges ---------- */
CURATED.SEQUENCES = [
  { id: "foodpath", name: "食物的消化路径 Food Path", source: "教材 p.35（PDF 37）", items: [
    "Mouth 口腔", "Oesophagus 食道", "Stomach 胃", "Small intestine 小肠", "Large intestine 大肠", "Anus 肛门" ]},
  { id: "airpath", name: "空气进入肺的路径 Air Path", source: "P2 p.35（PDF 37）", items: [
    "Nasal cavity 鼻腔", "Trachea 气管", "Bronchus 支气管", "Bronchiole 细支气管", "Alveoli 肺泡" ]},
  { id: "clot", name: "凝血过程 Blood Clotting", source: "教材 P2 p.26-27（PDF 28-29）", items: [
    "Blood vessel is damaged 血管受损", "Platelets stick & release clotting factors 血小板黏附并释放凝血因子",
    "Fibrinogen → Fibrin 纤维蛋白原转为纤维蛋白", "Fibrin mesh traps blood cells 纤维蛋白网截留血细胞",
    "Solid clot forms, bleeding stops 固态凝块止血" ]},
  { id: "rbckidney", name: "红细胞到肾之旅 RBC to Kidneys", source: "教材 p.189（PDF 191）L18-Q6", items: [
    "Left ventricle 左心室", "Aorta 主动脉", "Renal artery 肾动脉", "Kidneys 肾脏", "Renal vein 肾静脉", "Vena cava 腔静脉", "Right atrium 右心房" ]},
  { id: "cycle28", name: "月经周期六事件 Menstrual Cycle", source: "P2 p.128（PDF 130）", items: [
    "Menstruation 月经（内膜脱落）", "Follicle matures 卵泡成熟", "Ovulation 排卵", "Uterus lining thickens 内膜增厚",
    "Lining maintained 内膜维持", "Progesterone drops, cycle restarts 孕酮下降·周期重启" ]},
  { id: "heartbeat", name: "一次心跳的过程 Heartbeat", source: "教材 p.129-130（PDF 131-132）", items: [
    "Heart relaxed, blood fills atria 心脏舒张·血液充盈心房", "Atria contract 心房收缩", "AV valves close - \"lub\" 房室瓣关闭（lub）",
    "Ventricles contract 心室收缩", "Semilunar valves close - \"dub\" 半月瓣关闭（dub）", "Heart muscle relaxes 心肌舒张" ]},
  { id: "urine", name: "尿液的形成 Urine Formation", source: "P2 p.66-68（PDF 68-70）", items: [
    "Blood enters the glomerulus 血液进入肾小球", "High-pressure filtration into Bowman's capsule 高压滤过入肾小囊",
    "Selective reabsorption in the tubule 肾小管选择性重吸收", "Urine flows to collecting duct & bladder 尿液入集合管与膀胱" ]},
  { id: "stages", name: "食物加工五阶段 Processing Stages", source: "教材 p.44（PDF 46）", items: [
    "Ingestion 摄食", "Digestion 消化", "Absorption 吸收", "Assimilation 同化", "Egestion 排遗" ]}
];

/* ---------- True / False speed statements ---------- */
CURATED.TF = [
  { s: "Food passes through the liver. 食物会通过肝脏。", a: false, why: "肝是附属器官，食物不经过（教材 p.50）" },
  { s: "The gall bladder produces bile. 胆囊产生胆汁。", a: false, why: "肝产生、胆囊储存（教材 p.50）" },
  { s: "Enamel is the hardest substance in the human body. 牙釉质是人体最硬的物质。", a: true, why: "词汇表 p.6（PDF 8）" },
  { s: "The small intestine is about 6 metres long. 小肠约6米长。", a: true, why: "教材 p.37、p.95" },
  { s: "Villi decrease the surface area of the gut. 绒毛减小肠道表面积。", a: false, why: "绒毛大幅增加吸收表面积（教材 p.94）" },
  { s: "Most absorption happens in the stomach. 吸收主要发生在胃。", a: false, why: "吸收主要在小肠（教材 p.93）" },
  { s: "The pulmonary artery carries oxygenated blood. 肺动脉携带充氧血。", a: false, why: "肺动脉运缺氧血入肺（词汇表 p.15）" },
  { s: "Arteries carry blood away from the heart. 动脉把血送离心脏。", a: true, why: "教材 p.102" },
  { s: "Veins contain one-way valves. 静脉有单向瓣膜。", a: true, why: "教材 p.104、p.153" },
  { s: "Capillary walls are one cell thick. 毛细血管壁仅一细胞厚。", a: true, why: "教材 p.107 表（预填）" },
  { s: "The left ventricle has the thickest muscular wall. 左心室壁最厚。", a: true, why: "教材 p.111" },
  { s: "The 'lub' sound is caused by semilunar valves closing. lub 声由半月瓣关闭产生。", a: false, why: "lub=房室瓣关闭；dub=半月瓣（教材 p.130）" },
  { s: "Insulin raises blood glucose. 胰岛素升高血糖。", a: false, why: "胰岛素降糖；升糖靠胰高血糖素（P2 p.91）" },
  { s: "Glucagon converts glycogen into glucose. 胰高血糖素把糖原转为葡萄糖。", a: true, why: "P2 p.89、p.93" },
  { s: "The pancreas monitors blood glucose concentration. 胰腺监测血糖浓度。", a: true, why: "P2 p.91（Islets of Langerhans）" },
  { s: "Type 1 diabetes is treated with insulin injections. 一型糖尿病用胰岛素注射治疗。", a: true, why: "P2 p.93" },
  { s: "Adrenaline slows the heart rate. 肾上腺素减慢心率。", a: false, why: "肾上腺素加快心跳（P2 p.84）" },
  { s: "Sweating helps cool the body down. 出汗帮助身体降温。", a: true, why: "蒸发散热（P2 p.66）" },
  { s: "Urea is made in the liver. 尿素在肝脏产生。", a: true, why: "P2 p.15、p.51" },
  { s: "Egestion removes metabolic waste. 排遗排出代谢废物。", a: false, why: "排遗=未消化食物；代谢废物=排泄（P2 p.53）" },
  { s: "Ovulation happens around day 14 of a 28-day cycle. 28天周期的排卵约在第14天。", a: true, why: "P2 p.121-122" },
  { s: "Progesterone maintains the uterus lining. 孕酮维持子宫内膜。", a: true, why: "P2 词汇表 p.13" },
  { s: "FSH triggers ovulation. FSH 触发排卵。", a: false, why: "FSH促卵泡生长；LH峰触发排卵（P2 p.123）" },
  { s: "Alveolar walls are one cell thick. 肺泡壁仅一细胞厚。", a: true, why: "P2 p.44" },
  { s: "Exhaled air contains more CO2 than fresh air. 呼出气CO₂高于新鲜空气。", a: true, why: "石灰水实验（P2 p.48）" },
  { s: "Red blood cells have a nucleus. 红细胞有细胞核。", a: false, why: "成熟红细胞无核（教材 p.175）" }
];

/* ---------- Numeric cloze (typed answer, objective grading) ---------- */
CURATED.CLOZE = [
  { q: "The small intestine is about ___ metres long. 小肠约___米长。", a: ["6"], unit: "m", src: "教材 p.37（PDF 39）趣味事实" },
  { q: "The whole alimentary canal is about ___ metres long. 整条消化道约___米长。", a: ["9"], unit: "m", src: "教材 p.37（PDF 39）趣味事实" },
  { q: "18 pulses in 15 seconds = ___ bpm. 15秒18次脉搏=每分钟___次。", a: ["72"], unit: "bpm", src: "教材 p.150（PDF 152）Table 14.2" },
  { q: "22 pulses in 15 seconds = ___ bpm. 15秒22次=每分钟___次。", a: ["88"], unit: "bpm", src: "教材 p.126（PDF 128）L12-Q2" },
  { q: "15 pulses in 15 seconds = ___ bpm. 15秒15次=每分钟___次。", a: ["60"], unit: "bpm", src: "教材 p.136（PDF 138）Task 13.6" },
  { q: "The normal resting heart rate for teenagers is 60-___ bpm. 青少年正常静息心率为60-___次/分。", a: ["100"], unit: "bpm", src: "教材 p.135（PDF 137）" },
  { q: "In Task 15.5, at 50 g the diameter was 34 mm. Starting from 20 mm, the increase = ___ mm. 拉伸实验50g时直径34mm，增量为___mm。", a: ["14"], unit: "mm", src: "教材 p.161（PDF 163）Table 15.2" },
  { q: "The menstrual cycle lasts about ___ days on average. 月经周期平均约___天。", a: ["28"], unit: "days", src: "P2 p.121（PDF 123）" },
  { q: "In a 28-day cycle, ovulation happens around day ___. 28天周期的排卵约在第___天。", a: ["14"], unit: "", src: "P2 p.122、Table 32.1" },
  { q: "Progesterone peaks around day ___ (28-day cycle). 孕酮约在第___天达峰。", a: ["21"], unit: "", src: "P2 p.127（PDF 129）Table 32.1" },
  { q: "A 35-day cycle: ovulation would likely occur around day ___. 35天周期排卵约在第___天。", a: ["21"], unit: "", src: "P2 p.129（PDF 131）Task 32.9" },
  { q: "Normal blood glucose baseline is about ___ mg/dL. 血糖正常基线约___mg/dL。", a: ["90"], unit: "mg/dL", src: "P2 p.93（PDF 95）" },
  { q: "Teenagers need about ___ hours of sleep per night (adults need 7-8). 青少年每晚约需___小时睡眠。", a: ["9","10","9-10","9~10"], unit: "h", src: "P2 p.115（PDF 117）趣味事实" }
];

/* ---------- Diagram quiz (image-based MCQs) ---------- */
CURATED.DIAGRAM_QUIZ = [
  { img: "img/diag_respiratory.jpg", q_en: "Figure 1: Which labelled structure is the TRACHEA? 图中标注哪个是气管？",
    opts: ["A", "B", "C", "D"], correct: 1,
    why: "B 指向气管（A=鼻腔、C=支气管、D=细支气管）。出处：P2 p.132（PDF 134）Section A Q9", src: "P2 p.132（PDF 134）Revision A-Q9" },
  { img: "img/diag_respiratory.jpg", q_en: "Figure 1: Which labelled structure is the BRONCHUS? 图中哪个是支气管？",
    opts: ["A", "B", "C", "D"], correct: 2,
    why: "C 指向进入左肺的支气管。出处：P2 p.132 Figure 1", src: "P2 p.132（PDF 134）Figure 1" },
  { img: "img/diag_heart.png", q_en: "Which chamber pumps oxygenated blood to the WHOLE BODY? 哪个腔把充氧血泵往全身？",
    opts: ["Right atrium 右心房", "Right ventricle 右心室", "Left atrium 左心房", "Left ventricle 左心室"], correct: 3,
    why: "左心室壁最厚，把血经主动脉泵往全身（到脚尖和大脑）。出处：教材 p.111、p.116 Fig 11.4", src: "教材 p.111（PDF 113）" },
  { img: "img/diag_heart.png", q_en: "The vena cava delivers deoxygenated blood into which chamber? 腔静脉把缺氧血送入哪个腔？",
    opts: ["Right atrium 右心房", "Right ventricle 右心室", "Left atrium 左心房", "Left ventricle 左心室"], correct: 0,
    why: "腔静脉→右心房。出处：词汇表 p.14、Fig 11.4 词库", src: "教材 p.116（PDF 118）Fig 11.4" },
  { img: "img/diag_villus.jpg", q_en: "Which NUMBER points at the LACTEAL? 哪个编号指向乳糜管？",
    opts: ["1", "2", "3", "4"], correct: 1,
    why: "2=中央乳糜管（1=微绒毛、3=毛细血管、4=上皮细胞）。出处：教材 p.100（PDF 102）Fig 9.4", src: "教材 p.100（PDF 102）Task 9.5" },
  { img: "img/diag_villus.jpg", q_en: "Which NUMBER points at the BLOOD CAPILLARY? 哪个编号指向毛细血管？",
    opts: ["1", "2", "3", "4"], correct: 2,
    why: "3=毛细血管网，吸收葡萄糖与氨基酸入血。出处：教材 p.100 Fig 9.4", src: "教材 p.100（PDF 102）Task 9.5" },
  { img: "img/diag_urinary.jpg", q_en: "Which labelled structure STORES urine? 哪个结构储存尿液？",
    opts: ["Kidney 肾", "Ureter 输尿管", "Bladder 膀胱", "Urethra 尿道"], correct: 2,
    why: "膀胱是有弹性的储尿囊。出处：P2 p.52（PDF 54）§The Excretory Anatomy", src: "P2 p.52（PDF 54）" },
  { img: "img/diag_nephron.png", q_en: "High-pressure filtration happens in the…? 高压滤过发生在哪里？",
    opts: ["Collecting duct 集合管", "Glomerulus 肾小球", "Ureter 输尿管", "Bladder 膀胱"], correct: 1,
    why: "肾小球内高压把水/尿素/葡萄糖/盐压出成滤液。出处：P2 p.67（PDF 69）", src: "P2 p.67（PDF 69）" },
  { img: "img/diag_bodyvessels.jpg", q_en: "Which vessel carries nutrient-rich blood from the intestines to the liver? 哪条血管把富营养血从小肠运往肝？",
    opts: ["Hepatic artery 肝动脉", "Hepatic vein 肝静脉", "Hepatic portal vein 肝门静脉", "Renal artery 肾动脉"], correct: 2,
    why: "肝门静脉连接小肠与肝两套毛细血管。出处：教材 p.172（PDF 174）Fig 16.3", src: "教材 p.172（PDF 174）Task 16.2" },
  { img: "img/diag_tooth.jpg", q_en: "The hardest substance in the human body covers the crown as…? 人体最硬的物质是覆盖牙冠的…？",
    opts: ["Dentine 牙本质", "Pulp 牙髓", "Enamel 牙釉质", "Gum 牙龈"], correct: 2,
    why: "牙釉质是人体最硬物质，覆盖牙冠。出处：词汇表 p.6（PDF 8）、教材 p.55", src: "教材 p.61（PDF 63）Fig 4.2" },
  { img: "img/diag_cyclewheel.jpg", q_en: "Around which DAY does ovulation occur (28-day cycle)? 28天周期中排卵约在第几天？",
    opts: ["Day 1", "Day 7", "Day 14", "Day 28"], correct: 2,
    why: "LH 峰在约第14天触发排卵（图中星标）。出处：P2 p.126（PDF 128）Fig 32.2", src: "P2 p.126（PDF 128）Task 32.2" },
  { img: "img/diag_endocrine.jpg", q_en: "Which glands sit like triangular hats ON TOP OF the kidneys? 哪对腺体像三角帽一样骑在肾上？",
    opts: ["Pancreas 胰腺", "Thyroid 甲状腺", "Adrenal glands 肾上腺", "Ovaries 卵巢"], correct: 2,
    why: "肾上腺位于两肾上方，分泌肾上腺素。出处：P2 p.83（PDF 85）§Mapping the Glands", src: "P2 p.83（PDF 85）" }
];

/* MCQ items that require their workbook figure and live in the diagram quiz instead */
CURATED.DIAGRAM_ONLY_IDS = ["P2-REV-M09"];
