/* ============================================================
   TIARA — PORTFOLIO  |  main.js
   Responsive-aware: touch devices, iOS safe area, mobile UX
   ============================================================ */

/* ── Detect touch/pointer type ───────────────────── */
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Floating Petals (desktop & no reduced-motion only) ── */
(function spawnPetals() {
  if (isTouchDevice || prefersReducedMotion) return; // skip on mobile / accessibility
  const chars = ['✿', '❀', '✾', '❁', '⚘'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = chars[i % chars.length];
    p.style.cssText = `
      left: ${Math.random() * 100}vw;
      animation-duration: ${10 + Math.random() * 15}s;
      animation-delay: ${Math.random() * 10}s;
      font-size: ${0.6 + Math.random() * 0.8}rem;
      color: var(--olive-pale);
    `;
    document.body.appendChild(p);
  }
})();

/* ── Custom Cursor (desktop only) ────────────────── */
(function initCursor() {
  if (isTouchDevice) return;
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
  });

  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animateRing);
  })();

  const hoverEls = document.querySelectorAll('a, button, .org-card, .stat-item, .soft-tag, .edu-card, .timeline-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('active'); ring.classList.add('active'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('active'); ring.classList.remove('active'); });
  });
})();

/* ── Navbar: Shrink + shadow on scroll ────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── Hamburger Menu ───────────────────────────────── */
function toggleMenu() {
  const nav  = document.getElementById('navLinks');
  const btn  = document.getElementById('hamburger');
  const open = nav.classList.toggle('open');
  btn.classList.toggle('open', open);
}
function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// Close menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// Close when tapping outside the panel (left side / scrim area)
document.addEventListener('click', e => {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  if (!nav.classList.contains('open')) return;

  const panelWidth = Math.min(260, window.innerWidth * 0.78);
  const panelLeft  = window.innerWidth - panelWidth;

  // Tapped to the LEFT of panel = scrim area → close
  const tappedScrim   = e.clientX < panelLeft;
  const tappedOutside = !nav.contains(e.target) && !btn.contains(e.target);

  if (tappedScrim || tappedOutside) closeMenu();
});

/* ── Scroll Progress Indicator (desktop only) ─────── */
(function initScrollProgress() {
  const indicator = document.getElementById('scrollInd');
  const bar       = document.getElementById('scrollBar');
  const pctLabel  = document.getElementById('scrollPct');
  if (!indicator) return;

  // Hide on touch devices (CSS also hides at ≤860px)
  if (isTouchDevice) { indicator.style.display = 'none'; return; }

  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
    bar.style.height     = pct + '%';
    pctLabel.textContent = pct + '%';
    indicator.classList.toggle('show', window.scrollY > 200);
  }, { passive: true });
})();

/* ── Reveal Elements on Scroll ─────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .timeline-item, .org-card');

  // Skip animation if reduced motion preferred
  if (prefersReducedMotion) {
    els.forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
    return;
  }

  els.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on index within current batch
        const delay = isTouchDevice ? 0 : i * 60; // no stagger on mobile (feels faster)
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ── Skill Bars Animate on Scroll ──────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');

  if (prefersReducedMotion) {
    bars.forEach(b => { b.style.width = b.dataset.w + '%'; });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.w + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  bars.forEach(b => observer.observe(b));
})();

/* ── Active Nav Link Highlight on Scroll ──────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const update = () => {
    let current = '';
    sections.forEach(section => {
      const offset = section.offsetTop - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80) - 10;
      if (window.scrollY >= offset) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
})();

/* ── iOS Safe Area / Viewport fix ─────────────────── */
(function iosFix() {
  // Fix 100vh on iOS Safari (address bar height changes)
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });
  window.addEventListener('orientationchange', () => {
    // Small delay to let the browser finish the orientation change
    setTimeout(setVH, 200);
  });
})();

/* ── Smooth anchor scroll with offset ─────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// Contoh fungsi untuk me-render data dari Firebase ke HTML
// Anggap 'doc' adalah data komentar yang ditarik dari Firebase Firestore
function renderComment(doc) {
  const commentList = document.getElementById('commentWrapper');
  const emptyState = document.getElementById('emptyState');
  
  // Sembunyikan pesan "Belum ada komentar"
  if (emptyState) emptyState.style.display = 'none';

  const data = doc.data();
  const initial = data.name.charAt(0).toUpperCase();
  const statusHtml = data.status ? `<span class="comment-user-status">${data.status}</span>` : '';

  // Membuat elemen pembungkus komentar
  const commentDiv = document.createElement('div');
  commentDiv.className = 'comment-card-item';
  commentDiv.setAttribute('data-id', doc.id); // Simpan ID Firebase di elemen

  commentDiv.innerHTML = `
    <div class="comment-user-avatar">${initial}</div>
    <div class="comment-body">
      <div class="comment-meta">
        <div class="comment-header-row">
          <div>
            <h4 class="comment-user-name">${data.name}</h4>
            ${statusHtml}
          </div>
          <button class="comment-delete-btn" onclick="deleteComment('${doc.id}')">Hapus</button>
        </div>
        <span class="comment-timestamp">${data.timestamp}</span>
      </div>
      <p class="comment-text-content">${data.message}</p>
    </div>
  `;

  // Masukkan komentar ke daftar
  commentList.prepend(commentDiv);
}

// Fungsi kerangka untuk menghapus data dari Firebase
async function deleteComment(docId) {
  const confirmDelete = confirm("Apakah Anda yakin ingin menghapus komentar ini?");
  if (confirmDelete) {
    try {
      // Logika Firebase Anda di sini nanti
      // await deleteDoc(doc(db, "comments", docId));
      
      // Hapus elemen dari tampilan antarmuka secara langsung
      const commentElement = document.querySelector(`.comment-card-item[data-id="${docId}"]`);
      if (commentElement) {
        commentElement.remove();
      }
      
      // Munculkan kembali pesan kosong jika tidak ada komentar tersisa
      const wrapper = document.getElementById('commentWrapper');
      if (wrapper && wrapper.querySelectorAll('.comment-card-item').length === 0) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.style.display = 'block';
      }
      
    } catch (error) {
      console.error("Gagal menghapus komentar: ", error);
    }
  }
}