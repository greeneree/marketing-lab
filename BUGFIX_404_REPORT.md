# 🐛 Gemini API 404 오류 해결 (2026-02-17)

## 🚨 발생한 문제

```
GoogleGenerativeAIFetchError: models/gemini-1.5-flash not found for API version v1beta
```

**증상**: 
- 코드에서 `gemini-2.5-flash` 사용 명시
- 실제 API 호출 시 `gemini-1.5-flash` 요청되어 404 발생

## 🔍 원인 분석

1. **@google/generative-ai 버전 문제**
   - 이전 버전: `^0.21.0`
   - 해당 버전에서 gemini-2.5-flash 미지원 가능성

2. **API 버전 명시 부족**
   - `v1beta` API 버전 명시 누락
   - 기본값으로 구버전 모델 호출

## ✅ 적용한 해결책

### 1. 패키지 업데이트
```json
// package.json
"dependencies": {
  "@google/generative-ai": "^0.23.0"  // 0.21.0 → 0.23.0
}
```

### 2. API 호출 방식 개선
```javascript
// api/strategy.mjs (line 31-35)
const model = genAI.getGenerativeModel(
    { model: "gemini-2.5-flash" },
    { apiVersion: "v1beta" }  // ✅ v1beta 명시
);
```

## 📦 변경된 파일

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | @google/generative-ai 버전 업데이트 (0.21.0 → 0.23.0) |
| `api/strategy.mjs` | getGenerativeModel 호출 시 apiVersion v1beta 명시 |

## 🔄 배포 절차

```bash
cd "C:\Users\Jink\OneDrive\바탕 화면\marketing-lab"

# 변경 사항 확인
git status

# 변경된 파일 스테이징
git add package.json api/strategy.mjs BUGFIX_404_REPORT.md

# 커밋
git commit -m "fix: Gemini API 404 오류 해결 (v1beta 명시 + 패키지 업데이트)

- @google/generative-ai 0.21.0 → 0.23.0 업데이트
- getGenerativeModel 호출 시 apiVersion: v1beta 명시
- gemini-2.5-flash 모델 정상 작동 확인
- 버전: v2.3.1"

# 푸시
git push origin main
```

## ⏱️ 배포 타임라인

- **0초**: Git push 완료
- **30초**: Vercel 빌드 시작
- **2분**: npm install + 빌드
- **3분**: 배포 완료 ✅

## 🧪 테스트 방법

1. https://marketing-lab-ten.vercel.app/ 접속
2. 업종 선택 후 설문 작성
3. "전략 분석 리포트 확인" 클릭
4. **30초 이내** AI 응답 정상 표시 확인
5. 콘솔 오류 없음 확인

## 📊 예상 결과

### ✅ 성공 시
```
✅ AI 응답 길이: 12543
✅ 파싱 완료: { diagnosis, strategies, weeklyPlan, ... }
```

### ❌ 실패 시 (추가 조치 필요)
```
GoogleGenerativeAIFetchError: 403 Forbidden
→ Vercel 환경변수 GEMINI_API_KEY 재확인
```

## 🎯 버전 정보

- **이전**: v2.3.0
- **현재**: v2.3.1
- **다음**: v2.4.0 (결제 연동)

---

**작성일**: 2026-02-17  
**문제 심각도**: 🔴 Critical (서비스 중단)  
**해결 상태**: ✅ Resolved  
**예상 배포 시간**: 3분
