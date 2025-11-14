import './widget.css';

const STORAGE_KEY = 'accessibility-widget-state-v1';
const DEFAULT_LOCALE = 'tr';

const translations = {
  en: {
    openLabel: 'Open accessibility options',
    closeLabel: 'Close accessibility options',
    panelTitle: 'Accessibility options',
    highContrast: 'High contrast',
    textSize: 'Text size',
    lineHeight: 'Line spacing',
    colorFilter: 'Color filter',
    animations: 'Stop animations',
    reset: 'Reset adjustments',
    keyboardHint: 'Keyboard shortcut: Ctrl + Alt + A',
    textSizeDefault: 'Default',
    textSizeLarge: 'Large',
    textSizeXL: 'Extra large',
    lineHeightDefault: 'Default',
    lineHeightRelaxed: 'Relaxed',
    filterNone: 'None',
    filterGrayscale: 'Grayscale',
    filterSepia: 'Sepia',
    animationsLabel: 'Pause animations and transitions',
    highContrastDescription: 'Increase contrast for better readability.',
    persistNotice: 'Settings are saved in this browser.',
    ariaAnnouncement: 'Accessibility widget ready',
    colorThemeHint: 'Match widget with page theme by toggling body class.'
  },
  tr: {
    openLabel: 'Erişilebilirlik seçeneklerini aç',
    closeLabel: 'Erişilebilirlik seçeneklerini kapat',
    panelTitle: 'Erişilebilirlik seçenekleri',
    highContrast: 'Yüksek kontrast',
    textSize: 'Metin boyutu',
    lineHeight: 'Satır aralığı',
    colorFilter: 'Renk filtresi',
    animations: 'Animasyonları durdur',
    reset: 'Ayarları sıfırla',
    keyboardHint: 'Klavye kısayolu: Ctrl + Alt + A',
    textSizeDefault: 'Varsayılan',
    textSizeLarge: 'Büyük',
    textSizeXL: 'Çok büyük',
    lineHeightDefault: 'Varsayılan',
    lineHeightRelaxed: 'Genişletilmiş',
    filterNone: 'Yok',
    filterGrayscale: 'Gri tonlama',
    filterSepia: 'Sepya',
    animationsLabel: 'Animasyonları ve geçişleri durdur',
    highContrastDescription: 'Okunabilirliği artırmak için kontrastı yükseltir.',
    persistNotice: 'Ayarlar bu tarayıcıda saklanır.',
    ariaAnnouncement: 'Erişilebilirlik aracı hazır',
    colorThemeHint: 'Sayfa temasına göre gövde sınıfını ayarlayabilirsiniz.'
  }
};

const stateConfig = {
  highContrast: {
    className: 'accessibility-widget-high-contrast',
    type: 'boolean'
  },
  textSize: {
    apply: value => {
      const root = document.documentElement;
      root.classList.remove('accessibility-widget-large-text', 'accessibility-widget-text-xl');
      if (value === 'large') {
        root.classList.add('accessibility-widget-large-text');
      }
      if (value === 'xl') {
        root.classList.add('accessibility-widget-text-xl');
      }
    },
    defaultValue: 'default'
  },
  lineHeight: {
    className: 'accessibility-widget-line-height',
    type: 'boolean'
  },
  colorFilter: {
    defaultValue: 'none'
  },
  reduceMotion: {
    className: 'accessibility-widget-reduce-motion',
    type: 'boolean'
  }
};

function applyBooleanClass(className, enabled) {
  const root = document.documentElement;
  if (!className) return;
  root.classList.toggle(className, Boolean(enabled));
}

function updateDocumentFilters(currentState) {
  const root = document.documentElement;
  const filterSegments = [];

  if (currentState.highContrast) {
    filterSegments.push('contrast(1.35)', 'saturate(1.2)');
  }

  if (currentState.colorFilter === 'grayscale') {
    filterSegments.push('grayscale(100%)');
  } else if (currentState.colorFilter === 'sepia') {
    filterSegments.push('sepia(60%)');
  }

  const filterValue = filterSegments.join(' ') || 'none';
  root.style.setProperty('--aw-widget-filter', filterValue);
  root.classList.toggle('accessibility-widget-filtered', filterValue !== 'none');
}

function applyState(state) {
  Object.entries(stateConfig).forEach(([key, config]) => {
    const value = state[key];
    if (config.type === 'boolean' && config.className) {
      applyBooleanClass(config.className, value);
    } else if (config.apply) {
      config.apply(value);
    }
  });

  updateDocumentFilters(state);
}

function readPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // ignore persistence errors
  }
}

function createAnnouncement(message) {
  const region = document.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.className = 'accessibility-widget-announcer';
  region.style.position = 'absolute';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.padding = '0';
  region.style.margin = '-1px';
  region.style.border = '0';
  region.style.overflow = 'hidden';
  region.style.clip = 'rect(0 0 0 0)';
  region.textContent = message;
  document.body.appendChild(region);
  setTimeout(() => region.remove(), 2000);
}

function setBodyThemeClass() {
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('accessibility-widget-host-dark', isDark);
}

function createThemeSubscription(handler) {
  if (!window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handler);
  }
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handler);
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(handler);
    }
  };
}

function createOption(value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}

function buildWidgetUI(localeStrings, initialState) {
  const container = document.createElement('div');
  container.className = 'accessibility-widget';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'accessibility-widget__toggle';
  toggleButton.setAttribute('aria-haspopup', 'dialog');
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-label', localeStrings.openLabel);
  toggleButton.innerHTML = '&#9881;';

  const panel = document.createElement('section');
  panel.className = 'accessibility-widget__panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('tabindex', '-1');

  const panelTitle = document.createElement('h2');
  panelTitle.id = 'accessibility-widget-title';
  panelTitle.textContent = localeStrings.panelTitle;
  panel.appendChild(panelTitle);
  panel.setAttribute('aria-labelledby', panelTitle.id);

  const controls = document.createElement('div');
  controls.className = 'accessibility-widget__controls';

  // High contrast toggle
  const highContrastControl = document.createElement('div');
  highContrastControl.className = 'accessibility-widget__control';
  const highContrastLabel = document.createElement('label');
  const highContrastCheckbox = document.createElement('input');
  highContrastCheckbox.type = 'checkbox';
  highContrastCheckbox.checked = Boolean(initialState.highContrast);
  highContrastCheckbox.id = 'aw-high-contrast';
  highContrastLabel.setAttribute('for', highContrastCheckbox.id);
  highContrastLabel.textContent = `${localeStrings.highContrast}`;
  const highContrastDescription = document.createElement('span');
  highContrastDescription.textContent = localeStrings.highContrastDescription;
  highContrastDescription.id = 'aw-high-contrast-desc';
  highContrastCheckbox.setAttribute('aria-describedby', highContrastDescription.id);
  highContrastControl.append(highContrastLabel, highContrastCheckbox, highContrastDescription);
  controls.appendChild(highContrastControl);

  // Text size select
  const textSizeControl = document.createElement('div');
  textSizeControl.className = 'accessibility-widget__control';
  const textSizeLabel = document.createElement('label');
  const textSizeSelect = document.createElement('select');
  textSizeSelect.id = 'aw-text-size';
  textSizeSelect.append(
    createOption('default', localeStrings.textSizeDefault),
    createOption('large', localeStrings.textSizeLarge),
    createOption('xl', localeStrings.textSizeXL)
  );
  textSizeSelect.value = initialState.textSize || 'default';
  textSizeLabel.setAttribute('for', textSizeSelect.id);
  textSizeLabel.textContent = localeStrings.textSize;
  textSizeControl.append(textSizeLabel, textSizeSelect);
  controls.appendChild(textSizeControl);

  // Line height toggle
  const lineHeightControl = document.createElement('div');
  lineHeightControl.className = 'accessibility-widget__control';
  const lineHeightLabel = document.createElement('label');
  lineHeightLabel.setAttribute('for', 'aw-line-height');
  lineHeightLabel.textContent = localeStrings.lineHeight;
  const lineHeightSelect = document.createElement('select');
  lineHeightSelect.id = 'aw-line-height';
  lineHeightSelect.append(
    createOption('default', localeStrings.lineHeightDefault),
    createOption('relaxed', localeStrings.lineHeightRelaxed)
  );
  lineHeightSelect.value = initialState.lineHeight ? 'relaxed' : 'default';
  lineHeightControl.append(lineHeightLabel, lineHeightSelect);
  controls.appendChild(lineHeightControl);

  // Color filter select
  const filterControl = document.createElement('div');
  filterControl.className = 'accessibility-widget__control';
  const filterLabel = document.createElement('label');
  filterLabel.setAttribute('for', 'aw-color-filter');
  filterLabel.textContent = localeStrings.colorFilter;
  const filterSelect = document.createElement('select');
  filterSelect.id = 'aw-color-filter';
  filterSelect.append(
    createOption('none', localeStrings.filterNone),
    createOption('grayscale', localeStrings.filterGrayscale),
    createOption('sepia', localeStrings.filterSepia)
  );
  filterSelect.value = initialState.colorFilter || 'none';
  filterControl.append(filterLabel, filterSelect);
  controls.appendChild(filterControl);

  // Reduce motion toggle
  const animationControl = document.createElement('div');
  animationControl.className = 'accessibility-widget__control';
  const animationLabel = document.createElement('label');
  animationLabel.setAttribute('for', 'aw-reduce-motion');
  animationLabel.textContent = localeStrings.animations;
  const animationCheckbox = document.createElement('input');
  animationCheckbox.type = 'checkbox';
  animationCheckbox.id = 'aw-reduce-motion';
  animationCheckbox.checked = Boolean(initialState.reduceMotion);
  const animationDescription = document.createElement('span');
  animationDescription.textContent = localeStrings.animationsLabel;
  animationCheckbox.setAttribute('aria-describedby', animationDescription.id = 'aw-reduce-motion-desc');
  animationControl.append(animationLabel, animationCheckbox, animationDescription);
  controls.appendChild(animationControl);

  const resetControl = document.createElement('div');
  resetControl.className = 'accessibility-widget__control';
  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.textContent = localeStrings.reset;
  resetControl.appendChild(resetButton);
  controls.appendChild(resetControl);

  panel.appendChild(controls);

  const footer = document.createElement('div');
  footer.className = 'accessibility-widget__footer';
  footer.innerHTML = `${localeStrings.keyboardHint}<br />${localeStrings.persistNotice}`;
  panel.appendChild(footer);

  container.append(toggleButton, panel);

  return {
    container,
    toggleButton,
    panel,
    controls: {
      highContrastCheckbox,
      textSizeSelect,
      lineHeightSelect,
      filterSelect,
      animationCheckbox,
      resetButton
    }
  };
}

function normalizeState(rawState = {}, options = {}) {
  const { partial = false } = options;
  const defaultState = {
    highContrast: false,
    textSize: 'default',
    lineHeight: false,
    colorFilter: 'none',
    reduceMotion: false
  };

  const base = partial ? {} : { ...defaultState };
  if (rawState == null) {
    return partial ? base : { ...defaultState };
  }

  if ('highContrast' in rawState) {
    base.highContrast = Boolean(rawState.highContrast);
  }
  if ('textSize' in rawState) {
    const allowed = ['default', 'large', 'xl'];
    base.textSize = allowed.includes(rawState.textSize) ? rawState.textSize : defaultState.textSize;
  }
  if ('lineHeight' in rawState) {
    base.lineHeight = Boolean(rawState.lineHeight);
  }
  if ('colorFilter' in rawState) {
    const allowedFilters = ['none', 'grayscale', 'sepia'];
    base.colorFilter = allowedFilters.includes(rawState.colorFilter)
      ? rawState.colorFilter
      : defaultState.colorFilter;
  }
  if ('reduceMotion' in rawState) {
    base.reduceMotion = Boolean(rawState.reduceMotion);
  }

  return partial ? base : { ...defaultState, ...base };
}

function initAccessibilityWidget(options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Accessibility widget requires a browser environment.');
  }
  if (window.__accessibilityWidgetInitialized) {
    return window.__accessibilityWidgetInitialized;
  }

  const localeKey = options.locale && translations[options.locale] ? options.locale : DEFAULT_LOCALE;
  const strings = translations[localeKey] || translations[DEFAULT_LOCALE];

  setBodyThemeClass();
  const persisted = readPersistedState();
  const state = normalizeState(persisted);
  applyState(state);

  const { container, toggleButton, panel, controls } = buildWidgetUI(strings, state);
  const host = options.target && options.target instanceof HTMLElement ? options.target : document.body;
  host.appendChild(container);

  let lastFocusedElement = null;

  function openPanel() {
    panel.dataset.open = 'true';
    panel.setAttribute('aria-hidden', 'false');
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.setAttribute('aria-label', strings.closeLabel);
    panel.focus({ preventScroll: true });
    controls.highContrastCheckbox.focus({ preventScroll: true });
  }

  function closePanel() {
    panel.dataset.open = 'false';
    panel.setAttribute('aria-hidden', 'true');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', strings.openLabel);
    if (lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    } else {
      toggleButton.focus({ preventScroll: true });
    }
  }

  toggleButton.addEventListener('click', () => {
    const isOpen = panel.dataset.open === 'true';
    if (isOpen) {
      closePanel();
    } else {
      lastFocusedElement = document.activeElement;
      openPanel();
    }
  });

  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closePanel();
    }
  });

  function updateState(partial) {
    Object.assign(state, partial);
    applyState(state);
    persistState(state);
  }

  controls.highContrastCheckbox.addEventListener('change', event => {
    updateState({ highContrast: event.target.checked });
  });

  controls.textSizeSelect.addEventListener('change', event => {
    updateState({ textSize: event.target.value });
  });

  controls.lineHeightSelect.addEventListener('change', event => {
    updateState({ lineHeight: event.target.value === 'relaxed' });
  });

  controls.filterSelect.addEventListener('change', event => {
    updateState({ colorFilter: event.target.value });
  });

  controls.animationCheckbox.addEventListener('change', event => {
    updateState({ reduceMotion: event.target.checked });
  });

  controls.resetButton.addEventListener('click', () => {
    const resetState = normalizeState();
    updateState(resetState);
    controls.highContrastCheckbox.checked = resetState.highContrast;
    controls.textSizeSelect.value = resetState.textSize;
    controls.lineHeightSelect.value = resetState.lineHeight ? 'relaxed' : 'default';
    controls.filterSelect.value = resetState.colorFilter;
    controls.animationCheckbox.checked = resetState.reduceMotion;
  });

  function handleShortcut(event) {
    if (event.key.toLowerCase() === 'a' && event.altKey && event.ctrlKey) {
      event.preventDefault();
      const isOpen = panel.dataset.open === 'true';
      if (isOpen) {
        closePanel();
      } else {
        lastFocusedElement = document.activeElement;
        openPanel();
      }
    }
  }

  document.addEventListener('keydown', handleShortcut);
  const unsubscribeTheme = createThemeSubscription(setBodyThemeClass);

  createAnnouncement(strings.ariaAnnouncement);

  const api = {
    open: openPanel,
    close: closePanel,
    destroy: () => {
      document.removeEventListener('keydown', handleShortcut);
      unsubscribeTheme();
      container.remove();
      const root = document.documentElement;
      Object.keys(stateConfig).forEach(key => {
        const config = stateConfig[key];
        if (config.className) {
          root.classList.remove(config.className);
        }
      });
      root.classList.remove('accessibility-widget-filtered');
      root.style.removeProperty('--aw-widget-filter');
    },
    getState: () => ({ ...state }),
    setState: newState => {
      const sanitized = normalizeState(newState, { partial: true });
      if (Object.keys(sanitized).length === 0) {
        return;
      }
      updateState(sanitized);
    }
  };

  window.__accessibilityWidgetInitialized = api;
  return api;
}

if (typeof window !== 'undefined') {
  window.initAccessibilityWidget = initAccessibilityWidget;
}

export { initAccessibilityWidget };
