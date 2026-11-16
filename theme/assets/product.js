(function () {
  var productPage = document.querySelector('[data-product-page]');

  if (!productPage) {
    return;
  }

  var variantScript = productPage.querySelector('[data-product-variants]');
  var form = productPage.querySelector('[data-product-form]');
  var variantIdInput = productPage.querySelector('[data-variant-id]');
  var submitButton = productPage.querySelector('[data-product-submit]');
  var availability = productPage.querySelector('[data-product-availability]');
  var currentPrice = productPage.querySelector('[data-product-current-price]');
  var comparePrice = productPage.querySelector('[data-product-compare-price]');
  var status = productPage.querySelector('[data-product-status]');
  var currency = productPage.dataset.productCurrency || 'USD';
  var locale = document.documentElement.lang || 'en';
  var variants = [];

  try {
    variants = JSON.parse(variantScript ? variantScript.textContent : '[]');
  } catch (error) {
    variants = [];
  }

  function formatMoney(cents) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format((cents || 0) / 100);
  }

  function getSelectedOptions() {
    var selections = [];

    productPage.querySelectorAll('fieldset[data-option-index]').forEach(function (group) {
      var input = group.querySelector('input[type="radio"]:checked');
      var index = Number(group.dataset.optionIndex);

      if (input && Number.isInteger(index)) {
        selections[index] = input.value;
      }
    });

    return selections;
  }

  function getOptionGroups() {
    return Array.prototype.slice.call(productPage.querySelectorAll('fieldset[data-option-index]'));
  }

  function formatOptionList(optionNames) {
    var readableNames = optionNames.map(function (name) {
      return (name || 'option').toLowerCase();
    });

    if (readableNames.length === 1) {
      return readableNames[0];
    }

    if (readableNames.length === 2) {
      return readableNames[0] + ' and ' + readableNames[1];
    }

    return readableNames.slice(0, -1).join(', ') + ', and ' + readableNames[readableNames.length - 1];
  }

  function getSelectionState(selectedOptions) {
    var missingOptions = [];

    getOptionGroups().forEach(function (group) {
      var index = Number(group.dataset.optionIndex);

      if (!Number.isInteger(index) || selectedOptions[index]) {
        return;
      }

      missingOptions.push(group.dataset.optionName || 'option');
    });

    return {
      hasOptions: getOptionGroups().length > 0,
      missingOptions: missingOptions,
      hasMissingOptions: missingOptions.length > 0
    };
  }

  function getMissingSelectionMessage(selectionState) {
    if (!selectionState.hasMissingOptions) {
      return '';
    }

    return 'Choose a ' + formatOptionList(selectionState.missingOptions) + ' before adding to cart.';
  }

  function findVariant(selectedOptions) {
    if (!selectedOptions.length && variantIdInput) {
      return variants.find(function (variant) {
        return String(variant.id) === String(variantIdInput.value);
      }) || variants[0];
    }

    return variants.find(function (variant) {
      return variant.options.every(function (optionValue, index) {
        return selectedOptions[index] === optionValue;
      });
    });
  }

  function isOptionValueAvailable(optionIndex, optionValue, selectedOptions) {
    return variants.some(function (variant) {
      if (!variant.available || variant.options[optionIndex] !== optionValue) {
        return false;
      }

      return variant.options.every(function (candidateValue, candidateIndex) {
        return candidateIndex === optionIndex || !selectedOptions[candidateIndex] || selectedOptions[candidateIndex] === candidateValue;
      });
    });
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function updateOptionAvailability(selectedOptions) {
    productPage.querySelectorAll('[data-variant-option]').forEach(function (choice) {
      var optionIndex = Number(choice.dataset.optionIndex);
      var optionValue = choice.dataset.optionValue;
      var input = choice.querySelector('input[type="radio"]');
      var state = choice.querySelector('[data-variant-option-state]');
      var isAvailable = isOptionValueAvailable(optionIndex, optionValue, selectedOptions);

      choice.classList.toggle('variant-selector__choice--unavailable', !isAvailable);
      choice.dataset.variantOptionAvailable = isAvailable ? 'true' : 'false';

      if (input) {
        input.setAttribute('aria-disabled', isAvailable ? 'false' : 'true');
      }

      if (state) {
        state.textContent = isAvailable ? 'Available' : 'Unavailable';
      }
    });
  }

  function updateDisplayedVariant(variant, selectionState) {
    var availableText = 'Unavailable';
    var isMissingSelection = selectionState && selectionState.hasMissingOptions;
    var canAddVariant = variant && variant.available && !isMissingSelection;

    if (variantIdInput) {
      variantIdInput.value = variant && !isMissingSelection ? variant.id : '';
    }

    if (currentPrice && variant) {
      currentPrice.textContent = formatMoney(variant.price);
    }

    if (comparePrice && variant) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        comparePrice.hidden = false;
        comparePrice.textContent = formatMoney(variant.compare_at_price);
      } else {
        comparePrice.hidden = true;
        comparePrice.textContent = '';
      }
    }

    if (isMissingSelection) {
      availableText = 'Select options';
    } else if (variant && variant.available) {
      availableText = 'In stock';
    } else if (variant) {
      availableText = 'Sold out';
    }

    if (availability) {
      availability.textContent = availableText;
      availability.classList.toggle('product-page__availability--sold-out', !canAddVariant);
    }

    if (submitButton) {
      submitButton.disabled = Boolean(isMissingSelection);
      submitButton.textContent = canAddVariant ? 'Add to cart' : isMissingSelection ? 'Select options' : 'Sold out';
    }

    if (isMissingSelection) {
      setStatus(getMissingSelectionMessage(selectionState));
    } else {
      setStatus(canAddVariant ? '' : 'This size and colour combination is unavailable.');
    }
  }

  function updateMedia(variant) {
    if (!variant || !variant.featured_media) {
      return;
    }

    var mediaId = String(variant.featured_media.id);

    productPage.querySelectorAll('[data-product-media-item]').forEach(function (item) {
      var isActive = item.dataset.mediaId === mediaId;

      item.hidden = !isActive;
      item.classList.toggle('product-media-gallery__item--active', isActive);
    });

    productPage.querySelectorAll('[data-product-media-thumb]').forEach(function (thumb) {
      var isActive = thumb.dataset.mediaId === mediaId;

      thumb.classList.toggle('product-media-gallery__thumb--active', isActive);
      if (isActive) {
        thumb.setAttribute('aria-current', 'true');
      } else {
        thumb.removeAttribute('aria-current');
      }
    });
  }

  function refreshProductState() {
    var selectedOptions = getSelectedOptions();
    var selectionState = getSelectionState(selectedOptions);
    var variant = selectionState.hasMissingOptions ? null : findVariant(selectedOptions);

    updateOptionAvailability(selectedOptions);
    updateDisplayedVariant(variant, selectionState);
    updateMedia(variant);
  }

  productPage.querySelectorAll('[data-variant-option] input[type="radio"]').forEach(function (input) {
    input.addEventListener('change', refreshProductState);
  });

  productPage.querySelectorAll('[data-product-media-thumb]').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var mediaId = thumb.dataset.mediaId;

      productPage.querySelectorAll('[data-product-media-item]').forEach(function (item) {
        var isActive = item.dataset.mediaId === mediaId;

        item.hidden = !isActive;
        item.classList.toggle('product-media-gallery__item--active', isActive);
      });

      productPage.querySelectorAll('[data-product-media-thumb]').forEach(function (candidate) {
        var isActive = candidate === thumb;

        candidate.classList.toggle('product-media-gallery__thumb--active', isActive);
        if (isActive) {
          candidate.setAttribute('aria-current', 'true');
        } else {
          candidate.removeAttribute('aria-current');
        }
      });
    });
  });

  if (form) {
    form.addEventListener('submit', function (event) {
      var selectedOptions = getSelectedOptions();
      var selectionState = getSelectionState(selectedOptions);
      var selectedVariant = selectionState.hasMissingOptions ? null : findVariant(selectedOptions);

      if (selectionState.hasMissingOptions) {
        event.preventDefault();
        setStatus(getMissingSelectionMessage(selectionState));
        return;
      }

      if (!selectedVariant || !selectedVariant.available) {
        event.preventDefault();
        setStatus('This variant is unavailable. Choose another size or colour.');

        if (window.themeAnalytics && typeof window.themeAnalytics.trackOutOfStockAttempted === 'function') {
          window.themeAnalytics.trackOutOfStockAttempted({
            reason: selectedVariant ? 'variant_unavailable' : 'variant_not_found',
            productId: productPage.dataset.productId,
            variantId: selectedVariant ? selectedVariant.id : null,
            requestedQuantity: 1,
            availableQuantity: 0
          });
        }
      }
    });
  }

  var productViewedPayload = {
    event: 'product_viewed',
    product_id: Number(productPage.dataset.productId),
    variant_id: variantIdInput && variantIdInput.value ? Number(variantIdInput.value) : undefined
  };

  window.dispatchEvent(new CustomEvent('product_viewed', {
    detail: productViewedPayload
  }));

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(productViewedPayload);
  }

  refreshProductState();
})();
