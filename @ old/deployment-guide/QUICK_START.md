# ⚡ 빠른 시작 가이드 (30분 완성)

## 📍 지금 Vercel 메인 화면에 계신다면...

**아래 순서대로만 따라하세요!** 👇

---

## 🎯 전체 과정 (30분)

```
1. 로컬 프로젝트 생성 (5분)
   ↓
2. 파일 5개 복사 (10분)
   ↓
3. GitHub 푸시 (5분)
   ↓
4. Vercel Import (5분)
   ↓
5. 테스트 (5분)
```

---

## 📝 Step-by-Step

### 1️⃣ 터미널 열기 (30초)

**Windows:**
```
시작 → "cmd" 검색 → Enter
```

**Mac:**
```
⌘ + Space → "terminal" 검색 → Enter
```

---

### 2️⃣ 명령어 복사해서 실행 (5분)

터미널에 **한 줄씩** 복사해서 Enter:

```bash
# 데스크탑으로 이동
cd ~/Desktop

# 프로젝트 폴더 생성
mkdir marketing-lab
cd marketing-lab

# npm 초기화
npm init -y

# Google AI SDK 설치
npm install @google/generative-ai

# 폴더 구조 생성 (Windows)
mkdir api
mkdir public
mkdir public\css
mkdir public\js

# 폴더 구조 생성 (Mac/Linux)
# mkdir -p api public/css public/js
```

**✅ 확인**: `ls` (Mac) 또는 `dir` (Windows) 명령어로 폴더 확인

---

### 3️⃣ 파일 5개 만들기 (10분)

#### 방법 A: VS Code 사용 (권장)

```bash
# VS Code로 폴더 열기
code .
```

그 다음 VS Code에서 파일 생성:
- `api/generate-strategy.js`
- `public/index.html`
- `public/js/main.js`
- `public/css/style.css`
- `vercel.json`

#### 방법 B: 제공된 파일 다운로드

제가 만든 `deployment-guide` 폴더의 파일들을 복사하세요.

---

### 4️⃣ GitHub에 올리기 (5분)

#### A. GitHub 계정 로그인
- https://github.com/

#### B. 새 저장소 생성
1. https://github.com/new 접속
2. Repository name: `marketing-lab`
3. Public 선택
4. "Create repository" 클릭

#### C. 터미널에서 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/marketing-lab.git
git branch -M main
git push -u origin main
```

**`YOUR_USERNAME`을 본인 GitHub 아이디로 바꾸세요!**

---

### 5️⃣ Vercel에서 Import (5분)

#### A. Vercel 화면에서 "Import Git Repository" 클릭

#### B. GitHub 저장소 선택
- `marketing-lab` 찾아서 "Import" 클릭

#### C. 환경 변수 설정
**Environment Variables** 섹션:
```
Name: GOOGLE_API_KEY
Value: (아래에서 발급받은 키 입력)
```

#### D. Google Gemini API 키 발급 (1분)
1. 새 탭: https://aistudio.google.com/
2. "Get API Key" 클릭
3. 키 복사
4. Vercel에 붙여넣기

#### E. Deploy 클릭!
- 1-2분 대기
- ✅ 완료!

---

### 6️⃣ 테스트 (5분)

#### A. 배포된 URL 클릭
- `https://marketing-lab-xxx.vercel.app`

#### B. 폼 입력
```
업종: 한의원
이름: 테스트한의원
위치: 서울 강남구
월매출: 1500
고민: 신규 환자가 안 옵니다
```

#### C. "AI 전략 생성하기" 클릭
- 10-20초 대기
- 📋 AI 전략 확인!

---

## 🚨 자주 발생하는 문제

### ❌ "npm: command not found"
**해결:**
```
1. https://nodejs.org/ 접속
2. LTS 버전 다운로드
3. 설치 후 터미널 재시작
```

### ❌ "git: command not found"
**해결:**
```
1. https://git-scm.com/ 접속
2. 다운로드 및 설치
3. 터미널 재시작
```

### ❌ API 키 오류
**해결:**
```
1. Google AI Studio에서 키 재발급
2. Vercel → Settings → Environment Variables
3. GOOGLE_API_KEY 값 업데이트
4. Redeploy
```

---

## 📞 도움이 필요하면?

**어느 단계에서 막혔는지 알려주세요!**

예시:
- "npm init -y 명령어가 안 됩니다"
- "GitHub 푸시가 안 됩니다"
- "Vercel에서 에러가 납니다"

---

## 🎁 보너스: 파일 코드 미리보기

### `api/generate-strategy.js` (간단 버전)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { industry, data } = req.body;
  
  const prompt = `당신은 ${industry} 마케팅 전문가입니다. 
${data.name} (${data.location})의 마케팅 전략 5가지를 제시해주세요.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(prompt);
  
  return res.json({ 
    success: true, 
    strategy: result.response.text() 
  });
}
```

### `public/index.html` (핵심만)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>마케팅랩</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <h1>🎯 마케팅랩</h1>
  <form id="strategyForm">
    <input name="industry" placeholder="업종" required>
    <input name="name" placeholder="이름" required>
    <button type="submit">생성</button>
  </form>
  <div id="result"></div>
  <script src="js/main.js"></script>
</body>
</html>
```

---

**지금 바로 시작하세요! 🚀**

Step 1부터 차근차근 따라오시면 30분 안에 완성됩니다!
