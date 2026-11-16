(function () {
  var cartPage = document.querySelector('[data-cart-page]');

  if (!cartPage) {
    return;
  }

  var form = cartPage.querySelector('[data-cart-form]');
  var status = cartPage.querySelector('[data-cart-status]');
  var cartError = cartPage.querySelector('[data-cart-error]');
  var cartChangeUrl = cartPage.dataset.cartChangeUrl || '/cart/change';
  var currency = cartPage.dataset.cartCurrency || 'USD';
  var locale = document.documentElement.lang || 'en';
  var activeRequest = null;

  if (!form) {
    return;
  }

  function formatMoney(cents) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format((cents || 0) / 100);
  }

  function showStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function showCartError(message) {
    if (!cartError) {
      return;
    }

    cartError.textContent = message || '';
    cartError.hidden = !message;
  }

  function showLineError(line, message) {
    var lineError = line.querySelector('[data-cart-line-error]');
    var input = line.querySelector('[data-cart-quantity-input]');

    if (lineError) {
      lineError.textContent = message || '';
      lineError.hidden = !message;
    }

    if (input) {
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function clearErrors() {
    showCartError('');
    form.querySelectorAll('[data-cart-line]').forEach(function (line) {
      showLineError(line, '');
    });
  }

  function getRequestedQuantity(input) {
    var value = Number(input.value);
    var min = Number(input.min || 1);
    var max = input.max ? Number(input.max) : null;
    var step = Number(input.step || 1);

    if (!Number.isInteger(value)) {
      return { error: 'Enter a whole-number quantity.' };
    }

    if (value < min) {
      return { error: 'Quantity must be at least ' + min + '. Use Remove to delete this item.' };
    }

    if (max !== null && value > max) {
      return { error: 'Only ' + max + ' available for this item.' };
    }

    if (step > 1 && (value - min) % step !== 0) {
      return { error: 'Quantity must increase in steps of ' + step + '.' };
    }

    return { quantity: value };
  }

  function setLineBusy(line, isBusy) {
    line.classList.toggle('cart-line-item--updating', isBusy);
    line.querySelectorAll('button, input').forEach(function (control) {
      control.disabled = isBusy;
    });
  }

  function updateLineDisplay(line, item) {
    var input = line.querySelector('[data-cart-quantity-input]');
    var originalTotal = line.querySelector('[data-cart-line-total] s');
    var total = line.querySelector('[data-cart-line-total] strong');

    if (input) {
      input.value = item.quantity;
    }

    if (originalTotal) {
      originalTotal.textContent = formatMoney(item.original_line_price);
    }

    if (total) {
      total.textContent = formatMoney(item.final_line_price);
    }
  }

  function updateCartSummary(cart) {
    var subtotal = cartPage.querySelector('[data-cart-subtotal]');
    var discounts = cartPage.querySelector('[data-cart-discounts]');
    var total = cartPage.querySelector('[data-cart-total]');
    var count = cartPage.querySelector('[data-cart-count]');

    if (subtotal) {
      subtotal.textContent = formatMoney(cart.items_subtotal_price);
    }

    if (discounts) {
      discounts.textContent = '-' + formatMoney(cart.total_discount);
    }

    if (total) {
      total.textContent = formatMoney(cart.total_price);
    }

    if (count) {
      count.textContent = cart.item_count + (cart.item_count === 1 ? ' item' : ' items');
    }
  }

  function changeLine(line, quantity) {
    var lineKey = line.dataset.lineKey;

    if (!lineKey) {
      return;
    }

    if (activeRequest && activeRequest.abort) {
      activeRequest.abort();
    }

    activeRequest = new AbortController();
    clearErrors();
    setLineBusy(line, true);
    showStatus(quantity === 0 ? 'Removing item...' : 'Updating quantity...');

    fetch(cartChangeUrl.replace(/\.js$/, '') + '.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        id: lineKey,
        quantity: quantity
      }),
      signal: activeRequest.signal
    })
      .then(function (response) {
        return response.json().then(function (cart) {
          if (!response.ok) {
            throw cart;
          }

          return cart;
        });
      })
      .then(function (cart) {
        var matchingItem = cart.items.find(function (item) {
          return item.key === lineKey;
        });

        if (cart.item_count === 0) {
          window.location.reload();
          return;
        }

        if (quantity === 0 || !matchingItem) {
          line.remove();
          updateCartSummary(cart);
          showStatus('Item removed.');
          return;
        }

        updateLineDisplay(line, matchingItem);
        updateCartSummary(cart);
        showStatus('Cart updated.');
      })
      .catch(function (error) {
        if (error.name === 'AbortError') {
          return;
        }

        var message = error.description || error.message || 'We could not update this item. Check the quantity and try again.';
        showLineError(line, message);
        showCartError(message);
        showStatus('');
      })
      .finally(function () {
        setLineBusy(line, false);
        activeRequest = null;
      });
  }

  form.addEventListener('click', function (event) {
    var decreaseButton = event.target.closest('[data-cart-quantity-decrease]');
    var increaseButton = event.target.closest('[data-cart-quantity-increase]');
    var removeButton = event.target.closest('[data-cart-remove]');
    var button = decreaseButton || increaseButton || removeButton;

    if (!button) {
      return;
    }

    var line = button.closest('[data-cart-line]');
    var input = line ? line.querySelector('[data-cart-quantity-input]') : null;

    if (!line || !input) {
      return;
    }

    if (removeButton) {
      changeLine(line, 0);
      return;
    }

    var currentQuantity = Number(input.value);
    var step = Number(input.step || 1);
    var nextQuantity = currentQuantity + (increaseButton ? step : -step);

    input.value = nextQuantity;

    var requestedQuantity = getRequestedQuantity(input);
    if (requestedQuantity.error) {
      showLineError(line, requestedQuantity.error);
      input.value = currentQuantity;
      return;
    }

    changeLine(line, requestedQuantity.quantity);
  });

  form.addEventListener('change', function (event) {
    var input = event.target.closest('[data-cart-quantity-input]');

    if (!input) {
      return;
    }

    var line = input.closest('[data-cart-line]');
    var requestedQuantity = getRequestedQuantity(input);

    if (requestedQuantity.error) {
      showLineError(line, requestedQuantity.error);
      return;
    }

    changeLine(line, requestedQuantity.quantity);
  });

  form.addEventListener('submit', function (event) {
    var invalidInput = null;

    form.querySelectorAll('[data-cart-quantity-input]').forEach(function (input) {
      if (invalidInput) {
        return;
      }

      var line = input.closest('[data-cart-line]');
      var requestedQuantity = getRequestedQuantity(input);

      if (requestedQuantity.error) {
        invalidInput = input;
        showLineError(line, requestedQuantity.error);
        showCartError(requestedQuantity.error);
      }
    });

    if (invalidInput) {
      event.preventDefault();
      invalidInput.focus();
    }
  });
})();
