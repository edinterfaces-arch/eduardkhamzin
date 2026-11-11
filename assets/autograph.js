// Visitor autographs drawn on the page background.
// Saved autographs are drawn faintly behind the profile; "Оставить автограф"
// opens a drawing layer. Coordinates are CSS pixels from the viewport centre.
(() => {
  const API = '/api/autographs';
  const MAX_POINTS = 1200;
  const MIN_STEP = 2; // px between recorded points

  document.addEventListener('DOMContentLoaded', async () => {
    const button = document.querySelector('.autograph-button');
    const background = document.querySelector('.autograph-background');
    const layer = document.querySelector('.autograph-layer');
    const pad = layer?.querySelector('canvas');
    const toolbar = document.querySelector('.autograph-toolbar');
    if (!button || !background || !pad || !toolbar) return;
    const save = toolbar.querySelector('[data-action="save"]');
    const cancel = toolbar.querySelector('[data-action="cancel"]');
    const status = toolbar.querySelector('.autograph-status');

    let saved = [];
    let draft = [];
    let stroke = null;
    let sending = false;

    try {
      const response = await fetch(API, { headers: { Accept: 'application/json' } });
      if (!response.ok) return; // no API on this host: keep the feature hidden
      saved = (await response.json()).autographs || [];
    } catch {
      return;
    }

    function fit(canvas) {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      const context = canvas.getContext('2d');
      context.setTransform(ratio, 0, 0, ratio, (innerWidth / 2) * ratio, (innerHeight / 2) * ratio);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      return context;
    }

    function paint(context, strokes, width) {
      context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#111';
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
      const context = fit(background);
      for (const item of saved) paint(context, item.strokes, 2);
    }

    function renderPad() {
      paint(fit(pad), draft, 2.5);
    }

    function pointCount() {
      return draft.reduce((sum, points) => sum + points.length / 2, 0);
    }

    function point(event) {
      return [Math.round(event.clientX - innerWidth / 2), Math.round(event.clientY - innerHeight / 2)];
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
      setStatus('Нарисуйте автограф');
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
      button.focus();
    }

    pad.addEventListener('pointerdown', (event) => {
      if (sending || pointCount() >= MAX_POINTS) return;
      pad.setPointerCapture(event.pointerId);
      stroke = point(event);
      draft.push(stroke);
      renderPad();
    });
    pad.addEventListener('pointermove', (event) => {
      if (!stroke || pointCount() >= MAX_POINTS) return;
      const [x, y] = point(event);
      const lastX = stroke[stroke.length - 2];
      const lastY = stroke[stroke.length - 1];
      if (Math.hypot(x - lastX, y - lastY) < MIN_STEP) return;
      stroke.push(x, y);
      renderPad();
    });
    const finish = () => {
      if (!stroke) return;
      stroke = null;
      save.disabled = draft.length === 0;
      setStatus(pointCount() >= MAX_POINTS ? 'Места больше нет — сохраните автограф' : 'Можно дописать или сохранить');
    };
    pad.addEventListener('pointerup', finish);
    pad.addEventListener('pointercancel', finish);

    save.addEventListener('click', async () => {
      if (!draft.length || sending) return;
      sending = true;
      save.disabled = true;
      setStatus('Сохраняю…');
      try {
        const response = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strokes: draft }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(response.status === 429 ? 'Слишком много автографов, попробуйте позже' : 'Не получилось сохранить');
        saved.push(body.autograph);
        renderBackground();
        close();
        button.querySelector('.autograph-label').textContent = 'Спасибо!';
        setTimeout(() => { button.querySelector('.autograph-label').textContent = 'Оставить автограф'; }, 3000);
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
        if (!layer.hidden) renderPad();
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
