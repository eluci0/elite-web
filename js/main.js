(function() {
  const OFFICIAL_PHONE = "19564793074";

  // 1. Barra de Progreso y Títulos Cinemáticos
  const progressBar = document.getElementById('progress-bar');
  const zoomTitles = document.querySelectorAll('.zoom-title');

  function updateScrollEffects() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && maxScroll > 0) {
      progressBar.style.width = (scrollY / maxScroll * 100) + '%';
    }

    const vh = window.innerHeight;
    zoomTitles.forEach(title => {
      const rect = title.getBoundingClientRect();
      const dist = vh - rect.top;
      const total = vh * 0.78;
      const progress = Math.min(Math.max(dist / total, 0), 1);

      const currentScale = 2.8 - progress * 1.8;
      const currentOpacity = 0.2 + progress * 0.8;
      const translateY = (1 - progress) * 45;

      title.style.transform = `translate3d(0, ${translateY}px, 0) scale(${currentScale})`;
      title.style.opacity = currentOpacity.toString();

      const parentSection = title.closest('section') || title.closest('footer');
      if (parentSection) {
        const content = parentSection.querySelector('.section-content-reveal');
        if (content) {
          if (progress > 0.65) {
            content.classList.add('revealed');
          } else {
            content.classList.remove('revealed');
          }
        }
      }
    });
  }

  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  updateScrollEffects();

  // 2. Comparador Deslizable Antes / Después
  const baRange = document.getElementById('ba-range');
  const baAfterLayer = document.getElementById('ba-after-layer');
  const baHandleLine = document.getElementById('ba-handle-line');

  if (baRange && baAfterLayer && baHandleLine) {
    baRange.addEventListener('input', (e) => {
      const val = e.target.value;
      baAfterLayer.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
      baHandleLine.style.left = val + '%';
    });
  }

  // 3. Cotizador Interactivo y Reserva por WhatsApp
  const checkboxes = document.querySelectorAll('input[name="service-pick"]');
  const totalDisplay = document.getElementById('live-total-val');
  const quoteForm = document.getElementById('instant-quote-form');
  const resModal = document.getElementById('res-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalSummaryContent = document.getElementById('modal-summary-content');
  const whatsappDirectLink = document.getElementById('whatsapp-direct-link');
  const clientNameInput = document.getElementById('client-name-input');

  function updateTotal() {
    let total = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) total += parseInt(cb.value, 10);
    });
    if (totalDisplay) {
      totalDisplay.textContent = '$' + total + ' MXN';
    }
    return total;
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateTotal));

  window.selectServiceFromCard = function(val) {
    checkboxes.forEach(cb => {
      if (cb.value === val) {
        cb.checked = true;
      }
    });
    updateTotal();
    const quoteTarget = document.getElementById('quote-target');
    if (quoteTarget) {
      quoteTarget.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const total = updateTotal();
      const clientName = (clientNameInput && clientNameInput.value.trim()) || 'Cliente';

      let selectedServices = [];
      checkboxes.forEach(cb => {
        if (cb.checked) {
          selectedServices.push(cb.getAttribute('data-name') || cb.parentElement.textContent.trim());
        }
      });

      if (modalSummaryContent) {
        modalSummaryContent.innerHTML = `
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Sucursal:</strong> Matamoros, Tamaulipas</p>
          <p><strong>Servicios seleccionados:</strong></p>
          <ul style="margin-left: 1.2rem; color: #a1a1aa;">
            ${selectedServices.map(s => `<li>${s}</li>`).join('')}
          </ul>
          <p style="margin-top: 0.6rem;"><strong>Total estimado:</strong> <span style="color: var(--cyan-accent); font-weight: 700;">$${total} MXN</span></p>
        `;
      }

      if (whatsappDirectLink) {
        const message = `Hola ELITE Barbershop, mi nombre es ${clientName}. Me gustaría confirmar una cita en Matamoros para: ${selectedServices.join(', ')}. Mi estimado es de $${total} MXN. ¿Qué horarios tienen disponibles?`;
        whatsappDirectLink.href = `https://wa.me/${OFFICIAL_PHONE}?text=${encodeURIComponent(message)}`;
      }

      if (resModal) {
        resModal.classList.add('active');
      }
    });
  }

  if (btnCloseModal && resModal) {
    btnCloseModal.addEventListener('click', () => {
      resModal.classList.remove('active');
    });

    resModal.addEventListener('click', (e) => {
      if (e.target === resModal) {
        resModal.classList.remove('active');
      }
    });
  }
})();