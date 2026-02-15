# ⚡ 빠른 시작 가이드 (5분 완성)

현재 컴퓨터에 있는 프로젝트를 GitHub과 Vercel에 업데이트하는 방법입니다.

---

## 📍 현재 상황
- ✅ Vercel 계정 있음
- ✅ GitHub 저장소 있음 (`marketing-lab`)
- ✅ 로컬에 프로젝트 폴더 있음 (`~/Desktop/marketing-lab`)

---

## 🚀 3단계로 배포하기

### 1️⃣ 터미널 열고 프로젝트 이동 (30초)

**Windows**
```bash
Win + R → cmd 입력 → Enter
cd Desktop\marketing-lab
```

**Mac**
```bash
⌘ + Space → terminal 입력 → Enter
cd ~/Desktop/marketing-lab
```

---

### 2️⃣ 파일 복사 및 업데이트 (2분)

#### 방법 A: 직접 복사 (추천)
1. 이 세션에서 생성된 파일들을 로컬 프로젝트에 복사:
   - `public/index.html`
   - `public/css/style.css`
   - `public/js/main.js`
   - `api/generate-strategy.js`
   - `package.json`
   - `vercel.json`
   - `.gitignore`

2. 파일 구조 확인:
```
marketing-lab/
├── api/
│   └── generate-strategy.js
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── package.json
├── vercel.json
└── .gitignore
```

#### 방법 B: GitHub에서 다운로드
```bash
# 기존 프로젝트 백업
mv marketing-lab marketing-lab-backup

# 새 버전 클론
git clone https://github.com/YOUR_USERNAME/marketing-lab.git
cd marketing-lab
```

---

### 3️⃣ Git 업데이트 및 배포 (2분)

```bash
# 1. 현재 상태 확인
git status

# 2. 모든 파일 추가
git add .

# 3. 커밋
git commit -m "v2.0: 캘린더, 히트상품, 프롬프트 개선 완료"

# 4. GitHub에 푸시
git push origin main
```

**결과**: 
- ✅ GitHub 저장소 업데이트됨
- ✅ Vercel이 자동으로 배포 시작 (1-3분 소요)

---

## 🔍 배포 확인 (1분)

### 1. Vercel 대시보드 확인
1. https://vercel.com/dashboard 접속
2. `marketing-lab` 프로젝트 클릭
3. **Deployments** 탭 확인
4. 상태가 **"Building..."** → **"Ready"** ✅ 될 때까지 대기

### 2. 환경변수 확인
1. **Settings** 탭 클릭
2. **Environment Variables** 메뉴
3. `GOOGLE_API_KEY` 또는 `GOOGLE_AISTUDIO_KEY` 있는지 확인

⚠️ **중요**: API 키 이름 변경 필요
- 기존: `GOOGLE_AISTUDIO_KEY`
- 새로운: `GOOGLE_API_KEY` (코드에서 이걸 찾음)

**변경 방법**:
1. 기존 `GOOGLE_AISTUDIO_KEY` 삭제
2. 새로 추가: Key = `GOOGLE_API_KEY`, Value = (발급받은 키)
3. **Redeploy** 버튼 클릭

### 3. 사이트 접속 테스트
```
https://marketing-lab-ten.vercel.app/
```

**테스트 데이터**:
- 업종: 카페
- 이름: 테스트카페
- 위치: 망원동
- 월 매출: 300
- 온라인: 네이버플레이스, 카카오맵
- 히트상품: 있다 → "망원라떼"
- 고민: 평일이 한산해요

**기대 결과**:
- ✅ 로딩 화면 → AI 응답 표시
- ✅ 캘린더 90일 표시
- ✅ 프로그래스바 0%
- ✅ 해시태그 15개
- ✅ 예상 성과 (숫자 정확)

---

## ❌ 문제 발생 시

### 문제 1: Git Push 실패
```bash
# GitHub 인증 설정
git remote -v
# 출력 확인 후

git remote set-url origin https://github.com/YOUR_USERNAME/marketing-lab.git
git push origin main
```

### 문제 2: Vercel 배포 실패
1. Vercel 대시보드 → Deployments
2. 실패한 배포 클릭 → **Logs** 탭
3. 에러 메시지 확인
4. 주로 원인:
   - 환경변수 누락 → `GOOGLE_API_KEY` 추가
   - 파일 경로 오류 → `vercel.json` 확인

### 문제 3: AI 응답 안 나옴
**브라우저 콘솔 확인**:
1. F12 → Console 탭
2. 빨간 에러 메시지 확인
3. 주로 원인:
   - API 키 오류
   - CORS 에러
   - 네트워크 문제

**해결**:
```bash
# 로그 확인
vercel logs

# 환경변수 목록 확인
vercel env ls
```

---

## ✅ 완료 체크리스트

배포가 성공하면 아래 항목들이 모두 작동해야 합니다:

- [ ] 사이트 접속 가능
- [ ] 마포구 15개 동 선택 가능
- [ ] 온라인 등록 여부 체크박스 작동
- [ ] 히트상품 "있다" 선택 시 입력 필드 표시
- [ ] AI 전략 생성 버튼 클릭 → 로딩 → 결과
- [ ] 캘린더 90일 표시
- [ ] "실천했어요" 버튼 클릭 → "✅ 완료" 변경
- [ ] 프로그래스바 증가
- [ ] 해시태그 15개 표시
- [ ] 네이버/카카오맵 키워드 표시
- [ ] 예상 성과 숫자 정확 (만원 → 원)

---

## 🎯 다음 단계

### 즉시 (오늘)
1. ✅ 배포 완료 확인
2. 📱 모바일에서 테스트
3. 🌐 다른 브라우저에서 테스트 (Chrome, Safari, Edge)

### 이번 주
1. 👥 지인 자영업자 3-5명에게 공유
2. 📝 피드백 수집 (15분 인터뷰)
3. 🔧 개선사항 기록

### 다음 주
1. 💰 결제 시스템 연동 검토
2. 📊 사용 통계 수집
3. 🚀 추가 업종 지원 검토

---

## 📞 도움말

**자세한 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**빠른 명령어**:
```bash
# 상태 확인
git status

# 배포
git add . && git commit -m "update" && git push origin main

# 로그
vercel logs
```

---

**🎉 수고하셨습니다!**

모든 단계가 완료되면 실제 자영업자에게 공유하고  
진짜 피드백을 받으세요! 🚀
