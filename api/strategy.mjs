import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경 변수 우선순위 설정
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AISTUDIO_KEY;
console.log("🔑 API Key 상태:", apiKey ? `설정됨 (${apiKey.substring(0, 7)}...)` : "❌ 없음");

const genAI = new GoogleGenerativeAI(apiKey);

export default async function handler(req, res) {
    // CORS 헤더 설정
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
        const formData = req.body;
        console.log("📥 받은 데이터:", JSON.stringify(formData, null, 2));

        // AI 프롬프트 생성
        const prompt = generatePrompt(formData);
        console.log("📝 생성된 프롬프트 길이:", prompt.length);

        // Gemini API 호출
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ AI 응답 길이:", text.length);

        // JSON 파싱 및 구조화
        const strategyData = parseAIResponse(text, formData);

        return res.status(200).json(strategyData);

    } catch (error) {
        console.error('❌ API Error:', error);
        return res.status(500).json({
            error: 'AI 전략 생성 중 오류가 발생했습니다.',
            details: error.message
        });
    }
}

// ========================================
// AI 프롬프트 생성
// ========================================
function generatePrompt(data) {
    const {
        industry, storeName, district, monthlySales, realProfit,
        platforms, timeSchedule, concerns,
        topServices, competitors, faqs, bookingMethods, paymentMethods,
        reviews, snsInfo, industrySpecific
    } = data;

    // 히트 상품 추출
    const hitProducts = topServices?.filter(s => s.isHit).map(s => s.name) || [];
    const hitProductText = hitProducts.length > 0 
        ? `히트 상품: ${hitProducts.join(', ')}` 
        : '히트 상품 없음 (신규 개발 필요)';

    // 서비스 목록
    const servicesText = topServices?.map((s, i) => 
        `${i+1}. ${s.name} - ${Number(s.price).toLocaleString()}원${s.isHit ? ' ⭐' : ''}`
    ).join('\n  ') || '정보 없음';

    // 경쟁사 분석
    const competitorsText = competitors?.length > 0 
        ? competitors.map((c, i) => `${i+1}. ${c.name || '(미입력)'} - 특징: ${c.feature || '없음'}, 가격: ${c.price || '미입력'}`).join('\n  ')
        : '경쟁 정보 없음';

    // FAQ
    const faqText = faqs?.length > 0 
        ? faqs.map((q, i) => `${i+1}. ${q}`).join('\n  ')
        : '없음';

    // 리뷰 분석
    const reviewsText = `
  네이버: ${reviews?.naver?.count || 0}개, ${reviews?.naver?.rating || 0}점
  카카오: ${reviews?.kakao?.count || 0}개, ${reviews?.kakao?.rating || 0}점
  구글: ${reviews?.google?.count || 0}개, ${reviews?.google?.rating || 0}점`;

    // SNS 정보
    const snsText = snsInfo 
        ? `운영 중 (팔로워 ${snsInfo.followers}명, 주 ${snsInfo.frequency}회 업로드, 해시태그: ${snsInfo.hashtags})`
        : '미운영';

    // 업종별 특화 정보
    const specificText = Object.entries(industrySpecific || {})
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');

    // 평균 리뷰 평점 계산
    const avgRating = reviews 
        ? ((reviews.naver.rating + reviews.kakao.rating + reviews.google.rating) / 3).toFixed(1)
        : 0;

    // 예상 매출 증가
    const targetSales = Math.round(monthlySales * 1.3);
    const increaseSales = Math.round(monthlySales * 0.3);
    const increaseProfit = realProfit 
        ? Math.round(realProfit * 0.4)
        : Math.round(monthlySales * 0.1);

    const prompt = `
당신은 생존이 걸린 골목상권에서 죽어가는 가게를 살려내는 15년 경력의 로컬 비즈니스 전문 마케팅/그로스 컨설턴트입니다.

당신의 목표는 **실행 가능한 전략**을 제시하는 것입니다. 뻔한 위로는 필요 없습니다. 데이터를 기반으로 날카롭게 진단하고, 당장 내일부터 실행할 수 있는 구체적인 액션 플랜을 제시하세요.

# 📊 가게 정보

**기본 정보**
- 업종: ${industry}
- 상호명: ${storeName}
- 위치: 마포구 ${district}
- 월 평균 매출: ${monthlySales.toLocaleString()}만원
- 실제 수익: ${realProfit ? realProfit.toLocaleString() + '만원' : '미입력'}
- 온라인 등록: ${platforms?.join(', ') || '없음'}

**영업 시간대**
- 평일 한가한 시간: ${timeSchedule?.weekday?.idle?.start}:00 ~ ${timeSchedule?.weekday?.idle?.end}:00
- 평일 바쁜 시간: ${timeSchedule?.weekday?.busy?.start}:00 ~ ${timeSchedule?.weekday?.busy?.end}:00
- 주말 한가한 시간: ${timeSchedule?.weekend?.idle?.start}:00 ~ ${timeSchedule?.weekend?.idle?.end}:00
- 주말 바쁜 시간: ${timeSchedule?.weekend?.busy?.start}:00 ~ ${timeSchedule?.weekend?.busy?.end}:00

**현재 고민**
${concerns?.map((c, i) => `${i+1}. ${c}`).join('\n') || '없음'}

**주요 서비스 Top 3**
  ${servicesText}
  ${hitProductText}

**경쟁 매장 분석**
  ${competitorsText}

**고객 자주 묻는 질문 (FAQ)**
  ${faqText}

**예약/결제 방식**
- 예약: ${bookingMethods?.join(', ') || '없음'}
- 결제: ${paymentMethods?.join(', ') || '없음'}

**리뷰 현황**
${reviewsText}
- 평균 평점: ${avgRating}/5.0

**SNS 운영**
${snsText}

**업종별 특화 정보 (${industry})**
${specificText || '  없음'}

---

# 🎯 분석 지침

1. **강점 분석**: 위 데이터에서 실제로 강점이 될 수 있는 요소 3가지를 찾아라. 경쟁사 대비 차별화 포인트를 명확히 하라.

2. **약점 진단**: 리뷰 평점, 온라인 등록 여부, 히트 상품 유무, SNS 활동 등을 보고 뼈아픈 약점 3가지를 지적하라. 마포구 ${district} 상권에서 살아남으려면 무엇을 바꿔야 하는지 경고하라.

3. **즉시 실행 전략**: 지금 당장 돈 들이지 않고 실행할 수 있는 전략 3~5개를 제시하라. 각 전략마다 구체적인 실행 방법, 예상 비용, 난이도, 예상 효과를 명시하라.

4. **12주 실행 계획**: 1주차부터 12주차까지, 매주 7일 동안 무엇을 해야 하는지 구체적인 액션 플랜을 제시하라. "1일차: [구체적 행동]" 형식으로 작성하라.

5. **해시태그 & 키워드**: 마포구 ${district} 상권에 맞는 인스타그램 해시태그 15개와 네이버/카카오 검색 키워드를 제시하라.

6. **예상 결과**: 이 전략을 실행했을 때 3개월 후 예상되는 매출 증가와 수익 증가를 구체적 숫자로 제시하라.

---

# ⚠️ 출력 규칙

**반드시 아래 JSON 형식으로만 응답하세요. 마크다운이나 추가 설명은 절대 금지입니다.**

\`\`\`json
{
  "diagnosis": {
    "strengths": ["강점 1: 구체적인 설명", "강점 2: 구체적인 설명", "강점 3: 구체적인 설명"],
    "weaknesses": ["약점 1: 뼈아픈 지적", "약점 2: 뼈아픈 지적", "약점 3: 뼈아픈 지적"]
  },
  "strategies": [
    {
      "title": "전략 제목",
      "description": "구체적인 실행 방법 (최소 3문장 이상)",
      "cost": "0원" 또는 "5만원~10만원",
      "difficulty": "하" | "중" | "상",
      "effect": "예상 효과 (구체적 숫자 포함)"
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "1주차 테마",
      "days": ["1일차: 액션", "2일차: 액션", "3일차: 액션", "4일차: 액션", "5일차: 액션", "6일차: 액션", "7일차: 액션"]
    },
    // ... 12주차까지
  ],
  "hashtags": ["#마포${district}", "#${industry}", ...총 15개],
  "keywords": {
    "naver": ["키워드1", "키워드2", "키워드3"],
    "kakao": ["키워드1", "키워드2", "키워드3"]
  },
  "expectedResults": {
    "current": {
      "sales": ${monthlySales * 10000},
      "profit": ${realProfit ? realProfit * 10000 : monthlySales * 10000 * 0.25}
    },
    "after": {
      "sales": ${targetSales * 10000},
      "profit": ${(realProfit ? realProfit : monthlySales * 0.25) * 10000 + increaseProfit * 10000}
    },
    "increase": {
      "sales": ${increaseSales * 10000},
      "salesPercent": 30,
      "profit": ${increaseProfit * 10000},
      "profitPercent": ${realProfit ? 40 : 40}
    },
    "roi": 3.5,
    "period": "3개월"
  }
}
\`\`\`

**JSON 외 다른 텍스트는 절대 포함하지 마세요!**
`;

    return prompt;
}

// ========================================
// AI 응답 파싱
// ========================================
function parseAIResponse(text, context) {
    try {
        // JSON 추출
        let jsonText = text.trim();
        
        // 마크다운 코드 블록 제거
        if (jsonText.includes('```')) {
            const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match) {
                jsonText = match[1];
            }
        }

        const parsed = JSON.parse(jsonText);

        // 데이터 검증 및 정제
        const result = {
            diagnosis: {
                strengths: Array.isArray(parsed.diagnosis?.strengths) 
                    ? parsed.diagnosis.strengths.slice(0, 3)
                    : ['지역 내 인지도', '전문성', '고객 서비스'],
                weaknesses: Array.isArray(parsed.diagnosis?.weaknesses)
                    ? parsed.diagnosis.weaknesses.slice(0, 3)
                    : ['신규 고객 유입 부족', '온라인 마케팅 미흡', '차별화 부족']
            },
            strategies: Array.isArray(parsed.strategies) 
                ? parsed.strategies.map(s => ({
                    title: s.title || '즉시 실행 전략',
                    description: s.description || '구체적인 실행 방법을 제시합니다.',
                    cost: s.cost || '0원',
                    difficulty: s.difficulty || '중',
                    effect: s.effect || '효과적인 결과 예상'
                }))
                : getDefaultStrategies(context.industry),
            weeklyPlan: Array.isArray(parsed.weeklyPlan) && parsed.weeklyPlan.length === 12
                ? parsed.weeklyPlan
                : generateWeeklyPlan(context.industry),
            hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length >= 10
                ? parsed.hashtags.slice(0, 15)
                : generateHashtags(context.industry, context.district),
            keywords: parsed.keywords || generateKeywords(context.industry, context.district),
            expectedResults: parsed.expectedResults || generateExpectedResults(context.monthlySales, context.realProfit)
        };

        return result;

    } catch (error) {
        console.error('❌ JSON Parse Error:', error.message);
        console.log('원본 텍스트:', text.substring(0, 500));
        
        // 폴백 응답
        return getDefaultResponse(context);
    }
}

// ========================================
// 기본 전략 생성
// ========================================
function getDefaultStrategies(industry) {
    const strategies = {
        '한의원': [
            {
                title: '네이버플레이스 최적화',
                description: '고객이 검색할 만한 키워드를 프로필에 추가하고, 시술 전후 사진을 업로드하세요. 리뷰 답변을 정성껏 달아 신뢰도를 높이세요.',
                cost: '0원',
                difficulty: '하',
                effect: '검색 노출 30% 증가, 신규 예약 월 10건 증가'
            },
            {
                title: '첫 방문 고객 할인 이벤트',
                description: '첫 방문 고객에게 초진료 50% 할인 쿠폰을 제공하고, 재방문 시 사용 가능한 추가 쿠폰을 드립니다. SNS 공유 시 추가 혜택 제공.',
                cost: '5만원~10만원',
                difficulty: '중',
                effect: '신규 고객 월 15명 증가, 재방문율 40% 상승'
            }
        ],
        '카페': [
            {
                title: '시그니처 메뉴 개발',
                description: '독특한 시그니처 음료/디저트를 개발하고 SNS에 홍보하세요. 인스타그램에서 사진 찍기 좋은 비주얼로 제작.',
                cost: '5만원~15만원',
                difficulty: '중',
                effect: '객단가 20% 증가, SNS 공유 건수 50건 이상'
            },
            {
                title: '한가한 시간 할인 프로모션',
                description: '오후 2시~5시 음료 20% 할인 이벤트를 진행하여 유휴 시간 매출을 높이세요.',
                cost: '0원',
                difficulty: '하',
                effect: '유휴 시간 매출 30% 증가'
            }
        ]
    };

    return strategies[industry] || [
        {
            title: '온라인 마케팅 강화',
            description: '네이버플레이스, 카카오맵, 구글 마이비즈니스에 정보를 등록하고, 정기적으로 업데이트하세요.',
            cost: '0원',
            difficulty: '하',
            effect: '온라인 노출 50% 증가'
        }
    ];
}

// ========================================
// 12주 실행 계획 생성
// ========================================
function generateWeeklyPlan(industry) {
    const themes = [
        '정신 개조 및 기본 세팅',
        '고객 DB 구축',
        'SNS 계정 활성화',
        '리뷰 관리 시스템',
        '콘텐츠 제작 시작',
        '첫 프로모션 기획',
        '협업 파트너 발굴',
        '데이터 분석 시작',
        '단골 고객 관리',
        '신규 서비스 테스트',
        '마케팅 최적화',
        '성과 분석 및 개선'
    ];

    return themes.map((theme, index) => ({
        week: index + 1,
        theme,
        days: [
            `1일차: ${theme} - 목표 설정`,
            `2일차: 실행 계획 수립`,
            `3일차: 첫 번째 액션 실행`,
            `4일차: 피드백 수집`,
            `5일차: 개선 및 조정`,
            `6일차: 추가 실행`,
            `7일차: 주간 성과 점검`
        ]
    }));
}

// ========================================
// 해시태그 생성
// ========================================
function generateHashtags(industry, district) {
    const base = [
        `#마포${industry}`,
        `#${district}${industry}`,
        `#마포구${industry}`,
        `#홍대${industry}`,
        `#합정${industry}`,
        `#상수${industry}`,
        `#마포맛집`,
        `#서울${industry}`,
        `#로컬비즈니스`,
        `#골목상권`,
        `#동네${industry}`,
        `#추천${industry}`,
        `#가성비${industry}`,
        `#힐링플레이스`,
        `#서울핫플`
    ];

    return base;
}

// ========================================
// 키워드 생성
// ========================================
function generateKeywords(industry, district) {
    return {
        naver: [
            `마포 ${industry}`,
            `${district} ${industry}`,
            `홍대 ${industry}`,
            `합정 ${industry}`,
            `마포구 ${industry} 추천`
        ],
        kakao: [
            `${district} ${industry}`,
            `마포 ${industry}`,
            `홍대입구 ${industry}`,
            `${district} 맛집`,
            `마포 ${industry} 후기`
        ]
    };
}

// ========================================
// 예상 결과 생성
// ========================================
function generateExpectedResults(monthlySales, realProfit) {
    const currentSales = monthlySales * 10000;
    const currentProfit = realProfit ? realProfit * 10000 : currentSales * 0.25;
    
    const afterSales = Math.round(currentSales * 1.3);
    const afterProfit = Math.round(currentProfit * 1.4);
    
    return {
        current: {
            sales: currentSales,
            profit: currentProfit
        },
        after: {
            sales: afterSales,
            profit: afterProfit
        },
        increase: {
            sales: afterSales - currentSales,
            salesPercent: 30,
            profit: afterProfit - currentProfit,
            profitPercent: 40
        },
        roi: 3.5,
        period: '3개월'
    };
}

// ========================================
// 기본 응답 생성 (폴백)
// ========================================
function getDefaultResponse(context) {
    return {
        diagnosis: {
            strengths: [
                '지역 내 기본 인지도 보유',
                '전문성 있는 서비스 제공',
                '고객 응대 시스템 구축'
            ],
            weaknesses: [
                '신규 고객 유입 채널 부족',
                '온라인 마케팅 활동 미흡',
                '차별화된 포인트 부재'
            ]
        },
        strategies: getDefaultStrategies(context.industry),
        weeklyPlan: generateWeeklyPlan(context.industry),
        hashtags: generateHashtags(context.industry, context.district),
        keywords: generateKeywords(context.industry, context.district),
        expectedResults: generateExpectedResults(context.monthlySales, context.realProfit)
    };
}
