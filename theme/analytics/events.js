(function () {
  var eventNames = {
    addToCart: 'add_to_cart',
    cartAbandoned: 'cart_abandoned',
    loginPageInitialRender: 'login_page_initial_render',
    outOfStockAttempted: 'out_of_stock_attempted',
    productViewed: 'product_viewed'
  };

  function toPositiveNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : undefined;
  }

  function toText(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  function toStockAttemptReason(value) {
    var reason = toText(value);
    var allowedReasons = [
      'variant_unavailable',
      'variant_not_found',
      'stock_limit_exceeded',
      'line_unavailable',
      'unknown'
    ];

    return allowedReasons.indexOf(reason) >= 0 ? reason : 'unknown';
  }

  function removeEmptyValues(payload) {
    Object.keys(payload).forEach(function (key) {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  }

  function compactPayload(eventName, payload) {
    payload = payload || {};

    var compacted = {
      event: eventName
    };

    if (eventName === eventNames.addToCart) {
      compacted.product_id = toPositiveNumber(payload.productId);
      compacted.variant_id = toPositiveNumber(payload.variantId);
      compacted.quantity = toPositiveNumber(payload.quantity);
      compacted.value = toPositiveNumber(payload.value);
      compacted.currency = toText(payload.currency);
      compacted.source = toText(payload.source);
    }

    if (eventName === eventNames.cartAbandoned) {
      compacted.item_count = toPositiveNumber(payload.itemCount);
      compacted.value = toPositiveNumber(payload.value);
      compacted.currency = toText(payload.currency);
      compacted.cart_age_seconds = toPositiveNumber(payload.cartAgeSeconds);
      compacted.integration = toText(payload.integration || 'shopify_platform');
    }

    if (eventName === eventNames.outOfStockAttempted) {
      compacted.reason = toStockAttemptReason(payload.reason);
      compacted.variant_id = toPositiveNumber(payload.variantId);
      compacted.product_id = toPositiveNumber(payload.productId);
      compacted.requested_quantity = toPositiveNumber(payload.requestedQuantity);
      compacted.available_quantity = toPositiveNumber(payload.availableQuantity);
    }

    if (eventName === eventNames.loginPageInitialRender) {
      compacted.render_target = 'login_page';
      compacted.source = 'shopify_theme';
    }

    if (eventName === eventNames.productViewed) {
      compacted.product_id = toPositiveNumber(payload.productId);
      compacted.variant_id = toPositiveNumber(payload.variantId);
      compacted.currency = toText(payload.currency);
      compacted.source = toText(payload.source || 'product_detail');
    }

    return removeEmptyValues(compacted);
  }

  function publish(eventName, payload) {
    var eventPayload = compactPayload(eventName, payload);

    window.dispatchEvent(new CustomEvent(eventName, {
      detail: eventPayload
    }));

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventPayload);
    }

    return eventPayload;
  }

  window.themeAnalytics = window.themeAnalytics || {};

  window.themeAnalytics.trackAddToCart = function (payload) {
    return publish(eventNames.addToCart, payload);
  };

  window.themeAnalytics.trackCartAbandoned = function (payload) {
    return publish(eventNames.cartAbandoned, payload);
  };

  window.themeAnalytics.trackLoginPageInitialRender = function () {
    return publish(eventNames.loginPageInitialRender);
  };

  window.themeAnalytics.trackOutOfStockAttempted = function (payload) {
    return publish(eventNames.outOfStockAttempted, payload);
  };

  window.themeAnalytics.trackProductViewed = function (payload) {
    return publish(eventNames.productViewed, payload);
  };
})();
