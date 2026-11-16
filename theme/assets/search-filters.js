(() => {
  const forms = document.querySelectorAll('[data-filter-form]');

  if (!forms.length || !window.fetch || !window.DOMParser || !window.history) {
    return;
  }

  const getFormUrl = (form) => {
    const formData = new FormData(form);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      if (String(value).trim() !== '') {
        params.append(key, value);
      }
    });

    const url = new URL(form.action, window.location.origin);
    url.search = params.toString();
    return url;
  };

  const replaceRegion = (selector, doc) => {
    const current = document.querySelector(selector);
    const incoming = doc.querySelector(selector);

    if (current && incoming) {
      current.replaceWith(incoming);
    }
  };

  const updateFromUrl = async (url, form) => {
    const results = document.querySelector('[data-search-results]');
    if (results) {
      results.setAttribute('aria-busy', 'true');
    }

    const response = await fetch(url.toString(), {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) {
      form.submit();
      return;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    replaceRegion('[data-search-results]', doc);
    replaceRegion('[data-filter-form]', doc);

    window.history.pushState({}, '', url.toString());

    const updatedResults = document.querySelector('[data-search-results]');
    if (updatedResults) {
      updatedResults.setAttribute('aria-busy', 'false');
      updatedResults.focus({ preventScroll: true });
    }
  };

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-filter-input]');
    if (!input) {
      return;
    }

    const form = input.closest('[data-filter-form]');
    if (!form) {
      return;
    }

    updateFromUrl(getFormUrl(form), form).catch(() => form.submit());
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-filter-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    updateFromUrl(getFormUrl(form), form).catch(() => form.submit());
  });

  window.addEventListener('popstate', () => {
    window.location.reload();
  });
})();
