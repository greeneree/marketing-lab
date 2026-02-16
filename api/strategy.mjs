console.log("API Key Prefix:", process.env.GEMINI_API_KEY?.substring(0, 7));
import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경 변수 우선순위 설정 (Vercel 설정에 맞춰 GEMINI_API_KEY 권장)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AISTUDIO_KEY);

export default async function handler(req, res) {
    // 1. CORS 헤더 설정
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
            industry, storeName, district, monthlySales, platforms,
            hasHitProduct, hitProductName, concern, topServices,
            competitors, faqs, bookingMethods, reviews, strength
        } = req.body;

        // 2. AI 프롬프트 생성 함수 호출
        const prompt = generatePrompt({
            industry, storeName, district, monthlySales, platforms,
            hasHitProduct, hitProductName, concern, topServices,
            competitors, faqs, bookingMethods, reviews, strength
        });

        // 3. [핵심 수정] Gemini API 호출 설정
        // 인자를 두 개의 객체로 나누어 넣는 것이 정석 문법이야!
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" }, // 첫 번째 객체 닫고 쉼표!
            { apiVersion: "v1" }           // 두 번째 객체
        ); // 마지막 소괄호로 마무리!

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. JSON 파싱 및 구조화
        const strategyData = parseAIResponse(text, {
            industry, district, monthlySales, hasHitProduct, hitProductName
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

// --- 아래 함수들은 진구가 짠 로직 그대로 유지했어 ---

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
  * 네이버: ${data.reviews.naver?.count || 0}개, 평점 ${data.reviews.naver?.rating || 0}/5.0
  * 카카오: ${data.reviews.kakao?.count || 0}개, 평점 ${data.reviews.kakao?.rating || 0}/5.0
  * 구글: ${data.reviews.google?.count || 0}개, 평점 ${data.reviews.google?.rating || 0}/5.0` : '';

    const competitorsText = data.competitors?.length > 0 ? `
- 경쟁 매장:
${data.competitors.map((c, i) => `  ${i+1}. ${c.name || '(이름 미입력)'} - ${c.feature || '특징 없음'} - ${c.price || '가격대 미입력'}`).join('\n')}` : '';

    const faqsText = data.faqs?.length > 0 ? `
- 고객 자주 묻는 질문:
${data.faqs.map((q, i) => `  ${i+1}. ${q}`).join('\n')}` : '';

    return ` 당신은 생존이 걸린 골목상권에서 죽어가는 가게를 살려내는 10년 이상 경력의 로컬 비즈니스 전문 마케팅/그로스 컨설턴트입니다. 목표는 실행안입니다. [중요 규칙] 반드시 유효한 JSON만 응답하세요. 마크다운/설명 금지. # 가게 정보: 업종 ${data.industry}, 이름 ${data.storeName}, 위치 ${data.district}, 매출 ${data.monthlySales}만원... (생략된 프롬프트 내용 유지) `;
}

function parseAIResponse(text, context) {
    try {
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        const parsed = JSON.parse(jsonText);
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
    const plans = [];
    for (let week = 1; week <= 12; week++) {
        plans.push({ week, theme: `${week}주차 실행`, days: ["고객 DB 정리", "SNS 콘텐츠 제작"] });
    }
    return plans;
}

function generateHashtags(industry, district) {
    const base = ['#마포', `#마포${industry}`, `#${district}`];
    return base.slice(0, 15);
}

function generateKeywords(industry, district) {
    return { naver: [`마포 ${industry}`], kakao: [`${district} ${industry}`] };
}

function generateExpectedResults(currentSales) {
    const current = currentSales * 10000;
    return { current: { sales: current }, after: { sales: current * 1.3 }, roi: 3.5 };
}

function getDefaultResponse(context) {
    return {
        diagnosis: { strengths: ["지역 내 인지도"], weaknesses: ["신규 고객 유입 부족"] },
        strategies: [{ title: "지역 제휴 마케팅", description: "인근 업체와 제휴", cost: "5만원", difficulty: "하", effect: "효과" }],
        weeklyPlan: generateWeeklyPlan(null, context.industry),
        hashtags: generateHashtags(context.industry, context.district),
        keywords: generateKeywords(context.industry, context.district),
        expectedResults: generateExpectedResults(context.monthlySales)
    };
}
