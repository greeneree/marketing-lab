import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AISTUDIO_KEY);

export default async function handler(req, res) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            industry,
            storeName,
            district,
            monthlySales,
            platforms,
            hasHitProduct,
            hitProductName,
            concern,
            topServices,
            competitors,
            faqs,
            bookingMethods,
            reviews,
            strength
        } = req.body;

        // AI 프롬프트 생성
        const prompt = generatePrompt({
            industry,
            storeName,
            district,
            monthlySales,
            platforms,
            hasHitProduct,
            hitProductName,
            concern,
            topServices,
            competitors,
            faqs,
            bookingMethods,
            reviews,
            strength
        });

        // Gemini API 호출
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // JSON 파싱
        const strategyData = parseAIResponse(text, {
            industry,
            district,
            monthlySales,
            hasHitProduct,
            hitProductName
        });

        return res.status(200).json(strategyData);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'AI 전략 생성 중 오류가 발생했습니다.',
            details: error.message
        });
    }
}

function generatePrompt(data) {
    const platformText = data.platforms?.includes('none') ? '온라인 등록 없음' : 
        `${(data.platforms || []).map(p => {
            if (p === 'naver') return '네이버플레이스';
            if (p === 'kakao') return '카카오맵';
            return '기타';
        }).join(', ')} 등록됨`;

    const hitProductText = data.hasHitProduct ? 
        `주요 히트 상품: ${data.hitProductName}` : 
        '주요 히트 상품 없음 (신규 시그니처 메뉴 개발 필요)';

    const reviewsText = data.reviews ? `
- 리뷰 현황:
  * 네이버: ${data.reviews.naver.count}개, 평점 ${data.reviews.naver.rating}/5.0
  * 카카오: ${data.reviews.kakao.count}개, 평점 ${data.reviews.kakao.rating}/5.0
  * 구글: ${data.reviews.google.count}개, 평점 ${data.reviews.google.rating}/5.0` : '';

    const competitorsText = data.competitors?.length > 0 ? `
- 경쟁 매장:
${data.competitors.map((c, i) => `  ${i+1}. ${c.name || '(이름 미입력)'} - ${c.feature || '특징 없음'} - ${c.price || '가격대 미입력'}`).join('\n')}` : '';

    const faqsText = data.faqs?.length > 0 ? `
- 고객 자주 묻는 질문:
${data.faqs.map((q, i) => `  ${i+1}. ${q}`).join('\n')}` : '';

    return `
당신은 생존이 걸린 골목상권에서 죽어가는 가게를 살려내는 10년 이상 경력의 로컬 비즈니스 전문 마케팅/그로스 컨설턴트입니다.
목표는 "보기 좋은 조언"이 아니라 **12주 내 매출/신규/재방문을 실제로 올리는 실행안**입니다.

[중요 규칙]
- 근거 없는 업계 평균/수치를 만들어내지 마세요.
- 입력 정보로 계산 가능한 수치는 계산식과 함께 제시하세요.
- 모르는 정보는 (가정)으로 표시하고, 그 가정을 검증하는 방법을 제시하세요.
- 업종별 법/플랫폼 정책 리스크가 있으면 반드시 경고와 대체 표현을 제시하세요.

# 가게 정보
- 업종: ${data.industry}
- 이름: ${data.storeName}
- 위치: 서울 마포구 ${data.district}
- 월 평균 매출: ${data.monthlySales}만원
- ${platformText}
- ${hitProductText}
- 현재 고민: ${data.concern}
- 가게 강점: ${data.strength || '(미입력)'}
- 주요 서비스/가격: ${data.topServices || '(미입력)'}
- 예약/결제 방식: ${(data.bookingMethods || []).join(', ') || '(미입력)'}
${reviewsText}
${competitorsText}
${faqsText}

# 응답 형식: 반드시 유효한 JSON만 응답하세요

{
  "summary": {
    "coreLevers": ["레버1", "레버2", "레버3"],
    "reasoning": ["레버1 이유", "레버2 이유", "레버3 이유"],
    "stopDoing": ["하지 않을 것1", "하지 않을 것2", "하지 않을 것3"]
  },
  "diagnosis": {
    "strengths": [
      {"title": "강점1", "data": "데이터", "interpretation": "해석", "implication": "시사점"}
    ],
    "weaknesses": [
      {"title": "약점1", "data": "데이터 또는 (가정)", "interpretation": "해석", "implication": "시사점"}
    ],
    "segments": [
      {"name": "세그먼트A", "profile": "프로필", "motivation": "동기", "barrier": "장벽"},
      {"name": "세그먼트B", "profile": "프로필", "motivation": "동기", "barrier": "장벽"}
    ],
    "positioning": "포지셔닝 문장"
  },
  "offers": [
    {
      "name": "오퍼명",
      "segment": "타깃",
      "composition": "구성",
      "pricing": "가격 코멘트",
      "conversionDevice": "전환 장치",
      "retentionDevice": "재방문 장치",
      "compliance": "규정 리스크"
    }
  ],
  "strategies": [
    {
      "title": "전략명",
      "kpi": "목표",
      "segment": "타깃",
      "steps": ["1단계", "2단계"],
      "owner": "담당자",
      "timeRequired": "시간",
      "tools": "도구",
      "cost": "비용",
      "expectedEffect": "효과",
      "description": "설명"
    }
  ],
  "partnerships": [
    {
      "candidateTypes": ["업종1", "업종2"],
      "method": "제휴 방식",
      "customerFlow": "고객 동선",
      "costStructure": "비용 구조",
      "safeguards": "방지 룰",
      "pilot": "파일럿 방법"
    }
  ],
  "weeklyPlan": [
    {
      "week": "1-2",
      "theme": "테마",
      "deliverables": ["산출물"],
      "days": [
        {"day": 1, "action": "액션", "dod": "완료 기준"}
      ]
    }
  ],
  "contentIdeas": [
    {
      "format": "포맷",
      "hook": "훅",
      "outline": "대본",
      "cta": "CTA",
      "compliance": "규정"
    }
  ],
  "kpis": [
    {"name": "KPI명", "target": "목표", "measurement": "측정법"}
  ],
  "weeklyReviewTemplate": ["질문1", "질문2"],
  "expectedResults": {
    "current": {"sales": ${data.monthlySales * 10000}, "newCustomers": "(가정)", "revisitRate": "(가정)"},
    "after": {"sales": 0, "newCustomers": "(목표)", "revisitRate": "(목표)"},
    "investment": {"budget": "예산", "time": "시간"},
    "roiRange": {"conservative": 0, "baseline": 0, "aggressive": 0},
    "risks": [{"risk": "리스크", "mitigation": "완화책"}]
  },
  "hashtags": ["#해시태그"],
  "keywords": {"naver": ["키워드"], "kakao": ["키워드"]}
}

**중요**: 유효한 JSON만 응답하세요. 마크다운/설명 금지.
`;
}

function parseAIResponse(text, context) {
    try {
        // JSON 추출
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }

        const parsed = JSON.parse(jsonText);

        // 기본 구조로 변환 (기존 UI 호환)
        const result = {
            diagnosis: {
                strengths: parsed.diagnosis?.strengths?.map(s => s.title || s) || [],
                weaknesses: parsed.diagnosis?.weaknesses?.map(w => w.title || w) || []
            },
            strategies: (parsed.strategies || []).map(s => ({
                title: s.title,
                description: s.description || s.steps?.join('. ') || '상세 설명',
                cost: s.cost,
                difficulty: s.difficulty || '중',
                effect: s.expectedEffect || s.kpi
            })),
            weeklyPlan: generateWeeklyPlan(parsed.weeklyPlan, context.industry),
            hashtags: parsed.hashtags || generateHashtags(context.industry, context.district),
            keywords: parsed.keywords || generateKeywords(context.industry, context.district),
            expectedResults: parsed.expectedResults || generateExpectedResults(context.monthlySales)
        };

        return result;

    } catch (error) {
        console.error('JSON Parse Error:', error);
        return getDefaultResponse(context);
    }
}

function generateWeeklyPlan(aiPlan, industry) {
    if (aiPlan && aiPlan.length > 0) {
        // AI가 제공한 계획을 일자별로 변환
        const result = [];
        aiPlan.forEach(wp => {
            const days = wp.days || [];
            days.forEach(d => {
                result.push({
                    week: wp.week,
                    theme: wp.theme,
                    days: [d.action || '실행 과제']
                });
            });
        });
        return result;
    }

    // 기본 12주 계획
    const plans = [];
    for (let week = 1; week <= 12; week++) {
        plans.push({
            week,
            theme: `${week}주차 실행`,
            days: [
                "고객 DB 정리",
                "SNS 콘텐츠 제작",
                "지역 제휴 협의",
                "이벤트 준비",
                "고객 피드백 수집",
                "주간 성과 분석",
                "다음주 계획 수립"
            ]
        });
    }
    return plans;
}

function generateHashtags(industry, district) {
    const base = ['#마포', `#마포${industry}`, `#${district}`, `#${district}맛집`];
    const industryTags = {
        '한의원': ['#한의원', '#통증치료', '#추나요법', '#침술', '#한방치료'],
        '카페': ['#카페', '#카페스타그램', '#커피', '#디저트', '#카페추천'],
        '헬스장': ['#헬스', '#헬스장', '#PT', '#다이어트', '#운동'],
        '네일샵': ['#네일', '#네일아트', '#젤네일', '#네일샵', '#네일스타그램']
    };
    return [...base, ...(industryTags[industry] || [])].slice(0, 15);
}

function generateKeywords(industry, district) {
    const districtName = district.replace('동', '');
    return {
        naver: [
            `마포 ${industry}`,
            `${district} ${industry}`,
            `${districtName} ${industry}`,
            `마포 추천 ${industry}`,
            `${district} 맛집`
        ],
        kakao: [
            `${district} ${industry}`,
            `마포구 ${industry}`,
            `${districtName} ${industry} 추천`,
            `홍대 ${industry}`,
            `합정 ${industry}`
        ]
    };
}

function generateExpectedResults(currentSales) {
    const current = currentSales * 10000;
    const increase = Math.round(current * 0.3);
    const after = current + increase;
    const profit = Math.round(increase * 0.3);

    return {
        current: { sales: current },
        after: { sales: after },
        increase: {
            sales: increase,
            profit: profit
        },
        roi: 3.5
    };
}

function getDefaultResponse(context) {
    return {
        diagnosis: {
            strengths: ["지역 내 인지도", "기존 고객 만족도", "서비스 품질"],
            weaknesses: ["신규 고객 유입 부족", "온라인 마케팅 미흡", "재방문율 개선 필요"]
        },
        strategies: [
            {
                title: "지역 제휴 마케팅",
                description: "인근 업체와 제휴하여 상호 할인 혜택 제공",
                cost: "5만원",
                difficulty: "하",
                effect: "신규 고객 월 10명 증가"
            }
        ],
        weeklyPlan: generateWeeklyPlan(null, context.industry),
        hashtags: generateHashtags(context.industry, context.district),
        keywords: generateKeywords(context.industry, context.district),
        expectedResults: generateExpectedResults(context.monthlySales)
    };
}
