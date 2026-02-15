# 🚀 서버리스 함수 구현 가이드 (Vercel)

## 📋 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [환경 설정](#환경-설정)
3. [서버리스 함수 코드](#서버리스-함수-코드)
4. [배포 방법](#배포-방법)
5. [테스트 방법](#테스트-방법)

---

## 🏗️ 프로젝트 구조

```
marketing-lab/
├── api/
│   └── generate-strategy.js      # 서버리스 함수
├── public/
│   ├── index.html                 # 프론트엔드
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── .env.local                     # 환경 변수 (로컬)
├── .gitignore
├── package.json
└── vercel.json                    # Vercel 설정
```

---

## ⚙️ 환경 설정

### 1단계: Vercel 계정 생성
1. https://vercel.com/ 방문
2. GitHub 계정으로 로그인
3. 무료 플랜 선택 (Hobby)

### 2단계: 프로젝트 초기화
```bash
# 프로젝트 폴더 생성
mkdir marketing-lab-serverless
cd marketing-lab-serverless

# package.json 생성
npm init -y

# Vercel CLI 설치 (선택사항)
npm install -g vercel

# Google AI SDK 설치
npm install @google/generative-ai
```

### 3단계: 환경 변수 설정

`.env.local` 파일 생성:
```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

**API 키 발급:**
1. https://aistudio.google.com/ 방문
2. "Get API Key" 클릭
3. 새 프로젝트 생성
4. API 키 복사

---

## 🔧 서버리스 함수 코드

### `/api/generate-strategy.js`

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경 변수에서 API 키 가져오기
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// 업종별 프롬프트 템플릿
const PROMPTS = {
  '한의원': (data) => `
# 역할
당신은 한국의 한의원 마케팅 전문가입니다.
- 10년 이상 한의원 컨설팅 경험
- 네이버/카카오 플랫폼 전문가
- 건강보험 vs 비급여 특성 이해
- 한국 의료법 준수

# 고객 정보
- 한의원명: ${data.name}
- 위치: ${data.location}
- 운영기간: ${data.months}개월
- 월평균 매출: ${data.revenue}만원
- 평균 객단가: ${data.avgPrice}원
- 재방문율: ${data.returnRate}%
- 주력 진료: ${data.specialty}
- 현재 고민: ${data.concerns}
- 3개월 목표: ${data.goals}

# 요청사항
위 한의원에 맞춤 마케팅 전략을 작성해주세요.

## ⚠️ 중요 규칙
- IT 전문 용어 사용 금지 (CRM → 환자 관리 수첩)
- "오늘 당장 할 일" 체크리스트 필수
- 의료법 준수 (과대 광고 금지)

## 1. 현황 진단
### 강점 3개
### 약점 3개

## 2. 즉시 실행 전략 5개
각 전략마다:
- 제목
- 실행 방법 (3-4문장)
- 예상 비용
- 난이도 (1-3)
- 예상 효과
- 오늘 당장 할 일 체크리스트

## 3. 예상 성과
- 현재 상태
- 3개월 후 목표
- 투자 대비 수익

위 형식으로 응답해주세요.
`,

  '카페': (data) => `
# 역할
당신은 한국의 카페 마케팅 전문가입니다.

# 고객 정보
- 카페명: ${data.name}
- 위치: ${data.location}
- 운영기간: ${data.months}개월
- 월평균 매출: ${data.revenue}만원
- 평균 객단가: ${data.avgPrice}원
- 재방문율: ${data.returnRate}%
- 시그니처 메뉴: ${data.signature}
- 현재 고민: ${data.concerns}
- 3개월 목표: ${data.goals}

# 요청사항
(한의원과 동일한 형식으로 응답)
`,

  '헬스장': (data) => `
# 역할
당신은 한국의 헬스장 마케팅 전문가입니다.

# 고객 정보
- 헬스장명: ${data.name}
- 위치: ${data.location}
- 운영기간: ${data.months}개월
- 월평균 매출: ${data.revenue}만원
- 등록 회원: ${data.members}명
- 재등록률: ${data.retentionRate}%
- PT 비율: ${data.ptRate}%
- 현재 고민: ${data.concerns}
- 3개월 목표: ${data.goals}

# 요청사항
(한의원과 동일한 형식으로 응답)
`,

  '네일샵': (data) => `
# 역할
당신은 한국의 네일샵 마케팅 전문가입니다.

# 고객 정보
- 네일샵명: ${data.name}
- 위치: ${data.location}
- 운영기간: ${data.months}개월
- 월평균 매출: ${data.revenue}만원
- 평균 객단가: ${data.avgPrice}원
- 재방문 주기: ${data.returnCycle}주
- 예약률: ${data.bookingRate}%
- 현재 고민: ${data.concerns}
- 3개월 목표: ${data.goals}

# 요청사항
(한의원과 동일한 형식으로 응답)
`
};

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { industry, data } = req.body;

    // 입력 검증
    if (!industry || !data) {
      return res.status(400).json({ 
        error: '업종과 데이터를 입력해주세요' 
      });
    }

    // 프롬프트 생성
    const promptTemplate = PROMPTS[industry];
    if (!promptTemplate) {
      return res.status(400).json({ 
        error: '지원하지 않는 업종입니다' 
      });
    }

    const prompt = promptTemplate(data);

    // Google Gemini API 호출
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 성공 응답
    return res.status(200).json({
      success: true,
      strategy: text,
      tokensUsed: text.length // 대략적인 토큰 수
    });

  } catch (error) {
    console.error('AI API Error:', error);
    
    // 에러 응답
    return res.status(500).json({
      success: false,
      error: 'AI 전략 생성에 실패했습니다',
      details: error.message
    });
  }
}
```

---

## 🎨 프론트엔드 코드

### `/public/index.html`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>마케팅랩 - AI 마케팅 전략 생성</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>🎯 마케팅랩</h1>
      <p>15분 입력으로 받는 AI 마케팅 전략</p>
    </header>

    <main>
      <!-- 1단계: 업종 선택 -->
      <section id="step1" class="step active">
        <h2>1단계: 업종 선택</h2>
        <div class="industry-buttons">
          <button class="industry-btn" data-industry="한의원">🏥 한의원</button>
          <button class="industry-btn" data-industry="카페">☕ 카페</button>
          <button class="industry-btn" data-industry="헬스장">💪 헬스장</button>
          <button class="industry-btn" data-industry="네일샵">💅 네일샵</button>
        </div>
      </section>

      <!-- 2단계: 정보 입력 -->
      <section id="step2" class="step">
        <h2>2단계: 사업장 정보 입력</h2>
        <form id="infoForm">
          <div class="form-group">
            <label>사업장 이름</label>
            <input type="text" name="name" placeholder="예: 마포 행복한의원" required>
          </div>
          <div class="form-group">
            <label>위치</label>
            <input type="text" name="location" placeholder="예: 마포구 공덕동" required>
          </div>
          <div class="form-group">
            <label>운영 기간 (개월)</label>
            <input type="number" name="months" placeholder="예: 24" required>
          </div>
          <div class="form-group">
            <label>월평균 매출 (만원)</label>
            <input type="number" name="revenue" placeholder="예: 1500" required>
          </div>
          <div class="form-group">
            <label>현재 고민 (최대 3가지)</label>
            <textarea name="concerns" rows="3" placeholder="예: 신규 환자 유입이 안 됨&#10;재방문율이 낮음&#10;마케팅 방법을 모름" required></textarea>
          </div>
          <div class="form-group">
            <label>3개월 목표</label>
            <input type="text" name="goals" placeholder="예: 월 매출 30% 증가, 신규 환자 20명 확보" required>
          </div>

          <!-- 업종별 추가 필드는 JavaScript로 동적 생성 -->
          <div id="industrySpecificFields"></div>

          <button type="submit" class="submit-btn">AI 전략 생성하기</button>
        </form>
      </section>

      <!-- 3단계: 결과 표시 -->
      <section id="step3" class="step">
        <h2>3단계: AI 마케팅 전략</h2>
        <div id="loading" class="loading">
          <div class="spinner"></div>
          <p>AI가 맞춤 전략을 생성 중입니다...<br>약 10-20초 소요됩니다.</p>
        </div>
        <div id="result" class="result" style="display: none;">
          <div id="strategyContent"></div>
          <div class="action-buttons">
            <button onclick="copyStrategy()" class="btn-copy">📋 복사하기</button>
            <button onclick="downloadPDF()" class="btn-download">📥 PDF 다운로드</button>
            <button onclick="restart()" class="btn-restart">🔄 새로 시작</button>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script src="js/main.js"></script>
</body>
</html>
```

### `/public/js/main.js`

```javascript
let selectedIndustry = '';
const API_ENDPOINT = '/api/generate-strategy';

// 업종 선택
document.querySelectorAll('.industry-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedIndustry = btn.dataset.industry;
    
    // 업종별 추가 필드 생성
    generateIndustryFields(selectedIndustry);
    
    // 다음 단계로
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
  });
});

// 업종별 추가 필드 생성
function generateIndustryFields(industry) {
  const container = document.getElementById('industrySpecificFields');
  container.innerHTML = '';

  const fields = {
    '한의원': [
      { name: 'avgPrice', label: '평균 객단가 (원)', placeholder: '35000' },
      { name: 'returnRate', label: '재방문율 (%)', placeholder: '35' },
      { name: 'specialty', label: '주력 진료 분야', placeholder: '통증 치료, 다이어트' }
    ],
    '카페': [
      { name: 'avgPrice', label: '평균 객단가 (원)', placeholder: '7000' },
      { name: 'returnRate', label: '재방문율 (%)', placeholder: '40' },
      { name: 'signature', label: '시그니처 메뉴', placeholder: '수제 티라미수' }
    ],
    '헬스장': [
      { name: 'members', label: '등록 회원 (명)', placeholder: '150' },
      { name: 'retentionRate', label: '재등록률 (%)', placeholder: '60' },
      { name: 'ptRate', label: 'PT 비율 (%)', placeholder: '20' }
    ],
    '네일샵': [
      { name: 'avgPrice', label: '평균 객단가 (원)', placeholder: '50000' },
      { name: 'returnCycle', label: '재방문 주기 (주)', placeholder: '4' },
      { name: 'bookingRate', label: '예약률 (%)', placeholder: '70' }
    ]
  };

  fields[industry]?.forEach(field => {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label>${field.label}</label>
      <input type="text" name="${field.name}" placeholder="${field.placeholder}" required>
    `;
    container.appendChild(div);
  });
}

// 폼 제출
document.getElementById('infoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 폼 데이터 수집
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  // 다음 단계로 + 로딩 표시
  document.getElementById('step2').classList.remove('active');
  document.getElementById('step3').classList.add('active');
  document.getElementById('loading').style.display = 'block';
  document.getElementById('result').style.display = 'none';
  
  try {
    // API 호출
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        industry: selectedIndustry,
        data: data
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 성공: 결과 표시
      displayStrategy(result.strategy);
    } else {
      // 실패: 에러 메시지
      displayError(result.error);
    }
    
  } catch (error) {
    displayError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
  }
});

// 전략 표시
function displayStrategy(strategy) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  
  // Markdown을 HTML로 변환 (간단한 버전)
  const html = strategy
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  
  document.getElementById('strategyContent').innerHTML = html;
}

// 에러 표시
function displayError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  document.getElementById('strategyContent').innerHTML = `
    <div class="error">
      <h2>⚠️ 오류 발생</h2>
      <p>${message}</p>
      <button onclick="restart()" class="btn-restart">다시 시도하기</button>
    </div>
  `;
}

// 복사 기능
function copyStrategy() {
  const content = document.getElementById('strategyContent').innerText;
  navigator.clipboard.writeText(content);
  alert('전략이 복사되었습니다!');
}

// PDF 다운로드 (추후 구현)
function downloadPDF() {
  alert('PDF 다운로드 기능은 준비 중입니다.');
}

// 새로 시작
function restart() {
  location.reload();
}
```

### `/public/css/style.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

header {
  text-align: center;
  margin-bottom: 40px;
}

header h1 {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 10px;
}

header p {
  color: #666;
  font-size: 1.1rem;
}

.step {
  display: none;
}

.step.active {
  display: block;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.industry-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.industry-btn {
  padding: 30px;
  font-size: 1.5rem;
  border: 3px solid #e0e0e0;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.industry-btn:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s;
}

.submit-btn:hover {
  transform: scale(1.05);
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result {
  padding: 20px;
}

#strategyContent {
  line-height: 1.8;
  color: #333;
}

#strategyContent h2 {
  margin-top: 30px;
  margin-bottom: 15px;
  color: #667eea;
}

#strategyContent h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #764ba2;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.action-buttons button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-copy {
  background: #4CAF50;
  color: white;
}

.btn-download {
  background: #2196F3;
  color: white;
}

.btn-restart {
  background: #FF9800;
  color: white;
}

.action-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
```

---

## 📦 배포 방법

### Vercel로 배포 (추천)

#### Option 1: GitHub 연동 (자동 배포)
```bash
# 1. GitHub 저장소 생성 및 푸시
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/marketing-lab.git
git push -u origin main

# 2. Vercel에서 Import
# https://vercel.com/new
# → GitHub 저장소 선택
# → 환경 변수 설정 (GOOGLE_API_KEY)
# → Deploy 클릭
```

#### Option 2: Vercel CLI (수동 배포)
```bash
# 1. Vercel CLI 로그인
vercel login

# 2. 프로젝트 초기화
vercel

# 3. 환경 변수 설정
vercel env add GOOGLE_API_KEY

# 4. 배포
vercel --prod
```

---

## 🧪 테스트 방법

### 로컬 테스트
```bash
# Vercel Dev 서버 실행
vercel dev

# 브라우저에서 열기
# http://localhost:3000
```

### API 직접 테스트 (curl)
```bash
curl -X POST http://localhost:3000/api/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "한의원",
    "data": {
      "name": "마포 행복한의원",
      "location": "마포구 공덕동",
      "months": "24",
      "revenue": "1500",
      "avgPrice": "35000",
      "returnRate": "35",
      "specialty": "통증 치료",
      "concerns": "신규 환자 유입이 안 됨",
      "goals": "월 매출 30% 증가"
    }
  }'
```

---

## 🔒 보안 체크리스트

- [ ] `.env.local` 파일을 `.gitignore`에 추가
- [ ] Vercel 환경 변수에 API 키 등록
- [ ] CORS 설정 확인
- [ ] Rate Limiting 구현 (선택)
- [ ] 입력 검증 강화

---

## 📊 모니터링

### Vercel Dashboard에서 확인
- 배포 상태
- 함수 호출 횟수
- 에러 로그
- 응답 시간

### Google AI Studio에서 확인
- API 사용량
- 비용
- 할당량

---

**다음 단계: 프론트엔드 UI 디자인 개선 및 실제 배포** 🚀
