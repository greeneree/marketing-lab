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
       const prompt = `
        당신은 15년 경력의 전략적인, 로컬 비즈니스 생존 전문가입니다. 
        당신의 목표는 뻔한 위로가 아니라, 데이터를 기반으로 사장님의 뒤통수를 치는 날카로운 독설 컨설턴트가 되는 것입니다.

        # 고객 입력 데이터
        - 업종: ${industry}
        - 상호명: ${storeName}
        - 위치: 마포구 ${district}
        - 월 매출: ${monthlySales}만원
        - 온라인 등록: ${platforms.join(', ')}
        - 히트 상품: ${hasHitProduct ? hitProductName : '없음'}
        - 현재 고민: ${concern}
        - 주요 서비스: ${topServices}
        - 경쟁 매장: ${JSON.stringify(competitors)}
        - 고객 FAQ: ${faqs.join(' / ')}
        - 예약/결제: ${bookingMethods.join(', ')}
        - 리뷰 현황: 네이버(${reviews.naver.count}개, ${reviews.naver.rating}점), 카카오(${reviews.kakao.count}개, ${reviews.kakao.rating}점)
        - 사장님이 생각하는 강점: ${strength}

        # 분석 지침
        1. 사장님이 말한 '강점'이 주변 경쟁사(${JSON.stringify(competitors)}) 대비 진짜 경쟁력이 있는지 비판적으로 검토하라.
        2. 리뷰 평점이 낮거나 개수가 부족하면 마포구 ${district} 상권에서 도태될 수 있음을 경고하라.
        3. 12주 계획은 "1일차: [행동]" 형식으로, 당장 내일부터 돈 안 들이고 할 수 있는 것부터 시켜라.

        # 출력 규칙 (반드시 JSON으로만 대답할 것)
        {
          "diagnosis": {
            "strengths": ["날카로운 강점 분석 3개"],
            "weaknesses": ["뼈아픈 약점 지적 3개"]
          },
          "strategies": [
            {
              "title": "즉시 실행 전략",
              "description": "구체적인 방법",
              "cost": "예산",
              "difficulty": "1~3",
              "effect": "예상 효과"
            }
          ],
          "weeklyPlan": [
            {
              "week": 1,
              "theme": "정신 개조 및 기본 세팅",
              "days": ["1일차 액션", "2일차 액션", "3일차 액션", "4일차 액션", "5일차 액션", "6일차 액션", "7일차 액션"]
            }
          ],
          "hashtags": ["#태그1", "#태그2"],
          "keywords": { "naver": ["키워드"], "kakao": ["키워드"] },
          "expectedResults": {
            "current": { "sales": ${monthlySales} },
            "after": { "sales": ${Math.round(monthlySales * 1.3)} },
            "increase": { "sales": ${Math.round(monthlySales * 0.3)}, "profit": ${Math.round(monthlySales * 0.1)} },
            "roi": 3.5
          }
        }
`;

        // 3. [핵심 수정] Gemini API 호출 설정
        // 인자를 두 개의 객체로 나누어 넣는 것이 정석 문법이야!
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash" },
            { apiVersion: "v1beta" }
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
  * 구글: ${data.reviews.google?.count || 0}개, 평점 ${data.reviews.google?.rating || 0}/5.0` : '- 리뷰 정보 없음';

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
