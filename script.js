/**
 * ============================================================================
 * ROMANTIC INTERACTIVE QUESTIONNAIRE & DECLARATION - SCRIPT.JS
 * ============================================================================
 * Screen Flow:
 * 1. Welcome / Name Screen ("Let Me In ✨")
 * 2. Declaration Screen (Runaway "NO" button -> user clicks "YES! 🥰❤️")
 * 3. Intro Screen ("Okay, Daphy... I could've just texted you... [Start 👀]")
 * 4. 15 Questions Interactive Flow (Question 1 to 15)
 * 5. Final Screen (Ending summary, reactions, secret message, retake option)
 */

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================
const SUPABASE_URL = "https://plfcxgepkdotlgogvlvs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZmN4Z2Vwa2RvdGxnb2d2bHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2OTE0NDYsImV4cCI6MjEwMzI2NzQ0Nn0.ZUl7Pdc03PijnR6Q1WeRrNU7-a1nF5hgGRk4HFbAZe4";

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. SUPABASE CLIENT INITIALIZATION
  // ==========================================================================
  let supabaseClient = null;

  try {
    if (
      typeof supabase !== 'undefined' &&
      SUPABASE_URL && 
      SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
    ) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("✨ Supabase client initialized successfully.");
    } else {
      console.info("ℹ️ Supabase credentials not yet configured. Responses will be safely saved in LocalStorage.");
    }
  } catch (err) {
    console.warn("Could not initialize Supabase client:", err);
  }

  // ==========================================================================
  // 2. QUESTIONNAIRE DATA (15 Questions)
  // ==========================================================================
  const questionsData = [
    {
      id: 1,
      question: "How would you describe my vibe?",
      options: [
        "Mysterious 😭",
        "Calm",
        "Kinda cute 👀",
        "Chaotic but interesting 😂",
        "Still figuring you out"
      ]
    },
    {
      id: 2,
      question: "What was your first impression of me?",
      options: [
        "Quiet",
        "Funny",
        "Confident",
        "Cute 👀",
        "A little weird 😂",
        "I honestly don’t remember"
      ]
    },
    {
      id: 3,
      question: "Did your opinion of me change after we started talking?",
      options: [
        "Yes, in a good way",
        "A little",
        "Definitely 👀",
        "Not really",
        "I’m still studying you 😂"
      ]
    },
    {
      id: 4,
      question: "Do you actually enjoy talking to me?",
      options: [
        "Yeah 😌",
        "Sometimes 😂",
        "More than I expected",
        "Maybe a little too much 👀",
        "Depends on your mood 😭"
      ]
    },
    {
      id: 5,
      question: "Be honest… have I ever randomly crossed your mind?",
      options: [
        "Once or twice",
        "Maybe 👀",
        "Yes",
        "More than I’ll admit",
        "Don’t get excited 😂"
      ]
    },
    {
      id: 6,
      question: "Have I ever made you smile while looking at your phone?",
      options: [
        "Yes 😭",
        "Maybe",
        "A few times",
        "More than once 👀",
        "I refuse to answer 😂"
      ]
    },
    {
      id: 7,
      question: "What kind of time together sounds best?",
      options: [
        "Late night conversations 🌙",
        "Food + random talking",
        "Watching movies together",
        "Going somewhere peaceful",
        "Random adventure",
        "Honestly, all of these"
      ]
    },
    {
      id: 8,
      question: "If we watched a movie together, where are you sitting?",
      options: [
        "Very far away 😂",
        "Next to you",
        "Close enough 👀",
        "Depends on the movie",
        "Why are you asking? 😭"
      ]
    },
    {
      id: 9,
      question: "What do you think is my most attractive quality?",
      options: [
        "My personality",
        "My confidence",
        "My humor",
        "My looks 👀",
        "The way I talk",
        "You’re fishing for compliments 😂"
      ]
    },
    {
      id: 10,
      question: "If I randomly told you ‘I miss you’, what would you say?",
      options: [
        "I miss you too",
        "Awww 😭",
        "Why? 👀",
        "Who said you could miss me?",
        "I’d probably smile first"
      ]
    },
    {
      id: 11,
      question: "How dangerous would a late-night conversation between us be?",
      options: [
        "Completely innocent 😇",
        "A little dangerous 👀",
        "Very dangerous 😂",
        "We should probably not find out",
        "I’m curious now"
      ]
    },
    {
      id: 12,
      question: "If I asked you to go somewhere with me, just us, would you?",
      options: [
        "Yes",
        "Probably",
        "Depends where 👀",
        "You’d have to convince me",
        "Maybe 😌"
      ]
    },
    {
      id: 13,
      question: "Would you actually go on a proper date with me?",
      options: [
        "Yes ❤️",
        "Maybe 👀",
        "Depends on the date",
        "Convince me",
        "You’re getting brave 😂"
      ]
    },
    {
      id: 14,
      question: "Do you think there’s a little chemistry between us?",
      options: [
        "Maybe",
        "A little 👀",
        "Yes",
        "You already know the answer 😂",
        "I’m not answering that"
      ]
    },
    {
      id: 15,
      isSpecial: true,
      question: "Do you think there could ever be something more between us?",
      options: [
        "Maybe ❤️",
        "I think so 👀",
        "I’ve wondered about it too",
        "Maybe someday",
        "I honestly don’t know yet",
        "You’re moving fast 😂"
      ]
    }
  ];

  // ==========================================================================
  // 3. APPLICATION STATE
  // ==========================================================================
  let visitorName = localStorage.getItem('crush_visitor_name') || '';
  let sessionId = localStorage.getItem('crush_session_id') || generateSessionId();
  let currentQuestionIndex = 0;
  let userAnswers = JSON.parse(localStorage.getItem('crush_answers') || '{}');
  let isTransitioning = false;
  let isMusicPlaying = false;
  let dodgeCount = 0;
  let yesBtnScale = 1.0;

  localStorage.setItem('crush_session_id', sessionId);

  // ==========================================================================
  // 4. DOM ELEMENTS
  // ==========================================================================
  const welcomeScreen = document.getElementById('welcome-screen');
  const declarationScreen = document.getElementById('declaration-screen');
  const introScreen = document.getElementById('intro-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const finalScreen = document.getElementById('final-screen');

  const visitorNameInput = document.getElementById('visitor-name-input');
  const nameError = document.getElementById('name-error');
  const enterBtn = document.getElementById('enter-btn');
  const loginForm = document.getElementById('login-form');

  // Declaration Elements
  const declarationCard = document.getElementById('declaration-card');
  const declarationNameDisplay = document.getElementById('declaration-name-display');
  const dodgeArena = document.getElementById('dodge-arena');
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const noBtnText = document.getElementById('no-btn-text');
  const dodgeMsg = document.getElementById('dodge-msg');

  // Intro Elements
  const introNameDisplay = document.getElementById('intro-name-display');
  const startQuizBtn = document.getElementById('start-quiz-btn');

  // Questionnaire Elements
  const questionCard = document.getElementById('question-card');
  const questionTitle = document.getElementById('question-title');
  const optionsGrid = document.getElementById('options-grid');
  const specialBadge = document.getElementById('special-q15-badge');
  const questionIndicator = document.getElementById('question-indicator');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const saveStatus = document.getElementById('save-status');

  // Final Screen Elements
  const finalNameDisplay = document.getElementById('final-name-display');
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  const secretTriggerBtn = document.getElementById('secret-trigger-btn');
  const secretModal = document.getElementById('secret-modal');
  const closeSecretBtn = document.getElementById('close-secret-btn');

  const summaryToggleBtn = document.getElementById('summary-toggle-btn');
  const summaryPanel = document.getElementById('summary-panel');
  const summaryList = document.getElementById('summary-list');
  const chevronArrow = summaryToggleBtn.querySelector('.chevron-arrow');
  const restartQuizBtn = document.getElementById('restart-quiz-btn');

  // Audio Elements
  const backgroundMusic = document.getElementById('backgroundMusic');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon');
  const musicText = document.getElementById('music-text');

  // ==========================================================================
  // 5. HELPER UTILITIES
  // ==========================================================================
  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    fromScreen.classList.add('hidden');

    toScreen.classList.remove('hidden');
    void toScreen.offsetWidth; // Force reflow
    toScreen.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 6. SYNTHESIZED WEB AUDIO
  // ==========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSoftChime(frequency = 523.25, duration = 0.28) {
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Fallback
    }
  }

  function playCelebrationHarmony() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => playSoftChime(freq, 0.45), idx * 90);
    });
  }

  // ==========================================================================
  // 7. BACKGROUND MUSIC HANDLER
  // ==========================================================================
  if (backgroundMusic) {
    backgroundMusic.volume = 0.25;
  }

  function toggleMusic() {
    initAudioContext();

    if (!isMusicPlaying) {
      if (backgroundMusic) {
        backgroundMusic.play().then(() => {
          isMusicPlaying = true;
          musicIcon.textContent = "🎵";
          musicText.textContent = "Sound On";
        }).catch(() => {
          isMusicPlaying = true;
          musicIcon.textContent = "🎵";
          musicText.textContent = "Sound On";
          playSoftChime(659.25, 0.3);
        });
      }
    } else {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
      isMusicPlaying = false;
      musicIcon.textContent = "🔇";
      musicText.textContent = "Sound Off";
    }
  }

  musicToggleBtn.addEventListener('click', toggleMusic);

  // ==========================================================================
  // 8. SCREEN 1: LOGIN / WELCOME ENTRANCE -> GOES DIRECTLY TO DECLARATION!
  // ==========================================================================
  function handleLoginSubmit() {
    const nameVal = visitorNameInput.value.trim();
    if (!nameVal) {
      nameError.classList.remove('hidden');
      visitorNameInput.focus();
      return;
    }

    nameError.classList.add('hidden');
    visitorName = nameVal;
    localStorage.setItem('crush_visitor_name', visitorName);

    initAudioContext();
    playSoftChime(587.33, 0.25);

    // Auto-start background music on user click if not already playing
    if (!isMusicPlaying && backgroundMusic) {
      toggleMusic();
    }

    // Update personalized text displays
    declarationNameDisplay.textContent = visitorName;
    introNameDisplay.textContent = visitorName;
    finalNameDisplay.textContent = visitorName;

    // Reset dodge arena elements
    dodgeCount = 0;
    yesBtnScale = 1.0;
    yesBtn.style.transform = '';
    noBtn.style.transform = '';
    noBtn.style.position = 'relative';
    noBtn.style.top = '0px';
    noBtn.style.left = '0px';
    noBtnText.textContent = "No 😭";
    dodgeMsg.textContent = "";

    // POP DECLARATION SCREEN DIRECTLY!
    switchScreen(welcomeScreen, declarationScreen);
  }

  enterBtn.addEventListener('click', handleLoginSubmit);
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLoginSubmit();
  });

  if (visitorName) {
    visitorNameInput.value = visitorName;
    declarationNameDisplay.textContent = visitorName;
    introNameDisplay.textContent = visitorName;
    finalNameDisplay.textContent = visitorName;
  }

  // ==========================================================================
  // 9. SCREEN 2: DECLARATION & RUNAWAY "NO" BUTTON LOGIC
  // ==========================================================================
  const noButtonTexts = [
    "No 😭",
    "Nice try 😂",
    "Too slow! 🏃‍♀️",
    "Nope 👀",
    "Almost! 😜",
    "Not an option ❤️",
    "Just click YES 😌",
    "You know you want to 💖",
    "Error 404: No not found 🤖",
    "Resistance is futile ✨"
  ];

  const dodgeMessages = [
    "I told you rejection was mathematically disabled 😂",
    "The universe is gently steering you towards YES 👀",
    "Look how bright and shiny the YES button is getting! ✨",
    "You’re really trying hard to click No huh? 😭❤️",
    "Just surrender to the date already 😌🌹"
  ];

  function dodgeNoButton(e) {
    dodgeCount++;
    playSoftChime(750 + Math.random() * 200, 0.12);

    const arenaRect = dodgeArena.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    noBtn.style.position = 'absolute';

    const maxLeft = Math.max(10, arenaRect.width - btnRect.width - 20);
    const maxTop = Math.max(10, arenaRect.height - btnRect.height - 20);

    let randomX = Math.floor(Math.random() * maxLeft);
    let randomY = Math.floor(Math.random() * maxTop);

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    const randomRot = (Math.random() - 0.5) * 24;
    noBtn.style.transform = `rotate(${randomRot}deg)`;

    const textIdx = dodgeCount % noButtonTexts.length;
    noBtnText.textContent = noButtonTexts[textIdx];

    const msgIdx = (dodgeCount - 1) % dodgeMessages.length;
    dodgeMsg.textContent = dodgeMessages[msgIdx];

    // Grow the YES button
    yesBtnScale = Math.min(1.38, 1.0 + (dodgeCount * 0.04));
    yesBtn.style.transform = `scale(${yesBtnScale})`;
  }

  noBtn.addEventListener('mouseenter', dodgeNoButton);
  noBtn.addEventListener('mouseover', dodgeNoButton);
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNoButton(e);
  });
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeNoButton(e);
  });

  dodgeArena.addEventListener('mousemove', (e) => {
    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
    if (distance < 85) {
      dodgeNoButton(e);
    }
  });

  // WHEN YES IS CLICKED ON DECLARATION SCREEN -> POPS THE INTRO SCREEN NEXT!
  yesBtn.addEventListener('click', async () => {
    initAudioContext();
    playCelebrationHarmony();
    triggerMassiveCelebration();

    localStorage.setItem('crush_declaration_accepted', 'true');

    // Save declaration status to Supabase
    await submitToSupabase({
      declaration_response: "YES ❤️",
      declared_at: new Date().toISOString()
    });

    // POPS THE INTRO SCREEN ("Okay, [Name]... I could've just texted you...") NEXT!
    introNameDisplay.textContent = visitorName || 'You';

    setTimeout(() => {
      switchScreen(declarationScreen, introScreen);
    }, 450);
  });

  // ==========================================================================
  // 10. SCREEN 3: INTRO SCREEN -> CLICKS "Start 👀" TO BEGIN QUESTIONS
  // ==========================================================================
  startQuizBtn.addEventListener('click', () => {
    initAudioContext();
    playSoftChime(659.25, 0.25);
    currentQuestionIndex = 0;
    renderQuestion(0);
    switchScreen(introScreen, quizScreen);
  });

  // ==========================================================================
  // 11. SCREEN 4: 15-QUESTION FLOW
  // ==========================================================================
  function renderQuestion(index) {
    const q = questionsData[index];
    if (!q) return;

    const total = questionsData.length;
    const currentNum = index + 1;
    const percent = Math.round((currentNum / total) * 100);

    questionIndicator.textContent = `Question ${currentNum} of ${total}`;
    progressPercent.textContent = `${percent}%`;
    progressBarFill.style.width = `${percent}%`;

    if (q.isSpecial) {
      specialBadge.classList.remove('hidden');
      document.body.classList.add('special-dim-mode');
    } else {
      specialBadge.classList.add('hidden');
      document.body.classList.remove('special-dim-mode');
    }

    questionTitle.textContent = q.question;

    optionsGrid.innerHTML = '';
    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', optText);

      const letter = String.fromCharCode(65 + optIdx);

      btn.innerHTML = `
        <div class="option-btn-text">
          <span class="option-pill-badge">${letter}</span>
          <span>${escapeHTML(optText)}</span>
        </div>
        <svg class="option-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      btn.addEventListener('click', () => handleOptionSelection(btn, q.id, q.question, optText));
      optionsGrid.appendChild(btn);
    });

    saveStatus.classList.remove('visible');
  }

  function handleOptionSelection(selectedBtn, questionId, questionText, chosenOption) {
    if (isTransitioning) return;
    isTransitioning = true;

    playSoftChime(659.25, 0.2);

    const allOptions = optionsGrid.querySelectorAll('.option-btn');
    allOptions.forEach(b => b.classList.remove('selected'));
    selectedBtn.classList.add('selected');

    userAnswers[`question_${questionId}`] = {
      id: questionId,
      question: questionText,
      answer: chosenOption
    };
    localStorage.setItem('crush_answers', JSON.stringify(userAnswers));

    saveStatus.classList.add('visible');

    setTimeout(() => {
      questionCard.classList.remove('anim-fade-in');
      questionCard.classList.add('anim-fade-out');

      setTimeout(() => {
        currentQuestionIndex++;

        if (currentQuestionIndex < questionsData.length) {
          renderQuestion(currentQuestionIndex);
          questionCard.classList.remove('anim-fade-out');
          questionCard.classList.add('anim-fade-in');
          isTransitioning = false;
        } else {
          showFinalScreen();
          isTransitioning = false;
        }
      }, 250);

    }, 500);
  }

  // ==========================================================================
  // 12. SCREEN 5: FINAL COMPLETION & SUPABASE SUBMISSION
  // ==========================================================================
  async function showFinalScreen() {
    switchScreen(quizScreen, finalScreen);
    playCelebrationHarmony();
    triggerParticleBurst();
    populateSummaryView();

    await submitToSupabase();
  }

  async function submitToSupabase(extraFields = {}) {
    const formattedAnswers = {};
    questionsData.forEach(q => {
      const saved = userAnswers[`question_${q.id}`];
      formattedAnswers[`question_${q.id}`] = saved ? saved.answer : null;
    });

    const cleanVisitorName = (visitorName || 'Anonymous').trim();

    const payload = {
      visitor_name: cleanVisitorName,
      session_id: sessionId,
      answers: formattedAnswers,
      completed: true,
      created_at: new Date().toISOString(),
      ...extraFields
    };

    console.log("📦 Submitting payload to Supabase:", payload);

    if (supabaseClient) {
      try {
        // Check for existing record by visitor name to prevent duplicate rows per person
        const { data: existingRecords } = await supabaseClient
          .from('crush_responses')
          .select('id, session_id')
          .ilike('visitor_name', cleanVisitorName)
          .limit(1);

        let result;
        if (existingRecords && existingRecords.length > 0) {
          const existingId = existingRecords[0].id;
          result = await supabaseClient
            .from('crush_responses')
            .update(payload)
            .eq('id', existingId);
        } else {
          result = await supabaseClient
            .from('crush_responses')
            .insert([payload]);
        }

        if (result.error) {
          console.warn("⚠️ Supabase note:", result.error.message);
        } else {
          console.log("✅ Successfully saved response to Supabase table 'crush_responses'!", result.data);
        }
      } catch (err) {
        console.warn("⚠️ Supabase error (answers safe in localStorage):", err);
      }
    }
  }

  function populateSummaryView() {
    summaryList.innerHTML = '';
    questionsData.forEach((q, idx) => {
      const saved = userAnswers[`question_${q.id}`];
      if (saved) {
        const row = document.createElement('div');
        row.className = 'summary-row';
        row.innerHTML = `
          <div class="summary-q">Q${idx + 1}: ${escapeHTML(saved.question)}</div>
          <div class="summary-a">↳ ${escapeHTML(saved.answer)}</div>
        `;
        summaryList.appendChild(row);
      }
    });
  }

  // Reaction Buttons
  reactionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playCelebrationHarmony();
      triggerParticleBurst();
      btn.style.transform = 'scale(1.05)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    });
  });

  // Secret Modal
  secretTriggerBtn.addEventListener('click', () => {
    secretModal.classList.remove('hidden');
    playSoftChime(784, 0.2);
  });

  closeSecretBtn.addEventListener('click', () => {
    secretModal.classList.add('hidden');
  });

  secretModal.addEventListener('click', (e) => {
    if (e.target === secretModal) {
      secretModal.classList.add('hidden');
    }
  });

  // Summary Toggle
  summaryToggleBtn.addEventListener('click', () => {
    const isHidden = summaryPanel.classList.contains('hidden');
    if (isHidden) {
      summaryPanel.classList.remove('hidden');
      chevronArrow.classList.add('rotated');
      playSoftChime(523.25, 0.15);
    } else {
      summaryPanel.classList.add('hidden');
      chevronArrow.classList.remove('rotated');
    }
  });

  // Restart Quiz
  restartQuizBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    userAnswers = {};
    visitorName = '';
    visitorNameInput.value = '';
    localStorage.removeItem('crush_answers');
    localStorage.removeItem('crush_visitor_name');
    localStorage.removeItem('crush_declaration_accepted');
    
    declarationNameDisplay.textContent = 'You';
    introNameDisplay.textContent = 'You';
    finalNameDisplay.textContent = 'You';
    
    summaryPanel.classList.add('hidden');
    chevronArrow.classList.remove('rotated');

    renderQuestion(0);
    switchScreen(finalScreen, welcomeScreen);
    playSoftChime(440, 0.2);
  });

  // ==========================================================================
  // 13. CANVAS AMBIENT STARFIELD & PARTICLES ENGINE
  // ==========================================================================
  const ambientCanvas = document.getElementById('ambient-canvas');
  const aCtx = ambientCanvas.getContext('2d');

  let aWidth = (ambientCanvas.width = window.innerWidth);
  let aHeight = (ambientCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    aWidth = ambientCanvas.width = window.innerWidth;
    aHeight = ambientCanvas.height = window.innerHeight;
  });

  const ambientParticles = [];
  const starCount = window.innerWidth < 768 ? 35 : 65;

  class StarParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * aWidth;
      this.y = initial ? Math.random() * aHeight : aHeight + 15;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedY = Math.random() * 0.35 + 0.1;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.isStarShape = Math.random() > 0.7;
      this.color = Math.random() > 0.4 ? 'rgba(167, 139, 250,' : 'rgba(91, 140, 255,';
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      if (this.y < -20) {
        this.reset();
      }
    }

    draw() {
      aCtx.save();
      aCtx.translate(this.x, this.y);

      if (this.isStarShape) {
        aCtx.fillStyle = `${this.color} ${this.opacity})`;
        aCtx.beginPath();
        const s = this.size * 2;
        aCtx.moveTo(0, -s);
        aCtx.lineTo(s * 0.2, -s * 0.2);
        aCtx.lineTo(s, 0);
        aCtx.lineTo(s * 0.2, s * 0.2);
        aCtx.lineTo(0, s);
        aCtx.lineTo(-s * 0.2, s * 0.2);
        aCtx.lineTo(-s, 0);
        aCtx.lineTo(-s * 0.2, -s * 0.2);
        aCtx.closePath();
        aCtx.fill();
      } else {
        aCtx.beginPath();
        aCtx.arc(0, 0, this.size, 0, Math.PI * 2);
        aCtx.fillStyle = `${this.color} ${this.opacity})`;
        aCtx.shadowColor = 'rgba(139, 92, 246, 0.4)';
        aCtx.shadowBlur = this.size * 3;
        aCtx.fill();
      }

      aCtx.restore();
    }
  }

  for (let i = 0; i < starCount; i++) {
    ambientParticles.push(new StarParticle());
  }

  function animateAmbient() {
    aCtx.clearRect(0, 0, aWidth, aHeight);
    for (let i = 0; i < ambientParticles.length; i++) {
      ambientParticles[i].update();
      ambientParticles[i].draw();
    }
    requestAnimationFrame(animateAmbient);
  }

  animateAmbient();

  // ==========================================================================
  // 14. CELEBRATION PARTICLE BURST ENGINE (Hearts, Sparkles, Stars)
  // ==========================================================================
  const burstCanvas = document.getElementById('burst-canvas');
  const bCtx = burstCanvas.getContext('2d');

  let bWidth = (burstCanvas.width = window.innerWidth);
  let bHeight = (burstCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    bWidth = burstCanvas.width = window.innerWidth;
    bHeight = burstCanvas.height = window.innerHeight;
  });

  let burstParticles = [];
  let isBurstActive = false;

  const burstColors = [
    '#5B8CFF', '#8B5CF6', '#A78BFA', '#FDE047', 
    '#F5F3FF', '#A47551', '#4169E1', '#FF4D6D', '#FF758F'
  ];

  class BurstParticle {
    constructor(originX, originY) {
      this.x = originX;
      this.y = originY;
      this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
      this.size = Math.random() * 14 + 8;
      this.color = burstColors[Math.floor(Math.random() * burstColors.length)];

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 5;

      this.gravity = 0.22;
      this.drag = 0.95;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.14;
      this.opacity = 1;
      this.decay = Math.random() * 0.01 + 0.007;
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;

      this.x += this.vx;
      this.y += this.vy;

      this.rotation += this.rotSpeed;
      this.opacity -= this.decay;
    }

    draw() {
      if (this.opacity <= 0) return;

      bCtx.save();
      bCtx.translate(this.x, this.y);
      bCtx.rotate(this.rotation);
      bCtx.globalAlpha = Math.max(0, this.opacity);

      if (this.type === 'heart') {
        bCtx.fillStyle = this.color;
        bCtx.beginPath();
        const s = this.size * 0.55;
        bCtx.moveTo(0, s * 0.3);
        bCtx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.3);
        bCtx.bezierCurveTo(-s, s * 0.7, 0, s * 1.1, 0, s * 1.4);
        bCtx.bezierCurveTo(0, s * 1.1, s, s * 0.7, s, s * 0.3);
        bCtx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.3);
        bCtx.closePath();
        bCtx.fill();
      } else {
        bCtx.fillStyle = this.color;
        bCtx.beginPath();
        const s = this.size * 0.6;
        bCtx.moveTo(0, -s);
        bCtx.lineTo(s * 0.25, -s * 0.25);
        bCtx.lineTo(s, 0);
        bCtx.lineTo(s * 0.25, s * 0.25);
        bCtx.lineTo(0, s);
        bCtx.lineTo(-s * 0.25, s * 0.25);
        bCtx.lineTo(-s, 0);
        bCtx.lineTo(-s * 0.25, -s * 0.25);
        bCtx.closePath();
        bCtx.fill();
      }

      bCtx.restore();
    }
  }

  function triggerParticleBurst() {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    const count = window.innerWidth < 768 ? 55 : 90;
    for (let i = 0; i < count; i++) {
      burstParticles.push(new BurstParticle(originX, originY));
    }

    if (!isBurstActive) {
      isBurstActive = true;
      animateBurst();
    }
  }

  function triggerMassiveCelebration() {
    const count = window.innerWidth < 768 ? 90 : 160;
    for (let i = 0; i < count; i++) {
      burstParticles.push(new BurstParticle(window.innerWidth * 0.3, window.innerHeight * 0.5));
      burstParticles.push(new BurstParticle(window.innerWidth * 0.7, window.innerHeight * 0.5));
    }

    if (!isBurstActive) {
      isBurstActive = true;
      animateBurst();
    }
  }

  function animateBurst() {
    bCtx.clearRect(0, 0, bWidth, bHeight);

    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const p = burstParticles[i];
      p.update();
      p.draw();

      if (p.opacity <= 0 || p.y > bHeight + 30) {
        burstParticles.splice(i, 1);
      }
    }

    if (burstParticles.length > 0) {
      requestAnimationFrame(animateBurst);
    } else {
      isBurstActive = false;
      bCtx.clearRect(0, 0, bWidth, bHeight);
    }
  }

});
