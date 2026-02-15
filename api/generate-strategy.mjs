     1	import { GoogleGenerativeAI } from '@google/generative-ai';
     2	
     3	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_AISTUDIO_KEY);
     4	
     5	export default async function handler(req, res) {
     6	    // CORS 헤더
     7	    res.setHeader('Access-Control-Allow-Origin', '*');
     8	    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
     9	    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    10	
    11	    if (req.method === 'OPTIONS') {
    12	        return res.status(200).end();
    13	    }
    14	
    15	    if (req.method !== 'POST') {
    16	        return res.status(405).json({ error: 'Method not allowed' });
    17	    }
    18	
    19	    try {
    20	        const {
    21	            industry,
    22	            storeName,
    23	            district,
    24	            monthlySales,
    25	            platforms,
    26	            hasHitProduct,
    27	            hitProductName,
    28	            concern,
    29	            topServices,
    30	            competitors,
    31	            faqs,
    32	            bookingMethods,
    33	            reviews,
    34	            strength
    35	        } = req.body;
    36	
    37	        // AI 프롬프트 생성
    38	        const prompt = generatePrompt({
    39	            industry,
    40	            storeName,
    41	            district,
    42	            monthlySales,
    43	            platforms,
    44	            hasHitProduct,
    45	            hitProductName,
    46	            concern,
    47	            topServices,
    48	            competitors,
    49	            faqs,
    50	            bookingMethods,
    51	            reviews,
    52	            strength
    53	        });
    54	
    55	        // Gemini API 호출
    56	        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    57	        const result = await model.generateContent(prompt);
    58	        const response = await result.response;
    59	        const text = response.text();
    60	
    61	        // JSON 파싱
    62	        const strategyData = parseAIResponse(text, {
    63	            industry,
    64	            district,
    65	            monthlySales,
    66	            hasHitProduct,
    67	            hitProductName
    68	        });
    69	
    70	        return res.status(200).json(strategyData);
    71	
    72	    } catch (error) {
    73	        console.error('API Error:', error);
    74	        return res.status(500).json({
    75	            error: 'AI 전략 생성 중 오류가 발생했습니다.',
    76	            details: error.message
    77	        });
    78	    }
    79	}
    80	
    81	function generatePrompt(data) {
    82	    const platformText = data.platforms?.includes('none') ? '온라인 등록 없음' : 
    83	        `${(data.platforms || []).map(p => {
    84	            if (p === 'naver') return '네이버플레이스';
    85	            if (p === 'kakao') return '카카오맵';
    86	            return '기타';
    87	        }).join(', ')} 등록됨`;
    88	
    89	    const hitProductText = data.hasHitProduct ? 
    90	        `주요 히트 상품: ${data.hitProductName}` : 
    91	        '주요 히트 상품 없음 (신규 시그니처 메뉴 개발 필요)';
    92	
    93	    const reviewsText = data.reviews ? `
    94	- 리뷰 현황:
    95	  * 네이버: ${data.reviews.naver.count}개, 평점 ${data.reviews.naver.rating}/5.0
    96	  * 카카오: ${data.reviews.kakao.count}개, 평점 ${data.reviews.kakao.rating}/5.0
    97	  * 구글: ${data.reviews.google.count}개, 평점 ${data.reviews.google.rating}/5.0` : '';
    98	
    99	    const competitorsText = data.competitors?.length > 0 ? `
   100	- 경쟁 매장:
   101	${data.competitors.map((c, i) => `  ${i+1}. ${c.name || '(이름 미입력)'} - ${c.feature || '특징 없음'} - ${c.price || '가격대 미입력'}`).join('\n')}` : '';
   102	
   103	    const faqsText = data.faqs?.length > 0 ? `
   104	- 고객 자주 묻는 질문:
   105	${data.faqs.map((q, i) => `  ${i+1}. ${q}`).join('\n')}` : '';
   106	
   107	    return `
   108	당신은 생존이 걸린 골목상권에서 죽어가는 가게를 살려내는 10년 이상 경력의 로컬 비즈니스 전문 마케팅/그로스 컨설턴트입니다.
   109	목표는 "보기 좋은 조언"이 아니라 **12주 내 매출/신규/재방문을 실제로 올리는 실행안**입니다.
   110	
   111	[중요 규칙]
   112	- 근거 없는 업계 평균/수치를 만들어내지 마세요.
   113	- 입력 정보로 계산 가능한 수치는 계산식과 함께 제시하세요.
   114	- 모르는 정보는 (가정)으로 표시하고, 그 가정을 검증하는 방법을 제시하세요.
   115	- 업종별 법/플랫폼 정책 리스크가 있으면 반드시 경고와 대체 표현을 제시하세요.
   116	
   117	# 가게 정보
   118	- 업종: ${data.industry}
   119	- 이름: ${data.storeName}
   120	- 위치: 서울 마포구 ${data.district}
   121	- 월 평균 매출: ${data.monthlySales}만원
   122	- ${platformText}
   123	- ${hitProductText}
   124	- 현재 고민: ${data.concern}
   125	- 가게 강점: ${data.strength || '(미입력)'}
   126	- 주요 서비스/가격: ${data.topServices || '(미입력)'}
   127	- 예약/결제 방식: ${(data.bookingMethods || []).join(', ') || '(미입력)'}
   128	${reviewsText}
   129	${competitorsText}
   130	${faqsText}
   131	
   132	# 응답 형식: 반드시 유효한 JSON만 응답하세요
   133	
   134	{
   135	  "summary": {
   136	    "coreLevers": ["레버1", "레버2", "레버3"],
   137	    "reasoning": ["레버1 이유", "레버2 이유", "레버3 이유"],
   138	    "stopDoing": ["하지 않을 것1", "하지 않을 것2", "하지 않을 것3"]
   139	  },
   140	  "diagnosis": {
   141	    "strengths": [
   142	      {"title": "강점1", "data": "데이터", "interpretation": "해석", "implication": "시사점"}
   143	    ],
   144	    "weaknesses": [
   145	      {"title": "약점1", "data": "데이터 또는 (가정)", "interpretation": "해석", "implication": "시사점"}
   146	    ],
   147	    "segments": [
   148	      {"name": "세그먼트A", "profile": "프로필", "motivation": "동기", "barrier": "장벽"},
   149	      {"name": "세그먼트B", "profile": "프로필", "motivation": "동기", "barrier": "장벽"}
   150	    ],
   151	    "positioning": "포지셔닝 문장"
   152	  },
   153	  "offers": [
   154	    {
   155	      "name": "오퍼명",
   156	      "segment": "타깃",
   157	      "composition": "구성",
   158	      "pricing": "가격 코멘트",
   159	      "conversionDevice": "전환 장치",
   160	      "retentionDevice": "재방문 장치",
   161	      "compliance": "규정 리스크"
   162	    }
   163	  ],
   164	  "strategies": [
   165	    {
   166	      "title": "전략명",
   167	      "kpi": "목표",
   168	      "segment": "타깃",
   169	      "steps": ["1단계", "2단계"],
   170	      "owner": "담당자",
   171	      "timeRequired": "시간",
   172	      "tools": "도구",
   173	      "cost": "비용",
   174	      "expectedEffect": "효과",
   175	      "description": "설명"
   176	    }
   177	  ],
   178	  "partnerships": [
   179	    {
   180	      "candidateTypes": ["업종1", "업종2"],
   181	      "method": "제휴 방식",
   182	      "customerFlow": "고객 동선",
   183	      "costStructure": "비용 구조",
   184	      "safeguards": "방지 룰",
   185	      "pilot": "파일럿 방법"
   186	    }
   187	  ],
   188	  "weeklyPlan": [
   189	    {
   190	      "week": "1-2",
   191	      "theme": "테마",
   192	      "deliverables": ["산출물"],
   193	      "days": [
   194	        {"day": 1, "action": "액션", "dod": "완료 기준"}
   195	      ]
   196	    }
   197	  ],
   198	  "contentIdeas": [
   199	    {
   200	      "format": "포맷",
   201	      "hook": "훅",
   202	      "outline": "대본",
   203	      "cta": "CTA",
   204	      "compliance": "규정"
   205	    }
   206	  ],
   207	  "kpis": [
   208	    {"name": "KPI명", "target": "목표", "measurement": "측정법"}
   209	  ],
   210	  "weeklyReviewTemplate": ["질문1", "질문2"],
   211	  "expectedResults": {
   212	    "current": {"sales": ${data.monthlySales * 10000}, "newCustomers": "(가정)", "revisitRate": "(가정)"},
   213	    "after": {"sales": 0, "newCustomers": "(목표)", "revisitRate": "(목표)"},
   214	    "investment": {"budget": "예산", "time": "시간"},
   215	    "roiRange": {"conservative": 0, "baseline": 0, "aggressive": 0},
   216	    "risks": [{"risk": "리스크", "mitigation": "완화책"}]
   217	  },
   218	  "hashtags": ["#해시태그"],
   219	  "keywords": {"naver": ["키워드"], "kakao": ["키워드"]}
   220	}
   221	
   222	**중요**: 유효한 JSON만 응답하세요. 마크다운/설명 금지.
   223	`;
   224	}
   225	
   226	function parseAIResponse(text, context) {
   227	    try {
   228	        // JSON 추출
   229	        let jsonText = text.trim();
   230	        if (jsonText.startsWith('```')) {
   231	            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
   232	        }
   233	
   234	        const parsed = JSON.parse(jsonText);
   235	
   236	        // 기본 구조로 변환 (기존 UI 호환)
   237	        const result = {
   238	            diagnosis: {
   239	                strengths: parsed.diagnosis?.strengths?.map(s => s.title || s) || [],
   240	                weaknesses: parsed.diagnosis?.weaknesses?.map(w => w.title || w) || []
   241	            },
   242	            strategies: (parsed.strategies || []).map(s => ({
   243	                title: s.title,
   244	                description: s.description || s.steps?.join('. ') || '상세 설명',
   245	                cost: s.cost,
   246	                difficulty: s.difficulty || '중',
   247	                effect: s.expectedEffect || s.kpi
   248	            })),
   249	            weeklyPlan: generateWeeklyPlan(parsed.weeklyPlan, context.industry),
   250	            hashtags: parsed.hashtags || generateHashtags(context.industry, context.district),
   251	            keywords: parsed.keywords || generateKeywords(context.industry, context.district),
   252	            expectedResults: parsed.expectedResults || generateExpectedResults(context.monthlySales)
   253	        };
   254	
   255	        return result;
   256	
   257	    } catch (error) {
   258	        console.error('JSON Parse Error:', error);
   259	        return getDefaultResponse(context);
   260	    }
   261	}
   262	
   263	function generateWeeklyPlan(aiPlan, industry) {
   264	    if (aiPlan && aiPlan.length > 0) {
   265	        // AI가 제공한 계획을 일자별로 변환
   266	        const result = [];
   267	        aiPlan.forEach(wp => {
   268	            const days = wp.days || [];
   269	            days.forEach(d => {
   270	                result.push({
   271	                    week: wp.week,
   272	                    theme: wp.theme,
   273	                    days: [d.action || '실행 과제']
   274	                });
   275	            });
   276	        });
   277	        return result;
   278	    }
   279	
   280	    // 기본 12주 계획
   281	    const plans = [];
   282	    for (let week = 1; week <= 12; week++) {
   283	        plans.push({
   284	            week,
   285	            theme: `${week}주차 실행`,
   286	            days: [
   287	                "고객 DB 정리",
   288	                "SNS 콘텐츠 제작",
   289	                "지역 제휴 협의",
   290	                "이벤트 준비",
   291	                "고객 피드백 수집",
   292	                "주간 성과 분석",
   293	                "다음주 계획 수립"
   294	            ]
   295	        });
   296	    }
   297	    return plans;
   298	}
   299	
   300	function generateHashtags(industry, district) {
   301	    const base = ['#마포', `#마포${industry}`, `#${district}`, `#${district}맛집`];
   302	    const industryTags = {
   303	        '한의원': ['#한의원', '#통증치료', '#추나요법', '#침술', '#한방치료'],
   304	        '카페': ['#카페', '#카페스타그램', '#커피', '#디저트', '#카페추천'],
   305	        '헬스장': ['#헬스', '#헬스장', '#PT', '#다이어트', '#운동'],
   306	        '네일샵': ['#네일', '#네일아트', '#젤네일', '#네일샵', '#네일스타그램']
   307	    };
   308	    return [...base, ...(industryTags[industry] || [])].slice(0, 15);
   309	}
   310	
   311	function generateKeywords(industry, district) {
   312	    const districtName = district.replace('동', '');
   313	    return {
   314	        naver: [
   315	            `마포 ${industry}`,
   316	            `${district} ${industry}`,
   317	            `${districtName} ${industry}`,
   318	            `마포 추천 ${industry}`,
   319	            `${district} 맛집`
   320	        ],
   321	        kakao: [
   322	            `${district} ${industry}`,
   323	            `마포구 ${industry}`,
   324	            `${districtName} ${industry} 추천`,
   325	            `홍대 ${industry}`,
   326	            `합정 ${industry}`
   327	        ]
   328	    };
   329	}
   330	
   331	function generateExpectedResults(currentSales) {
   332	    const current = currentSales * 10000;
   333	    const increase = Math.round(current * 0.3);
   334	    const after = current + increase;
   335	    const profit = Math.round(increase * 0.3);
   336	
   337	    return {
   338	        current: { sales: current },
   339	        after: { sales: after },
   340	        increase: {
   341	            sales: increase,
   342	            profit: profit
   343	        },
   344	        roi: 3.5
   345	    };
   346	}
   347	
   348	function getDefaultResponse(context) {
   349	    return {
   350	        diagnosis: {
   351	            strengths: ["지역 내 인지도", "기존 고객 만족도", "서비스 품질"],
   352	            weaknesses: ["신규 고객 유입 부족", "온라인 마케팅 미흡", "재방문율 개선 필요"]
   353	        },
   354	        strategies: [
   355	            {
   356	                title: "지역 제휴 마케팅",
   357	                description: "인근 업체와 제휴하여 상호 할인 혜택 제공",
   358	                cost: "5만원",
   359	                difficulty: "하",
   360	                effect: "신규 고객 월 10명 증가"
   361	            }
   362	        ],
   363	        weeklyPlan: generateWeeklyPlan(null, context.industry),
   364	        hashtags: generateHashtags(context.industry, context.district),
   365	        keywords: generateKeywords(context.industry, context.district),
   366	        expectedResults: generateExpectedResults(context.monthlySales)
   367	    };
   368	}