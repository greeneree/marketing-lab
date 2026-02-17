import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경 변수 우선순위 설정
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AISTUDIO_KEY;

if (!apiKey) {
    console.error("❌ CRITICAL: API Key가 설정되지 않았습니다!");
}

console.log("🔑 API Key 상태:", apiKey ? `설정됨 (${apiKey.substring(0, 7)}...)` : "❌ 없음");
console.log("📌 Vercel 배포 확인: 2026-02-17 v2.3.3");
console.log("🔧 Node.js 버전:", process.version);

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

        // Gemini API 호출 (사용자 요청에 따라 gemini-2.5-flash 유지)
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash" },
            { apiVersion: "v1beta" }
        );
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
        reviews, snsInfo, industrySpecific, uniqueStrength
    } = data;

    const hitProducts = topServices?.filter(s => s.isHit).map(s => s.name) || [];
    const hitProductText = hitProducts.length > 0 ? `히트 상품: ${hitProducts.join(', ')}` : '히트 상품 없음';

    const servicesText = topServices?.map((s, i) => 
        `${i+1}. ${s.name} - ${Number(s.price).toLocaleString()}원${s.isHit ? ' ⭐' : ''}`
    ).join('\n  ') || '정보 없음';

    const competitorsText = competitors?.length > 0 
        ? competitors.map((c, i) => `${i+1}. ${c.name || '(미입력)'} - 특징: ${c.feature || '없음'}, 가격: ${c.price || '미입력'}`).join('\n  ')
        : '경쟁 정보 없음';

    const reviewsText = `네이버: ${reviews?.naver?.count || 0}개, 카카오: ${reviews?.kakao?.count || 0}개`;

    const snsText = snsInfo 
        ? `운영 중 (팔로워 ${snsInfo.followers}명, 주 ${snsInfo.frequency}회 업로드${snsInfo.noHashtags ? ', 해시태그 사용 안 함' : `, 해시태그: ${snsInfo.hashtags}`})`
        : '미운영';

    const specificText = Object.entries(industrySpecific || {})
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');

    const targetSales = Math.round(monthlySales * 1.3);
    const increaseSales = Math.round(monthlySales * 0.3);
    const increaseProfit = realProfit ? Math.round(realProfit * 0.4) : Math.round(monthlySales * 0.1);

    return `
당신은 15년 경력의 로컬 비즈니스 컨설턴트입니다. 다음 정보를 바탕으로 실행 가능한 전략을 JSON 형식으로만 응답하세요.

# 📊 가게 정보
- 상호명: ${storeName} (${industry})
- 위치: 마포구 ${district}
- 현재 고민: ${concerns?.join(', ') || '없음'}
- 주요 서비스: ${servicesText}
- 경쟁 분석: ${competitorsText}
- SNS/리뷰: ${snsText}, ${reviewsText}
- 특이사항: ${uniqueStrength || '없음'}
- 업종 특화: ${specificText}

# ⚠️ 출력 규칙: 반드시 JSON 형식으로만 응답하며 마크다운이나 추가 설명은 제외할 것.
{
  "diagnosis": { "strengths": [], "weaknesses": [] },
  "strategies": [{ "title": "", "description": "", "cost": "", "difficulty": "", "effect": "" }],
  "weeklyPlan": [{ "week": 1, "theme": "", "days": [] }],
  "hashtags": [],
  "keywords": { "naver": [], "kakao": [] },
  "expectedResults": {
    "current": { "sales": ${monthlySales * 10000}, "profit": ${realProfit ? realProfit * 10000 : monthlySales * 2500} },
    "after": { "sales": ${targetSales * 10000}, "profit": ${(realProfit ? realProfit * 10000 : monthlySales * 2500) + increaseProfit * 10000} },
    "increase": { "sales": ${increaseSales * 10000}, "salesPercent": 30, "profit": ${increaseProfit * 10000}, "profitPercent": 40 },
    "roi": 3.5,
    "period": "3개월"
  }
}
`;
}

// ========================================
// AI 응답 파싱 및 기타 헬퍼 함수
// ========================================
function parseAIResponse(text, context) {
    try {
        let jsonText = text.trim();
        if (jsonText.includes('```')) {
            const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match) jsonText = match[1];
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('❌ JSON Parse Error:', error.message);
        return getDefaultResponse(context);
    }
}

function getDefaultResponse(context) {
    return {
        diagnosis: { strengths: ['기본 인지도'], weaknesses: ['신규 유입 부족'] },
        strategies: [{ title: '온라인 최적화', description: '네이버 플레이스를 업데이트하세요.', cost: '0원', difficulty: '하', effect: '노출 증가' }],
        weeklyPlan: Array.from({length: 12}, (_, i) => ({ week: i + 1, theme: '기반 다지기', days: ['1일차: 목표 설정'] })),
        hashtags: [`#마포${context.district}`, `#${context.industry}`],
        keywords: { naver: [`${context.district} ${context.industry}`], kakao: [`${context.district} 맛집`] },
        expectedResults: { current: { sales: 0, profit: 0 }, after: { sales: 0, profit: 0 }, increase: { sales: 0, salesPercent: 0, profit: 0, profitPercent: 0 }, roi: 0, period: '3개월' }
    };
}
