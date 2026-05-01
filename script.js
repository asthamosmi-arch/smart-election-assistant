/**
 * Smart Election Assistant - Main Script
 * Handles navigation, language toggle, chatbot, quiz, demo voting, and Google Maps
 */

'use strict';

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
        options: ['Article 19', '326', 'Article 14', 'Article 21'],
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
    'evm': 'EVM (Electronic Voting Machine) is a tamper-proof device used in Indian elections. It records your vote securely without paper.',
    'id': 'You need a valid Voter ID (EPIC) or any government-issued photo ID to vote. The Election Commission accepts 12 types of documents.',
    'age': 'The minimum voting age in India is 18 years. You must be 18 or older on the qualifying date to register as a voter.',
    'time': 'Polling booths are generally open from 7:00 AM to 6:00 PM on election day. Some constituencies may have different timings.',
    'default': 'I can help you with information about voting, registration, documents, polling booths, NOTA, and more. Please ask a specific question!'
};

// ============================================================
// GOOGLE MAPS INTEGRATION
// ============================================================

let map = null;
let marker = null;

/**
 * Initialize Google Maps
 */
function initMap() {
    const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi
    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
        zoom: 12,
        center: defaultLocation,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
    });

    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: 'Polling Booth Location',
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });
}

/**
 * Update map location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} title - Marker title
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

/**
 * Navigate to a section
 * @param {string} targetId - Section ID to navigate to
 */
function navigateTo(targetId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.setAttribute('aria-hidden', 'false');
        targetSection.focus();
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
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

/**
 * Toggle language between English and Hindi
 */
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    const translatables = document.querySelectorAll('.translatable');
    translatables.forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) el.textContent = text;
    });

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.setAttribute('aria-label', currentLang === 'en' ? 'Switch to Hindi' : 'Switch to English');
    }

    document.documentElement.setAttribute('lang', currentLang === 'hi' ? 'hi' : 'en');
}

// ============================================================
// ELIGIBILITY CHECKER
// ============================================================

/**
 * Check voter eligibility based on age
 */
function checkEligibility() {
    const ageInput = document.getElementById('age-input');
    const result = document.getElementById('eligibility-result');
    if (!ageInput || !result) return;

    const age = parseInt(ageInput.value, 10);

    if (isNaN(age) || age < 0 || age > 120) {
        result.innerHTML = '<span class="error">⚠️ Please enter a valid age between 0 and 120.</span>';
        result.className = 'result-box error';
        return;
    }

    if (age >= 18) {
        result.innerHTML = `✅ <strong>Eligible to Vote!</strong> At ${age} years old, you can register and vote in Indian elections. Visit voters.eci.gov.in to register.`;
        result.className = 'result-box success';
    } else {
        const yearsLeft = 18 - age;
        result.innerHTML = `❌ <strong>Not Yet Eligible.</strong> At ${age} years old, you need ${yearsLeft} more year(s) to be eligible to vote.`;
        result.className = 'result-box error';
    }
}

// ============================================================
// CITY INFO
// ============================================================

/**
 * Get city-wise election information
 */
function getCityInfo() {
    const cityInput = document.getElementById('city-input');
    const result = document.getElementById('city-info-result');
    if (!cityInput || !result) return;

    const city = cityInput.value.trim().toLowerCase();
    if (!city) {
        result.innerHTML = '<span class="error">⚠️ Please enter a city name.</span>';
        return;
    }

    const data = CITY_DATA[city];
    if (data) {
        result.innerHTML = `
            <div class="info-grid">
                <div class="info-item"><strong>🏙️ City:</strong> ${data.city}</div>
                <div class="info-item"><strong>📅 Voting Date:</strong> ${data.votingDate}</div>
                <div class="info-item"><strong>⏰ Voting Time:</strong> ${data.votingTime}</div>
                <div class="info-item"><strong>📊 Previous Turnout:</strong> ${data.previousTurnout}</div>
                <div class="info-item"><strong>🗳️ Total Booths:</strong> ${data.totalBooths.toLocaleString()}</div>
                <div class="info-item"><strong>👥 Total Voters:</strong> ${data.totalVoters}</div>
            </div>`;
        result.className = 'result-box success';
    } else {
        result.innerHTML = `⚠️ City "<strong>${cityInput.value}</strong>" not found. Try: Delhi, Mumbai, Bangalore, Chennai, Hyderabad, or Kolkata.`;
        result.className = 'result-box error';
    }
}

// ============================================================
// BOOTH LOCATOR
// ============================================================

/**
 * Locate polling booth and update map
 */
function locateBooth() {
    const areaInput = document.getElementById('area-input');
    const result = document.getElementById('booth-result');
    if (!areaInput || !result) return;

    const area = areaInput.value.trim().toLowerCase();
    if (!area) {
        result.innerHTML = '<span class="error">⚠️ Please enter a city or area name.</span>';
        return;
    }

    const data = CITY_DATA[area];
    if (data) {
        result.innerHTML = `
            <div class="booth-info">
                <p>📍 <strong>Nearest Booth Area:</strong> ${data.city} Central</p>
                <p>🕐 <strong>Timings:</strong> ${data.votingTime}</p>
                <p>📋 <strong>Bring:</strong> Voter ID / Aadhaar / Passport</p>
                <p>☎️ <strong>Helpline:</strong> 1950</p>
            </div>`;
        result.className = 'result-box success';
        updateMap(data.lat, data.lng, `${data.city} Polling Booth`);
    } else {
        result.innerHTML = `⚠️ Area "<strong>${areaInput.value}</strong>" not found. Try: Delhi, Mumbai, Bangalore, Chennai, Hyderabad, or Kolkata.`;
        result.className = 'result-box error';
    }
}

// ============================================================
// CHATBOT
// ============================================================

/**
 * Send a chat message and get a response
 */
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    if (!input || !messagesContainer) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.textContent = userMessage;
    userDiv.setAttribute('role', 'listitem');
    messagesContainer.appendChild(userDiv);

    // Generate bot response
    const response = getBotResponse(userMessage);
    setTimeout(() => {
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot-message';
        botDiv.textContent = response;
        botDiv.setAttribute('role', 'listitem');
        messagesContainer.appendChild(botDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 400);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Get bot response based on user input
 * @param {string} message - User message
 * @returns {string} Bot response
 */
function getBotResponse(message) {
    const lower = message.toLowerCase();
    for (const [key, response] of Object.entries(CHATBOT_RESPONSES)) {
        if (lower.includes(key)) return response;
    }
    return CHATBOT_RESPONSES.default;
}

// ============================================================
// QUIZ
// ============================================================

let currentQuestion = 0;
let score = 0;

/**
 * Render the current quiz question
 */
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
                <button class="quiz-option" onclick="selectAnswer(${i})" role="radio" aria-checked="false" aria-label="${opt}">
                    ${String.fromCharCode(65 + i)}. ${opt}
                </button>`).join('')}
        </div>`;
}

/**
 * Handle quiz answer selection
 * @param {number} selected - Selected answer index
 */
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
    nextBtn.onclick = () => {
        currentQuestion++;
        renderQuiz();
    };
    container.appendChild(nextBtn);
}

/**
 * Render quiz results
 * @param {HTMLElement} container - Container element
 */
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
            <button class="primary-btn" onclick="restartQuiz()" aria-label="Restart quiz">🔄 Try Again</button>
        </div>`;
}

/**
 * Restart the quiz
 */
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    renderQuiz();
}

// ============================================================
// DEMO VOTING
// ============================================================

const votes = { A: 0, B: 0, C: 0, NOTA: 0 };
let hasVoted = false;

/**
 * Cast a demo vote
 * @param {string} party - Party to vote for
 */
function castVote(party) {
    if (hasVoted) {
        alert('You have already voted in this demo session!');
        return;
    }
    votes[party]++;
    hasVoted = true;
    renderResults();

    const voteBtns = document.querySelectorAll('.vote-btn');
    voteBtns.forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
    });
}

/**
 * Render demo voting results
 */
function renderResults() {
    const container = document.getElementById('poll-results');
    if (!container) return;

    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    const parties = [
        { key: 'A', label: 'Progressive Dawn 🌅', color: '#f59e0b' },
        { key: 'B', label: 'Heritage Front 🌲', color: '#10b981' },
        { key: 'C', label: 'Future Forward 🚀', color: '#6366f1' },
        { key: 'NOTA', label: 'NOTA', color: '#6b7280' }
    ];

    container.innerHTML = parties.map(p => {
        const pct = total > 0 ? Math.round((votes[p.key] / total) * 100) : 0;
        return `
            <div class="result-bar" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${p.label}: ${pct}%">
                <div class="result-label">${p.label}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${p.color}"></div></div>
                <div class="result-pct">${pct}%</div>
            </div>`;
    }).join('');
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-target')));
    });

    // Card navigation
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('click', () => navigateTo(card.getAttribute('data-target')));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') navigateTo(card.getAttribute('data-target'));
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

    // Chatbot
    const sendBtn = document.getElementById('send-chat-btn');
    if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);

    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

    // Demo voting
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', () => castVote(btn.getAttribute('data-party')));
    });

    // Initialize quiz and results
    renderQuiz();
    renderResults();

    // Set initial aria-hidden for inactive sections
    document.querySelectorAll('.content-section:not(.active)').forEach(s => {
        s.setAttribute('aria-hidden', 'true');
    });
});
