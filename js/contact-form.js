// Sostituisce l'invio AJAX di Fluent Forms con Web3Forms (sito statico).
// Imposta la tua access key da https://web3forms.com (gratis, legata alla tua email).
(function () {
  var ACCESS_KEY = '3df385cb-b9c7-4c1a-850d-730757a65c41';
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var LABELS = {
    'dropdown': 'Type of Event',
    'names[first_name]': 'First Name',
    'names[last_name]': 'Last Name',
    'input_text': 'Company Name',
    'dropdown_1': 'Country of Residence',
    'dropdown_2': 'Preferred Language',
    'dropdown_3': 'Estimated Event Budget',
    'email': 'Email',
    'description': 'Additional Notes'
  };

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'fluentform_3') return;
    e.preventDefault();
    e.stopImmediatePropagation();

    var btn = form.querySelector('button[type=submit]');
    var err = document.getElementById('fluentform_3_errors');
    var show = function (msg) { if (err) err.textContent = msg; };
    show('');

    var gdpr = form.elements['gdpr-agreement'];
    if (gdpr && !gdpr.checked) { show('Please confirm that you have read the Privacy Policy and consent to the processing of your data.'); gdpr.focus(); return; }
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var data = { access_key: ACCESS_KEY, subject: 'New request from deaitalianevents.com', from_name: 'DEA Italian Events website' };
    Object.keys(LABELS).forEach(function (n) {
      var el = form.elements[n];
      if (el && el.value) data[LABELS[n]] = el.value;
    });
    var email = form.elements['email'];
    if (email) data.replyto = email.value;

    if (btn) { btn.disabled = true; }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.success) { window.location.href = '/thank-you/'; }
      else { throw new Error(j.message || 'error'); }
    }).catch(function () {
      if (btn) btn.disabled = false;
      show('Something went wrong. Please try again or email us directly.');
    });
  }, true);
})();
