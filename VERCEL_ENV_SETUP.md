# 🔧 Vercel 환경 변수 설정 가이드

## 🚨 현재 문제

**증상**: API 호출 시 204 No Content 응답
```
POST /api/strategy
Response: 204 No Content
```

**원인 가능성**:
1. ❌ Vercel 환경 변수 미설정
2. ❌ API 키 유효기간 만료
3. ❌ 배포 버전 불일치

---

## ✅ 해결 방법

### 1단계: Vercel 환경 변수 확인

1. **Vercel Dashboard** 접속
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `marketing-lab` 프로젝트 클릭

3. **Settings → Environment Variables**
   - 좌측 메뉴에서 "Settings" 클릭
   - "Environment Variables" 탭 선택

4. **필수 환경 변수 확인**
   | 이름 | 값 | 환경 |
   |------|-----|------|
   | `GEMINI_API_KEY` | AIza... (Google AI Studio 키) | Production, Preview, Development |

### 2단계: API 키 발급 (없는 경우)

1. **Google AI Studio 접속**
   - https://aistudio.google.com/apikey

2. **Create API Key** 클릭
   - 프로젝트 선택 또는 새로 생성
   - API 키 복사 (예: AIzaSyD...)

3. **Vercel에 추가**
   ```
   Name: GEMINI_API_KEY
   Value: [복사한 API 키]
   Environment: Production, Preview, Development (모두 체크)
   ```

4. **Save** 버튼 클릭

### 3단계: 재배포

**Option A - 자동 재배포 (권장)**
```bash
cd "C:\Users\Jink\OneDrive\바탕 화면\marketing-lab"

# 더미 커밋으로 강제 재배포
git add .
git commit -m "fix: 204 오류 해결 - Vercel 환경 변수 확인 (v2.3.2)"
git push origin main
```

**Option B - Vercel Dashboard에서 수동 재배포**
1. Vercel Dashboard → Deployments
2. 최신 배포 선택
3. 우측 상단 "⋯" 메뉴 → "Redeploy"
4. "Redeploy" 버튼 클릭

---

## 🧪 테스트 방법

### 1. 로그 확인
Vercel Dashboard → Deployments → 최신 배포 → "View Function Logs"
```
✅ 정상:
🔑 API Key 상태: 설정됨 (AIzaSyD...)
📥 받은 데이터: {...}
📝 생성된 프롬프트 길이: 4523
✅ AI 응답 길이: 12345

❌ 오류:
🔑 API Key 상태: ❌ 없음
```

### 2. 브라우저 테스트
1. https://marketing-lab-ten.vercel.app/ 접속
2. 설문 작성 및 제출
3. **F12 → Network 탭**에서 `/api/strategy` 응답 확인
   - ✅ 정상: `200 OK` + JSON 데이터
   - ❌ 오류: `204 No Content` 또는 `500 Internal Server Error`

---

## 📊 환경 변수 우선순위

API는 다음 순서로 환경 변수를 확인합니다:
```javascript
const apiKey = 
    process.env.GEMINI_API_KEY ||        // 1순위
    process.env.GOOGLE_API_KEY ||        // 2순위
    process.env.GOOGLE_AISTUDIO_KEY;     // 3순위
```

**권장**: `GEMINI_API_KEY` 사용

---

## 🔍 디버깅 체크리스트

- [ ] Vercel 환경 변수 `GEMINI_API_KEY` 설정됨
- [ ] API 키가 `AIza...` 형식으로 시작
- [ ] 환경 변수 적용 대상: Production, Preview, Development 모두 체크
- [ ] Git push 후 Vercel 빌드 완료 (3분 대기)
- [ ] Function Logs에서 `🔑 API Key 상태: 설정됨` 확인
- [ ] 브라우저 Network 탭에서 `200 OK` 응답 확인

---

## 🆘 여전히 204 오류 발생 시

### 추가 확인 사항

1. **API 키 할당량 확인**
   - https://aistudio.google.com/apikey
   - 일일 요청 한도 초과 여부 확인

2. **Vercel 함수 로그**
   ```bash
   vercel logs marketing-lab --follow
   ```

3. **로컬 테스트**
   ```bash
   cd "C:\Users\Jink\OneDrive\바탕 화면\marketing-lab"
   
   # .env 파일 생성
   echo GEMINI_API_KEY=AIza... > .env
   
   # 로컬 실행
   npm run dev
   
   # 브라우저: http://localhost:3000
   ```

---

**작성일**: 2026-02-17  
**문제**: 204 No Content 응답  
**우선순위**: 🔴 Critical  
**예상 해결 시간**: 5-10분
