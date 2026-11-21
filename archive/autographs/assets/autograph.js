// Visitor autographs drawn on the page background.
// Saved autographs are drawn faintly behind the profile. "Оставить автограф"
// opens a signature box: draw inside it, drag it by its handle to place the
// autograph anywhere, then save. Stored coordinates are CSS pixels from the
// viewport centre, so autographs keep their place around the centred profile.
(() => {
  const API = '/api/autographs';
  const MAX_POINTS = 1200;
  const MIN_STEP = 2; // px between recorded points
  const EDGE = 8; // px kept between the box and the screen edge

  document.addEventListener('DOMContentLoaded', async () => {
    const button = document.querySelector('.autograph-button');
    const background = document.querySelector('.autograph-background');
    const layer = document.querySelector('.autograph-layer');
    const box = layer?.querySelector('.autograph-pad');
    const handle = box?.querySelector('.autograph-handle');
    const pad = box?.querySelector('canvas');
    const toolbar = document.querySelector('.autograph-toolbar');
    if (!button || !background || !box || !handle || !pad || !toolbar) return;
    const save = toolbar.querySelector('[data-action="save"]');
    const cancel = toolbar.querySelector('[data-action="cancel"]');
    const status = toolbar.querySelector('.autograph-status');
    const label = button.querySelector('.autograph-label');

    let saved = [];
    let draft = []; // strokes in the box's own coordinates
    let stroke = null;
    let drag = null;
    let position = { left: 0, top: 0 };
    let sending = false;

    try {
      const response = await fetch(API, { headers: { Accept: 'application/json' } });
      if (!response.ok) return; // no API on this host: keep the feature hidden
      saved = (await response.json()).autographs || [];
    } catch {
      return;
    }

    const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#111';

    function fit(canvas, width, height, originX, originY) {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const context = canvas.getContext('2d');
      context.setTransform(ratio, 0, 0, ratio, originX * ratio, originY * ratio);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      return context;
    }

    function paint(context, strokes, width) {
      context.strokeStyle = ink();
      context.lineWidth = width;
      for (const points of strokes) {
        context.beginPath();
        context.moveTo(points[0], points[1]);
        if (points.length === 2) context.lineTo(points[0] + 0.1, points[1]);
        for (let i = 2; i < points.length; i += 2) context.lineTo(points[i], points[i + 1]);
        context.stroke();
      }
    }

    function renderBackground() {
      const context = fit(background, innerWidth, innerHeight, innerWidth / 2, innerHeight / 2);
      for (const item of saved) paint(context, item.strokes, 2);
    }

    function renderPad() {
      paint(fit(pad, pad.clientWidth, pad.clientHeight, 0, 0), draft, 2.5);
    }

    function place(left, top) {
      position = {
        left: Math.min(Math.max(EDGE, left), Math.max(EDGE, innerWidth - box.offsetWidth - EDGE)),
        top: Math.min(Math.max(EDGE, top), Math.max(EDGE, innerHeight - box.offsetHeight - EDGE)),
      };
      box.style.transform = `translate(${Math.round(position.left)}px, ${Math.round(position.top)}px)`;
    }

    const pointCount = () => draft.reduce((sum, points) => sum + points.length / 2, 0);

    function local(event) {
      const rect = pad.getBoundingClientRect();
      return [Math.round(event.clientX - rect.left), Math.round(event.clientY - rect.top)];
    }

    // Convert the box's strokes to page coordinates (relative to the viewport centre).
    function toPage() {
      const rect = pad.getBoundingClientRect();
      const dx = Math.round(rect.left - innerWidth / 2);
      const dy = Math.round(rect.top - innerHeight / 2);
      return draft.map((points) => points.map((value, i) => value + (i % 2 ? dy : dx)));
    }

    function capture(element, event) {
      try { element.setPointerCapture(event.pointerId); } catch {}
    }

    function setStatus(text) {
      status.textContent = text;
    }

    function open() {
      draft = [];
      document.body.classList.add('autograph-drawing');
      layer.hidden = false;
      toolbar.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      save.disabled = true;
      setStatus('Распишитесь в рамке');
      place((innerWidth - box.offsetWidth) / 2, (innerHeight - box.offsetHeight) / 2);
      renderPad();
      cancel.focus();
    }

    function close() {
      document.body.classList.remove('autograph-drawing');
      layer.hidden = true;
      toolbar.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      draft = [];
      stroke = null;
      drag = null;
      button.focus();
    }

    // Drawing inside the box.
    pad.addEventListener('pointerdown', (event) => {
      if (sending || pointCount() >= MAX_POINTS) return;
      capture(pad, event);
      stroke = local(event);
      draft.push(stroke);
      renderPad();
    });
    pad.addEventListener('pointermove', (event) => {
      if (!stroke || pointCount() >= MAX_POINTS) return;
      const [x, y] = local(event);
      if (Math.hypot(x - stroke[stroke.length - 2], y - stroke[stroke.length - 1]) < MIN_STEP) return;
      stroke.push(x, y);
      renderPad();
    });
    const finishStroke = () => {
      if (!stroke) return;
      stroke = null;
      save.disabled = draft.length === 0;
      setStatus(pointCount() >= MAX_POINTS
        ? 'Места больше нет — сохраните автограф'
        : 'Перетащите рамку, куда хотите, и сохраните');
    };
    pad.addEventListener('pointerup', finishStroke);
    pad.addEventListener('pointercancel', finishStroke);

    // Moving the box by its handle (pointer) or with the arrow keys.
    handle.addEventListener('pointerdown', (event) => {
      capture(handle, event);
      drag = { x: event.clientX - position.left, y: event.clientY - position.top };
      box.classList.add('is-dragging');
    });
    handle.addEventListener('pointermove', (event) => {
      if (drag) place(event.clientX - drag.x, event.clientY - drag.y);
    });
    const finishDrag = () => {
      drag = null;
      box.classList.remove('is-dragging');
    };
    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
    handle.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 40 : 10;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (!moves[event.key]) return;
      event.preventDefault();
      place(position.left + moves[event.key][0], position.top + moves[event.key][1]);
    });

    save.addEventListener('click', async () => {
      if (!draft.length || sending) return;
      sending = true;
      save.disabled = true;
      setStatus('Сохраняю…');
      try {
        const response = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strokes: toPage() }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(response.status === 429
            ? 'Слишком много автографов, попробуйте позже'
            : `Не получилось сохранить (${response.status})`);
        }
        saved.push(body.autograph);
        renderBackground();
        close();
        label.textContent = 'Спасибо!';
        setTimeout(() => { label.textContent = 'Оставить автограф'; }, 3000);
      } catch (error) {
        setStatus(error.message || 'Не получилось сохранить');
        save.disabled = false;
      } finally {
        sending = false;
      }
    });
    cancel.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !layer.hidden) close();
    });
    button.addEventListener('click', () => (layer.hidden ? open() : close()));

    let resizeFrame = 0;
    addEventListener('resize', () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        renderBackground();
        if (!layer.hidden) {
          place(position.left, position.top);
          renderPad();
        }
      });
    });
    // Repaint in the new ink colour when the theme changes.
    new MutationObserver(() => {
      renderBackground();
      if (!layer.hidden) renderPad();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    renderBackground();
    button.hidden = false;
  });
})();
