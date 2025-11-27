// Type definitions for global objects
declare global {
  interface Window {
    grecaptcha: any;
    trackGoogleAdsEvent?: (eventName: string, params: any) => void;
    triggerContactConversion?: () => void;
  }
}

export function initContactForm(recaptchaSiteKey: string, trackFormStart: boolean) {
  const form = document.getElementById('contactForm') as HTMLFormElement;
  if (!form) return;

  const submitButton = document.getElementById('submitButton') as HTMLButtonElement;
  const buttonText = document.getElementById('buttonText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const formMessage = document.getElementById('formMessage');
  const timestampField = document.getElementById('timestamp') as HTMLInputElement;

  // Set timestamp on load
  if (timestampField) {
    timestampField.value = Date.now().toString();
  }

  // Lazy load reCAPTCHA
  let recaptchaLoaded = false;
  function loadRecaptcha() {
    if (recaptchaLoaded) return;
    recaptchaLoaded = true;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  // Track form start (Remarketing) & Load reCAPTCHA
  if (trackFormStart || true) { // Always setup listeners for reCAPTCHA
    let formStarted = false;
    const formInputs = form.querySelectorAll('input, textarea');
    
    formInputs.forEach(input => {
      // Load reCAPTCHA on focus of any field
      input.addEventListener('focus', loadRecaptcha, { once: true });

      input.addEventListener('input', () => {
        if (!formStarted) {
          const val = (input as HTMLInputElement).value;
          if (val.trim().length > 0) {
            formStarted = true;
            if (typeof window.trackGoogleAdsEvent === 'function') {
              window.trackGoogleAdsEvent('form_start', {
                'event_category': 'contact',
                'event_label': 'contact_page_form_interaction'
              });
            }
          }
        }
      });
    });
  }

  // Client-side validation
  function validateForm(): string | null {
    const nombre = (form.querySelector('[name="nombre"]') as HTMLInputElement).value.trim();
    const apellido = (form.querySelector('[name="apellido"]') as HTMLInputElement).value.trim();
    const email = (form.querySelector('[name="email"]') as HTMLInputElement).value.trim();
    const telefono = (form.querySelector('[name="telefono"]') as HTMLInputElement).value.trim();
    const asunto = (form.querySelector('[name="asunto"]') as HTMLInputElement).value.trim();
    const mensaje = (form.querySelector('[name="mensaje"]') as HTMLTextAreaElement).value.trim();

    if (!nombre || nombre.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!apellido || apellido.length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (!asunto || asunto.length < 5) return 'El asunto debe tener al menos 5 caracteres';
    if (!mensaje || mensaje.length < 10) return 'El mensaje debe tener al menos 10 caracteres';
    
    if (!email && !telefono) return 'Debes proporcionar al menos un email o teléfono';

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return 'El formato del email no es válido';
    }

    if (nombre.length > 50) return 'El nombre no puede exceder 50 caracteres';
    if (apellido.length > 50) return 'El apellido no puede exceder 50 caracteres';
    if (asunto.length > 100) return 'El asunto no puede exceder 100 caracteres';
    if (mensaje.length > 2000) return 'El mensaje no puede exceder 2000 caracteres';

    return null;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ensure reCAPTCHA is loaded (in case user submitted without focusing? unlikely but possible with autofill)
    loadRecaptcha();

    const validationError = validateForm();
    if (validationError && formMessage) {
      formMessage.textContent = validationError;
      formMessage.className = 'rounded-md p-4 text-sm bg-red-50 text-red-800 border border-red-200';
      formMessage.classList.remove('hidden');
      formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (submitButton) submitButton.disabled = true;
    if (buttonText) buttonText.textContent = 'Verificando...';
    loadingSpinner?.classList.remove('hidden');
    formMessage?.classList.add('hidden');

    try {
      // Wait for reCAPTCHA to be ready
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        const checkGrecaptcha = (attempts = 0) => {
            if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.ready) {
                window.grecaptcha.ready(() => {
                    window.grecaptcha.execute(recaptchaSiteKey, { 
                        action: 'submit_contact_form' 
                    }).then(resolve).catch(reject);
                });
            } else {
                if (attempts < 20) { // Wait up to 2 seconds
                    setTimeout(() => checkGrecaptcha(attempts + 1), 100);
                } else {
                    console.warn('reCAPTCHA load timeout');
                    resolve(''); // Proceed without token (server might reject)
                }
            }
        };
        checkGrecaptcha();
      });

      const formData = new FormData(form);
      formData.append('recaptcha_token', recaptchaToken);

      if (buttonText) buttonText.textContent = 'Enviando...';

      const response = await fetch('/api/contact/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (formMessage) {
        if (result.success) {
          formMessage.textContent = result.message;
          formMessage.className = 'rounded-md p-4 text-sm bg-green-50 text-green-800 border border-green-200';
          formMessage.classList.remove('hidden');
          
          form.reset();
          if (timestampField) timestampField.value = Date.now().toString();

          formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          if (typeof window.triggerContactConversion === 'function') {
            window.triggerContactConversion();
          }
        } else {
          formMessage.textContent = result.message || 'Hubo un error al enviar el mensaje.';
          formMessage.className = 'rounded-md p-4 text-sm bg-red-50 text-red-800 border border-red-200';
          formMessage.classList.remove('hidden');
          formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (formMessage) {
        formMessage.textContent = 'Ocurrió un error al procesar tu solicitud.';
        formMessage.className = 'rounded-md p-4 text-sm bg-red-50 text-red-800 border border-red-200';
        formMessage.classList.remove('hidden');
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
      if (buttonText) buttonText.textContent = 'Enviar mensaje';
      loadingSpinner?.classList.add('hidden');
    }
  });
}
