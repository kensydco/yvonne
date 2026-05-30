/**
 * LeadHER CRE — floating chat widget
 * Replace WORKER_URL with your deployed Cloudflare Worker URL.
 */
(function () {
  const WORKER_URL = 'https://yvonne-chat.klburnett.workers.dev';

  const OPENER = [
    "Hi! I'm Yvonne's assistant. Ask me about her services, LeadHER CRE, or The Commercial Pivot.",
  ];

  /* ── inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    #lh-chat-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 9998;
      width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
      background: #0c2233; box-shadow: 0 8px 28px -6px rgba(12,34,51,.65);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #lh-chat-btn:hover { transform: scale(1.07); box-shadow: 0 12px 32px -6px rgba(12,34,51,.75); }
    #lh-chat-btn svg { width: 26px; height: 26px; }
    #lh-chat-btn .lh-close { display: none; }
    #lh-chat-btn.open .lh-open  { display: none; }
    #lh-chat-btn.open .lh-close { display: block; }

    #lh-chat-panel {
      position: fixed; bottom: 96px; right: 28px; z-index: 9997;
      width: 360px; max-width: calc(100vw - 40px);
      background: #f6f0e4; border: 1px solid #d4c9b0;
      box-shadow: 0 24px 60px -12px rgba(12,34,51,.35);
      display: flex; flex-direction: column; overflow: hidden;
      transform: translateY(12px) scale(.97); opacity: 0;
      pointer-events: none;
      transition: opacity .22s ease, transform .22s ease;
    }
    #lh-chat-panel.open {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
    }

    #lh-chat-head {
      background: #0c2233; padding: 16px 18px;
      display: flex; align-items: center; gap: 12px;
    }
    #lh-chat-head .lh-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #1a3348; border: 1.5px solid #b5884b;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-family: Georgia, serif; font-size: 14px; font-weight: 700;
      color: #f6f0e4; letter-spacing: -.01em;
    }
    #lh-chat-head .lh-hd-name {
      font-family: 'Hanken Grotesk', sans-serif; font-size: 14px;
      font-weight: 600; color: #f6f0e4; letter-spacing: .01em;
    }
    #lh-chat-head .lh-hd-sub {
      font-family: 'Hanken Grotesk', sans-serif; font-size: 11px;
      color: #b5884b; letter-spacing: .04em; text-transform: uppercase;
      margin-top: 1px;
    }

    #lh-chat-msgs {
      flex: 1; overflow-y: auto; padding: 18px 16px;
      display: flex; flex-direction: column; gap: 12px;
      max-height: 340px; min-height: 180px;
      scroll-behavior: smooth;
    }
    #lh-chat-msgs::-webkit-scrollbar { width: 4px; }
    #lh-chat-msgs::-webkit-scrollbar-track { background: transparent; }
    #lh-chat-msgs::-webkit-scrollbar-thumb { background: #d4c9b0; border-radius: 4px; }

    .lh-msg {
      max-width: 88%; font-family: 'Hanken Grotesk', sans-serif;
      font-size: 13.5px; line-height: 1.55; border-radius: 2px;
      padding: 10px 13px; animation: lhfadein .18s ease;
    }
    @keyframes lhfadein { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; } }
    .lh-msg.bot {
      background: #0c2233; color: #f6f0e4; align-self: flex-start;
      border-bottom-left-radius: 0;
    }
    .lh-msg.user {
      background: #b5884b; color: #fff; align-self: flex-end;
      border-bottom-right-radius: 0;
    }
    .lh-msg.error { background: #5c1a1a; color: #f6d8d8; align-self: flex-start; font-size: 13px; }

    .lh-dots {
      display: flex; gap: 5px; padding: 10px 13px;
      background: #0c2233; align-self: flex-start;
      border-radius: 2px; border-bottom-left-radius: 0;
    }
    .lh-dots span {
      width: 6px; height: 6px; border-radius: 50%; background: #b5884b;
      animation: lhbounce 1.2s infinite ease-in-out;
    }
    .lh-dots span:nth-child(2) { animation-delay: .18s; }
    .lh-dots span:nth-child(3) { animation-delay: .36s; }
    @keyframes lhbounce { 0%,80%,100% { transform: scale(.65); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }

    #lh-chat-form {
      display: flex; gap: 0; border-top: 1px solid #d4c9b0;
      background: #fff;
    }
    #lh-chat-input {
      flex: 1; border: none; outline: none; padding: 13px 14px;
      font-family: 'Hanken Grotesk', sans-serif; font-size: 13.5px;
      background: transparent; color: #0c2233; resize: none;
      line-height: 1.45;
    }
    #lh-chat-input::placeholder { color: #9b8f7a; }
    #lh-chat-send {
      width: 46px; flex-shrink: 0; border: none; cursor: pointer;
      background: #0c2233; color: #b5884b;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    #lh-chat-send:hover { background: #1a3348; }
    #lh-chat-send svg { width: 18px; height: 18px; }
    #lh-chat-send:disabled { opacity: .45; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  /* ── build DOM ── */
  const btn = document.createElement('button');
  btn.id = 'lh-chat-btn';
  btn.setAttribute('aria-label', 'Chat with Yvonne\'s assistant');
  btn.innerHTML = `
    <svg class="lh-open" viewBox="0 0 24 24" fill="none" stroke="#b5884b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="lh-close" viewBox="0 0 24 24" fill="none" stroke="#b5884b" stroke-width="2" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`;

  const panel = document.createElement('div');
  panel.id = 'lh-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat assistant');
  panel.innerHTML = `
    <div id="lh-chat-head">
      <div class="lh-avatar">LH</div>
      <div>
        <div class="lh-hd-name">LeadHER CRE Assistant</div>
        <div class="lh-hd-sub">Powered by Yvonne's knowledge</div>
      </div>
    </div>
    <div id="lh-chat-msgs"></div>
    <form id="lh-chat-form" autocomplete="off">
      <input id="lh-chat-input" type="text" placeholder="Ask about services, LeadHER CRE…" maxlength="400" />
      <button id="lh-chat-send" type="submit" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>`;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  /* ── state ── */
  const msgs = document.getElementById('lh-chat-msgs');
  const input = document.getElementById('lh-chat-input');
  const send = document.getElementById('lh-chat-send');
  const form = document.getElementById('lh-chat-form');
  const history = [];

  /* ── helpers ── */
  function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = 'lh-msg ' + role;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function showDots() {
    const el = document.createElement('div');
    el.className = 'lh-dots';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  /* ── opener ── */
  addMsg('bot', OPENER[0]);

  /* ── toggle ── */
  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => input.focus(), 220);
  });

  /* ── send ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    send.disabled = true;
    addMsg('user', text);
    history.push({ role: 'user', content: text });

    const dots = showDots();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      dots.remove();
      if (data.error) throw new Error(data.error);
      const reply = data.reply;
      history.push({ role: 'assistant', content: reply });
      addMsg('bot', reply);
    } catch (err) {
      dots.remove();
      addMsg('error', 'Sorry, something went wrong. Please try again.');
      history.pop();
    } finally {
      send.disabled = false;
      input.focus();
    }
  });

  /* ── enter to send (shift+enter = newline if input were textarea) ── */
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
