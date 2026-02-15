// 마포구 동명 데이터
const mapoDistricts = [
    "공덕동", "아현동", "도화동", "용강동", "대흥동",
    "염리동", "신수동", "서강동", "서교동", "합정동",
    "망원동", "연남동", "성산동", "중동", "상암동"
];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    loadCompletedTasks();
});

// 폼 초기화
function initializeForm() {
    // 마포구 동 선택 옵션 추가
    const districtSelect = document.getElementById('district');
    mapoDistricts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    // 히트 상품 라디오 버튼 이벤트
    document.querySelectorAll('input[name="hit-product"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const inputDiv = document.getElementById('hit-product-input');
            inputDiv.style.display = e.target.value === 'yes' ? 'block' : 'none';
        });
    });

    // FAQ 추가 버튼
    let faqCount = 1;
    document.getElementById('add-faq-btn').addEventListener('click', () => {
        if (faqCount < 5) {
            const faqContainer = document.getElementById('faq-container');
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = 'faq-input';
            newInput.placeholder = `질문 ${faqCount + 1}`;
            faqContainer.appendChild(newInput);
            faqCount++;
            
            if (faqCount >= 5) {
                document.getElementById('add-faq-btn').style.display = 'none';
            }
        }
    });

    // 기타 예약방식 입력 필드 토글
    document.getElementById('booking-other').addEventListener('change', (e) => {
        const otherInput = document.getElementById('booking-other-input');
        otherInput.style.display = e.target.checked ? 'block' : 'none';
    });

    // 생성 버튼 클릭
    document.getElementById('generate-btn').addEventListener('click', generateStrategy);

    // 리셋 버튼 클릭
    document.getElementById('reset-btn').addEventListener('click', () => {
        document.getElementById('question-form').style.display = 'block';
        document.getElementById('result').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// AI 전략 생성
async function generateStrategy() {
    // 입력값 검증
    const industry = document.getElementById('industry').value;
    const storeName = document.getElementById('store-name').value;
    const district = document.getElementById('district').value;
    const monthlySales = document.getElementById('monthly-sales').value;
    const concern = document.getElementById('concern').value;

    if (!industry || !storeName || !district || !monthlySales || !concern) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }

    // 플랫폼 선택
    const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked'))
        .map(cb => cb.value);

    if (platforms.length === 0) {
        alert('온라인 등록 여부를 선택해주세요.');
        return;
    }

    // 히트 상품
    const hitProductRadio = document.querySelector('input[name="hit-product"]:checked');
    if (!hitProductRadio) {
        alert('히트 상품 유무를 선택해주세요.');
        return;
    }

    const hasHitProduct = hitProductRadio.value === 'yes';
    const hitProductName = hasHitProduct ? document.getElementById('hit-product-name').value : '';

    // 추가 정보 수집
    const topServices = document.getElementById('top-services').value;
    
    // 경쟁 매장
    const competitors = [];
    document.querySelectorAll('.competitor-row').forEach(row => {
        const name = row.querySelector('.competitor-name').value;
        const feature = row.querySelector('.competitor-feature').value;
        const price = row.querySelector('.competitor-price').value;
        if (name || feature || price) {
            competitors.push({ name, feature, price });
        }
    });

    // FAQ
    const faqs = Array.from(document.querySelectorAll('.faq-input'))
        .map(input => input.value)
        .filter(val => val.trim() !== '');

    // 예약방식
    const bookingMethods = Array.from(document.querySelectorAll('input[name="booking"]:checked'))
        .map(cb => {
            if (cb.value === 'other') {
                return document.getElementById('booking-other-input').value || '기타';
            }
            return cb.value;
        });

    // 리뷰 정보
    const reviews = {
        naver: {
            count: parseInt(document.getElementById('review-naver-count').value) || 0,
            rating: parseFloat(document.getElementById('review-naver-rating').value) || 0
        },
        kakao: {
            count: parseInt(document.getElementById('review-kakao-count').value) || 0,
            rating: parseFloat(document.getElementById('review-kakao-rating').value) || 0
        },
        google: {
            count: parseInt(document.getElementById('review-google-count').value) || 0,
            rating: parseFloat(document.getElementById('review-google-rating').value) || 0
        }
    };

    // 가게 강점
    const strength = document.getElementById('strength').value;

    if (!strength) {
        alert('가게의 강점을 입력해주세요.');
        return;
    }

    // 로딩 표시
    document.getElementById('question-form').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    try {
        // API 호출
        const response = await fetch('/api/generate-strategy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                industry,
                storeName,
                district,
                monthlySales: parseInt(monthlySales),
                platforms,
                hasHitProduct,
                hitProductName,
                concern,
                // 추가 정보
                topServices,
                competitors,
                faqs,
                bookingMethods,
                reviews,
                strength
            })
        });

        if (!response.ok) {
            throw new Error('AI 응답 오류');
        }

        const data = await response.json();

        // 결과 표시
        displayResults(data);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('result').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error:', error);
        alert('전략 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('question-form').style.display = 'block';
    }
}

// 결과 표시
function displayResults(data) {
    // 현황 진단
    displayDiagnosis(data.diagnosis);

    // 즉시 실행 전략
    displayStrategies(data.strategies);

    // 12주 캘린더
    displayCalendar(data.weeklyPlan);

    // 해시태그
    displayHashtags(data.hashtags);

    // 키워드
    displayKeywords(data.keywords);

    // 예상 성과
    displayExpectedResults(data.expectedResults);
}

// 현황 진단 표시
function displayDiagnosis(diagnosis) {
    const container = document.getElementById('diagnosis');
    
    let html = '<h3>💪 강점</h3>';
    diagnosis.strengths.forEach(item => {
        html += `<div class="diagnosis-item">${item}</div>`;
    });

    html += '<h3 style="margin-top: 30px;">📈 개선이 필요한 부분</h3>';
    diagnosis.weaknesses.forEach(item => {
        html += `<div class="diagnosis-item">${item}</div>`;
    });

    container.innerHTML = html;
}

// 즉시 실행 전략 표시
function displayStrategies(strategies) {
    const container = document.getElementById('strategies');
    
    let html = '';
    strategies.forEach((strategy, index) => {
        html += `
            <div class="strategy-item">
                <h3>${index + 1}. ${strategy.title}</h3>
                <p>${strategy.description}</p>
                <div class="strategy-meta">
                    <span>💰 예상 비용: ${strategy.cost}</span>
                    <span>⭐ 난이도: ${strategy.difficulty}</span>
                    <span>📈 예상 효과: ${strategy.effect}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 12주 캘린더 표시
function displayCalendar(weeklyPlan) {
    const container = document.getElementById('calendar');
    const today = new Date();
    
    let html = '';
    let totalTasks = 0;
    
    // 3개월 = 90일
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        const week = Math.floor(i / 7) + 1;
        
        // 주차별 계획 가져오기
        const weekPlan = weeklyPlan[week - 1] || {};
        const dayPlan = weekPlan.days ? weekPlan.days[i % 7] : '';
        
        if (dayPlan) totalTasks++;
        
        const isCompleted = isTaskCompleted(i);
        
        html += `
            <div class="calendar-day ${isCompleted ? 'completed' : ''}" data-day="${i}">
                <div class="day-header">${dayOfWeek}</div>
                <div class="day-date">${date.getMonth() + 1}/${date.getDate()}</div>
                <div class="day-content">${dayPlan || '-'}</div>
                ${dayPlan ? `
                    <button class="complete-btn ${isCompleted ? 'completed' : ''}" onclick="toggleComplete(${i})">
                        ${isCompleted ? '✅ 완료' : '실천했어요'}
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    container.innerHTML = html;
    updateProgress();
}

// 실천 완료 토글
function toggleComplete(dayIndex) {
    const completed = getCompletedTasks();
    const key = `task-${dayIndex}`;
    
    if (completed[key]) {
        delete completed[key];
    } else {
        completed[key] = true;
    }
    
    localStorage.setItem('completedTasks', JSON.stringify(completed));
    
    // UI 업데이트
    const dayElement = document.querySelector(`[data-day="${dayIndex}"]`);
    const btn = dayElement.querySelector('.complete-btn');
    
    if (completed[key]) {
        dayElement.classList.add('completed');
        btn.classList.add('completed');
        btn.textContent = '✅ 완료';
    } else {
        dayElement.classList.remove('completed');
        btn.classList.remove('completed');
        btn.textContent = '실천했어요';
    }
    
    updateProgress();
}

// 완료된 작업 불러오기
function loadCompletedTasks() {
    // 로컬스토리지에서 불러오기
}

function getCompletedTasks() {
    const data = localStorage.getItem('completedTasks');
    return data ? JSON.parse(data) : {};
}

function isTaskCompleted(dayIndex) {
    const completed = getCompletedTasks();
    return completed[`task-${dayIndex}`] || false;
}

// 프로그래스 업데이트
function updateProgress() {
    const totalTasks = document.querySelectorAll('.complete-btn').length;
    const completedTasks = document.querySelectorAll('.complete-btn.completed').length;
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// 해시태그 표시
function displayHashtags(hashtags) {
    const container = document.getElementById('hashtags');
    
    let html = '<div class="hashtag-container">';
    hashtags.forEach(tag => {
        html += `<span class="hashtag" onclick="copyToClipboard('${tag}')">${tag}</span>`;
    });
    html += '</div>';
    html += '<p style="margin-top: 15px; color: #666; font-size: 0.9rem;">💡 해시태그를 클릭하면 복사됩니다.</p>';
    
    container.innerHTML = html;
}

// 키워드 표시
function displayKeywords(keywords) {
    const container = document.getElementById('keywords');
    
    let html = '<div class="keyword-container">';
    html += `
        <div class="keyword-item">
            <strong>네이버플레이스</strong>
            <p>${keywords.naver.join(', ')}</p>
        </div>
        <div class="keyword-item">
            <strong>카카오맵</strong>
            <p>${keywords.kakao.join(', ')}</p>
        </div>
    `;
    html += '</div>';
    
    container.innerHTML = html;
}

// 예상 성과 표시
function displayExpectedResults(results) {
    const container = document.getElementById('expected-results');
    
    let html = '<div class="results-grid">';
    
    html += `
        <div class="result-card">
            <h3>현재 상태</h3>
            <div class="result-value">${results.current.sales.toLocaleString()} 원</div>
            <p>월 매출</p>
        </div>
        
        <div class="result-card">
            <h3>3개월 후</h3>
            <div class="result-value">${results.after.sales.toLocaleString()} 원</div>
            <p>월 매출</p>
            <p class="result-change">+${results.increase.sales.toLocaleString()} 원</p>
        </div>
        
        <div class="result-card">
            <h3>예상 수익 증가</h3>
            <div class="result-value">${results.increase.profit.toLocaleString()} 원</div>
            <p>순이익</p>
            <p class="result-change">ROI ${results.roi}배</p>
        </div>
    `;
    
    html += '</div>';
    
    container.innerHTML = html;
}

// 클립보드 복사
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`복사되었습니다: ${text}`);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}
