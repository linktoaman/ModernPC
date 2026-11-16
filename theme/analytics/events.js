(function () {
  var eventName = 'out_of_stock_attempted';

  function toPositiveNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : undefined;
  }

  function compactPayload(payload) {
    var compacted = {
      event: eventName,
      reason: payload.reason || 'unknown',
      variant_id: toPositiveNumber(payload.variantId),
      product_id: toPositiveNumber(payload.productId),
      requested_quantity: toPositiveNumber(payload.requestedQuantity),
      available_quantity: toPositiveNumber(payload.availableQuantity)
    };

    Object.keys(compacted).forEach(function (key) {
      if (compacted[key] === undefined || compacted[key] === null || compacted[key] === '') {
        delete compacted[key];
      }
    });

    return compacted;
  }

  window.themeAnalytics = window.themeAnalytics || {};
  window.themeAnalytics.trackOutOfStockAttempted = function (payload) {
    var eventPayload = compactPayload(payload || {});

    window.dispatchEvent(new CustomEvent(eventName, {
      detail: eventPayload
    }));

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventPayload);
    }
  };
})();
