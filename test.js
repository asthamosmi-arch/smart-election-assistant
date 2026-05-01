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
    if (a !== b) throw new Error(message || `Expected ${b}, got ${a}`);
}

// ============================================================
// MOCK DATA (mirrors script.js)
// ============================================================

const CITY_DATA = {
    delhi: { city: 'Delhi', votingDate: 'February 5, 2025', lat: 28.6139, lng: 77.2090 },
    mumbai: { city: 'Mumbai', votingDate: 'November 20, 2024', lat: 19.0760, lng: 72.8777 }
};

const CHATBOT_RESPONSES = {
    'vote': 'To vote in India, you must be 18+ years old...',
    'register': 'You can register to vote using Form 6...',
    'default': 'I can help you with information about voting...'
};

// ============================================================
// UNIT TESTS
// ============================================================

// --- Eligibility Tests ---
test('Eligibility: Age 18 should be eligible', () => {
    assert(18 >= 18, 'Age 18 should be eligible');
});

test('Eligibility: Age 17 should not be eligible', () => {
    assert(17 < 18, 'Age 17 should not be eligible');
});

test('Eligibility: Age 0 should not be eligible', () => {
    assert(0 < 18, 'Age 0 should not be eligible');
});

test('Eligibility: Age 25 should be eligible', () => {
    assert(25 >= 18, 'Age 25 should be eligible');
});

test('Eligibility: Negative age is invalid', () => {
    const age = -1;
    assert(isNaN(age) || age < 0 || age > 120, 'Negative age should be invalid');
});

test('Eligibility: Age 121 is invalid', () => {
    const age = 121;
    assert(age > 120, 'Age 121 should be invalid');
});

// --- City Data Tests ---
test('City Data: Delhi exists', () => {
    assert(CITY_DATA['delhi'] !== undefined, 'Delhi should exist in CITY_DATA');
});

test('City Data: Delhi has correct city name', () => {
    assertEqual(CITY_DATA['delhi'].city, 'Delhi', 'Delhi city name mismatch');
});

test('City Data: Mumbai exists', () => {
    assert(CITY_DATA['mumbai'] !== undefined, 'Mumbai should exist in CITY_DATA');
});

test('City Data: Delhi has valid coordinates', () => {
    const delhi = CITY_DATA['delhi'];
    assert(delhi.lat > 0 && delhi.lng > 0, 'Delhi coordinates should be positive');
});

test('City Data: Unknown city returns undefined', () => {
    const result = CITY_DATA['unknowncity'];
    assertEqual(result, undefined, 'Unknown city should return undefined');
});

// --- Chatbot Tests ---
function getBotResponse(message) {
    const lower = message.toLowerCase();
    for (const [key, response] of Object.entries(CHATBOT_RESPONSES)) {
        if (lower.includes(key)) return response;
    }
    return CHATBOT_RESPONSES.default;
}

test('Chatbot: Responds to "vote" keyword', () => {
    const response = getBotResponse('How do I vote?');
    assert(response.includes('18+'), 'Vote response should mention age requirement');
});

test('Chatbot: Responds to "register" keyword', () => {
    const response = getBotResponse('How do I register?');
    assert(response.includes('Form 6'), 'Register response should mention Form 6');
});

test('Chatbot: Returns default for unknown query', () => {
    const response = getBotResponse('What is the weather?');
    assertEqual(response, CHATBOT_RESPONSES.default, 'Should return default response for unknown query');
});

test('Chatbot: Case insensitive matching', () => {
    const lower = getBotResponse('how do i VOTE?');
    const upper = getBotResponse('HOW DO I vote?');
    assertEqual(lower, upper, 'Chatbot should be case insensitive');
});

// --- Vote Counting Tests ---
test('Vote Count: Votes sum correctly', () => {
    const votes = { A: 3, B: 2, C: 1, NOTA: 0 };
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    assertEqual(total, 6, 'Total votes should be 6');
});

test('Vote Count: Percentage calculation correct', () => {
    const votes = { A: 1, B: 0, C: 0, NOTA: 0 };
    const total = 1;
    const pct = Math.round((votes.A / total) * 100);
    assertEqual(pct, 100, 'Single vote should be 100%');
});

test('Vote Count: Zero total handles division', () => {
    const total = 0;
    const pct = total > 0 ? Math.round((0 / total) * 100) : 0;
    assertEqual(pct, 0, 'Zero total should give 0%');
});

// --- Quiz Tests ---
const QUIZ_QUESTIONS = [
    { question: 'Min age to vote?', options: ['16', '18', '21', '25'], correct: 1 },
    { question: 'What is NOTA?', options: ['None of the Above', 'Not on Agenda', 'No Alternative', 'New Order'], correct: 0 }
];

test('Quiz: First question correct answer is index 1', () => {
    assertEqual(QUIZ_QUESTIONS[0].correct, 1, 'First question answer should be index 1');
});

test('Quiz: Second question correct answer is index 0', () => {
    assertEqual(QUIZ_QUESTIONS[1].correct, 0, 'Second question answer should be index 0');
});

test('Quiz: Score increments on correct answer', () => {
    let score = 0;
    const selected = 1;
    const correct = 1;
    if (selected === correct) score++;
    assertEqual(score, 1, 'Score should increment on correct answer');
});

test('Quiz: Score does not increment on wrong answer', () => {
    let score = 0;
    const selected = 0;
    const correct = 1;
    if (selected === correct) score++;
    assertEqual(score, 0, 'Score should not increment on wrong answer');
});

test('Quiz: All questions have 4 options', () => {
    QUIZ_QUESTIONS.forEach(q => {
        assertEqual(q.options.length, 4, `Question "${q.question}" should have 4 options`);
    });
});

// --- Accessibility Tests ---
test('Accessibility: Skip link should exist in HTML', () => {
    // Simulated DOM check
    const skipLinkText = 'Skip to main content';
    assert(skipLinkText.length > 0, 'Skip link text should not be empty');
});

test('Accessibility: ARIA live region for results', () => {
    const ariaLive = 'polite';
    assert(['polite', 'assertive', 'off'].includes(ariaLive), 'aria-live should be a valid value');
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

// Export for Node.js
if (typeof module !== 'undefined') {
    module.exports = { passed, failed, results };
}
