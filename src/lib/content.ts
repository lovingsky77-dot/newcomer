export type ScheduleItem = {
  time: string;
  title: string;
  type: "welcome" | "business" | "move" | "experience" | "vision";
  detail?: string;
};

export const schedules: Record<string, { date: string; place: string; theme: string; items: ScheduleItem[] }> = {
  "DAY 1": {
    date: "9/14",
    place: "서울사무소",
    theme: "연결의 시작",
    items: [
      { time: "11:00", title: "과정소개 & Icebreaking", type: "welcome", detail: "1시간" },
      { time: "12:00", title: "점심", type: "welcome", detail: "1시간" },
      { time: "13:00", title: "환영사", type: "welcome", detail: "1시간" },
      { time: "14:00", title: "사업부문 소개", type: "business", detail: "1시간" },
      { time: "15:00", title: "자기비저닝(팀빌딩)", type: "vision", detail: "3시간" },
    ],
  },
  "DAY 2": {
    date: "9/15",
    place: "서울사무소 · 동부권역센터 · 창녕비전캠퍼스",
    theme: "사업을 읽는 시선",
    items: [
      { time: "09:00", title: "대동 농기계 상품 소개", type: "business", detail: "1시간" },
      { time: "10:00", title: "모빌리티 & 로보틱스 사업소개", type: "business", detail: "1시간" },
      { time: "11:00", title: "Agtech & AILab 사업소개", type: "business", detail: "1시간" },
      { time: "12:00", title: "점심 및 이동", type: "move", detail: "서울사무소 → 동부권역센터" },
      { time: "15:30", title: "권역센터 소개 및 현장투어", type: "experience", detail: "1시간" },
      { time: "16:30", title: "비전캠퍼스로 이동", type: "move", detail: "동부권역센터 → 창녕비전캠퍼스" },
    ],
  },
  "DAY 3": {
    date: "9/16",
    place: "성서통합R&D센터 · 대구공장 · 그룹시험센터",
    theme: "대동 사업장을 이해하다",
    items: [
      { time: "09:00", title: "개발부문 소개", type: "business", detail: "1시간" },
      { time: "10:00", title: "개발 프로세스 소개", type: "business", detail: "1.5시간" },
      { time: "11:30", title: "점심 및 이동", type: "move", detail: "성서통합R&D센터 → 대구공장" },
      { time: "13:30", title: "공장부문 소개 및 생산공정의 이해", type: "business", detail: "1시간" },
      { time: "14:30", title: "공장 현장투어", type: "experience", detail: "1.5시간" },
      { time: "16:00", title: "비전캠퍼스로 이동", type: "move", detail: "대구공장 → 창녕비전캠퍼스" },
      { time: "17:00", title: "그룹시험센터 투어", type: "experience", detail: "1시간" },
    ],
  },
  "DAY 4": {
    date: "9/17",
    place: "대동기어 · 대동모빌리티 · 대동금속",
    theme: "그룹사를 연결하다",
    items: [
      { time: "09:00", title: "대동기어로 이동", type: "move", detail: "창녕비전캠퍼스 → 대동기어" },
      { time: "09:30", title: "대동기어 사업장 소개 및 현장투어", type: "experience", detail: "1.5시간" },
      { time: "11:00", title: "점심 및 이동", type: "move", detail: "대동기어 → 대동모빌리티" },
      { time: "13:00", title: "모빌리티 사업장 소개 및 S-Factory 투어", type: "experience", detail: "1.5시간" },
      { time: "14:30", title: "대동금속으로 이동", type: "move", detail: "대동모빌리티 → 대동금속" },
      { time: "15:30", title: "대동금속 사업장 소개 및 현장투어", type: "experience", detail: "1.5시간" },
      { time: "17:00", title: "비전캠퍼스로 이동", type: "move", detail: "대동금속 → 창녕비전캠퍼스" },
    ],
  },
  "DAY 5": {
    date: "9/18",
    place: "창녕비전캠퍼스",
    theme: "대동인이 되다",
    items: [
      { time: "09:00", title: "농기계 체험", type: "experience", detail: "3시간 · 기술을 직접 경험하며 5일의 배움을 완성합니다." },
      { time: "12:00", title: "점심", type: "welcome" },
      { time: "13:00", title: "과정 마무리", type: "welcome" },
    ],
  },
};

export type QuizQuestion = {
  id: string;
  type: "knowledge" | "personality";
  category: string;
  question: string;
  options: string[];
  correctIndex: number | null;
  explanation: string;
  image?: string | null;
  active?: boolean;
  sortOrder: number;
};

export const defaultQuestions: QuizQuestion[] = [
  { id: "history", type: "knowledge", category: "HERITAGE", question: "대동의 시작은 언제일까요?", options: ["1937년", "1947년", "1957년", "1967년"], correctIndex: 1, explanation: "대동은 1947년 창업 이후 한국 농업의 기계화를 이끌어왔습니다.", sortOrder: 1 },
  { id: "values", type: "knowledge", category: "VALUE", question: "대동의 핵심가치가 아닌 것은 무엇일까요?", options: ["창조", "신뢰", "안전", "열정"], correctIndex: 2, explanation: "대동의 핵심가치는 창조, 신뢰, 열정, 책임입니다.", sortOrder: 2 },
  { id: "future-five", type: "knowledge", category: "AI TO THE FIELD", question: "2026년 대동이 제시한 미래 5대 사업의 올바른 조합은?", options: ["정밀농업·로보틱스·스마트파밍·AI 에이전트·커넥티드", "농기계·금융·건설·항공·물류", "스마트폰·반도체·바이오·게임·로봇", "트랙터·이앙기·콤바인·경운기·엔진"], correctIndex: 0, explanation: "AI와 데이터, 로보틱스를 기반으로 다섯 사업의 경쟁력을 고도화하고 있습니다.", sortOrder: 3 },
  { id: "future-three", type: "knowledge", category: "VISION", question: "AI to the Field를 이루는 3대 핵심 축은?", options: ["AI 정밀농업·AI 스마트파밍·AI 필드로봇", "생산·영업·서비스", "서울·대구·창녕", "농업·금융·유통"], correctIndex: 0, explanation: "세 핵심 축은 오퍼레이션 센터와 연결되어 농업의 AI 대전환을 만듭니다.", sortOrder: 4 },
  { id: "machine", type: "knowledge", category: "MACHINE", question: "사진 속 대동의 자율작업 농기계는 무엇일까요?", options: ["콤바인", "트랙터", "이앙기", "스키드로더"], correctIndex: 1, explanation: "트랙터는 경운부터 파종까지 다양한 농작업의 중심을 담당합니다.", image: "/images/future-04.png", sortOrder: 5 },
  { id: "day-five", type: "knowledge", category: "JOURNEY", question: "5일차 여정을 완성하는 대표 프로그램은?", options: ["농기계 체험", "해외사업 소개", "자기비저닝", "모빌리티 신공장 투어"], correctIndex: 0, explanation: "DAY 5에는 비전캠퍼스에서 농기계를 직접 체험합니다.", sortOrder: 6 },
  { id: "personality", type: "personality", category: "MY VALUE", question: "새로운 과제를 만났을 때 나는 어떤 사람에 가까운가요?", options: ["새로운 방법을 먼저 상상한다", "동료의 의견을 듣고 연결한다", "끝까지 에너지를 잃지 않는다", "맡은 결과를 확실하게 완성한다"], correctIndex: null, explanation: "선택에는 정답이 없습니다. 지금의 나를 가장 잘 표현하는 문장을 골라보세요.", sortOrder: 7 },
];

export const valueTypes = ["창조", "신뢰", "열정", "책임"] as const;
