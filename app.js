const API_URL = 'https://fakestoreapi.com/products';
const form = document.querySelector('#product-form');
const button = document.querySelector('#submit-button');
const errorMessage = document.querySelector('#error-message');
const resultCard = document.querySelector('#result-card');
const resultTitle = document.querySelector('#result-title');
const resultSummary = document.querySelector('#result-summary');
const resultIcon = document.querySelector('#result-icon');
const resultDetails = document.querySelector('#result-details');
const resultPlaceholder = document.querySelector('#result-placeholder');
const simulateFailure = document.querySelector('#simulate-failure');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  resultCard.classList.remove('success', 'failure');

  const formData = new FormData(form);
  const payload = {
    title: String(formData.get('title')).trim(),
    price: Number(formData.get('price')),
    description: String(formData.get('description')).trim(),
    image: 'https://i.pravatar.cc/300?img=12',
    category: String(formData.get('category'))
  };

  if (!form.reportValidity()) return;
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    showError('قیمت باید عددی بیشتر از صفر باشد.');
    return;
  }

  button.disabled = true;
  button.querySelector('span:first-child').textContent = 'در حال ارسال...';
  resultTitle.textContent = 'در حال ارتباط';
  resultSummary.textContent = 'درخواست در حال ارسال به Fake Store API است.';
  resultIcon.textContent = '…';
  resultPlaceholder.hidden = true;
  resultDetails.hidden = false;
  document.querySelector('#http-status').textContent = 'منتظر پاسخ';
  document.querySelector('#request-json').textContent = JSON.stringify(payload, null, 2);
  document.querySelector('#response-json').textContent = 'در انتظار پاسخ سرور...';

  try {
    const requestUrl = simulateFailure.checked ? 'http://127.0.0.1:65535/products' : API_URL;
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const responseText = await response.text();
    let responseBody;
    try { responseBody = responseText ? JSON.parse(responseText) : null; }
    catch { responseBody = responseText; }

    document.querySelector('#http-status').textContent = `${response.status} ${response.statusText}`;
    document.querySelector('#response-json').textContent = typeof responseBody === 'string'
      ? responseBody
      : JSON.stringify(responseBody, null, 2);

    if (!response.ok) throw new Error(`سرور با وضعیت ${response.status} پاسخ داد.`);
    resultCard.classList.add('success');
    resultTitle.textContent = 'درخواست موفق بود';
    resultSummary.textContent = 'محصول به API ارسال شد و پاسخ سرور در پایین قابل مشاهده است.';
    resultIcon.textContent = '✓';
  } catch (error) {
    resultCard.classList.add('failure');
    resultTitle.textContent = 'ارسال انجام نشد';
    resultSummary.textContent = simulateFailure.checked
      ? 'حالت ناموفق عمداً فعال شد؛ آدرس آزمایشی پاسخ نمی‌دهد.'
      : error instanceof TypeError
        ? 'ارتباط با API برقرار نشد. اتصال اینترنت را بررسی کن و دوباره امتحان کن.'
        : error.message;
    resultIcon.textContent = '!';
    if (document.querySelector('#http-status').textContent === 'منتظر پاسخ') {
      document.querySelector('#http-status').textContent = 'بدون پاسخ';
    }
    if (document.querySelector('#response-json').textContent === 'در انتظار پاسخ سرور...') {
      document.querySelector('#response-json').textContent = error.message;
    }
  } finally {
    button.disabled = false;
    button.querySelector('span:first-child').textContent = 'ارسال محصول';
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}


