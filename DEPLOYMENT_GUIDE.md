# 🚀 Git 업데이트 및 Vercel 배포 가이드

## 📋 목차
1. [로컬에서 Git 업데이트](#1-로컬에서-git-업데이트)
2. [Vercel 자동 배포](#2-vercel-자동-배포)
3. [환경변수 설정 확인](#3-환경변수-설정-확인)
4. [배포 확인 및 테스트](#4-배포-확인-및-테스트)
5. [문제 해결](#5-문제-해결)

---

## 1. 로컬에서 Git 업데이트

### 1-1. 터미널 열기
- **Windows**: `Win + R` → `cmd` 입력 → Enter
- **Mac**: `⌘ + Space` → `terminal` 입력 → Enter

### 1-2. 프로젝트 폴더로 이동
```bash
cd ~/Desktop/marketing-lab
# 또는 프로젝트가 있는 경로로 이동
```

### 1-3. 현재 상태 확인
```bash
git status
```
**예상 결과**: 수정된 파일들이 빨간색으로 표시됨

### 1-4. 모든 변경사항 추가
```bash
git add .
```

### 1-5. 커밋 메시지 작성
```bash
git commit -m "v2.0: 사전질문 추가, 캘린더 구현, 프롬프트 개선"
```

### 1-6. GitHub에 푸시
```bash
git push origin main
```

**완료!** 이제 GitHub에 코드가 업데이트되었습니다.

---

## 2. Vercel 자동 배포

### 2-1. Vercel이 GitHub와 연동되어 있다면
✅ **자동으로 배포가 시작됩니다!**

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택: `marketing-lab`
3. **Deployments** 탭 확인
4. 최신 배포가 "Building..." → "Ready" 상태로 변경될 때까지 대기 (약 1-3분)

### 2-2. 만약 자동 배포가 안 된다면
```bash
# Vercel CLI로 수동 배포
vercel --prod
```

---

## 3. 환경변수 설정 확인

### 3-1. Vercel 대시보드에서 확인
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택: `marketing-lab`
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 선택

### 3-2. 필요한 환경변수
| Key | Value | Environments |
|-----|-------|--------------|
| `GOOGLE_API_KEY` | `AIza...` (발급받은 키) | Production, Preview, Development |

⚠️ **중요**: 
- 기존에 `GOOGLE_AISTUDIO_KEY`로 설정했다면 **삭제**하고
- `GOOGLE_API_KEY`로 **새로 추가**해야 합니다.

### 3-3. 환경변수 변경 후
반드시 **Redeploy** 버튼을 눌러야 적용됩니다!

---

## 4. 배포 확인 및 테스트

### 4-1. 배포 완료 확인
1. Vercel 대시보드의 **Deployments** 탭
2. 최신 배포 상태가 **"Ready"** ✅ 인지 확인
3. **"Visit"** 버튼 클릭 → 사이트 접속

### 4-2. 기능 테스트
아래 순서대로 테스트하세요:

#### ✅ 체크리스트

- [ ] **마포구 동 선택**: 15개 동이 모두 표시되는가?
  - 공덕동, 아현동, 도화동, 용강동, 대흥동
  - 염리동, 신수동, 서강동, 서교동, 합정동
  - 망원동, 연남동, 성산동, 중동, 상암동

- [ ] **온라인 등록 여부**: 체크박스가 작동하는가?
  - 네이버플레이스, 카카오맵, 기타, 없음

- [ ] **히트 상품 입력**: 
  - "있다" 선택 시 → 입력 필드 표시
  - "없다" 선택 시 → 입력 필드 숨김

- [ ] **AI 전략 생성**: 
  - "AI 전략 생성하기" 버튼 클릭
  - 로딩 화면 표시
  - 3-10초 후 결과 화면 표시

- [ ] **결과 화면 확인**:
  - ✅ 현황 진단 (강점/약점)
  - ✅ 즉시 실행 전략 5개
  - ✅ 12주 캘린더 (90일치 표시)
  - ✅ 프로그래스바 (0% → 실천 시 증가)
  - ✅ 인스타그램 해시태그 15개
  - ✅ 네이버/카카오맵 키워드
  - ✅ 예상 성과 (숫자 오류 없음: "원" 단위 정확)

- [ ] **실천 체크 기능**:
  - 캘린더 날짜 클릭 → "실천했어요" 버튼
  - 버튼 클릭 → "✅ 완료"로 변경
  - 프로그래스바 증가 확인

### 4-3. 샘플 테스트 데이터
```
업종: 카페
이름: 테스트카페
위치: 망원동
월 평균 매출: 300 (만원)
온라인 등록: 네이버플레이스, 카카오맵
히트 상품: 있다 → "망원라떼"
고민: 주말만 손님이 많고 평일이 한산해요
```

**예상 AI 응답 포함**:
- 전략: "망원라떼 시그니처 메뉴 강화"
- 전략: "평일 오전 재택근무족 타겟"
- 전략: "망원동 상권 연계 제휴"

---

## 5. 문제 해결

### 문제 1: "AI 응답 오류" 표시
**원인**: API 키 문제
**해결**:
1. Vercel → Settings → Environment Variables
2. `GOOGLE_API_KEY` 값 확인
3. Google AI Studio에서 새 키 발급: https://aistudio.google.com/
4. Vercel에서 환경변수 업데이트
5. **Redeploy** 버튼 클릭

### 문제 2: 빈 화면만 표시
**원인**: JavaScript 로드 실패
**해결**:
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 에러 메시지 확인
3. 아래 명령어로 로그 확인
```bash
vercel logs
```

### 문제 3: "만원" 대신 "원" 표시 안됨
**원인**: 이미 해결되었지만 혹시 모를 경우
**확인**:
- `public/js/main.js` 파일의 `displayExpectedResults` 함수
- `toLocaleString()` 사용 확인
- 단위가 "원"인지 확인

### 문제 4: Git Push 실패
**에러**: `Permission denied (publickey)`
**해결**:
```bash
# GitHub 인증 다시 설정
git remote set-url origin https://github.com/YOUR_USERNAME/marketing-lab.git
git push origin main
```

### 문제 5: Vercel 배포 실패
**에러 로그 확인**:
1. Vercel 대시보드 → Deployments
2. 실패한 배포 클릭
3. **Logs** 탭에서 에러 메시지 확인
4. 주로 다음 원인:
   - `package.json` 문법 오류
   - API 라우트 경로 오류
   - 환경변수 누락

---

## 📊 배포 후 체크리스트

### 즉시 확인
- [ ] 사이트 접속 가능
- [ ] 폼 입력 정상 작동
- [ ] AI 응답 정상 생성
- [ ] 캘린더 표시 정상
- [ ] 숫자 단위 정확 ("원" 표시)

### 1시간 후 확인
- [ ] 여러 브라우저에서 테스트 (Chrome, Safari, Edge)
- [ ] 모바일에서 테스트
- [ ] 다양한 업종으로 테스트

### 지인 테스트 요청
- [ ] 실제 자영업자 1-3명에게 공유
- [ ] 사용 후기 수집
- [ ] 개선 사항 기록

---

## 🎯 다음 단계 권장사항

### 1주일 후
- 지인 피드백 수집
- AI 프롬프트 개선
- 추가 업종 지원 (예: 식당, 미용실)

### 2주일 후
- 결제 시스템 연동 (Toss Payments, BootPay 등)
- 사용자 가입 기능 추가
- 전략 히스토리 저장 기능

### 1개월 후
- 실제 성과 추적 기능
- 고객 만족도 조사
- 마케팅 시작 (블로그, 인스타그램)

---

## 💡 빠른 명령어 참고

```bash
# Git 상태 확인
git status

# 변경사항 추가 및 커밋
git add .
git commit -m "메시지"
git push origin main

# Vercel 배포
vercel --prod

# 로그 확인
vercel logs

# 환경변수 목록
vercel env ls
```

---

## 🆘 도움이 필요하면

1. **Vercel 로그 확인**: `vercel logs`
2. **브라우저 콘솔 확인**: F12 → Console
3. **Git 상태 확인**: `git status`
4. **GitHub 이슈 생성**: 문제 상세 기록

---

**🎉 축하합니다!**

모든 기능이 정상 작동하면 배포가 완료된 것입니다.
이제 실제 자영업자 지인들에게 공유하고 피드백을 받으세요!

**사이트 URL**: https://marketing-lab-ten.vercel.app/
