/* 글씨 크기 조절: 배율(--fs)을 올리고 내린다. 덱(m*.html)과 타임테이블(index.html) 모두에서 동작.
   줄이는 쪽으로도 열어 두고, 고른 배율은 저장해 다른 장/다른 모듈에서도 그대로 쓴다. */
(function () {
  var MIN = 0.7, MAX = 1.6, STEP = 0.05, BASE = 0.9, KEY = 'okf-fs';
  var fs = BASE;
  try {
    var saved = parseFloat(localStorage.getItem(KEY));
    if (saved >= MIN && saved <= MAX) fs = saved;
  } catch (e) {}

  var ctl = document.createElement('div');
  ctl.className = 'fontctl';
  ctl.innerHTML =
    '<span class="fc-lbl">글씨 크기</span>' +
    '<button type="button" class="fc-small" data-fs="down" aria-label="글씨 작게">가－</button>' +
    '<span class="fc-now">100%</span>' +
    '<button type="button" class="fc-big" data-fs="up" aria-label="글씨 크게">가＋</button>' +
    '<button type="button" class="fc-reset" data-fs="reset" aria-label="글씨 원래대로">기본</button>' +
    '<button type="button" class="fc-hc" data-hc aria-pressed="false" aria-label="진하게 보기">진하게</button>';
  document.body.appendChild(ctl);
  var bMin = ctl.querySelector('[data-fs="down"]');
  var bMax = ctl.querySelector('[data-fs="up"]');
  var now = ctl.querySelector('.fc-now');

  function applyFs() {
    fs = Math.round(fs * 100) / 100;
    document.documentElement.style.setProperty('--fs', fs);
    now.textContent = Math.round(fs * 100) + '%';
    bMin.disabled = fs <= MIN + 1e-9;
    bMax.disabled = fs >= MAX - 1e-9;
    try { localStorage.setItem(KEY, fs); } catch (e) {}
  }
  /* 진하게 보기 — 프로젝터가 연하게 나올 때만 켠다. 켠 상태도 저장한다. */
  var HC = 'okf-hc';
  var hcBtn = ctl.querySelector('[data-hc]');
  function applyHc(on) {
    document.body.classList.toggle('hc', on);
    hcBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    try { localStorage.setItem(HC, on ? '1' : '0'); } catch (e) {}
  }
  var hcOn = false;
  try { hcOn = localStorage.getItem(HC) === '1'; } catch (e) {}
  applyHc(hcOn);

  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-hc')) { applyHc(!document.body.classList.contains('hc')); return; }
    var act = b.getAttribute('data-fs');
    if (act === 'up') fs = Math.min(MAX, fs + STEP);
    else if (act === 'down') fs = Math.max(MIN, fs - STEP);
    else fs = BASE;
    applyFs();
  });
  // 키보드로도: - / + (덱에서 슬라이드 넘김과 겹치지 않는 키)
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (e.key === '-' || e.key === '_') { fs = Math.max(MIN, fs - STEP); applyFs(); }
    else if (e.key === '+' || e.key === '=') { fs = Math.min(MAX, fs + STEP); applyFs(); }
    else if (e.key === '0') { fs = BASE; applyFs(); }
  });
  applyFs();
})();

/* 강의자료 덱 조작: 방향키/스페이스로 넘기기, F 전체화면, ESC 목차 */
(function () {
  var box = document.querySelector('.slides');
  if (!box) return;
  var slides = Array.prototype.slice.call(box.querySelectorAll('.slide'));
  var prog = document.querySelector('.prog');
  var count = document.querySelector('.count');
  var total = slides.length;

  /* offsetTop 은 zoom(--fs) 이 걸리기 전 좌표라 scrollTop 과 단위가 다르다.
     배율이 1이 아니면 어긋나므로, 실제 화면 좌표(getBoundingClientRect)로 계산한다. */
  function offsetOf(s) {
    return box.scrollTop + s.getBoundingClientRect().top - box.getBoundingClientRect().top;
  }

  function current() {
    var top = box.scrollTop, best = 0, gap = Infinity;
    slides.forEach(function (s, i) {
      var d = Math.abs(offsetOf(s) - top);
      if (d < gap) { gap = d; best = i; }
    });
    return best;
  }

  function paint() {
    var i = current();
    if (count) count.textContent = (i + 1) + ' / ' + total;
    if (prog) prog.style.width = (total < 2 ? 100 : (i / (total - 1)) * 100) + '%';
    if (location.hash !== '#s' + (i + 1)) {
      history.replaceState(null, '', '#s' + (i + 1));
    }
  }

  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    closeFn();
    box.scrollTo({ top: offsetOf(slides[i]), behavior: 'smooth' });
  }

  var tick;
  box.addEventListener('scroll', function () {
    clearTimeout(tick);
    tick = setTimeout(paint, 90);
  });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA') return;

    // 한글 입력 상태에서는 F 가 e.key='ㄹ' 로 들어온다. 자판 위치(e.code)로 판단한다.
    if (e.code === 'KeyF') {
      e.preventDefault();
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(function () {});
      return;
    }

    switch (e.key) {
      // 좌우 = 장 넘기기 / 위아래 = 지금 장 안에서 훑어보기(기본 스크롤에 맡긴다)
      case 'ArrowRight': case 'PageDown': case ' ':
        e.preventDefault(); go(current() + 1); break;
      case 'ArrowLeft': case 'PageUp':
        e.preventDefault(); go(current() - 1); break;
      case 'ArrowDown': case 'ArrowUp':
        box.scrollBy({ top: e.key === 'ArrowDown' ? 90 : -90, behavior: 'auto' });
        e.preventDefault(); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(total - 1); break;
      case 'Escape':
        if (document.body.classList.contains('lb-open')) { closeLightbox(); break; }
        if (document.body.classList.contains('fn-open')) { closeFn(); break; }
        if (!document.fullscreenElement) location.href = 'index.html';
        break;
    }
  });

  // 처음 열 때 해시가 있으면 그 장으로
  if (/^#s\d+$/.test(location.hash)) {
    var n = parseInt(location.hash.slice(2), 10) - 1;
    window.addEventListener('load', function () { go(n); });
  }
  // 같은 문서 안에서 #s3 같은 링크를 눌렀을 때 (스크롤로 바뀐 해시는 replaceState라 여기 걸리지 않는다)
  window.addEventListener('hashchange', function () {
    if (/^#s\d+$/.test(location.hash)) go(parseInt(location.hash.slice(2), 10) - 1);
  });

  /* ---------- 이미지 확대 보기 ---------- */
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<img alt=""><span class="lb-x" aria-hidden="true">닫기 Esc</span>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    document.body.classList.add('lb-open');
  }
  function closeLightbox() {
    document.body.classList.remove('lb-open');
    setTimeout(function () { lbImg.src = ''; }, 200);
  }
  lb.addEventListener('click', closeLightbox);

  document.addEventListener('click', function (e) {
    var img = e.target.closest('figure.dia img, .samples img');
    if (!img) return;
    e.preventDefault();
    openLightbox(img.src, img.alt);
  });

  /* ---------- 체크리스트 ---------- */
  document.addEventListener('click', function (e) {
    var li = e.target.closest('ul.check > li');
    if (!li) return;
    li.classList.toggle('on');
  });

  /* ---------- 용어 설명 ----------
     본문의 .ft 를 누르면 같은 이름의 .fn 항목 하나만 아래에 띄운다.
     .fn 블록은 화면에 깔지 않고 설명 원문을 담아 두는 자리로만 쓴다. */
  var terms = {};
  Array.prototype.forEach.call(document.querySelectorAll('.fn p'), function (p) {
    var b = p.querySelector('b');
    if (!b) return;
    var key = b.textContent.trim();
    if (!terms[key]) terms[key] = p.innerHTML;
  });

  var fnbox = document.createElement('div');
  fnbox.className = 'fnbox';
  fnbox.setAttribute('role', 'note');
  document.body.appendChild(fnbox);

  var openTerm = null;

  function closeFn() {
    if (!openTerm) return;
    document.body.classList.remove('fn-open');
    var lit = document.querySelector('.ft.on');
    if (lit) lit.classList.remove('on');
    openTerm = null;
  }

  function showFn(el) {
    var key = el.textContent.trim();
    if (!terms[key]) return;
    if (openTerm === key) { closeFn(); return; }
    closeFn();
    fnbox.innerHTML = '<p>' + terms[key] + '</p>' +
      '<button type="button" class="fn-x">닫기</button>';
    el.classList.add('on');
    document.body.classList.add('fn-open');
    openTerm = key;
  }

  // 설명이 없는 용어는 눌러도 아무 일이 없으므로 손 모양도 주지 않는다
  Array.prototype.forEach.call(document.querySelectorAll('.ft'), function (el) {
    if (!terms[el.textContent.trim()]) el.classList.add('no-fn');
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('.fn-x')) { closeFn(); return; }
    var ft = e.target.closest('.ft');
    if (ft) { e.preventDefault(); showFn(ft); return; }
    if (openTerm && !e.target.closest('.fnbox')) closeFn();
  });

  paint();
})();