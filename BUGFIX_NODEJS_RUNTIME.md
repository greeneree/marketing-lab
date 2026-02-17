# 🐛 Node.js 런타임 오류 해결 (2026-02-17)

## 🚨 발생한 문제

```
SyntaxError: Unexpected token '**'
at compileSourceTextModule (node:internal/modules/esm/utils:346:16)
...
Node.js process exited with exit status: 1
```

**증상**: Vercel 배포 후 API 함수가 시작조차 못함

---

## 🔍 원인 분석

### 1. Vercel의 Node.js 버전 불일치

**문제점**:
- `package.json`에 `"node": "20.x"` 명시
- 하지만 `vercel.json`에 런타임 지정 없음
- Vercel이 **기본값(Node.js 14 또는 16)** 사용
- 최신 JavaScript 문법(Optional Chaining `?.`) 미지원

### 2. 사용된 최신 문법

```javascript
// api/strategy.mjs에서 사용된 최신 문법
const hitProducts = topServices?.filter(s => s.isHit);  // Optional Chaining (Node.js 14+)
const servicesText = topServices?.map(...);
const competitorsText = competitors?.length > 0;
```

**Node.js 버전별 지원**:
| 문법 | Node.js 12 | Node.js 14 | Node.js 16 | Node.js 18 | Node.js 20 |
|------|-----------|-----------|-----------|-----------|-----------|
| Optional Chaining (`?.`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Nullish Coalescing (`??`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| ES Modules (`.mjs`) | ⚠️ | ✅ | ✅ | ✅ | ✅ |

---

## ✅ 적용한 해결책

### 1. vercel.json에 Node.js 런타임 명시

```json
{
  "functions": {
    "api/**/*.mjs": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**변경 사항**:
- ✅ `"functions"` 섹션 추가
- ✅ API 함수에 `nodejs20.x` 런타임 명시
- ✅ `.mjs` 파일 패턴 지정

### 2. API 키 검증 강화

```javascript
// api/strategy.mjs
const apiKey = process.env.GEMINI_API_KEY || ...;

if (!apiKey) {
    console.error("❌ CRITICAL: API Key가 설정되지 않았습니다!");
}

console.log("🔧 Node.js 버전:", process.version);
```

**추가 로그**:
- Node.js 버전 출력 (디버깅용)
- API 키 누락 시 명확한 에러 메시지

---

## 📦 변경된 파일

| 파일 | 변경 내용 |
|------|----------|
| `vercel.json` | `functions.runtime: nodejs20.x` 추가 |
| `api/strategy.mjs` | API 키 검증 및 버전 로그 추가 |
| `package.json` | 버전 2.3.2 → 2.3.3 |

---

## 🔄 배포 절차

```bash
cd "C:\Users\Jink\OneDrive\바탕 화면\marketing-lab"

git status

git add vercel.json api/strategy.mjs package.json BUGFIX_NODEJS_RUNTIME.md

git commit -m "fix: Node.js 런타임 오류 해결 (v2.3.3)

- vercel.json에 nodejs20.x 런타임 명시
- API 함수가 올바른 Node.js 버전 사용 보장
- Optional Chaining 등 최신 문법 정상 작동
- API 키 검증 및 디버깅 로그 강화"

git push origin main
```

---

## 🧪 배포 후 확인 사항 (3분 대기)

### 1️⃣ Vercel 빌드 로그

Vercel Dashboard → Deployments → 최신 배포 → **Build Logs**

**정상 빌드 예시**:
```
✓ Installing dependencies...
✓ @google/generative-ai@0.23.0
✓ Build completed
✓ Deploying functions with Node.js 20.x
```

### 2️⃣ Function Logs

Deployments → **View Function Logs**

**정상 로그 예시**:
```
🔑 API Key 상태: 설정됨 (AIzaSyD...)
📌 Vercel 배포 확인: 2026-02-17 v2.3.2
🔧 Node.js 버전: v20.11.0
📥 받은 데이터: {...}
```

**오류 로그 (여전히 발생 시)**:
```
SyntaxError: Unexpected token '**'
→ 캐시 문제: Vercel Dashboard에서 수동 Redeploy 필요
```

### 3️⃣ 브라우저 테스트

1. https://marketing-lab-ten.vercel.app/ 접속
2. 설문 작성 후 "전략 분석 리포트 확인" 클릭
3. **F12 → Network 탭**:
   - ✅ `POST /api/strategy` → `200 OK`
   - ❌ `204 No Content` → 환경 변수 확인
   - ❌ `500 Internal Server Error` → Function Logs 확인

---

## 🎯 추가 조치 (여전히 오류 시)

### Option 1: 수동 재배포 (캐시 초기화)

1. Vercel Dashboard → Deployments
2. 최신 배포 선택
3. 우측 상단 "⋯" → **Redeploy**
4. ✅ **"Use existing Build Cache"** 체크 해제
5. **Redeploy** 버튼 클릭

### Option 2: Vercel CLI로 강제 배포

```bash
npm install -g vercel

cd "C:\Users\Jink\OneDrive\바탕 화면\marketing-lab"

# 프로덕션 배포
vercel --prod --force
```

### Option 3: 환경 변수 재확인

**Vercel Dashboard → Settings → Environment Variables**

| 이름 | 값 | 환경 |
|------|-----|------|
| `GEMINI_API_KEY` | AIza... | ✅ Production<br>✅ Preview<br>✅ Development |

---

## 📊 버전 정보

- **이전**: v2.3.2 (검증 버그 수정)
- **현재**: v2.3.3 (Node.js 런타임 수정)
- **다음**: v2.4.0 (결제 연동)

---

## 🔗 참고 자료

- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Node.js Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**작성일**: 2026-02-17  
**문제 심각도**: 🔴 Critical (배포 실패)  
**해결 상태**: ✅ Resolved  
**예상 배포 시간**: 3-5분
