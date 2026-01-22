(function() {
    const DEST_EMAIL = 'INSERISCI_LA_TUA_EMAIL'; // TODO: sostituire INSERISCI_LA_TUA_EMAIL
    const PAYMENT_LINK = 'PAYPAL_ME_LINK'; // TODO: sostituire PAYPAL_ME_LINK
    const PRICING = {
        base: 50, // TODO: sostituire prezzo base
        qualities: {
            standard: 0, // TODO: sostituire maggiorazioni qualità
            premium: 10,
            heavy: 15
        },
        extras: {
            ricamo: 5, // TODO: sostituire costi extra
            nome: 8
        }
    };

    const state = {
        quality: '',
        color: '',
        size: '',
        design: '',
        extraRicamo: false,
        extraNome: false,
        customName: '',
        note: '',
        customerName: '',
        email: '',
        address: ''
    };

    const els = {
        form: document.getElementById('config-form'),
        summaryQuality: document.getElementById('summary-quality'),
        summaryColor: document.getElementById('summary-color'),
        summarySize: document.getElementById('summary-size'),
        summaryDesign: document.getElementById('summary-design'),
        summaryExtras: document.getElementById('summary-extras'),
        summaryNote: document.getElementById('summary-note'),
        summaryPrice: document.getElementById('summary-price'),
        summaryImage: document.getElementById('design-preview'),
        alert: document.getElementById('form-alert'),
        toast: document.getElementById('toast'),
        nav: document.getElementById('site-nav'),
        navToggle: document.getElementById('nav-toggle'),
        navIndicator: document.getElementById('nav-indicator')
    };

    if (!els.form) return;

    const designImages = {
        a: '/assets/merch/design-a.jpg',
        b: '/assets/merch/design-b.jpg',
        c: '/assets/merch/design-c.jpg'
    };

    function formatPrice(value) {
        const n = isNaN(value) ? 0 : Number(value);
        return '\u20AC ' + n.toFixed(2);
    }

    function computePrice() {
        let total = PRICING.base || 0;
        if (state.quality && PRICING.qualities[state.quality] !== undefined) {
            total += Number(PRICING.qualities[state.quality]);
        }
        if (state.extraRicamo) total += Number(PRICING.extras.ricamo || 0);
        if (state.extraNome) total += Number(PRICING.extras.nome || 0);
        return total;
    }

    function getLabel(name, value) {
        const input = els.form.querySelector(`input[name="${name}"][value="${value}"]`);
        return input ? (input.getAttribute('data-label') || input.value) : '';
    }

    function updatePreview(src, alt) {
        if (!els.summaryImage) return;
        const url = src || els.summaryImage.dataset.placeholder || designImages.a;
        els.summaryImage.src = url;
        els.summaryImage.alt = alt || 'Anteprima design PCtekPro';
    }

    function updateSummary() {
        els.summaryQuality.textContent = state.quality ? getLabel('quality', state.quality) : 'Seleziona';
        els.summaryColor.textContent = state.color ? getLabel('color', state.color) : 'Seleziona';
        els.summarySize.textContent = state.size ? getLabel('size', state.size) : 'Seleziona';
        els.summaryDesign.textContent = state.design ? getLabel('design', state.design) : 'Seleziona';
        els.summaryNote.textContent = state.note ? state.note : 'Nessuna nota';

        const extras = [];
        if (state.extraRicamo) extras.push(`Ricamo (+${PRICING.extras.ricamo || 0}\u20AC)`);
        if (state.extraNome) {
            const label = state.customName ? `Nome personalizzato (${state.customName})` : 'Nome personalizzato';
            extras.push(`${label} (+${PRICING.extras.nome || 0}\u20AC)`);
        }
        els.summaryExtras.textContent = extras.length ? extras.join(', ') : 'Nessun extra';

        els.summaryPrice.textContent = formatPrice(computePrice());

        if (state.design && designImages[state.design]) {
            updatePreview(designImages[state.design], `Design ${state.design.toUpperCase()}`);
        }
    }

    function showAlert(message, isError) {
        if (!els.alert) return;
        els.alert.textContent = message;
        els.alert.classList.toggle('error', Boolean(isError));
        els.alert.hidden = false;
    }

    function validate() {
        const missing = [];
        if (!state.quality) missing.push('Qualità');
        if (!state.color) missing.push('Colore');
        if (!state.size) missing.push('Taglia');
        if (!state.design) missing.push('Design');
        if (!state.customerName.trim()) missing.push('Nome e cognome');
        if (!state.email.trim()) missing.push('Email');
        if (!state.address.trim()) missing.push('Indirizzo completo');

        if (missing.length) {
            showAlert('Compila: ' + missing.join(', '), true);
            return false;
        }

        showAlert('Tutto pronto. Controlla i dati e invia la richiesta.', false);
        return true;
    }

    function buildOrderText() {
        const extras = [];
        if (state.extraRicamo) extras.push(`Ricamo (+${PRICING.extras.ricamo || 0}\u20AC)`);
        if (state.extraNome) {
            const label = state.customName ? `Nome personalizzato (${state.customName})` : 'Nome personalizzato';
            extras.push(`${label} (+${PRICING.extras.nome || 0}\u20AC)`);
        }

        const lines = [
            'Richiesta Felpa PCtekPro',
            '---',
            `Nome/Cognome: ${state.customerName || '-'}`,
            `Email: ${state.email || '-'}`,
            `Indirizzo: ${state.address || '-'}`,
            `Qualità: ${state.quality ? getLabel('quality', state.quality) : '-'}`,
            `Colore: ${state.color ? getLabel('color', state.color) : '-'}`,
            `Taglia: ${state.size ? getLabel('size', state.size) : '-'}`,
            `Design: ${state.design ? getLabel('design', state.design) : '-'}`,
            `Extra: ${extras.length ? extras.join(', ') : 'Nessuno'}`,
            `Note: ${state.note || 'Nessuna'}`,
            `Prezzo stimato: ${formatPrice(computePrice())}`,
            `Pagamento: Riceverai istruzioni di pagamento PayPal (${PAYMENT_LINK})`,
            `Data/Ora: ${new Date().toLocaleString('it-IT')}`
        ];

        return lines.join('\n');
    }

    function sendEmail() {
        if (!validate()) return;
        const subject = encodeURIComponent('Richiesta Felpa PCtekPro');
        const body = encodeURIComponent(buildOrderText());
        window.location.href = `mailto:${DEST_EMAIL}?subject=${subject}&body=${body}`;
    }

    async function copyRequest() {
        if (!validate()) return;
        const text = buildOrderText();
        try {
            await navigator.clipboard.writeText(text);
            showToast('Richiesta copiata negli appunti');
        } catch (e) {
            const area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            document.body.removeChild(area);
            showToast('Richiesta copiata (fallback)');
        }
    }

    function showToast(msg) {
        if (!els.toast) return;
        els.toast.textContent = msg;
        els.toast.classList.add('is-visible');
        setTimeout(() => els.toast.classList.remove('is-visible'), 2500);
    }

    function handleChange(event) {
        const t = event.target;
        if (!t) return;
        const name = t.name;
        const value = t.value;

        switch (name) {
            case 'quality':
                state.quality = value;
                break;
            case 'color':
                state.color = value;
                break;
            case 'size':
                state.size = value;
                break;
            case 'design':
                state.design = value;
                if (designImages[value]) updatePreview(designImages[value], `Design ${value.toUpperCase()}`);
                break;
            case 'extra-ricamo':
                state.extraRicamo = t.checked;
                break;
            case 'extra-nome':
                state.extraNome = t.checked;
                break;
            case 'custom-name':
                state.customName = value;
                break;
            case 'note':
                state.note = value;
                break;
            case 'customer-name':
                state.customerName = value;
                break;
            case 'customer-email':
                state.email = value;
                break;
            case 'customer-address':
                state.address = value;
                break;
            default:
                break;
        }

        updateSummary();
    }

    function initNav() {
        if (!els.nav || !els.navToggle) return;
        const close = () => {
            els.navToggle.setAttribute('aria-expanded', 'false');
            els.navToggle.setAttribute('aria-label', 'Apri menu');
            els.nav.classList.remove('is-open');
        };
        const open = () => {
            els.navToggle.setAttribute('aria-expanded', 'true');
            els.navToggle.setAttribute('aria-label', 'Chiudi menu');
            els.nav.classList.add('is-open');
        };
        els.navToggle.addEventListener('click', () => {
            const expanded = els.navToggle.getAttribute('aria-expanded') === 'true';
            expanded ? close() : open();
        });
        els.nav.addEventListener('click', (e) => {
            if (e.target.closest('a')) close();
        });
        window.addEventListener('resize', () => {
            if (window.matchMedia('(min-width: 881px)').matches) close();
        });

        const header = document.querySelector('header');
        const hero = document.getElementById('merch-hero');
        function setHeaderState() {
            if (!header) return;
            const y = window.scrollY || document.documentElement.scrollTop || 0;
            header.classList.toggle('is-scrolled', y > 24);
            if (hero) {
                const r = hero.getBoundingClientRect();
                header.classList.toggle('is-hero', r.bottom > header.offsetHeight);
            }
        }
        setHeaderState();
        window.addEventListener('scroll', setHeaderState, { passive: true });

        if (els.navIndicator) {
            const target = els.nav.querySelector('a[href="/merch/"]') || els.nav.querySelector('a');
            if (target) {
                const rect = target.getBoundingClientRect();
                const navRect = els.nav.getBoundingClientRect();
                els.navIndicator.style.left = (rect.left - navRect.left) + 'px';
                els.navIndicator.style.width = rect.width + 'px';
            }
        }
    }

    function initFallbacks() {
        document.querySelectorAll('[data-fallback-image]').forEach((img) => {
            const toggle = () => {
                const wrapper = img.closest('.with-fallback');
                if (wrapper) {
                    wrapper.classList.add('show-placeholder');
                    const fb = wrapper.querySelector('.media-fallback');
                    if (fb) fb.hidden = false;
                }
            };
            img.addEventListener('error', toggle);
            if (img.complete && !img.naturalWidth) toggle();
        });
    }

    function bindActions() {
        els.form.addEventListener('input', handleChange);
        els.form.addEventListener('change', handleChange);

        document.querySelectorAll('[data-action="send"]').forEach((btn) => {
            btn.addEventListener('click', (ev) => { ev.preventDefault(); sendEmail(); });
        });
        document.querySelectorAll('[data-action="copy"]').forEach((btn) => {
            btn.addEventListener('click', (ev) => { ev.preventDefault(); copyRequest(); });
        });
    }

    function initDefaults() {
        // Pre-select nothing to force validation; keep summary visible
        updateSummary();
        if (els.alert) els.alert.hidden = true;
    }

    initNav();
    initFallbacks();
    bindActions();
    initDefaults();
})(); 
