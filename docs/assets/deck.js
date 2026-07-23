/* 글씨 크기 조절: 배율(--fs)을 올리고 내린다. 덱(m*.html)과 타임테이블(index.html) 모두에서 동작 */
(function () {
  var MIN = 1, MAX = 1.6, STEP = 0.1, fs = 1;
  var ctl = document.createElement('div');
  ctl.className = 'fontctl';
  ctl.innerHTML =
    '<span class="fc-lbl">글씨</span>' +
    '<button type="button" class="fc-small" data-fs="down" aria-label="글씨 작게">가－</button>' +
    '<button type="button" class="fc-big" data-fs="up" aria-label="글씨 크게">가＋</button>' +
    '<button type="button" class="fc-reset" data-fs="reset" aria-label="글씨 원래대로">기본</button>';
  document.body.appendChild(ctl);
  var bMin = ctl.querySelector('[data-fs="down"]');
  var bMax = ctl.querySelector('[data-fs="up"]');

  function applyFs() {
    fs = Math.round(fs * 10) / 10;
    document.documentElement.style.setProperty('--fs', fs);
    bMin.disabled = fs <= MIN + 1e-9;
    bMax.disabled = fs >= MAX - 1e-9;
  }
  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var act = b.getAttribute('data-fs');
    if (act === 'up') fs = Math.min(MAX, fs + STEP);
    else if (act === 'down') fs = Math.max(MIN, fs - STEP);
    else fs = 1;
    applyFs();
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

  function current() {
    var top = box.scrollTop, best = 0, gap = Infinity;
    slides.forEach(function (s, i) {
      var d = Math.abs(s.offsetTop - top);
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
    box.scrollTo({ top: slides[i].offsetTop, behavior: 'smooth' });
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

    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); go(current() + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); go(current() - 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(total - 1); break;
      case 'f': case 'F':
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
      case 'Escape':
        if (!document.fullscreenElement) location.href = 'index.html';
        break;
    }
  });

  // 처음 열 때 해시가 있으면 그 장으로
  if (/^#s\d+$/.test(location.hash)) {
    var n = parseInt(location.hash.slice(2), 10) - 1;
    window.addEventListener('load', function () { go(n); });
  }
  paint();
})();
