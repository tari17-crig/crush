/**
 * ============================================================================
 * ADMIN DASHBOARD SCRIPT - ADMIN.JS
 * ============================================================================
 * Features:
 * - Secret PIN Passcode Lock Screen
 * - Live Supabase Querying (crush_responses table)
 * - LocalStorage Local-Mode Fallback
 * - Dashboard Overview Metrics (Total Count, Declaration, Latest Visitor)
 * - Detailed QA Breakdown for Every Submission
 * - Ambient Starfield Background
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const ADMIN_PIN = "7788";

const SUPABASE_URL = "https://plfcxgepkdotlgogvlvs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZmN4Z2Vwa2RvdGxnb2d2bHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2OTE0NDYsImV4cCI6MjEwMzI2NzQ0Nn0.ZUl7Pdc03PijnR6Q1WeRrNU7-a1nF5hgGRk4HFbAZe4";

// Mapping of question IDs to clean question titles for display
const QUESTION_TITLES = {
  question_1: "1. How would you describe my vibe?",
  question_2: "2. What was your first impression of me?",
  question_3: "3. Did your opinion of me change after we started talking?",
  question_4: "4. Do you actually enjoy talking to me?",
  question_5: "5. Have I ever randomly crossed your mind?",
  question_6: "6. Have I ever made you smile while looking at your phone?",
  question_7: "7. What kind of time together sounds best?",
  question_8: "8. If we watched a movie together, where are you sitting?",
  question_9: "9. What do you think is my most attractive quality?",
  question_10: "10. If I told you ‘I miss you’, what would you say?",
  question_11: "11. How dangerous would a late-night conversation be?",
  question_12: "12. If I asked you to go somewhere just us, would you?",
  question_13: "13. Would you actually go on a proper date with me?",
  question_14: "14. Do you think there’s a little chemistry between us?",
  question_15: "15. Do you think there could ever be something more between us?"
};

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. SUPABASE CLIENT
  // ==========================================================================
  let supabaseClient = null;
  let isSupabaseConfigured = false;

  try {
    if (
      typeof supabase !== 'undefined' &&
      SUPABASE_URL && 
      SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
    ) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      isSupabaseConfigured = true;
    }
  } catch (e) {
    console.warn("Supabase init error:", e);
  }

  // ==========================================================================
  // 2. DOM ELEMENTS
  // ==========================================================================
  const lockScreen = document.getElementById('lock-screen');
  const dashboardContainer = document.getElementById('dashboard-container');
  const pinForm = document.getElementById('pin-form');
  const adminPinInput = document.getElementById('admin-pin-input');
  const pinError = document.getElementById('pin-error');
  const unlockBtn = document.getElementById('unlock-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const clearBtn = document.getElementById('clear-btn');

  const statTotalCount = document.getElementById('stat-total-count');
  const statDeclarationStatus = document.getElementById('stat-declaration-status');
  const statLatestName = document.getElementById('stat-latest-name');
  const statLatestTime = document.getElementById('stat-latest-time');

  const dbIndicatorDot = document.getElementById('db-indicator-dot');
  const dbStatusText = document.getElementById('db-status-text');
  const dataSourceBadge = document.getElementById('data-source-badge');

  const recordsCountBadge = document.getElementById('records-count-badge');
  const emptyState = document.getElementById('empty-state');
  const responsesContainer = document.getElementById('responses-container');

  // ==========================================================================
  // 3. PASSCODE AUTHENTICATION
  // ==========================================================================
  function checkAuth() {
    const isUnlocked = sessionStorage.getItem('admin_unlocked') === 'true';
    if (isUnlocked) {
      showDashboard();
    } else {
      showLockScreen();
    }
  }

  function showLockScreen() {
    lockScreen.classList.remove('hidden');
    lockScreen.classList.add('active');
    dashboardContainer.classList.add('hidden');
    adminPinInput.value = '';
    adminPinInput.focus();
  }

  function showDashboard() {
    lockScreen.classList.add('hidden');
    lockScreen.classList.remove('active');
    dashboardContainer.classList.remove('hidden');
    fetchAndRenderResponses();
  }

  function handleUnlock() {
    const entered = adminPinInput.value.trim();
    if (entered === ADMIN_PIN) {
      pinError.classList.add('hidden');
      sessionStorage.setItem('admin_unlocked', 'true');
      showDashboard();
    } else {
      pinError.classList.remove('hidden');
      adminPinInput.value = '';
      adminPinInput.focus();
    }
  }

  pinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUnlock();
  });
  unlockBtn.addEventListener('click', handleUnlock);

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('admin_unlocked');
    showLockScreen();
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      const refreshIcon = refreshBtn.querySelector('.icon-refresh');
      const refreshText = refreshBtn.querySelector('span');
      if (refreshIcon) refreshIcon.classList.add('spinning');
      if (refreshText) refreshText.textContent = 'Refreshing...';
      refreshBtn.disabled = true;

      await fetchAndRenderResponses();

      setTimeout(() => {
        if (refreshIcon) refreshIcon.classList.remove('spinning');
        if (refreshText) refreshText.textContent = 'Refresh';
        refreshBtn.disabled = false;
      }, 400);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      const confirmed = confirm("⚠️ Are you sure you want to clear ALL questionnaire submissions?\n\nThis will permanently delete all stored responses from both Supabase and LocalStorage.");
      if (!confirmed) return;

      clearBtn.disabled = true;
      clearBtn.style.opacity = '0.5';

      try {
        // 1. Clear Supabase table if configured
        if (isSupabaseConfigured && supabaseClient) {
          const { error } = await supabaseClient
            .from('crush_responses')
            .delete()
            .neq('session_id', '___force_clear_all___');

          if (error) {
            console.warn("Supabase clear note:", error.message);
          }
        }

        // 2. Clear all LocalStorage keys related to the questionnaire
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('crush_')) {
            localStorage.removeItem(key);
          }
        }
        localStorage.removeItem('crush_visitor_name');
        localStorage.removeItem('crush_answers');
        localStorage.removeItem('crush_declaration_accepted');
        localStorage.removeItem('crush_session_id');

        // 3. Force re-render empty dashboard
        renderDashboard([]);
        alert("✅ All submissions cleared successfully!");
      } catch (err) {
        console.error("Clear error:", err);
        alert("An error occurred while clearing submissions.");
      } finally {
        clearBtn.disabled = false;
        clearBtn.style.opacity = '1';
      }
    });
  }

  // ==========================================================================
  // 4. DATA FETCHING & RENDERING
  // ==========================================================================
  async function fetchAndRenderResponses() {
    let responsesList = [];

    // 1. Try fetching from Supabase
    if (isSupabaseConfigured && supabaseClient) {
      dbIndicatorDot.className = 'indicator-dot connected';
      dbStatusText.textContent = 'Supabase Connected';
      dataSourceBadge.textContent = 'Live Database';

      try {
        const { data, error } = await supabaseClient
          .from('crush_responses')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          responsesList = data;
        }
      } catch (err) {
        console.warn("Supabase fetch error:", err);
      }
    } else {
      dbIndicatorDot.className = 'indicator-dot local-mode';
      dbStatusText.textContent = 'Local Mode (Supabase credentials not configured)';
      dataSourceBadge.textContent = 'LocalStorage Mode';
    }

    // 2. Also check local storage (if testing locally or Supabase is empty)
    const localName = localStorage.getItem('crush_visitor_name');
    const localAnswers = JSON.parse(localStorage.getItem('crush_answers') || '{}');
    const localDeclared = localStorage.getItem('crush_declaration_accepted') === 'true';

    if (localName || Object.keys(localAnswers).length > 0) {
      // Format local storage answers into response object
      const formattedLocalAnswers = {};
      Object.keys(localAnswers).forEach(k => {
        formattedLocalAnswers[k] = localAnswers[k].answer;
      });

      const localRecord = {
        session_id: localStorage.getItem('crush_session_id') || 'local_session',
        visitor_name: localName || 'Anonymous',
        declaration_response: localDeclared ? "YES ❤️" : "Pending",
        answers: formattedLocalAnswers,
        created_at: new Date().toISOString(),
        is_local_mock: true
      };

      // If not already in Supabase results, append to front
      const alreadyExists = responsesList.some(r => 
        r.session_id === localRecord.session_id || 
        (r.visitor_name && r.visitor_name.trim().toLowerCase() === localRecord.visitor_name.trim().toLowerCase())
      );
      if (!alreadyExists) {
        responsesList.unshift(localRecord);
      }
    }

    // Deduplicate responses list by visitor_name (case-insensitive) keeping the most complete / latest record
    const uniqueMap = new Map();
    responsesList.forEach(rec => {
      const nameKey = (rec.visitor_name || 'Anonymous').trim().toLowerCase();
      if (!uniqueMap.has(nameKey)) {
        uniqueMap.set(nameKey, rec);
      } else {
        const existing = uniqueMap.get(nameKey);
        if (!existing.completed && rec.completed) {
          uniqueMap.set(nameKey, rec);
        }
      }
    });

    const uniqueResponsesList = Array.from(uniqueMap.values());
    renderDashboard(uniqueResponsesList);
  }

  function renderDashboard(records) {
    const count = records.length;
    statTotalCount.textContent = count;
    recordsCountBadge.textContent = `${count} ${count === 1 ? 'record' : 'records'}`;

    if (count === 0) {
      emptyState.classList.remove('hidden');
      responsesContainer.innerHTML = '';
      statDeclarationStatus.textContent = 'Waiting...';
      statLatestName.textContent = 'None yet';
      statLatestTime.textContent = 'Never';
      return;
    }

    emptyState.classList.add('hidden');
    responsesContainer.innerHTML = '';

    // Update Overview Metrics with latest record
    const latest = records[0];
    statLatestName.textContent = latest.visitor_name || 'Anonymous';
    statLatestTime.textContent = formatTime(latest.created_at || new Date().toISOString());

    const hasSaidYes = records.some(r => 
      r.declaration_response === 'YES ❤️' || r.declaration_response === 'yes' || r.declaration_accepted === true
    );

    if (hasSaidYes) {
      statDeclarationStatus.textContent = 'YES! Date Confirmed ❤️';
      statDeclarationStatus.style.color = '#34D399';
    } else {
      statDeclarationStatus.textContent = 'Pending...';
      statDeclarationStatus.style.color = '#FF758F';
    }

    // Render Cards for each submission
    records.forEach((record, index) => {
      const card = createResponseCard(record, index);
      responsesContainer.appendChild(card);
    });
  }

  function createResponseCard(record, index) {
    const card = document.createElement('div');
    card.className = 'response-card glass-panel';

    const isYes = record.declaration_response === 'YES ❤️' || record.declaration_response === 'yes' || record.declaration_accepted === true;
    const declarationTagClass = isYes ? 'declaration-tag accepted' : 'declaration-tag';
    const declarationTagText = isYes ? '💍 Date Confirmed: YES ❤️' : '⏳ Date: Pending';

    const timeStr = formatFullDateTime(record.created_at);

    // Build QA HTML
    let qaItemsHTML = '';
    const answersObj = record.answers || {};

    for (let i = 1; i <= 15; i++) {
      const qKey = `question_${i}`;
      const answerVal = answersObj[qKey] || answersObj[`q${i}`] || 'No answer recorded';
      const questionTitle = QUESTION_TITLES[qKey] || `Question ${i}`;

      qaItemsHTML += `
        <div class="qa-item">
          <span class="qa-q">${escapeHTML(questionTitle)}</span>
          <span class="qa-a">${escapeHTML(answerVal)}</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="response-card-header">
        <div class="visitor-info">
          <div class="visitor-name-badge">
            <span>💌</span>
            <h3>${escapeHTML(record.visitor_name || 'Anonymous')}</h3>
          </div>
          <span class="response-time">${escapeHTML(timeStr)}</span>
        </div>

        <div class="response-badges">
          <span class="${declarationTagClass}">${declarationTagText}</span>
          ${record.is_local_mock ? '<span class="source-badge">Local Browser</span>' : '<span class="source-badge">Supabase DB</span>'}
          <button class="delete-card-btn" title="Delete this submission">🗑️ Delete</button>
        </div>
      </div>

      <div class="answers-breakdown">
        <div class="answers-accordion-title">Questionnaire Answers (15/15)</div>
        <div class="qa-grid">
          ${qaItemsHTML}
        </div>
      </div>
    `;

    const singleDeleteBtn = card.querySelector('.delete-card-btn');
    if (singleDeleteBtn) {
      singleDeleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmSingle = confirm(`Delete submission from "${record.visitor_name || 'Anonymous'}"?`);
        if (!confirmSingle) return;

        singleDeleteBtn.disabled = true;
        try {
          if (isSupabaseConfigured && supabaseClient && record.id) {
            await supabaseClient.from('crush_responses').delete().eq('id', record.id);
          } else if (isSupabaseConfigured && supabaseClient && record.session_id) {
            await supabaseClient.from('crush_responses').delete().eq('session_id', record.session_id);
          }

          if (record.is_local_mock || record.session_id === localStorage.getItem('crush_session_id')) {
            localStorage.removeItem('crush_visitor_name');
            localStorage.removeItem('crush_answers');
            localStorage.removeItem('crush_declaration_accepted');
            localStorage.removeItem('crush_session_id');
          }

          card.remove();
          fetchAndRenderResponses();
        } catch (err) {
          console.error("Delete record error:", err);
        }
      });
    }

    return card;
  }

  // ==========================================================================
  // 5. FORMATTING HELPERS
  // ==========================================================================
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

  function formatTime(isoStr) {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  }

  function formatFullDateTime(isoStr) {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' at ' + d.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Date unavailable';
    }
  }

  // ==========================================================================
  // 6. AMBIENT STARFIELD CANVAS
  // ==========================================================================
  const ambientCanvas = document.getElementById('ambient-canvas');
  if (ambientCanvas) {
    const aCtx = ambientCanvas.getContext('2d');
    let aWidth = (ambientCanvas.width = window.innerWidth);
    let aHeight = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      aWidth = ambientCanvas.width = window.innerWidth;
      aHeight = ambientCanvas.height = window.innerHeight;
    });

    const particles = [];
    const count = window.innerWidth < 768 ? 25 : 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * aWidth,
        y: Math.random() * aHeight,
        size: Math.random() * 2 + 0.8,
        speedY: Math.random() * 0.25 + 0.08,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      aCtx.clearRect(0, 0, aWidth, aHeight);
      aCtx.fillStyle = 'rgba(167, 139, 250, 0.4)';

      particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < -10) p.y = aHeight + 10;

        aCtx.beginPath();
        aCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        aCtx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // Check Auth on page load
  checkAuth();

});
