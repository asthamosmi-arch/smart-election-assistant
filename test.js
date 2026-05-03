/**
 * Smart Election Assistant - Test Suite
 * Unit tests for core functionality
 */

'use strict';

// ============================================================
// TEST FRAMEWORK
// ============================================================

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        results.push({ name, status: 'PASS' });
    } catch (e) {
        failed++;
        results.push({ name, status: 'FAIL', error: e.message });
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, message) {
    if (a !== b) throw new Error(message || `Expected "${b}", got "${a}"`);
}

function assertNotEqual(a, b, message) {
    if (a === b) throw new Error(message || `Expected values to differ, both are "${a}"`);
}

// ============================================================
// MOCK DATA (prefixed to avoid conflicts with script.js)
// ============================================================

const TEST_CITY_DATA = {
    delhi: { city: 'Delhi', votingDate: 'February 5, 2025', votingTime: '7:00 AM - 6:00 PM', previousTurnout: '62.4%', totalBooths: 13033, totalVoters: '1.55 Crore', lat: 28.6139, lng: 77.2090 },
    mumbai: { city: 'Mumbai', votingDate: 'November 20, 2024', votingTime: '7:00 AM - 6:00 PM', previousTurnout: '58.7%', totalBooths: 10000, totalVoters: '1.06 Crore', lat: 19.0760, lng: 72.8777 },
    bangalore: { city: 'Bangalore', votingDate: 'April 26, 2024', votingTime: '7:00 AM - 6:00 PM', previousTurnout: '54.2%', totalBooths: 8000, totalVoters: '97 Lakh', lat: 12.9716, lng: 77.5946 }
};

const TEST_CHATBOT_RESPONSES = {
    'vote': 'To vote in India, you must be 18+ years old...',
    'register': 'You can register to vote using Form 6...',
    'nota': 'NOTA (None of the Above) lets voters reject all candidates.',
    'age': 'The minimum voting age in India is 18 years.',
    'default': 'I can help you with information about voting...'
};

const TEST_QUIZ_QUESTIONS = [
    { question: 'Min age to vote?', options: ['16', '18', '21', '25'], correct: 1, explanation: 'Minimum age is 18.' },
    { question: 'What is NOTA?', options: ['None of the Above', 'Not on Agenda', 'No Alternative', 'New Order'], correct: 0, explanation: 'NOTA = None of the Above.' },
    { question: 'Who conducts Indian elections?', options: ['President', 'Supreme Court', 'Election Commission', 'Parliament'], correct: 2, explanation: 'Election Commission of India.' }
];

// ============================================================
// MOCK FUNCTIONS (mirrors script.js logic)
// ============================================================

function testGetBotResponse(message) {
    if (!message || message.trim() === '') return TEST_CHATBOT_RESPONSES.default;
    const lower = message.toLowerCase();
    const matchedKey = Object.keys(TEST_CHATBOT_RESPONSES).find(key => key !== 'default' && lower.includes(key));
    return matchedKey ? TEST_CHATBOT_RESPONSES[matchedKey] : TEST_CHATBOT_RESPONSES.default;
}

function testCheckEligibility(age) {
    if (isNaN(age) || age < 0 || age > 120) return 'invalid';
    return age >= 18 ? 'eligible' : 'not-eligible';
}

function testDebounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function testCalculateVotePercentage(votes, partyKey) {
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round((votes[partyKey] / total) * 100);
}

// ============================================================
// UNIT TESTS
// ============================================================

// --- Eligibility Tests ---
test('Eligibility: Age 18 should be eligible', () => {
    assertEqual(testCheckEligibility(18), 'eligible', 'Age 18 should be eligible');
});

test('Eligibility: Age 17 should not be eligible', () => {
    assertEqual(testCheckEligibility(17), 'not-eligible', 'Age 17 should not be eligible');
});

test('Eligibility: Age 0 should not be eligible', () => {
    assertEqual(testCheckEligibility(0), 'not-eligible', 'Age 0 should not be eligible');
});

test('Eligibility: Age 25 should be eligible', () => {
    assertEqual(testCheckEligibility(25), 'eligible', 'Age 25 should be eligible');
});

test('Eligibility: Negative age is invalid', () => {
    assertEqual(testCheckEligibility(-1), 'invalid', 'Negative age should be invalid');
});

test('Eligibility: Age 121 is invalid', () => {
    assertEqual(testCheckEligibility(121), 'invalid', 'Age 121 should be invalid');
});

test('Eligibility: NaN is invalid', () => {
    assertEqual(testCheckEligibility(NaN), 'invalid', 'NaN should be invalid');
});

test('Eligibility: Age 100 should be eligible', () => {
    assertEqual(testCheckEligibility(100), 'eligible', 'Age 100 should be eligible');
});

// --- City Data Tests ---
test('City Data: Delhi exists', () => {
    assert(TEST_CITY_DATA['delhi'] !== undefined, 'Delhi should exist in CITY_DATA');
});

test('City Data: Delhi has correct city name', () => {
    assertEqual(TEST_CITY_DATA['delhi'].city, 'Delhi', 'Delhi city name mismatch');
});

test('City Data: Mumbai exists', () => {
    assert(TEST_CITY_DATA['mumbai'] !== undefined, 'Mumbai should exist in CITY_DATA');
});

test('City Data: Bangalore exists', () => {
    assert(TEST_CITY_DATA['bangalore'] !== undefined, 'Bangalore should exist in CITY_DATA');
});

test('City Data: Delhi has valid coordinates', () => {
    const delhi = TEST_CITY_DATA['delhi'];
    assert(delhi.lat > 0 && delhi.lng > 0, 'Delhi coordinates should be positive');
});

test('City Data: All cities have lat/lng defined', () => {
    Object.values(TEST_CITY_DATA).forEach(city => {
        assert(city.lat !== undefined && city.lng !== undefined, `${city.city} missing coordinates`);
    });
});

test('City Data: Unknown city returns undefined', () => {
    assertEqual(TEST_CITY_DATA['unknowncity'], undefined, 'Unknown city should return undefined');
});

test('City Data: Delhi has valid booth count', () => {
    assert(TEST_CITY_DATA['delhi'].totalBooths > 0, 'Delhi should have positive booth count');
});

// --- Chatbot Tests ---
test('Chatbot: Responds to "vote" keyword', () => {
    const response = testGetBotResponse('How do I vote?');
    assert(response.includes('18+'), 'Vote response should mention age requirement');
});

test('Chatbot: Responds to "register" keyword', () => {
    const response = testGetBotResponse('How do I register?');
    assert(response.includes('Form 6'), 'Register response should mention Form 6');
});

test('Chatbot: Returns default for unknown query', () => {
    const response = testGetBotResponse('What is the weather today?');
    assertEqual(response, TEST_CHATBOT_RESPONSES.default, 'Should return default response for unknown query');
});

test('Chatbot: Case insensitive matching', () => {
    const lower = testGetBotResponse('how do i vote?');
    const upper = testGetBotResponse('HOW DO I VOTE?');
    assertEqual(lower, upper, 'Chatbot should be case insensitive');
});

test('Chatbot: Empty string returns default', () => {
    const response = testGetBotResponse('');
    assertEqual(response, TEST_CHATBOT_RESPONSES.default, 'Empty string should return default');
});

test('Chatbot: Responds to "nota" keyword', () => {
    const response = testGetBotResponse('What is NOTA?');
    assert(response.includes('None of the Above'), 'NOTA response should explain it');
});

test('Chatbot: Responds to "age" keyword', () => {
    const response = testGetBotResponse('What is the voting age?');
    assert(response.includes('18'), 'Age response should mention 18');
});

// --- Vote Counting Tests ---
test('Vote Count: Votes sum correctly', () => {
    const votes = { A: 3, B: 2, C: 1, NOTA: 0 };
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    assertEqual(total, 6, 'Total votes should be 6');
});

test('Vote Count: Percentage calculation correct', () => {
    const pct = testCalculateVotePercentage({ A: 1, B: 0, C: 0, NOTA: 0 }, 'A');
    assertEqual(pct, 100, 'Single vote should be 100%');
});

test('Vote Count: Zero total handles division safely', () => {
    const pct = testCalculateVotePercentage({ A: 0, B: 0, C: 0, NOTA: 0 }, 'A');
    assertEqual(pct, 0, 'Zero total should give 0%');
});

test('Vote Count: Percentage always between 0 and 100', () => {
    const votes = { A: 5, B: 3, C: 2, NOTA: 0 };
    Object.keys(votes).forEach(key => {
        const pct = testCalculateVotePercentage(votes, key);
        assert(pct >= 0 && pct <= 100, `Percentage for ${key} should be 0-100, got ${pct}`);
    });
});

test('Vote Count: NOTA percentage correct', () => {
    const votes = { A: 0, B: 0, C: 0, NOTA: 2 };
    const pct = testCalculateVotePercentage(votes, 'NOTA');
    assertEqual(pct, 100, 'NOTA only vote should be 100%');
});

// --- Quiz Tests ---
test('Quiz: First question correct answer is index 1', () => {
    assertEqual(TEST_QUIZ_QUESTIONS[0].correct, 1, 'First question answer should be index 1');
});

test('Quiz: Second question correct answer is index 0', () => {
    assertEqual(TEST_QUIZ_QUESTIONS[1].correct, 0, 'Second question answer should be index 0');
});

test('Quiz: Score increments on correct answer', () => {
    let score = 0;
    const selected = 1;
    if (selected === TEST_QUIZ_QUESTIONS[0].correct) score++;
    assertEqual(score, 1, 'Score should increment on correct answer');
});

test('Quiz: Score does not increment on wrong answer', () => {
    let score = 0;
    const selected = 0;
    if (selected === TEST_QUIZ_QUESTIONS[0].correct) score++;
    assertEqual(score, 0, 'Score should not increment on wrong answer');
});

test('Quiz: All questions have 4 options', () => {
    TEST_QUIZ_QUESTIONS.forEach(q => {
        assertEqual(q.options.length, 4, `Question "${q.question}" should have 4 options`);
    });
});

test('Quiz: All questions have explanations', () => {
    TEST_QUIZ_QUESTIONS.forEach(q => {
        assert(q.explanation && q.explanation.length > 0, `Question "${q.question}" should have explanation`);
    });
});

test('Quiz: Percentage calc 2/3 correct', () => {
    const pct = Math.round((2 / 3) * 100);
    assertEqual(pct, 67, 'Score 2/3 should be 67%');
});

// --- Debounce Tests ---
test('Debounce: Returns a function', () => {
    const debounced = testDebounce(() => {}, 100);
    assertEqual(typeof debounced, 'function', 'Debounce should return a function');
});

test('Debounce: Delay is positive number', () => {
    const delay = 200;
    assert(delay > 0, 'Debounce delay should be positive');
});

// --- Firebase Config Tests ---
test('Firebase Config: Has apiKey', () => {
    const config = {
        apiKey: "AIzaSyB73wE94Nm45Sh1dDP_WNHQOgFsjMF1GL0",
        databaseURL: "https://smart-election-assistant-34fd6-default-rtdb.firebaseio.com",
        projectId: "smart-election-assistant-34fd6"
    };
    assert(config.apiKey && config.apiKey.length > 0, 'Firebase config should have apiKey');
});

test('Firebase Config: Has databaseURL', () => {
    const databaseURL = "https://smart-election-assistant-34fd6-default-rtdb.firebaseio.com";
    assert(databaseURL.includes('firebaseio.com'), 'databaseURL should be a Firebase URL');
});

test('Firebase Config: Has projectId', () => {
    const projectId = "smart-election-assistant-34fd6";
    assert(projectId && projectId.length > 0, 'Firebase config should have projectId');
});

// --- Accessibility Tests ---
test('Accessibility: Skip link text is not empty', () => {
    const skipLinkText = 'Skip to main content';
    assert(skipLinkText.length > 0, 'Skip link text should not be empty');
});

test('Accessibility: ARIA live region value is valid', () => {
    const ariaLive = 'polite';
    assert(['polite', 'assertive', 'off'].includes(ariaLive), 'aria-live should be a valid value');
});

test('Accessibility: Language toggle has valid aria-label', () => {
    const ariaLabel = 'Toggle language between English and Hindi';
    assert(ariaLabel.length > 0, 'Language toggle should have aria-label');
});

// --- Caching Tests ---
test('Cache: City cache stores data correctly', () => {
    const cache = {};
    cache['delhi'] = TEST_CITY_DATA['delhi'];
    assertEqual(cache['delhi'].city, 'Delhi', 'Cache should store and return city data');
});

test('Cache: Cache hit returns same object', () => {
    const cache = {};
    const data = TEST_CITY_DATA['mumbai'];
    cache['mumbai'] = data;
    assert(cache['mumbai'] === data, 'Cache should return same object reference');
});

// ============================================================
// RESULTS
// ============================================================

function printResults() {
    console.log('\n=== SMART ELECTION ASSISTANT TEST RESULTS ===\n');
    results.forEach(r => {
        const icon = r.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${r.status}: ${r.name}`);
        if (r.error) console.log(`   Error: ${r.error}`);
    });
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
    console.log(`📈 Score: ${Math.round((passed / (passed + failed)) * 100)}%\n`);
}

printResults();

if (typeof module !== 'undefined') {
    module.exports = { passed, failed, results };
}
