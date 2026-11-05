import { animate as animateScroll, scroll, stagger } from 'motion';
import { animate } from 'motion/mini';

// Leo's word reveals: 6px blur, 14px lift, 50ms stagger and an ease-out.
// Everything starts as readable HTML; only this enhancement prepares entrances.
const ease = [0.22, 1, 0.36, 1] as const;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const seen = new WeakSet<HTMLElement>();
let cleanup: (() => void)[] = [];

document.querySelectorAll<HTMLElement>('[data-motion-content]').forEach((article) => {
  [...article.children].forEach((child) => {
    if (child instanceof HTMLElement) child.dataset.motion = 'reveal';
  });
});

function splitWords(element: HTMLElement) {
  if (element.querySelector('.motion-word')) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    (node.textContent ?? '').split(/(\s+)/).forEach((part) => {
      if (!part || /^\s+$/.test(part)) fragment.append(document.createTextNode(part));
      else {
        const word = document.createElement('span');
        word.className = 'motion-word';
        word.textContent = part;
        fragment.append(word);
      }
    });
    node.replaceWith(fragment);
  });
}

// Keep the original text in the accessibility tree and hide only its visual copy.
document.querySelectorAll<HTMLElement>('.button, .text-link, .site-header nav a').forEach((link) => {
  [...link.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return;
    const label = document.createElement('span');
    label.className = 'motion-label';
    const original = document.createElement('span');
    original.className = 'motion-label-original';
    original.textContent = node.textContent;
    const copy = original.cloneNode(true) as HTMLElement;
    copy.className = 'motion-label-copy';
    copy.setAttribute('aria-hidden', 'true');
    label.append(original, copy);
    node.replaceWith(label);
  });
});

function updateMotion() {
  cleanup.forEach((stop) => stop());
  cleanup = [];
  if (reduced.matches) return;

  const active = new Map<HTMLElement, () => void>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) reveal(entry.target as HTMLElement);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
  cleanup.push(() => observer.disconnect());

  function reveal(element: HTMLElement, immediate = false) {
    observer.unobserve(element);
    if (seen.has(element)) return;
    seen.add(element);
    const words = [...element.querySelectorAll<HTMLElement>('.motion-word')];
    const targets = words.length ? words : [element];
    const reset = () => {
      targets.forEach((target) => {
        target.style.removeProperty('opacity');
        target.style.removeProperty('transform');
        target.style.removeProperty('filter');
      });
      element.dataset.motionState = 'visible';
      active.delete(element);
    };
    if (immediate) { reset(); return; }
    element.dataset.motionState = 'entering';
    const effect = animate(targets, {
      opacity: [0, 1], transform: [`translateY(${words.length ? 14 : 16}px)`, 'none'],
      ...(words.length ? { filter: ['blur(6px)', 'blur(0px)'] } : {}),
    }, {
      duration: 0.8, ease,
      delay: words.length ? stagger(0.05, { startDelay: Number(element.dataset.motionDelay ?? 0) }) : Number(element.dataset.motionDelay ?? 0),
    });
    const stop = () => { effect.cancel(); reset(); };
    active.set(element, stop);
    effect.then(() => { effect.cancel(); reset(); });
  }

  const pending: HTMLElement[] = [];
  const entrances = [...document.querySelectorAll<HTMLElement>('[data-motion]')].filter((element) => !seen.has(element));
  entrances.forEach((element) => {
    if (element.dataset.motion === 'text') splitWords(element);
  });
  // Read geometry in a batch, before changing any entrance styles.
  const positions = entrances.map((element) => element.getBoundingClientRect().top);
  entrances.forEach((element, index) => {
    // Don't conceal content above a restored scroll position or an anchor target.
    if (positions[index] < 0 || element.contains(document.activeElement)) {
      reveal(element, true);
      return;
    }
    element.dataset.motionState = 'pending';
    pending.push(element);
    observer.observe(element);
  });
  const showFocused = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>('[data-motion]');
    if (!element) return;
    active.get(element)?.();
    reveal(element, true);
  };
  document.addEventListener('focusin', showFocused);
  cleanup.push(() => {
    document.removeEventListener('focusin', showFocused);
    active.forEach((stop) => stop());
    pending.forEach((element) => { element.dataset.motionState = 'visible'; });
  });

  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((image) => {
    const effect = animateScroll(image, { y: [12, -12] }, { ease: 'linear' });
    cleanup.push(scroll(effect, { target: image, offset: ['start end', 'end start'] }));
    cleanup.push(() => { effect.cancel(); image.style.removeProperty('transform'); });
  });

  if (!finePointer.matches) return;
  document.querySelectorAll<HTMLElement>('.button').forEach((button) => {
    const reset = () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || button.matches(':focus-visible')) return;
      const rect = button.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      button.style.setProperty('--magnet-x', `${Math.max(-4, Math.min(4, x))}px`);
      button.style.setProperty('--magnet-y', `${Math.max(-3, Math.min(3, y))}px`);
    };
    button.addEventListener('pointermove', move);
    button.addEventListener('pointerleave', reset);
    button.addEventListener('blur', reset);
    cleanup.push(() => {
      button.removeEventListener('pointermove', move);
      button.removeEventListener('pointerleave', reset);
      button.removeEventListener('blur', reset);
      reset();
    });
  });
}

updateMotion();
reduced.addEventListener('change', updateMotion);
finePointer.addEventListener('change', updateMotion);
