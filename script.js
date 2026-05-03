/**
 * Smart Election Assistant - Main Script
 * Features: Firebase Realtime Database, Google Maps, Bilingual, Quiz, Chatbot
 */

'use strict';

// ============================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB73wE94Nm45Sh1dDP_WNHQOgFsjMF1GL0",
    authDomain: "smart-election-assistant-34fd6.firebaseapp.com",
    databaseURL: "https://smart-election-assistant-34fd6-default-rtdb.firebaseio.com",
    projectId: "smart-election-assistant-34fd6",
    storageBucket: "smart-election-assistant-34fd6.firebasestorage.app",
    messagingSenderId: "103417862972",
    appId: "1:103417862972:web:3c9b362b5dfc5081b61c39",
    measurementId: "G-8FSZ0LWHSK"
};

let firebaseApp = null;
let db = null;

try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    firebase.analytics();
    console.log('Firebase connected successfully');
} catch (e) {
    console.warn('Firebase init failed, using local fallback:', e.message);
}

// ============================================================
// CONSTANTS & DATA
// ============================================================

const CITY_DATA = {
    delhi: {
        city: 'Delhi',
        votingDate: 'February 5, 2025',
        votingTime: '7:00 AM - 6:00 PM',
        previousTurnout: '62.4%',
        totalBooths: 13033,
        totalVoters: '1.55 Crore',
        lat: 28.6139, lng: 77.2090
    },
    mumbai: {
        city: 'Mumbai',
        votingDate: 'November 20, 2024',
        votingTime: '7:00 AM - 6:00 PM',
        previousTurnout: '58.7%',
        totalBooths: 10000,
        totalVoters: '1.06 Crore',
        lat: 19.0760, lng: 72.8777
    },
    bangalore: {
        city: 'Bangalore',
        votingDate: 'April 26, 2024',
        votingTime: '7:00 AM - 6:00 PM',
        previousTurnout: '54.2%',
        totalBooths: 8000,
        totalVoters: '97 Lakh',
        lat: 12.9716, lng: 77.5946
    },
    chennai: {
        city: 'Chennai',
        votingDate: 'April 19, 2024',
        votingTime: '7:00 AM - 6:00 PM',
        previousTurnout: '60.1%',
        totalBooths: 6500,
        totalVoters: '66 Lakh',
        lat: 13.0827, lng: 80.2707
    },
    hyderabad: {
        city: 'Hyderabad',
        votingDate: 'May 13, 2024',
        votingTime: '7:00 AM - 6:00 PM',
        previousTurnout: '56.8%',
        totalBooths: 7200,
        totalVoters: '75 Lakh',
        lat: 17.3850, lng: 78.4867
    },
    kolkata: {
        city: 'Kolkata',
        votingDate: 'May 20, 2024',
        votingTime: '7:00 AM - 6:00 PM',
        previousTurnout: '72.3%',
        totalBooths: 9000,
        totalVoters: '85 Lakh',
        lat: 22.5726, lng: 88.3639
    }
};

const QUIZ_QUESTIONS = [
    {
        question: 'What is the minimum age to vote in India?',
        options: ['16 years', '18 years', '21 years', '25 years'],
        correct: 1,
        explanation: 'In India, the minimum voting age is 18 years as per the Constitution.'
    },
    {
        question: 'What does NOTA stand for?',
        options: ['None of the Above', 'Not on the Agenda', 'No Other Alternative', 'New Order to Act'],
        correct: 0,
        explanation: 'NOTA stands for None of the Above, allowing voters to reject all candidates.'
    },
    {
        question: 'Which article of the Constitution gives the right to vote?',
        options: ['Article 19', 'Article 326', 'Article 14', 'Article 21'],
        correct: 1,
        explanation: 'Article 326 of the Indian Constitution grants the right to vote.'
    },
    {
        question: 'What is the full form of EVM?',
        options: ['Electronic Voting Machine', 'Election Verification Module', 'Electronic Vote Manager', 'Ethical Voting Mechanism'],
        correct: 0,
        explanation: 'EVM stands for Electronic Voting Machine, used in Indian elections.'
    },
    {
        question: 'Who conducts elections in India?',
        options: ['President of India', 'Supreme Court', 'Election Commission of India', 'Parliament'],
        correct: 2,
        explanation: 'The Election Commission of India (ECI) is responsible for conducting elections.'
    }
];

const CHATBOT_RESPONSES = {
    'vote': 'To vote in India, you must be 18+ years old and registered as a voter. Bring your Voter ID card to your designated polling booth on election day.',
    'register': 'You can register to vote using Form 6 on the NVSP portal (voters.eci.gov.in) or through the Voter Helpline App.',
    'document': 'Documents accepted at polling booths: Voter ID Card (EPIC), Aadhaar Card, Passport, Driving License, PAN Card, or any government-issued photo ID.',
    'booth': 'To find your polling booth, visit voters.eci.gov.in or call the voter helpline 1950. You can also use this app\'s "Find My Booth" section.',
    'nota': 'NOTA (None of the Above) lets voters reject all candidates. Press the NOTA button on the EVM if you don\'t want to vote for any candidate.',
    'evm': 'EVM (Electronic Voting Machine) is a tamper-proof device used in Indian elections. It records your vote securely.',
    'id': 'You need a valid Voter ID (EPIC) or any government-issued photo ID to vote. The Election Commission accepts 12 types of documents.',
    'age': 'The minimum voting age in India is 18 years. You must be 18 or older on the qualifying date to register as a voter.',
    'time': 'Polling booths are generally open from 7:00 AM to 6:00 PM on election day. Some constituencies may have different timings.',
    'default': 'I can help you with information about voting, registration, documents, polling booths, NOTA, and more. Please ask a specific question!'
};

// ============================================================
// EFFICIENCY: CACHING & DEBOUNCE
// ============================================================

const cityCache = {};

/**
 * Debounce function to limit rapid firing
 */
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ============================================================
// GOOGLE MAPS INTEGRATION
// ============================================================

let map = null;
let marker = null;

/**
 * Initialize Google Maps with fallback
 */
function initMap() {
    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    try {
        const defaultLocation = { lat: 28.6139, lng: 77.2090 };
        map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: defaultLocation,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });
        marker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            title: 'Polling Booth Location',
            icon: { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }
        });
    } catch (e) {
        mapElement.style.cssText = 'padding:20px;text-align:center;background:#f3f4f6;border-radius:8px;';
        mapElement.innerHTML = '<p>📍 Map preview unavailable.</p><a href="https://maps.google.com/?q=28.6139,77.2090" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>';
    }
}

/**
 * Update map to a new location
 */
function updateMap(lat, lng, title) {
    if (!map || !marker) return;
    const location = { lat, lng };
    map.setCenter(location);
    map.setZoom(14);
    marker.setPosition(location);
    marker.setTitle(title);
}

// ============================================================
// NAVIGATION
// ============================================================

function navigateTo(targetId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.setAttribute('aria-hidden', 'false');
        targetSection.focus();
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
    });

    const activeBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-current', 'page');
    }
}

// ============================================================
// LANGUAGE TOGGLE
// ============================================================

let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    document.querySelectorAll('.translatable').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) el.textContent = text;
    });
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.setAttribute('aria-label', currentLang === 'en' ? 'Switch to Hindi' : 'Switch to English');
    }
}

// ============================================================
// ELIGIBILITY CHECKER
// ============================================================

function checkEligibility() {
    const input = document.getElementById('age-input');
    const result = document.getElementById('eligibility-result');
    if (!input || !result) return;

    const age = parseInt(input.value, 10);

    if (isNaN(age) || age < 0 || age > 120) {
        result.innerHTML = '<p class="error" role="alert">⚠️ Please enter a valid age between 0 and 120.</p>';
        return;
    }
    if (age >= 18) {
        result.innerHTML = `<p class="success" role="alert">✅ You are eligible to vote! Age ${age} meets the minimum requirement of 18 years.</p>`;
    } else {
        result.innerHTML = `<p class="error" role="alert">❌ You are not yet eligible. You need to be at least 18 years old. You are ${18 - age} year(s) away.</p>`;
    }
}

// ============================================================
// CITY INFO (with caching)
// ============================================================

function getCityInfo() {
    const select = document.getElementById('city-select');
    const result = document.getElementById('city-info-result');
    if (!select || !result) return;

    const city = select.value;
    if (!city) {
        result.innerHTML = '<p role="alert">Please select a city.</p>';
        return;
    }

    // Use cache if available
    if (cityCache[city]) {
        displayCityInfo(cityCache[city], result);
        return;
    }

    const data = CITY_DATA[city];
    if (data) {
        cityCache[city] = data;
        displayCityInfo(data, result);
    } else {
        result.innerHTML = '<p role="alert">City information not available.</p>';
    }
}

function displayCityInfo(data, container) {
    container.innerHTML = `
        <div class="city-info-card" role="region" aria-label="${data.city} election information">
            <h3>📍 ${data.city}</h3>
            <p><strong>Voting Date:</strong> ${data.votingDate}</p>
            <p><strong>Voting Time:</strong> ${data.votingTime}</p>
            <p><strong>Previous Turnout:</strong> ${data.previousTurnout}</p>
            <p><strong>Total Booths:</strong> ${data.totalBooths.toLocaleString()}</p>
            <p><strong>Total Voters:</strong> ${data.totalVoters}</p>
        </div>`;
}

// ============================================================
// BOOTH LOCATOR
// ============================================================

function locateBooth() {
    const select = document.getElementById('booth-city-select');
    if (!select) return;
    const city = select.value;
    if (!city) { alert('Please select a city.'); return; }

    const data = CITY_DATA[city];
    if (data) updateMap(data.lat, data.lng, `${data.city} - Polling Booth`);
}

// ============================================================
// CHATBOT (with debounce)
// ============================================================

function getBotResponse(message) {
    if (!message || message.trim() === '') return CHATBOT_RESPONSES.default;
    const lower = message.toLowerCase();
    const matchedKey = Object.keys(CHATBOT_RESPONSES).find(key => key !== 'default' && lower.includes(key));
    return matchedKey ? CHATBOT_RESPONSES[matchedKey] : CHATBOT_RESPONSES.default;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.textContent = text;
    userMsg.setAttribute('aria-label', `You said: ${text}`);
    messages.appendChild(userMsg);

    input.value = '';

    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.textContent = getBotResponse(text);
        botMsg.setAttribute('aria-label', `Assistant replied: ${getBotResponse(text)}`);
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 300);

    messages.scrollTop = messages.scrollHeight;
}

const debouncedSendChat = debounce(sendChatMessage, 200);

// ============================================================
// QUIZ
// ============================================================

let currentQuestion = 0;
let score = 0;

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (currentQuestion >= QUIZ_QUESTIONS.length) {
        renderQuizResults(container);
        return;
    }

    const q = QUIZ_QUESTIONS[currentQuestion];
    container.innerHTML = `
        <div class="quiz-progress" role="progressbar" aria-valuenow="${currentQuestion + 1}" aria-valuemin="1" aria-valuemax="${QUIZ_QUESTIONS.length}">
            Question ${currentQuestion + 1} of ${QUIZ_QUESTIONS.length}
            <div class="progress-bar"><div class="progress-fill" style="width:${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%"></div></div>
        </div>
        <p class="quiz-question" id="quiz-q-${currentQuestion}">${q.question}</p>
        <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-q-${currentQuestion}">
            ${q.options.map((opt, i) => `
                <button class="quiz-option" data-index="${i}" role="radio" aria-checked="false" aria-label="${opt}">
                    ${String.fromCharCode(65 + i)}. ${opt}
                </button>`).join('')}
        </div>`;

    // Event delegation instead of onclick attributes
    container.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => selectAnswer(parseInt(btn.getAttribute('data-index'), 10)));
    });
}

function selectAnswer(selected) {
    const q = QUIZ_QUESTIONS[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');

    options.forEach((btn, i) => {
        btn.disabled = true;
        btn.setAttribute('aria-checked', i === selected ? 'true' : 'false');
        if (i === q.correct) btn.classList.add('correct');
        else if (i === selected) btn.classList.add('wrong');
    });

    if (selected === q.correct) score++;

    const container = document.getElementById('quiz-container');
    const explanation = document.createElement('p');
    explanation.className = 'explanation';
    explanation.innerHTML = `<strong>${selected === q.correct ? '✅ Correct!' : '❌ Incorrect!'}</strong> ${q.explanation}`;
    container.appendChild(explanation);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'primary-btn mt-1';
    nextBtn.textContent = currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results';
    nextBtn.setAttribute('aria-label', currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Go to next question' : 'See quiz results');
    nextBtn.addEventListener('click', () => {
        currentQuestion++;
        renderQuiz();
    });
    container.appendChild(nextBtn);
}

function renderQuizResults(container) {
    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const grade = percentage >= 80 ? '🏆 Excellent!' : percentage >= 60 ? '👍 Good!' : '📚 Keep Learning!';

    container.innerHTML = `
        <div class="quiz-results" role="region" aria-label="Quiz results">
            <h3>${grade}</h3>
            <div class="score-circle" aria-label="Score: ${score} out of ${QUIZ_QUESTIONS.length}">
                <span class="score-number">${score}/${QUIZ_QUESTIONS.length}</span>
                <span class="score-percent">${percentage}%</span>
            </div>
            <p>You answered ${score} out of ${QUIZ_QUESTIONS.length} questions correctly!</p>
            <button class="primary-btn" id="restart-quiz-btn" aria-label="Restart the election quiz">🔄 Try Again</button>
        </div>`;

    document.getElementById('restart-quiz-btn').addEventListener('click', restartQuiz);
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    renderQuiz();
}

// ============================================================
// DEMO VOTING — FIREBASE REALTIME DATABASE
// ============================================================

let hasVoted = false;

const PARTIES = [
    { key: 'A', label: 'Progressive Dawn 🌅', color: '#f59e0b' },
    { key: 'B', label: 'Heritage Front 🌲', color: '#10b981' },
    { key: 'C', label: 'Future Forward 🚀', color: '#6366f1' },
    { key: 'NOTA', label: 'NOTA', color: '#6b7280' }
];

/**
 * Cast vote — saves to Firebase if available, else local fallback
 */
function castVote(party) {
    if (hasVoted) {
        alert('You have already voted in this demo session!');
        return;
    }

    hasVoted = true;
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
    });

    if (db) {
        // Firebase: increment vote count in Realtime Database
        db.ref('votes/' + party).transaction(currentCount => (currentCount || 0) + 1)
            .then(() => console.log('Vote saved to Firebase:', party))
            .catch(err => console.warn('Firebase vote error:', err));
    } else {
        // Local fallback
        localVotes[party] = (localVotes[party] || 0) + 1;
        renderLocalResults();
    }
}

// Local fallback votes object
const localVotes = { A: 0, B: 0, C: 0, NOTA: 0 };

function renderLocalResults() {
    const container = document.getElementById('poll-results');
    if (!container) return;
    const total = Object.values(localVotes).reduce((a, b) => a + b, 0);
    renderResultBars(container, localVotes, total);
}

function renderResultBars(container, votes, total) {
    container.innerHTML = PARTIES.map(p => {
        const count = votes[p.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
            <div class="result-bar" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${p.label}: ${pct}% (${count} votes)">
                <div class="result-label">${p.label}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${p.color}"></div></div>
                <div class="result-pct">${pct}% (${count})</div>
            </div>`;
    }).join('');
}

/**
 * Listen to Firebase for real-time vote updates
 */
function listenToVotes() {
    const container = document.getElementById('poll-results');
    if (!container) return;

    if (db) {
        db.ref('votes').on('value', snapshot => {
            const votes = snapshot.val() || { A: 0, B: 0, C: 0, NOTA: 0 };
            const total = Object.values(votes).reduce((a, b) => a + b, 0);
            renderResultBars(container, votes, total);
        });
    } else {
        renderLocalResults();
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-target')));
    });

    // Card navigation (keyboard + click)
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('click', () => navigateTo(card.getAttribute('data-target')));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo(card.getAttribute('data-target'));
            }
        });
    });

    // Language toggle
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);

    // Eligibility checker
    const checkBtn = document.getElementById('check-eligibility-btn');
    if (checkBtn) checkBtn.addEventListener('click', checkEligibility);

    const ageInput = document.getElementById('age-input');
    if (ageInput) ageInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkEligibility(); });

    // City info
    const cityBtn = document.getElementById('get-city-info-btn');
    if (cityBtn) cityBtn.addEventListener('click', getCityInfo);

    // Booth locator
    const boothBtn = document.getElementById('locate-booth-btn');
    if (boothBtn) boothBtn.addEventListener('click', locateBooth);

    // Chatbot with debounce
    const sendBtn = document.getElementById('send-chat-btn');
    if (sendBtn) sendBtn.addEventListener('click', debouncedSendChat);

    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') debouncedSendChat(); });

    // Demo voting
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', () => castVote(btn.getAttribute('data-party')));
    });

    // Initialize quiz
    renderQuiz();

    // Start Firebase real-time vote listener
    listenToVotes();

    // Set initial aria-hidden for inactive sections
    document.querySelectorAll('.content-section:not(.active)').forEach(s => {
        s.setAttribute('aria-hidden', 'true');
    });
});
