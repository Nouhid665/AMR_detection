document.addEventListener('DOMContentLoaded', function () {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ==========================
    // AUTH / USER MENU
    // ==========================
    const authModal = $('#authModal');
    const authClose = $('#authClose');
    const signInBtn = $('#signInBtn');
    const signUpBtn = $('#signUpBtn');
    const authTabs = $$('.auth-tab');
    const authForms = $$('.auth-form');
    const switchToSignUp = $('#switchToSignUp');
    const switchToSignIn = $('#switchToSignIn');
    const signInForm = $('#signInForm');
    const signUpForm = $('#signUpForm');
    const authButtons = $('#authButtons');
    const userMenu = $('#userMenu');
    const userAvatar = $('#userAvatar');
    const userDropdown = $('#userDropdown');
    const logoutBtn = $('#logoutBtn');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }

    function openAuthModal(tab) {
        authModal.classList.add('active');
        switchAuthTab(tab);
    }

    function closeAuthModal() {
        authModal.classList.remove('active');
    }

    function switchAuthTab(tab) {
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        $(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
        $(`#${tab}Form`).classList.add('active');
    }

    if (signInBtn) {
        signInBtn.addEventListener('click', e => {
            e.preventDefault();
            openAuthModal('signin');
        });
    }

    if (signUpBtn) {
        signUpBtn.addEventListener('click', e => {
            e.preventDefault();
            openAuthModal('signup');
        });
    }

    if (authClose) authClose.addEventListener('click', closeAuthModal);

    if (authModal) {
        authModal.addEventListener('click', e => {
            if (e.target === authModal) closeAuthModal();
        });
    }

    authTabs.forEach(tab => tab.addEventListener('click', function () {
        switchAuthTab(this.dataset.tab);
    }));

    if (switchToSignUp) {
        switchToSignUp.addEventListener('click', e => {
            e.preventDefault();
            switchAuthTab('signup');
        });
    }

    if (switchToSignIn) {
        switchToSignIn.addEventListener('click', e => {
            e.preventDefault();
            switchAuthTab('signin');
        });
    }

    if (signInForm) {
        signInForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = $('#signInEmail').value;
            const password = $('#signInPassword').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                authButtons.style.display = 'none';
                userMenu.style.display = 'flex';
                userAvatar.textContent = user.name.charAt(0).toUpperCase();
                closeAuthModal();
                alert('Successfully signed in!');
            } else {
                alert('Invalid email or password');
            }
        });
    }

    if (signUpForm) {
        signUpForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#signUpName').value;
            const email = $('#signUpEmail').value;
            const password = $('#signUpPassword').value;
            const confirmPassword = $('#signUpConfirmPassword').value;

            if (!name || !email || !password || password !== confirmPassword) {
                return alert("Invalid input!");
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.email === email)) {
                return alert('User exists!');
            }

            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            authButtons.style.display = 'none';
            userMenu.style.display = 'flex';
            userAvatar.textContent = name.charAt(0).toUpperCase();
            closeAuthModal();
            alert('Account created!');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
            userDropdown.classList.remove('active');
            alert('Logged out!');
        });
    }

    if (userAvatar) {
        userAvatar.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });
    }

    // ==========================
    // PREDICTION FORM
    // ==========================
    const form = $("#predictionForm");
    const signalInput = $("#signalInput");
    const resultBox = $("#predictionResult");
    let predError = $("#predError");
    const exampleBtn = $("#exampleBtn");

    if (!predError && form) {
        predError = document.createElement('p');
        predError.id = 'predError';
        predError.style.color = 'red';
        form.insertAdjacentElement('afterend', predError);
    }

    if (exampleBtn) {
        exampleBtn.addEventListener('click', () => {
            signalInput.value = JSON.stringify(generateQPSKExample());
        });
    }

    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();

            // clear old error message
            predError.textContent = "";

            try {
                const signalData = JSON.parse(signalInput.value);
                const resp = await fetch("/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ signal: signalData })
                });
                const data = await resp.json();

                if (data.predictions) {
                    // build the table
                    let html = "<h3>Prediction Result</h3><table border='1'><tr><th>Class</th><th>Label</th><th>Confidence</th></tr>";
                    data.predictions.forEach(p => {
                        html += `<tr><td>${p.class}</td><td>${p.label}</td><td>${(p.confidence * 100).toFixed(2)}%</td></tr>`;
                    });
                    html += "</table>";

                    // find the prediction with the highest confidence
                    const bestPrediction = data.predictions.reduce((prev, curr) =>
                        (curr.confidence > prev.confidence ? curr : prev)
                    );

                    // add the final output line
                    html += `<p style="margin-top:12px; text-align:center; font-size:18px; font-weight:bold; color:#16c79a;">
                                Final Output: ${bestPrediction.label}
                             </p>`;

                    resultBox.innerHTML = html;
                    resultBox.classList.remove("hidden");
                } else {
                    predError.textContent = data.error || "Unexpected response";
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    predError.textContent = "❌ Invalid input format. Please enter valid JSON signal data.";
                } else {
                    predError.textContent = "⚠️ Error connecting to backend.";
                }
            }
        });
    }

    function generateQPSKExample() {
        const symbols = [[1, 1], [1, -1], [-1, 1], [-1, -1]], I = [], Q = [];
        for (let i = 0; i < 128; i++) {
            const s = symbols[Math.floor(Math.random() * 4)];
            I.push(+(s[0] + (Math.random() - 0.5) * 0.1).toFixed(3));
            Q.push(+(s[1] + (Math.random() - 0.5) * 0.1).toFixed(3));
        }
        return [I, Q];
    }

    // ==========================
    // CHATBOT
    // ==========================
    const chatbotButton = $('.chatbot-button');
    const chatbotWindow = $('.chatbot-window');
    const chatbotClose = $('.chatbot-close');
    const sendMessageButton = $('#sendMessage');
    const chatbotInput = $('#chatbotInput');
    const chatbotMessages = $('.chatbot-messages');
    const chatbotStartListeningBtn = $('#chatbotStartListening'); // Speak button

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `message ${sender}-message`;
        msg.textContent = text;
        chatbotMessages.appendChild(msg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const s = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(s);
        }
    }

    function sendMessage() {
        const msg = chatbotInput.value.trim();
        if (!msg) return;
        addMessage(msg, 'user');
        chatbotInput.value = '';
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = "Assistant typing...";
        chatbotMessages.appendChild(typing);

        setTimeout(() => {
            chatbotMessages.removeChild(typing);
            generateResponse(msg);
        }, 1000);
    }

    if (sendMessageButton) sendMessageButton.addEventListener('click', sendMessage);
    if (chatbotInput) chatbotInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    if (chatbotButton) chatbotButton.addEventListener('click', () => chatbotWindow.classList.toggle('active'));
    if (chatbotClose) chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('active'));

    // ==========================
    // CHATBOT SPEECH RECOGNITION
    // ==========================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let chatbotRecognition;
    let isChatbotListening = false;

    if (SpeechRecognition) {
        chatbotRecognition = new SpeechRecognition();
        chatbotRecognition.continuous = false;
        chatbotRecognition.lang = 'en-US';
        chatbotRecognition.interimResults = false;
        chatbotRecognition.maxAlternatives = 1;

        chatbotRecognition.onstart = () => {
            isChatbotListening = true;
            addMessage("🎤 Listening...", 'bot');
        };

        chatbotRecognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            chatbotInput.value = speechResult;
            sendMessage();
        };

        chatbotRecognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            addMessage("❌ I didn't catch that. Please try again.", 'bot');
            isChatbotListening = false;
        };

        chatbotRecognition.onend = () => { isChatbotListening = false; };

        if (chatbotStartListeningBtn) {
            chatbotStartListeningBtn.addEventListener('click', () => {
                if (isChatbotListening) {
                    chatbotRecognition.stop();
                    isChatbotListening = false;
                } else {
                    try {
                        chatbotRecognition.start();
                    } catch (err) {
                        console.error("Speech recognition start failed:", err);
                        addMessage("⚠️ Speech recognition not available.", 'bot');
                    }
                }
            });
        }
    } else {
        if (chatbotStartListeningBtn) chatbotStartListeningBtn.style.display = 'none';
        addMessage("⚠️ Voice recognition not supported. Use Chrome/Edge.", 'bot');
    }

    // ==========================
    // CHATBOT INTENTS
    // ==========================
    const intents = [
        {
            patterns: ["hello", "hi", "hey", "good morning", "good evening"],
            response: "👋 Hello! I'm Wave, your NextWave assistant. How can I help you today?",
            quickReplies: `
                <div class="quick-reply" data-message="What is NextWave?">What is NextWave?</div>
                <div class="quick-reply" data-message="Tell me about your technology">Your Technology</div>
                <div class="quick-reply" data-message="How can I contact you?">Contact Options</div>
            `
        },
        {
            patterns: ["what is nextwave", "about nextwave", "tell me about nextwave", "explain nextwave", "company info"],
            response: "🌍 NextWave specializes in Automatic Modulation Recognition (AMR) for satellite communications. We build algorithms that can detect and classify modulation schemes automatically."
        },
        {
            patterns: ["technology", "amr", "algorithm", "signal recognition", "modulation"],
            response: "⚡ Our technology supports 11 modulation classes (QPSK, BPSK, QAM16, QAM64, etc.). It uses deep learning to classify signals from raw I/Q samples in real-time."
        },
        {
            patterns: ["who are you", "founder", "team", "developers", "your creators"],
            response: "👨‍💻 I’m Wave, your AI assistant. NextWave was founded by Nouhid Siddiqui (Tech Lead), Arghadip Pan (Researcher), Priyanshu Kumari (Co-Tech Lead), and a skilled team of engineers."
        },
        {
            patterns: ["contact", "email", "phone", "reach you", "support"],
            response: "📩 You can contact us at **nouhidsidd123@gmail.com** or call **+1 (555) 123-WAVE**. Our team is available Mon-Fri, 9AM-6PM."
        },
        {
            patterns: ["demo", "trial", "request", "free trial", "show me"],
            response: "✅ Sure! We'd love to arrange a demo. Please share your email and we'll contact you."
        }
    ];

    // ==========================
    // KNOWLEDGE BASE (Project-related answers)
    // ==========================
    const knowledgeBase = {
        "bpsk": "BPSK (Binary Phase Shift Keying) is a digital modulation technique where each symbol represents one bit using two phases, 0° and 180°. It is robust against noise and commonly used in satellite communications.",
        "qpsk": "QPSK (Quadrature Phase Shift Keying) encodes 2 bits per symbol by shifting the carrier phase among 4 values (0°, 90°, 180°, 270°). It doubles spectral efficiency compared to BPSK.",
        "8psk": "8PSK uses 8 different phase shifts to encode 3 bits per symbol, increasing data rate but requiring higher SNR for reliable detection.",
        "qam16": "16-QAM uses both amplitude and phase to encode 4 bits per symbol. It balances data rate and robustness, often used in DVB standards.",
        "qam64": "64-QAM encodes 6 bits per symbol, providing higher throughput but needing higher SNR and linearity.",
        "pam4": "PAM4 (Pulse Amplitude Modulation with 4 levels) represents 2 bits per symbol by using 4 amplitude levels. It is bandwidth-efficient but more sensitive to noise.",
        "am-dsb": "AM-DSB (Double Sideband Amplitude Modulation) transmits both upper and lower sidebands of the carrier, consuming more bandwidth but simple to implement.",
        "am-ssb": "AM-SSB (Single Sideband Amplitude Modulation) transmits only one sideband, reducing bandwidth and power requirements, commonly used in radio communications.",
        "cpfsk": "CPFSK (Continuous Phase Frequency Shift Keying) is a type of FSK where phase continuity is maintained, improving spectral efficiency and reducing side lobes.",
        "gfsk": "GFSK (Gaussian Frequency Shift Keying) shapes frequency transitions with a Gaussian filter, improving spectral efficiency. It is widely used in Bluetooth.",
        "wbfm": "WBFM (Wideband Frequency Modulation) provides high fidelity and resistance to noise, commonly used in FM broadcasting.",
        "snr": "SNR (Signal-to-Noise Ratio) values in our project range from -20 dB to +18 dB. A higher SNR indicates a clearer signal. For example, QAM64 requires high SNR (~15 dB+), while BPSK can work at much lower SNR (~0 dB or less)."
    };

    // ==========================
    // CHATBOT RESPONSE GENERATOR
    // ==========================
    function generateResponse(userMessage) {
        const msg = userMessage.toLowerCase().trim();
        let response = "🤔 I'm not sure I understood that. Could you rephrase your question about NextWave, our technology, or contact info?";
        let quickRepliesHTML = "";

        // 1️⃣ Check knowledge base first
        if (knowledgeBase[msg]) {
            response = knowledgeBase[msg];
        } else {
            // 2️⃣ Then check intents
            for (let intent of intents) {
                if (intent.patterns.some(p => msg.includes(p))) {
                    response = intent.response;
                    if (intent.quickReplies) quickRepliesHTML = intent.quickReplies;
                    break;
                }
            }
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = response;

        if (quickRepliesHTML) {
            const qr = document.createElement('div');
            qr.className = 'quick-replies';
            qr.innerHTML = quickRepliesHTML;
            messageElement.appendChild(qr);

            setTimeout(() => {
                qr.querySelectorAll('.quick-reply').forEach(reply => {
                    reply.addEventListener('click', function () {
                        chatbotInput.value = this.getAttribute('data-message');
                        sendMessage();
                    });
                });
            }, 100);
        }

        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        speakText(response);
    }
});
