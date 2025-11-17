(function () {
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
      magnifier: 'Magnifier',
      contrastAdjust: 'Contrast adjustment',
      dyslexia: 'Dyslexia-friendly font',
      highlightLinks: 'Highlight links',
      reset: 'Reset adjustments',
      keyboardHint: 'Keyboard shortcut: Ctrl + Alt + A',
      textSizeDefault: 'Default',
      textSizeLarge: 'Large',
      textSizeXL: 'Extra large',
      lineHeightDefault: 'Default',
      lineHeightRelaxed: '1.5×',
      lineHeightSpacious: '2×',
      filterNone: 'None',
      filterGrayscale: 'Grayscale',
      filterSepia: 'Sepia',
      magnifierDefault: 'Off',
      magnifierMedium: '125%',
      magnifierLarge: '150%',
      contrastDefault: 'Default',
      contrastMedium: 'Increase (125%)',
      contrastStrong: 'Increase (150%)',
      animationsLabel: 'Pause animations and transitions',
      highContrastDescription: 'Increase contrast for better readability.',
      magnifierDescription: 'Zoom the entire page for easier reading.',
      dyslexiaDescription: 'Switch to a font that supports dyslexic readers.',
      highlightLinksDescription: 'Underline and outline all links on the page.',
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
      magnifier: 'Büyüteç',
      contrastAdjust: 'Kontrast ayarı',
      dyslexia: 'Disleksi dostu yazı tipi',
      highlightLinks: 'Bağlantıları vurgula',
      reset: 'Ayarları sıfırla',
      keyboardHint: 'Klavye kısayolu: Ctrl + Alt + A',
      textSizeDefault: 'Varsayılan',
      textSizeLarge: 'Büyük',
      textSizeXL: 'Çok büyük',
      lineHeightDefault: 'Varsayılan',
      lineHeightRelaxed: '1.5×',
      lineHeightSpacious: '2×',
      filterNone: 'Yok',
      filterGrayscale: 'Gri tonlama',
      filterSepia: 'Sepya',
      magnifierDefault: 'Kapalı',
      magnifierMedium: '%125',
      magnifierLarge: '%150',
      contrastDefault: 'Varsayılan',
      contrastMedium: 'Arttır (125%)',
      contrastStrong: 'Arttır (150%)',
      animationsLabel: 'Animasyonları ve geçişleri durdur',
      highContrastDescription: 'Okunabilirliği artırmak için kontrastı yükseltir.',
      magnifierDescription: 'Sayfanın tamamını yakınlaştırır.',
      dyslexiaDescription: 'Disleksiye uygun bir yazı tipine geçer.',
      highlightLinksDescription: 'Sayfadaki bağlantıları vurgular.',
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
      apply: value => {
        const root = document.documentElement;
        root.classList.remove('accessibility-widget-line-height-1-5', 'accessibility-widget-line-height-2');
        if (value === '1_5') {
          root.classList.add('accessibility-widget-line-height-1-5');
        }
        if (value === '2') {
          root.classList.add('accessibility-widget-line-height-2');
        }
      },
      defaultValue: 'default'
    },
    colorFilter: {
      defaultValue: 'none'
    },
    reduceMotion: {
      className: 'accessibility-widget-reduce-motion',
      type: 'boolean'
    },
    contrastAdjust: {
      defaultValue: 'default'
    },
    magnifier: {
      apply: value => {
        const root = document.documentElement;
        const scaleMap = {
          default: '1',
          '125': '1.25',
          '150': '1.5'
        };
        const normalized = scaleMap[value] || '1';
        if (normalized === '1') {
          root.classList.remove('accessibility-widget-magnifier-active');
          root.style.removeProperty('--aw-magnifier-scale');
        } else {
          root.classList.add('accessibility-widget-magnifier-active');
          root.style.setProperty('--aw-magnifier-scale', normalized);
        }
      },
      defaultValue: 'default'
    },
    dyslexiaFriendly: {
      className: 'accessibility-widget-dyslexia',
      type: 'boolean'
    },
    highlightLinks: {
      className: 'accessibility-widget-highlight-links',
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

    if (currentState.contrastAdjust === '125') {
      filterSegments.push('contrast(1.25)');
    } else if (currentState.contrastAdjust === '150') {
      filterSegments.push('contrast(1.5)');
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
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      border: '0',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)'
    });
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
      return function () {};
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
    }
    return function () {
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
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'accessibility-widget__toggle-icon';
    toggleIcon.setAttribute('aria-hidden', 'true');
    toggleIcon.textContent = '♿';
    toggleButton.appendChild(toggleIcon);

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

    const highContrastControl = document.createElement('div');
    highContrastControl.className = 'accessibility-widget__control';
    const highContrastLabel = document.createElement('label');
    const highContrastCheckbox = document.createElement('input');
    highContrastCheckbox.type = 'checkbox';
    highContrastCheckbox.checked = Boolean(initialState.highContrast);
    highContrastCheckbox.id = 'aw-high-contrast';
    highContrastLabel.setAttribute('for', highContrastCheckbox.id);
    highContrastLabel.textContent = '' + localeStrings.highContrast;
    const highContrastDescription = document.createElement('span');
    highContrastDescription.textContent = localeStrings.highContrastDescription;
    highContrastDescription.id = 'aw-high-contrast-desc';
    highContrastCheckbox.setAttribute('aria-describedby', highContrastDescription.id);
    highContrastControl.append(highContrastLabel, highContrastCheckbox, highContrastDescription);
    controls.appendChild(highContrastControl);

    const contrastControl = document.createElement('div');
    contrastControl.className = 'accessibility-widget__control';
    const contrastLabel = document.createElement('label');
    contrastLabel.setAttribute('for', 'aw-contrast-adjust');
    contrastLabel.textContent = localeStrings.contrastAdjust;
    const contrastSelect = document.createElement('select');
    contrastSelect.id = 'aw-contrast-adjust';
    contrastSelect.append(
      createOption('default', localeStrings.contrastDefault),
      createOption('125', localeStrings.contrastMedium),
      createOption('150', localeStrings.contrastStrong)
    );
    contrastSelect.value = initialState.contrastAdjust || 'default';
    contrastControl.append(contrastLabel, contrastSelect);
    controls.appendChild(contrastControl);

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

    const magnifierControl = document.createElement('div');
    magnifierControl.className = 'accessibility-widget__control';
    const magnifierLabel = document.createElement('label');
    magnifierLabel.setAttribute('for', 'aw-magnifier');
    magnifierLabel.textContent = localeStrings.magnifier;
    const magnifierSelect = document.createElement('select');
    magnifierSelect.id = 'aw-magnifier';
    magnifierSelect.append(
      createOption('default', localeStrings.magnifierDefault),
      createOption('125', localeStrings.magnifierMedium),
      createOption('150', localeStrings.magnifierLarge)
    );
    magnifierSelect.value = initialState.magnifier || 'default';
    const magnifierDescription = document.createElement('span');
    magnifierDescription.textContent = localeStrings.magnifierDescription;
    magnifierDescription.id = 'aw-magnifier-desc';
    magnifierSelect.setAttribute('aria-describedby', magnifierDescription.id);
    magnifierControl.append(magnifierLabel, magnifierSelect, magnifierDescription);
    controls.appendChild(magnifierControl);

    const lineHeightControl = document.createElement('div');
    lineHeightControl.className = 'accessibility-widget__control';
    const lineHeightLabel = document.createElement('label');
    lineHeightLabel.setAttribute('for', 'aw-line-height');
    lineHeightLabel.textContent = localeStrings.lineHeight;
    const lineHeightSelect = document.createElement('select');
    lineHeightSelect.id = 'aw-line-height';
    lineHeightSelect.append(
      createOption('default', localeStrings.lineHeightDefault),
      createOption('1_5', localeStrings.lineHeightRelaxed),
      createOption('2', localeStrings.lineHeightSpacious)
    );
    lineHeightSelect.value = initialState.lineHeight || 'default';
    lineHeightControl.append(lineHeightLabel, lineHeightSelect);
    controls.appendChild(lineHeightControl);

    const dyslexiaControl = document.createElement('div');
    dyslexiaControl.className = 'accessibility-widget__control';
    const dyslexiaLabel = document.createElement('label');
    const dyslexiaCheckbox = document.createElement('input');
    dyslexiaCheckbox.type = 'checkbox';
    dyslexiaCheckbox.checked = Boolean(initialState.dyslexiaFriendly);
    dyslexiaCheckbox.id = 'aw-dyslexia';
    dyslexiaLabel.setAttribute('for', dyslexiaCheckbox.id);
    dyslexiaLabel.textContent = localeStrings.dyslexia;
    const dyslexiaDescription = document.createElement('span');
    dyslexiaDescription.textContent = localeStrings.dyslexiaDescription;
    dyslexiaDescription.id = 'aw-dyslexia-desc';
    dyslexiaCheckbox.setAttribute('aria-describedby', dyslexiaDescription.id);
    dyslexiaControl.append(dyslexiaLabel, dyslexiaCheckbox, dyslexiaDescription);
    controls.appendChild(dyslexiaControl);

    const highlightControl = document.createElement('div');
    highlightControl.className = 'accessibility-widget__control';
    const highlightLabel = document.createElement('label');
    const highlightCheckbox = document.createElement('input');
    highlightCheckbox.type = 'checkbox';
    highlightCheckbox.checked = Boolean(initialState.highlightLinks);
    highlightCheckbox.id = 'aw-highlight-links';
    highlightLabel.setAttribute('for', highlightCheckbox.id);
    highlightLabel.textContent = localeStrings.highlightLinks;
    const highlightDescription = document.createElement('span');
    highlightDescription.textContent = localeStrings.highlightLinksDescription;
    highlightDescription.id = 'aw-highlight-links-desc';
    highlightCheckbox.setAttribute('aria-describedby', highlightDescription.id);
    highlightControl.append(highlightLabel, highlightCheckbox, highlightDescription);
    controls.appendChild(highlightControl);

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
    animationDescription.id = 'aw-reduce-motion-desc';
    animationCheckbox.setAttribute('aria-describedby', animationDescription.id);
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
    footer.innerHTML = localeStrings.keyboardHint + '<br />' + localeStrings.persistNotice;
    panel.appendChild(footer);

    container.append(toggleButton, panel);

    return {
      container,
      toggleButton,
      panel,
      controls: {
        highContrastCheckbox,
        contrastSelect,
        textSizeSelect,
        magnifierSelect,
        lineHeightSelect,
        filterSelect,
        animationCheckbox,
        dyslexiaCheckbox,
        highlightCheckbox,
        resetButton
      }
    };
  }

  function normalizeState(rawState, options) {
    if (rawState === void 0) rawState = {};
    if (options === void 0) options = {};
    const partial = Boolean(options.partial);
    const defaultState = {
      highContrast: false,
      textSize: 'default',
      lineHeight: 'default',
      colorFilter: 'none',
      reduceMotion: false,
      contrastAdjust: 'default',
      magnifier: 'default',
      dyslexiaFriendly: false,
      highlightLinks: false
    };
    const base = partial ? {} : Object.assign({}, defaultState);
    if (rawState == null) {
      return partial ? base : Object.assign({}, defaultState);
    }
    if ('highContrast' in rawState) {
      base.highContrast = Boolean(rawState.highContrast);
    }
    if ('textSize' in rawState) {
      const allowed = ['default', 'large', 'xl'];
      base.textSize = allowed.indexOf(rawState.textSize) > -1 ? rawState.textSize : defaultState.textSize;
    }
    if ('lineHeight' in rawState) {
      if (typeof rawState.lineHeight === 'string') {
        const allowedHeights = ['default', '1_5', '2'];
        base.lineHeight = allowedHeights.indexOf(rawState.lineHeight) > -1 ? rawState.lineHeight : defaultState.lineHeight;
      } else {
        base.lineHeight = rawState.lineHeight ? '1_5' : 'default';
      }
    }
    if ('colorFilter' in rawState) {
      const allowedFilters = ['none', 'grayscale', 'sepia'];
      base.colorFilter = allowedFilters.indexOf(rawState.colorFilter) > -1 ? rawState.colorFilter : defaultState.colorFilter;
    }
    if ('reduceMotion' in rawState) {
      base.reduceMotion = Boolean(rawState.reduceMotion);
    }
    if ('contrastAdjust' in rawState) {
      const allowedContrast = ['default', '125', '150'];
      base.contrastAdjust = allowedContrast.indexOf(rawState.contrastAdjust) > -1 ? rawState.contrastAdjust : defaultState.contrastAdjust;
    }
    if ('magnifier' in rawState) {
      const allowedMagnifier = ['default', '125', '150'];
      base.magnifier = allowedMagnifier.indexOf(rawState.magnifier) > -1 ? rawState.magnifier : defaultState.magnifier;
    }
    if ('dyslexiaFriendly' in rawState) {
      base.dyslexiaFriendly = Boolean(rawState.dyslexiaFriendly);
    }
    if ('highlightLinks' in rawState) {
      base.highlightLinks = Boolean(rawState.highlightLinks);
    }
    return partial ? base : Object.assign({}, defaultState, base);
  }

  function resolveBaseHref() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = document.currentScript || scripts[scripts.length - 1];
    if (!currentScript || !currentScript.src) return '';
    const url = new URL(currentScript.src, window.location.href);
    url.hash = '';
    url.search = '';
    const href = url.href;
    return href.slice(0, href.lastIndexOf('/') + 1);
  }

  function ensureStylesheetLoaded() {
    const href = resolveBaseHref() + 'widget.css';
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === href)) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function initAccessibilityWidget(options) {
    if (options === void 0) options = {};
    if (typeof window === 'undefined') {
      throw new Error('Accessibility widget requires a browser environment.');
    }
    if (window.__accessibilityWidgetInitialized) {
      return window.__accessibilityWidgetInitialized;
    }

    ensureStylesheetLoaded();

    const localeKey = options.locale && translations[options.locale] ? options.locale : DEFAULT_LOCALE;
    const strings = translations[localeKey] || translations[DEFAULT_LOCALE];

    setBodyThemeClass();
    const persisted = readPersistedState();
    const state = normalizeState(persisted);
    applyState(state);

    const built = buildWidgetUI(strings, state);
    const container = built.container;
    const toggleButton = built.toggleButton;
    const panel = built.panel;
    const controls = built.controls;
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

    toggleButton.addEventListener('click', function () {
      const isOpen = panel.dataset.open === 'true';
      if (isOpen) {
        closePanel();
      } else {
        lastFocusedElement = document.activeElement;
        openPanel();
      }
    });

    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePanel();
      }
    });

    function updateState(partial) {
      Object.assign(state, partial);
      applyState(state);
      persistState(state);
    }

    controls.highContrastCheckbox.addEventListener('change', function (event) {
      updateState({ highContrast: event.target.checked });
    });

    controls.contrastSelect.addEventListener('change', function (event) {
      updateState({ contrastAdjust: event.target.value });
    });

    controls.textSizeSelect.addEventListener('change', function (event) {
      updateState({ textSize: event.target.value });
    });

    controls.magnifierSelect.addEventListener('change', function (event) {
      updateState({ magnifier: event.target.value });
    });

    controls.lineHeightSelect.addEventListener('change', function (event) {
      updateState({ lineHeight: event.target.value });
    });

    controls.filterSelect.addEventListener('change', function (event) {
      updateState({ colorFilter: event.target.value });
    });

    controls.animationCheckbox.addEventListener('change', function (event) {
      updateState({ reduceMotion: event.target.checked });
    });

    controls.dyslexiaCheckbox.addEventListener('change', function (event) {
      updateState({ dyslexiaFriendly: event.target.checked });
    });

    controls.highlightCheckbox.addEventListener('change', function (event) {
      updateState({ highlightLinks: event.target.checked });
    });

    controls.resetButton.addEventListener('click', function () {
      const resetState = normalizeState();
      updateState(resetState);
      controls.highContrastCheckbox.checked = resetState.highContrast;
      controls.contrastSelect.value = resetState.contrastAdjust;
      controls.textSizeSelect.value = resetState.textSize;
      controls.magnifierSelect.value = resetState.magnifier;
      controls.lineHeightSelect.value = resetState.lineHeight || 'default';
      controls.filterSelect.value = resetState.colorFilter;
      controls.animationCheckbox.checked = resetState.reduceMotion;
      controls.dyslexiaCheckbox.checked = resetState.dyslexiaFriendly;
      controls.highlightCheckbox.checked = resetState.highlightLinks;
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
      destroy: function () {
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
        root.classList.remove(
          'accessibility-widget-large-text',
          'accessibility-widget-text-xl',
          'accessibility-widget-line-height-1-5',
          'accessibility-widget-line-height-2',
          'accessibility-widget-magnifier-active'
        );
        root.style.removeProperty('--aw-magnifier-scale');
      },
      getState: function () {
        return Object.assign({}, state);
      },
      setState: function (newState) {
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

  window.initAccessibilityWidget = initAccessibilityWidget;
})();
