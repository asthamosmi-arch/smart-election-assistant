document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Logic ---
    const navButtons = document.querySelectorAll('.nav-btn, .nav-card');
    const sections = document.querySelectorAll('.content-section');

    function navigateTo(targetId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all sidebar buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to corresponding sidebar button
        const activeBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            navigateTo(targetId);
        });
    });

    // --- Language Toggle Logic ---
    const langToggleBtn = document.getElementById('lang-toggle');
    let currentLang = 'en';

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        
        const translatableElements = document.querySelectorAll('.translatable');
        translatableElements.forEach(el => {
            if (currentLang === 'hi' && el.hasAttribute('data-hi')) {
                el.textContent = el.getAttribute('data-hi');
            } else if (currentLang === 'en' && el.hasAttribute('data-en')) {
                el.textContent = el.getAttribute('data-en');
            }
        });
    });

    // --- Eligibility Checker ---
    const ageInput = document.getElementById('age-input');
    const checkBtn = document.getElementById('check-eligibility-btn');
    const eligibilityResult = document.getElementById('eligibility-result');

    checkBtn.addEventListener('click', () => {
        const age = parseInt(ageInput.value);
        eligibilityResult.className = 'result-box'; // reset

        if (isNaN(age) || age < 0) {
            eligibilityResult.textContent = currentLang === 'hi' ? "कृपया एक वैध आयु दर्ज करें।" : "Please enter a valid age.";
            eligibilityResult.classList.add('error');
        } else if (age >= 18) {
            eligibilityResult.innerHTML = currentLang === 'hi' 
                ? "<strong>बधाई हो!</strong> आप मतदान करने के लिए पात्र हैं। सुनिश्चित करें कि आपके पास वोटर आईडी है।" 
                : "<strong>Congratulations!</strong> You are eligible to vote. Make sure you have a Voter ID.";
            eligibilityResult.classList.add('success');
        } else {
            eligibilityResult.innerHTML = currentLang === 'hi' 
                ? `आप पात्र नहीं हैं। आप <strong>${18 - age}</strong> वर्षों में मतदान कर सकेंगे।` 
                : `You are not eligible yet. You can vote in <strong>${18 - age}</strong> years.`;
            eligibilityResult.classList.add('error');
        }
    });

    // --- City-wise Info ---
    const cityData = {
        'delhi': { date: 'May 25, 2024', time: '7:00 AM - 6:00 PM', turnout: '60.5%' },
        'mumbai': { date: 'May 20, 2024', time: '7:00 AM - 6:00 PM', turnout: '55.3%' },
        'bangalore': { date: 'April 26, 2024', time: '7:00 AM - 6:00 PM', turnout: '54.7%' },
        'chennai': { date: 'April 19, 2024', time: '7:00 AM - 6:00 PM', turnout: '62.0%' },
        'kolkata': { date: 'June 1, 2024', time: '7:00 AM - 6:00 PM', turnout: '70.2%' }
    };

    const cityInput = document.getElementById('city-input');
    const getCityInfoBtn = document.getElementById('get-city-info-btn');
    const cityInfoResult = document.getElementById('city-info-result');

    getCityInfoBtn.addEventListener('click', () => {
        const city = cityInput.value.trim().toLowerCase();
        cityInfoResult.className = 'result-box';

        if (cityData[city]) {
            const data = cityData[city];
            cityInfoResult.innerHTML = `
                <strong>City:</strong> ${city.charAt(0).toUpperCase() + city.slice(1)}<br>
                <strong>Voting Date:</strong> ${data.date}<br>
                <strong>Voting Time:</strong> ${data.time}<br>
                <strong>Previous Turnout:</strong> ${data.turnout}
            `;
            cityInfoResult.classList.add('success');
        } else {
            cityInfoResult.textContent = currentLang === 'hi' ? "डेटा उपलब्ध नहीं है। कृपया 'Delhi' या 'Mumbai' जैसे प्रमुख शहर का प्रयास करें।" : "Data not available. Please try a major city like 'Delhi' or 'Mumbai'.";
            cityInfoResult.classList.add('error');
        }
    });

    // --- Booth Locator ---
    const areaInput = document.getElementById('area-input');
    const locateBtn = document.getElementById('locate-booth-btn');
    const boothResult = document.getElementById('booth-result');

    locateBtn.addEventListener('click', () => {
        const area = areaInput.value.trim();
        boothResult.className = 'result-box';

        if (area) {
            boothResult.innerHTML = `
                <strong>Booth Name:</strong> Govt. Primary School, ${area}<br>
                <strong>Booth Address:</strong> Main Road, ${area}, XYZ City<br>
                <strong>Voting Time:</strong> 7:00 AM - 6:00 PM<br>
                <button class="primary-btn mt-2" onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(area)}')">Get Directions</button>
            `;
            boothResult.classList.add('success');
        } else {
            boothResult.textContent = currentLang === 'hi' ? "कृपया एक क्षेत्र या शहर दर्ज करें।" : "Please enter an area or city.";
            boothResult.classList.add('error');
        }
    });

    // --- Chatbot ---
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessages = document.getElementById('chat-messages');

    const botResponses = [
        { keywords: ['how', 'vote', 'process'], response: 'To vote: 1. Check your name in the voter list. 2. Go to the polling booth with your Voter ID. 3. Press the button against your chosen candidate on the EVM.' },
        { keywords: ['document', 'id', 'proof'], response: 'You need a Voter ID (EPIC) to vote. Other accepted IDs include Aadhaar Card, PAN Card, Driving License, or Passport.' },
        { keywords: ['time', 'when'], response: 'Voting usually takes place between 7:00 AM and 6:00 PM on the designated election day for your constituency.' },
        { keywords: ['eligibility', 'age'], response: 'You must be an Indian citizen and at least 18 years old to be eligible to vote.' },
        { keywords: ['nota'], response: 'NOTA stands for "None of the Above". You can choose this if you do not wish to vote for any of the listed candidates.' }
    ];

    function addMessage(text, isBot = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processChat() {
        const text = chatInput.value.trim().toLowerCase();
        if (!text) return;

        addMessage(chatInput.value, false);
        chatInput.value = '';

        setTimeout(() => {
            let reply = "I'm sorry, I didn't understand that. You can ask about the voting process, required documents, or voting time.";
            
            for (let item of botResponses) {
                if (item.keywords.some(kw => text.includes(kw))) {
                    reply = item.response;
                    break;
                }
            }
            
            addMessage(reply, true);
        }, 600);
    }

    sendChatBtn.addEventListener('click', processChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processChat();
    });

    // --- Quiz Logic ---
    const quizData = [
        {
            q: "What is the minimum age to vote in India?",
            options: ["16", "18", "21", "25"],
            correct: 1
        },
        {
            q: "What does EVM stand for?",
            options: ["Election Voting Machine", "Electronic Voting Machine", "Evaluating Voter Machine", "Electronic Verification Method"],
            correct: 1
        },
        {
            q: "Which option can you choose if you don't want to vote for any candidate?",
            options: ["VETO", "NONE", "NOTA", "NULL"],
            correct: 2
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    const quizContainer = document.getElementById('quiz-container');

    function renderQuiz() {
        if (currentQuestion >= quizData.length) {
            quizContainer.innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <h3>Quiz Completed!</h3>
                    <p style="font-size: 1.5rem; margin-top: 1rem;">Your Score: ${score} / ${quizData.length}</p>
                    <button class="primary-btn mt-2" id="restart-quiz">Restart Quiz</button>
                </div>
            `;
            document.getElementById('restart-quiz').addEventListener('click', () => {
                currentQuestion = 0;
                score = 0;
                renderQuiz();
            });
            return;
        }

        const qData = quizData[currentQuestion];
        let optionsHtml = '';
        
        qData.options.forEach((opt, index) => {
            optionsHtml += `<button class="quiz-option-btn" data-index="${index}">${opt}</button>`;
        });

        quizContainer.innerHTML = `
            <div class="quiz-question">Q${currentQuestion + 1}. ${qData.q}</div>
            <div class="quiz-options">
                ${optionsHtml}
            </div>
            <div id="quiz-feedback" class="quiz-feedback"></div>
            <button class="primary-btn next-btn" id="next-q-btn" style="display:none;">Next Question</button>
        `;

        const optionBtns = document.querySelectorAll('.quiz-option-btn');
        const feedback = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('next-q-btn');

        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (nextBtn.style.display !== 'none') return; // already answered

                const selectedIndex = parseInt(e.target.getAttribute('data-index'));
                
                // Highlight correct and wrong
                optionBtns.forEach((b, i) => {
                    if (i === qData.correct) {
                        b.classList.add('correct');
                    } else if (i === selectedIndex) {
                        b.classList.add('wrong');
                    }
                });

                if (selectedIndex === qData.correct) {
                    feedback.textContent = "✅ Correct!";
                    feedback.style.color = "var(--secondary-color)";
                    score++;
                } else {
                    feedback.textContent = "❌ Incorrect!";
                    feedback.style.color = "#ef4444";
                }

                nextBtn.style.display = 'block';
            });
        });

        nextBtn.addEventListener('click', () => {
            currentQuestion++;
            renderQuiz();
        });
    }

    renderQuiz();

    // --- Demo Voting Logic ---
    const votes = {
        'A': 0,
        'B': 0,
        'C': 0,
        'NOTA': 0
    };

    const partyNames = {
        'A': 'Progressive Dawn',
        'B': 'Heritage Front',
        'C': 'Future Forward',
        'NOTA': 'NOTA'
    };

    const voteBtns = document.querySelectorAll('.vote-btn');
    const pollResultsContainer = document.getElementById('poll-results');

    function renderPollResults() {
        const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
        let html = '';

        for (const [key, count] of Object.entries(votes)) {
            const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
            html += `
                <div class="poll-bar-container">
                    <div class="poll-label">
                        <span>${partyNames[key]}</span>
                        <span>${percentage}% (${count} votes)</span>
                    </div>
                    <div class="poll-bar-bg">
                        <div class="poll-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
        pollResultsContainer.innerHTML = html;
    }

    voteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const party = btn.getAttribute('data-party');
            votes[party]++;
            
            // Visual feedback
            const originalText = btn.textContent;
            btn.textContent = '✅ Vote Cast!';
            btn.style.backgroundColor = '#ecfdf5';
            btn.style.borderColor = '#10b981';
            
            // Disable all buttons briefly
            voteBtns.forEach(b => b.disabled = true);
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                if(party === 'NOTA') {
                     btn.classList.add('btn-nota');
                }
                voteBtns.forEach(b => b.disabled = false);
            }, 1000);

            renderPollResults();
        });
    });

    renderPollResults(); // Initial render

});
