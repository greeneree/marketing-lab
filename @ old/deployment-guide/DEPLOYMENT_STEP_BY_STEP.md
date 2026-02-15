# 🚀 Vercel 배포 상세 가이드

## 📍 현재 위치: Vercel 메인 화면

화면에 보이는 것:
- "Let's build something new" 제목
- "Import Git Repository" 섹션
- "Clone Template" 섹션

---

## 🎯 **지금부터 따라하세요!**

### Step 1: 로컬에 프로젝트 생성 (5분)

#### 1-1. 터미널 열기
- **Windows**: 시작 → `cmd` 검색 → 명령 프롬프트
- **Mac**: Spotlight (⌘ + Space) → `terminal` 검색

#### 1-2. 프로젝트 폴더 생성
```bash
# 데스크탑으로 이동
cd ~/Desktop

# 폴더 생성 및 이동
mkdir marketing-lab
cd marketing-lab
```

#### 1-3. npm 초기화
```bash
npm init -y
```

**출력 결과 확인:**
```json
{
  "name": "marketing-lab",
  "version": "1.0.0",
  ...
}
```

#### 1-4. Google AI SDK 설치
```bash
npm install @google/generative-ai
```

**설치 완료 메시지:**
```
added 1 package, and audited 2 packages in 2s
```

---

### Step 2: 필수 파일 생성 (10분)

#### 2-1. 폴더 구조 만들기
```bash
# Windows
mkdir api public public\css public\js

# Mac/Linux
mkdir -p api public/css public/js
```

#### 2-2. 파일 생성

**방법 1: VS Code 사용 (권장)**
```bash
# VS Code 설치 (없으면)
# https://code.visualstudio.com/

# 프로젝트 폴더를 VS Code로 열기
code .
```

**방법 2: 메모장/TextEdit 사용**
- 각 파일을 수동으로 생성

---

### Step 3: 핵심 파일 코드 작성

#### 📄 `api/generate-strategy.js` (서버리스 함수)

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  // CORS 설정
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
    const { industry, data } = req.body;

    const prompt = `
# 역할
당신은 한국의 ${industry} 마케팅 전문가입니다.

# 고객 정보
- 업체명: ${data.name}
- 위치: ${data.location}
- 월매출: ${data.revenue}만원
- 현재 고민: ${data.concerns}

# 요청
위 정보를 바탕으로 즉시 실행 가능한 마케팅 전략 5개를 제시해주세요.
각 전략마다 실행 방법, 예상 비용, 예상 효과를 포함해주세요.
IT 용어를 사용하지 말고 자영업자가 이해하기 쉬운 말로 설명해주세요.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      strategy: text
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI 전략 생성 실패',
      details: error.message
    });
  }
}
```

#### 📄 `public/index.html`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>마케팅랩 - AI 마케팅 전략</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <h1>🎯 마케팅랩</h1>
    <p class="subtitle">AI가 만드는 맞춤 마케팅 전략</p>

    <form id="strategyForm">
      <div class="form-group">
        <label>업종</label>
        <select name="industry" required>
          <option value="">선택하세요</option>
          <option value="한의원">🏥 한의원</option>
          <option value="카페">☕ 카페</option>
          <option value="헬스장">💪 헬스장</option>
          <option value="네일샵">💅 네일샵</option>
        </select>
      </div>

      <div class="form-group">
        <label>사업장 이름</label>
        <input type="text" name="name" placeholder="예: 마포 행복한의원" required>
      </div>

      <div class="form-group">
        <label>위치</label>
        <input type="text" name="location" placeholder="예: 마포구 공덕동" required>
      </div>

      <div class="form-group">
        <label>월평균 매출 (만원)</label>
        <input type="number" name="revenue" placeholder="예: 1500" required>
      </div>

      <div class="form-group">
        <label>현재 고민</label>
        <textarea name="concerns" rows="3" placeholder="예: 신규 고객 유입이 안 됨" required></textarea>
      </div>

      <button type="submit" id="submitBtn">
        <span id="btnText">AI 전략 생성하기</span>
        <span id="loading" style="display: none;">생성 중...</span>
      </button>
    </form>

    <div id="result" style="display: none;">
      <h2>📋 맞춤 마케팅 전략</h2>
      <div id="strategyContent"></div>
      <button onclick="location.reload()">새로 시작</button>
    </div>
  </div>

  <script src="js/main.js"></script>
</body>
</html>
```

#### 📄 `public/js/main.js`

```javascript
document.getElementById('strategyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const loading = document.getElementById('loading');
  
  // 버튼 상태 변경
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  loading.style.display = 'inline';
  
  // 폼 데이터 수집
  const formData = new FormData(e.target);
  const data = {
    industry: formData.get('industry'),
    data: {
      name: formData.get('name'),
      location: formData.get('location'),
      revenue: formData.get('revenue'),
      concerns: formData.get('concerns')
    }
  };
  
  try {
    const response = await fetch('/api/generate-strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 결과 표시
      document.getElementById('strategyForm').style.display = 'none';
      document.getElementById('result').style.display = 'block';
      document.getElementById('strategyContent').innerHTML = 
        result.strategy.replace(/\n/g, '<br>');
    } else {
      alert('오류: ' + result.error);
    }
    
  } catch (error) {
    alert('네트워크 오류: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    loading.style.display = 'none';
  }
});
```

#### 📄 `public/css/style.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

h1 {
  text-align: center;
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

button[type="submit"] {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  transform: scale(1.05);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

#result {
  margin-top: 30px;
}

#result h2 {
  color: #667eea;
  margin-bottom: 20px;
}

#strategyContent {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}
```

---

### Step 4: GitHub에 푸시

#### 4-1. Git 초기화
```bash
git init
git add .
git commit -m "Initial commit"
```

#### 4-2. GitHub 저장소 생성
1. https://github.com/new 접속
2. Repository name: `marketing-lab`
3. Public 선택
4. "Create repository" 클릭

#### 4-3. 원격 저장소 연결 및 푸시
```bash
# GitHub에서 알려주는 명령어 복사해서 실행
git remote add origin https://github.com/YOUR_USERNAME/marketing-lab.git
git branch -M main
git push -u origin main
```

---

### Step 5: Vercel에서 Import

#### 5-1. Vercel 화면에서 "Import Git Repository" 클릭

#### 5-2. GitHub 저장소 선택
- `marketing-lab` 저장소 선택
- "Import" 클릭

#### 5-3. 환경 변수 설정
**Environment Variables 섹션에서:**
- Key: `GOOGLE_API_KEY`
- Value: (Google Gemini API 키 입력)
- "Add" 클릭

#### 5-4. Deploy 클릭
- 약 1-2분 대기
- ✅ "Congratulations!" 메시지 표시

---

### Step 6: 테스트

#### 6-1. 배포된 URL 클릭
- `https://marketing-lab-xxx.vercel.app` 형식

#### 6-2. 테스트 데이터 입력
```
업종: 한의원
이름: 테스트한의원
위치: 서울시 강남구
월매출: 1500
고민: 신규 환자가 없어요
```

#### 6-3. "AI 전략 생성하기" 클릭
- 10-20초 대기
- AI 전략 확인!

---

## ❓ 문제 발생 시

### 문제 1: npm 명령어를 찾을 수 없음
**해결**: Node.js 설치
- https://nodejs.org/
- LTS 버전 다운로드 및 설치

### 문제 2: API 키 오류
**해결**: Google Gemini API 키 발급
- https://aistudio.google.com/
- "Get API Key" 클릭
- 키 복사 후 Vercel 환경 변수에 입력

### 문제 3: 배포 실패
**해결**: vercel.json 파일 확인
- 파일 위치: 프로젝트 루트
- 내용: 위의 vercel.json 코드

---

## 🎉 완료!

배포가 성공하면:
- ✅ 실시간 AI 마케팅 전략 생성 가능
- ✅ 인터넷에 공개된 URL
- ✅ 자동 HTTPS 적용

---

**지금 어느 단계에 계신가요? 막히는 부분이 있으면 알려주세요!** 🚀
