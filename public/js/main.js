// ========================================
// 전역 변수
// ========================================
let selectedIndustry = '';
let selectedIndustryIcon = '';
let isPaid = false; // 결제 상태

// 마포구 동명 데이터
const mapoDistricts = [
    "공덕동", "아현동", "도화동", "용강동", "대흥동",
    "염리동", "신수동", "서강동", "서교동", "합정동",
    "망원동", "연남동", "성산동", "중동", "상암동"
];

// 업종별 특장점 예시
const strengthExamples = {
    '한의원': '필라테스 연계 자세 치료',
    '네일샵': '반려동물 동반 가능',
    '카페': '아이돌 생일 카페 지원 가능',
    '헬스장': '1일권(Daily Pass) 판매'
};

// ========================================
// 페이지 로드 시 초기화
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeDistricts();
    initializeTimeSelects();
    initializeConcernOther();
    checkPaymentStatus();
});

// ========================================
// 결제 상태 확인
// ========================================
function checkPaymentStatus() {
    const paid = localStorage.getItem('marketinglab_paid');
    if (paid === 'true') {
        isPaid = true;
    }
}

// ========================================
// 모달 열기/닫기
// ========================================
function openIndustryModal() {
    document.getElementById('industry-modal').classList.remove('hidden');
}

function closeIndustryModal() {
    document.getElementById('industry-modal').classList.add('hidden');
}

// ========================================
// 마포구 동명 초기화
// ========================================
function initializeDistricts() {
    const districtSelect = document.getElementById('district');
    mapoDistricts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

// ========================================
// 시간 선택 박스 초기화 (없음 옵션 추가)
// ========================================
function initializeTimeSelects() {
    const timeSelects = [
        'weekday-idle-start', 'weekday-idle-end',
        'weekday-busy-start', 'weekday-busy-end',
        'weekend-idle-start', 'weekend-idle-end',
        'weekend-busy-start', 'weekend-busy-end'
    ];

    timeSelects.forEach(id => {
        const select = document.getElementById(id);
        
        // '없음' 옵션 추가
        const noneOption = document.createElement('option');
        noneOption.value = 'none';
        noneOption.textContent = '없음';
        select.appendChild(noneOption);
        
        // 시간 옵션 추가
        for (let hour = 0; hour <= 23; hour++) {
            const option = document.createElement('option');
            option.value = hour;
            option.textContent = `${String(hour).padStart(2, '0')}:00`;
            select.appendChild(option);
        }
    });
}

// ========================================
// "기타" 고민 입력 필드 토글
// ========================================
function initializeConcernOther() {
    const checkbox = document.getElementById('concern-other-checkbox');
    const input = document.getElementById('concern-other-input');
    
    checkbox.addEventListener('change', (e) => {
        input.style.display = e.target.checked ? 'block' : 'none';
        if (!e.target.checked) {
            input.value = '';
        }
    });
}

// ========================================
// 업종 선택 섹션으로 스크롤
// ========================================
function scrollToIndustry() {
    document.querySelector('.industry-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// ========================================
// 업종 선택
// ========================================
function selectIndustry(industry, icon) {
    selectedIndustry = industry;
    selectedIndustryIcon = icon;
    
    // 모달 닫기
    closeIndustryModal();
    
    // 화면 전환
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('info-screen').classList.remove('hidden');
    
    // 선택한 업종 표시
    document.getElementById('selected-industry-icon').textContent = icon;
    document.getElementById('selected-industry-name').textContent = industry;
    
    // 특장점 예시 업데이트
    const strengthPlaceholder = document.getElementById('strength-placeholder');
    if (strengthPlaceholder) {
        strengthPlaceholder.textContent = `예: ${strengthExamples[industry] || '우리 가게만의 강점을 입력하세요'}`;
    }
    
    // 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// 추가 정보 화면으로 이동
// ========================================
function goToAdditionalInfo() {
    // 필수 항목 검증
    if (!validateBasicInfo()) {
        alert('필수 항목을 모두 입력해주세요');
        return;
    }
    
    // 화면 전환
    document.getElementById('info-screen').classList.add('hidden');
    document.getElementById('additional-info-screen').classList.remove('hidden');
    
    // 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// 기본 정보 검증
// ========================================
function validateBasicInfo() {
    // 가게 이름
    const storeName = document.getElementById('store-name').value.trim();
    if (!storeName) return false;
    
    // 위치
    const district = document.getElementById('district').value;
    if (!district) return false;
    
    // 월 매출
    const monthlySales = document.getElementById('monthly-sales').value;
    if (!monthlySales || monthlySales <= 0) return false;
    
    // 온라인 등록 여부 (최소 1개 체크)
    const platforms = document.querySelectorAll('input[name="platform"]:checked');
    if (platforms.length === 0) return false;
    
    // 시간대 선택 검증
    const timeInputs = [
        'weekday-idle-start', 'weekday-idle-end',
        'weekday-busy-start', 'weekday-busy-end',
        'weekend-idle-start', 'weekend-idle-end',
        'weekend-busy-start', 'weekend-busy-end'
    ];
    
    for (const id of timeInputs) {
        if (!document.getElementById(id).value) return false;
    }
    
    // 현재 고민 (최소 1개 체크)
    const concerns = document.querySelectorAll('input[name="concern"]:checked');
    if (concerns.length === 0) return false;
    
    // "기타" 체크 시 입력 필드 검증
    const concernOtherChecked = document.getElementById('concern-other-checkbox').checked;
    const concernOtherInput = document.getElementById('concern-other-input').value.trim();
    if (concernOtherChecked && !concernOtherInput) {
        alert('기타 고민 내용을 입력해주세요');
        return false;
    }
    
    return true;
}

// ========================================
// FAQ 추가 함수
// ========================================
function addFaqInput() {
    const container = document.getElementById('faq-container');
    const currentCount = container.querySelectorAll('.faq-input').length;
    
    if (currentCount >= 5) {
        alert('FAQ는 최대 5개까지 추가할 수 있습니다.');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'faq-input';
    input.placeholder = '자주 묻는 질문을 입력하세요';
    input.style.marginBottom = '10px';
    
    container.appendChild(input);
}

// ========================================
// SNS 필드 토글
// ========================================
function toggleSnsFields(show) {
    const snsDetails = document.getElementById('sns-details');
    snsDetails.style.display = show ? 'block' : 'none';
    
    // 필드 초기화
    if (!show) {
        document.getElementById('sns-followers').value = '';
        document.getElementById('sns-frequency').value = '';
        document.getElementById('sns-hashtags').value = '';
        document.getElementById('no-hashtags').checked = false;
    }
}

// ========================================
// 해시태그 입력 토글 (Phase 2 신규)
// ========================================
function toggleHashtagInput() {
    const noHashtags = document.getElementById('no-hashtags').checked;
    const hashtagInput = document.getElementById('sns-hashtags');
    
    if (noHashtags) {
        hashtagInput.value = '';
        hashtagInput.disabled = true;
        hashtagInput.placeholder = '해시태그를 사용하지 않습니다';
    } else {
        hashtagInput.disabled = false;
        hashtagInput.placeholder = '예: #마포한의원 #홍대한의원';
    }
}

// ========================================
// 추가 정보 검증 및 업종별 화면으로 이동
// ========================================
function goToIndustrySpecific() {
    // 필수 필드 검증
    const services = document.querySelectorAll('.service-name');
    const servicePrices = document.querySelectorAll('.service-price');
    
    // 서비스 Top 3 검증
    for (let i = 0; i < 3; i++) {
        if (!services[i].value.trim() || !servicePrices[i].value) {
            alert('주요 서비스 Top 3를 모두 입력해주세요');
            return;
        }
    }
    
    // 예약 방식 최소 1개 체크
    const bookingMethods = document.querySelectorAll('input[name="booking"]:checked');
    if (bookingMethods.length === 0) {
        alert('예약 방식을 최소 1개 이상 선택해주세요');
        return;
    }
    
    // 결제 방식 최소 1개 체크
    const paymentMethods = document.querySelectorAll('input[name="payment"]:checked');
    if (paymentMethods.length === 0) {
        alert('결제 방식을 최소 1개 이상 선택해주세요');
        return;
    }
    
    // 리뷰 정보 검증 (리뷰 수만 체크, 평점은 Phase 2에서 제거됨)
    const reviewCounts = document.querySelectorAll('.review-count');
    
    for (let i = 0; i < reviewCounts.length; i++) {
        if (!reviewCounts[i].value || reviewCounts[i].value < 0) {
            alert('모든 플랫폼의 리뷰 수를 입력해주세요 (0 이상)');
            return;
        }
    }
    
    // 화면 전환
    document.getElementById('additional-info-screen').classList.add('hidden');
    document.getElementById('industry-specific-screen').classList.remove('hidden');
    
    // 업종별 필드 표시
    showIndustryFields(selectedIndustry);
    
    // 업종 아이콘 및 이름 설정
    document.getElementById('specific-industry-icon').textContent = selectedIndustryIcon;
    document.getElementById('specific-industry-name').textContent = selectedIndustry;
    
    // 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// 업종별 필드 표시
// ========================================
function showIndustryFields(industry) {
    // 모든 업종 필드 숨기기
    document.querySelectorAll('.industry-fields').forEach(field => {
        field.classList.add('hidden');
    });
    
    // 선택된 업종 필드만 표시
    const targetFields = document.getElementById(`industry-fields-${industry}`);
    if (targetFields) {
        targetFields.classList.remove('hidden');
    }
}

// ========================================
// 폼 데이터 수집
// ========================================
function collectFormData() {
    // 기본 정보
    const storeName = document.getElementById('store-name').value.trim();
    const district = document.getElementById('district').value;
    const monthlySales = parseInt(document.getElementById('monthly-sales').value);
    const realProfit = document.getElementById('real-profit').value 
        ? parseInt(document.getElementById('real-profit').value) 
        : null;
    
    // 온라인 등록 여부
    const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked'))
        .map(cb => cb.value);
    
    // 시간대 정보
    const weekdayIdleStart = document.getElementById('weekday-idle-start').value;
    const weekdayIdleEnd = document.getElementById('weekday-idle-end').value;
    const weekdayBusyStart = document.getElementById('weekday-busy-start').value;
    const weekdayBusyEnd = document.getElementById('weekday-busy-end').value;
    const weekendIdleStart = document.getElementById('weekend-idle-start').value;
    const weekendIdleEnd = document.getElementById('weekend-idle-end').value;
    const weekendBusyStart = document.getElementById('weekend-busy-start').value;
    const weekendBusyEnd = document.getElementById('weekend-busy-end').value;
    
    // 현재 고민
    const concerns = Array.from(document.querySelectorAll('input[name="concern"]:checked'))
        .map(cb => {
            if (cb.value === '기타') {
                return document.getElementById('concern-other-input').value.trim();
            }
            return cb.value;
        });
    
    // 주요 서비스 Top 3
    const topServices = [];
    const serviceRows = document.querySelectorAll('.service-row');
    serviceRows.forEach(row => {
        const name = row.querySelector('.service-name').value.trim();
        const price = row.querySelector('.service-price').value;
        const isHit = row.querySelector('.service-hit').checked;
        if (name && price) {
            topServices.push({ name, price: parseInt(price), isHit });
        }
    });
    
    // 경쟁 매장
    const competitors = [];
    const competitorRows = document.querySelectorAll('.competitor-row');
    competitorRows.forEach(row => {
        const name = row.querySelector('.competitor-name').value.trim();
        const feature = row.querySelector('.competitor-feature').value.trim();
        const price = row.querySelector('.competitor-price').value.trim();
        if (name || feature || price) {
            competitors.push({ name, feature, price });
        }
    });
    
    // FAQ
    const faqs = [];
    const faqInputs = document.querySelectorAll('.faq-input');
    faqInputs.forEach(input => {
        const value = input.value.trim();
        if (value) faqs.push(value);
    });
    
    // 예약/결제 방식
    const bookingMethods = Array.from(document.querySelectorAll('input[name="booking"]:checked'))
        .map(cb => cb.value);
    const paymentMethods = Array.from(document.querySelectorAll('input[name="payment"]:checked'))
        .map(cb => cb.value);
    
    // 리뷰 정보 (Phase 2: 평점 제거, 리뷰 수만)
    const reviews = {};
    const platforms_review = ['naver', 'kakao']; // 구글 제거
    platforms_review.forEach(platform => {
        const count = document.querySelector(`.review-count[data-platform="${platform}"]`).value;
        reviews[platform] = {
            count: parseInt(count) || 0
        };
    });
    
    // SNS 정보 (Phase 2: 해시태그 사용 안 함 옵션)
    const snsActive = document.querySelector('input[name="sns-active"]:checked').value === 'yes';
    let snsInfo = null;
    if (snsActive) {
        const noHashtags = document.getElementById('no-hashtags').checked;
        snsInfo = {
            followers: parseInt(document.getElementById('sns-followers').value) || 0,
            frequency: parseInt(document.getElementById('sns-frequency').value) || 0,
            hashtags: noHashtags ? '' : document.getElementById('sns-hashtags').value.trim(),
            noHashtags: noHashtags
        };
    }
    
    // 업종별 특화 정보
    const industrySpecific = {};
    const industryInputs = document.querySelectorAll(`#industry-fields-${selectedIndustry} .industry-input`);
    industryInputs.forEach(input => {
        const field = input.dataset.field;
        industrySpecific[field] = input.value;
    });
    
    // 라디오 버튼 수집 (업종별)
    const radioButtons = document.querySelectorAll(`#industry-fields-${selectedIndustry} input[type="radio"]:checked`);
    radioButtons.forEach(radio => {
        const name = radio.name.split('-')[0]; // 예: "staff-한의원" -> "staff"
        industrySpecific[name] = radio.value;
    });
    
    // 특장점 (Phase 2 신규)
    const uniqueStrength = document.getElementById('unique-strength')?.value.trim() || '';
    
    return {
        industry: selectedIndustry,
        storeName,
        district,
        monthlySales,
        realProfit,
        platforms,
        timeSchedule: {
            weekday: {
                idle: { start: weekdayIdleStart, end: weekdayIdleEnd },
                busy: { start: weekdayBusyStart, end: weekdayBusyEnd }
            },
            weekend: {
                idle: { start: weekendIdleStart, end: weekendIdleEnd },
                busy: { start: weekendBusyStart, end: weekendBusyEnd }
            }
        },
        concerns,
        topServices,
        competitors,
        faqs,
        bookingMethods,
        paymentMethods,
        reviews,
        snsInfo,
        industrySpecific,
        uniqueStrength  // Phase 2 신규
    };
}

// ========================================
// 최종 제출 및 AI 전략 생성
// ========================================
async function submitAndGenerate() {
    // 업종별 필수 필드 검증
    const industryInputs = document.querySelectorAll(`#industry-fields-${selectedIndustry} input[required]`);
    for (const input of industryInputs) {
        if (input.type === 'radio') {
            const radioGroup = document.querySelector(`input[name="${input.name}"]:checked`);
            if (!radioGroup) {
                alert('모든 필수 항목을 입력해주세요');
                return;
            }
        } else if (!input.value) {
            alert('모든 필수 항목을 입력해주세요');
            return;
        }
    }
    
    const formData = collectFormData();
    console.log('📊 전송할 데이터:', formData);
    
    // 로딩 화면 표시
    document.getElementById('industry-specific-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
        // API 호출
        const response = await fetch('/api/strategy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ AI 응답:', result);
        
        // 결과 화면 표시
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        
        // 결과 표시 (다음 단계에서 구현)
        displayResults(result);
        
    } catch (error) {
        console.error('❌ 오류:', error);
        alert('전략 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        
        // 이전 화면으로 복귀
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('industry-specific-screen').classList.remove('hidden');
    }
}

// ========================================
// 결과 화면 표시 (Phase 2: 블러 처리 추가)
// ========================================
function displayResults(result) {
    console.log('📊 결과 표시 시작:', result);

    // 가게 이름 표시
    const storeName = document.getElementById('store-name').value.trim();
    document.getElementById('result-store-name').textContent = storeName;

    // 진단 결과
    displayDiagnosis(result.diagnosis);

    // 즉시 실행 전략
    displayStrategies(result.strategies);

    // 12주 실행 계획
    displayWeeklyPlan(result.weeklyPlan);

    // 해시태그 & 키워드
    displayHashtagsAndKeywords(result.hashtags, result.keywords);

    // 예상 결과
    displayExpectedResults(result.expectedResults);

    // Phase 2: 결제 여부에 따라 블러 처리
    if (!isPaid) {
        applyBlurEffect();
    }

    // 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// 블러 효과 적용 (Phase 2 신규)
// ========================================
function applyBlurEffect() {
    // 첫 번째 섹션(진단)만 제외하고 나머지 블러 처리
    const sections = [
        'strategies-container',
        'weekly-plan-container',
        'hashtags-container',
        'keywords-container',
        'expected-results-container'
    ];
    
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (container) {
            // container의 부모 card를 찾음
            const card = container.closest('.card');
            if (card) {
                // card에 blurred-section 클래스 추가
                card.classList.add('blurred-section');
                card.style.position = 'relative';
                
                // 언락 오버레이 추가 (blur 영향 받지 않음)
                const overlay = document.createElement('div');
                overlay.className = 'unlock-overlay';
                overlay.innerHTML = `
                    <h3>🔒 전체 전략을 확인하시겠어요?</h3>
                    <button class="payment-button" onclick="showPaymentOptions()">
                        ₩9,900 결제하고 전체 보기
                    </button>
                    <button class="free-code-button" onclick="showCodeInput()">
                        무료코드로 미리보기
                    </button>
                    <div id="code-input-section-${sectionId}" class="code-input-section hidden">
                        <input type="text" class="code-input" placeholder="코드 입력" maxlength="5">
                        <button class="code-submit-btn" onclick="validateCode()">확인</button>
                        <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">
                            💡 힌트: 12345
                        </p>
                    </div>
                `;
                card.appendChild(overlay);
            }
        }
    });
}

// ========================================
// 결제 옵션 표시 (Phase 2 신규)
// ========================================
function showPaymentOptions() {
    alert('결제 기능은 곧 오픈 예정입니다!\n현재는 무료코드(12345)로 전체 내용을 확인하실 수 있습니다.');
}

// ========================================
// 코드 입력 섹션 표시 (Phase 2 신규)
// ========================================
function showCodeInput() {
    // 모든 코드 입력 섹션 표시
    document.querySelectorAll('.code-input-section').forEach(section => {
        section.classList.remove('hidden');
    });
}

// ========================================
// 코드 검증 (Phase 2 신규)
// ========================================
function validateCode() {
    // 모든 입력창에서 코드 확인
    const codeInputs = document.querySelectorAll('.code-input');
    let code = '';
    
    codeInputs.forEach(input => {
        if (input.value.trim()) {
            code = input.value.trim();
        }
    });
    
    if (code === '12345') {
        // 결제 상태 저장
        localStorage.setItem('marketinglab_paid', 'true');
        isPaid = true;
        
        // 블러 효과 제거
        unlockAllResults();
        
        alert('✅ 코드가 확인되었습니다!\n전체 전략을 확인하세요.');
    } else {
        alert('❌ 잘못된 코드입니다.\n올바른 코드를 입력해주세요.');
    }
}

// ========================================
// 전체 결과 언락 (Phase 2 신규)
// ========================================
function unlockAllResults() {
    // 모든 블러 섹션 제거
    document.querySelectorAll('.blurred-section').forEach(section => {
        section.classList.remove('blurred-section');
    });
    
    // 모든 언락 오버레이 제거
    document.querySelectorAll('.unlock-overlay').forEach(overlay => {
        overlay.remove();
    });
}

// ========================================
// 진단 결과 표시
// ========================================
function displayDiagnosis(diagnosis) {
    const strengthsContainer = document.getElementById('diagnosis-strengths');
    const weaknessesContainer = document.getElementById('diagnosis-weaknesses');

    // 강점
    strengthsContainer.innerHTML = diagnosis.strengths.map((item, index) => `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <span style="color: #10b981; font-weight: 700; font-size: 1.2rem;">${index + 1}.</span>
            <p style="color: #334155; line-height: 1.6;">${item}</p>
        </div>
    `).join('');

    // 약점
    weaknessesContainer.innerHTML = diagnosis.weaknesses.map((item, index) => `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <span style="color: #ff4e3a; font-weight: 700; font-size: 1.2rem;">${index + 1}.</span>
            <p style="color: #334155; line-height: 1.6;">${item}</p>
        </div>
    `).join('');
}

// ========================================
// 즉시 실행 전략 표시
// ========================================
function displayStrategies(strategies) {
    const container = document.getElementById('strategies-container');

    container.innerHTML = strategies.map((strategy, index) => `
        <div style="
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #001a3d;
            background: #f1f5f9;
            border-radius: 8px;
        ">
            <h4 style="color: #001a3d; margin-bottom: 10px;">
                ${index + 1}. ${strategy.title}
            </h4>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 15px;">
                ${strategy.description}
            </p>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <span style="
                    padding: 5px 12px;
                    background: white;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    color: #64748b;
                ">
                    💰 ${strategy.cost}
                </span>
                <span style="
                    padding: 5px 12px;
                    background: white;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    color: #64748b;
                ">
                    📊 난이도: ${strategy.difficulty}
                </span>
                <span style="
                    padding: 5px 12px;
                    background: white;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    color: #10b981;
                    font-weight: 600;
                ">
                    ✨ ${strategy.effect}
                </span>
            </div>
        </div>
    `).join('');
}

// ========================================
// 12주 실행 계획 표시
// ========================================
function displayWeeklyPlan(weeklyPlan) {
    const container = document.getElementById('weekly-plan-container');

    container.innerHTML = weeklyPlan.map(week => `
        <div style="
            margin-bottom: 25px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
        ">
            <h4 style="
                color: #001a3d;
                margin-bottom: 10px;
                font-size: 1.1rem;
            ">
                ${week.week}주차: ${week.theme}
            </h4>
            <div style="display: grid; gap: 8px;">
                ${week.days.map(day => `
                    <div style="
                        padding: 10px 15px;
                        background: white;
                        border-radius: 6px;
                        font-size: 0.95rem;
                        color: #475569;
                    ">
                        ${day}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ========================================
// 해시태그 & 키워드 표시
// ========================================
function displayHashtagsAndKeywords(hashtags, keywords) {
    const hashtagsContainer = document.getElementById('hashtags-container');
    const keywordsContainer = document.getElementById('keywords-container');

    // 해시태그
    hashtagsContainer.innerHTML = `
        <h4 style="color: #001a3d; margin-bottom: 15px;">📸 인스타그램 추천 해시태그</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${hashtags.map(tag => `
                <span style="
                    padding: 8px 15px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                ">
                    ${tag}
                </span>
            `).join('')}
        </div>
    `;

    // 키워드
    keywordsContainer.innerHTML = `
        <h4 style="color: #001a3d; margin-bottom: 15px;">🔍 검색 키워드</h4>
        <div style="display: grid; gap: 15px;">
            <div>
                <strong style="color: #10b981;">네이버플레이스</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    ${keywords.naver.map(keyword => `
                        <span style="
                            padding: 6px 12px;
                            background: #e8f5e9;
                            color: #2e7d32;
                            border-radius: 15px;
                            font-size: 0.9rem;
                        ">
                            ${keyword}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div>
                <strong style="color: #f59e0b;">카카오맵</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    ${keywords.kakao.map(keyword => `
                        <span style="
                            padding: 6px 12px;
                            background: #fff3cd;
                            color: #856404;
                            border-radius: 15px;
                            font-size: 0.9rem;
                        ">
                            ${keyword}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ========================================
// 예상 결과 표시
// ========================================
function displayExpectedResults(results) {
    const container = document.getElementById('expected-results-container');

    const currentSales = results.current.sales.toLocaleString();
    const currentProfit = results.current.profit.toLocaleString();
    const afterSales = results.after.sales.toLocaleString();
    const afterProfit = results.after.profit.toLocaleString();
    const increaseSales = results.increase.sales.toLocaleString();
    const increaseProfit = results.increase.profit.toLocaleString();
    const salesPercent = results.increase.salesPercent;
    const profitPercent = results.increase.profitPercent;

    container.innerHTML = `
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        ">
            <div style="
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                color: white;
                text-align: center;
            ">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">현재 월 매출</div>
                <div style="font-size: 1.8rem; font-weight: 700;">${currentSales}원</div>
            </div>
            
            <div style="
                padding: 20px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 15px;
                color: white;
                text-align: center;
            ">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">예상 월 매출</div>
                <div style="font-size: 1.8rem; font-weight: 700;">${afterSales}원</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">↑ ${salesPercent}% 증가</div>
            </div>
            
            <div style="
                padding: 20px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                border-radius: 15px;
                color: white;
                text-align: center;
            ">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">예상 수익 증가</div>
                <div style="font-size: 1.8rem; font-weight: 700;">+${increaseProfit}원</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">↑ ${profitPercent}% 증가</div>
            </div>
        </div>

        <div style="
            padding: 20px;
            background: #f1f5f9;
            border-radius: 10px;
            text-align: center;
        ">
            <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 10px;">
                💡 이 전략을 실행하면
            </p>
            <p style="color: #001a3d; font-size: 1.2rem; font-weight: 600;">
                <strong>${results.period}</strong> 후 약 <strong style="color: #ff4e3a;">${increaseSales}원</strong>의 추가 매출 예상
            </p>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">
                투자 대비 수익률(ROI): <strong style="color: #10b981;">${results.roi}배</strong>
            </p>
        </div>
    `;
}
