/**
 * SOLAR INSTALLATION WEBSITE — FRONTEND INTERACTIVITY
 * Technology: Vanilla JavaScript (ES6+)
 * Notice: This is a demonstration project. Form submissions and calculators are client-side only.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. STICKY HEADER, MOBILE HAMBURGER MENU & ACTIVE NAV HIGHLIGHT
     ========================================================================== */
  const siteHeader = document.getElementById('site-header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  function toggleMobileMenu(forceClose = false) {
    if (!hamburgerBtn || !navMenu) return;
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    const nextState = forceClose ? false : !isExpanded;
    hamburgerBtn.setAttribute('aria-expanded', String(nextState));
    navMenu.classList.toggle('open', nextState);
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMobileMenu());
  }

  // Close mobile menu when clicking a nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  const mobileCta = document.querySelector('.nav-mobile-cta a');
  if (mobileCta) {
    mobileCta.addEventListener('click', () => toggleMobileMenu(true));
  }

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMobileMenu(true);
      hideDemoToast();
    }
  });

  // Scroll listener for sticky header & back-to-top button
  const sections = document.querySelectorAll('main section[id]');

  function handleScroll() {
    const scrollY = window.scrollY;

    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', scrollY > 24);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollY > 450);
    }

    // Active section highlight in navigation
    let currentSectionId = 'home';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 130;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentSectionId}`);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     2. SCROLL REVEAL ANIMATIONS & ANIMATED TRUST COUNTERS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // Animated Counters for Trust Statistics
  const statCounters = document.querySelectorAll('.stat-counter');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1600;
    const startTime = performance.now();

    function updateFrame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('en-IN');
      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      } else {
        el.textContent = target.toLocaleString('en-IN');
      }
    }

    requestAnimationFrame(updateFrame);
  }

  if ('IntersectionObserver' in window && statCounters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    statCounters.forEach((counter) => counterObserver.observe(counter));
  } else {
    statCounters.forEach((counter) => {
      counter.textContent = counter.getAttribute('data-target');
    });
  }

  /* ==========================================================================
     3. PROJECTS SHOWCASE FILTERING
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.getAttribute('data-filter');

      filterBtns.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-selected', String(isCurrent));
      });

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const shouldShow = selectedFilter === 'all' || category === selectedFilter;
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });

  /* ==========================================================================
     4. INTERACTIVE SOLAR SAVINGS CALCULATOR
     ========================================================================== */
  const billInput = document.getElementById('calc-bill-input');
  const billSlider = document.getElementById('calc-bill-slider');
  const billDisplay = document.getElementById('calc-bill-display');
  const roofAreaInput = document.getElementById('calc-roof-area');
  const roofAreaFeedback = document.getElementById('roof-area-feedback');
  const propTypeRadios = document.querySelectorAll('input[name="calcPropertyType"]');
  const propPills = document.querySelectorAll('.prop-pill');
  const calcResetBtn = document.getElementById('calc-reset-btn');
  const calcApplyBtn = document.getElementById('calc-apply-quote-btn');

  // Output DOM Elements
  const resCapacity = document.getElementById('res-capacity');
  const resRoofReq = document.getElementById('res-roof-req');
  const resCost = document.getElementById('res-cost');
  const resMonthlySavings = document.getElementById('res-monthly-savings');
  const resAnnualSavings = document.getElementById('res-annual-savings');
  const resPayback = document.getElementById('res-payback');
  const resLifetimeSavings = document.getElementById('res-lifetime-savings');

  // Segment assumptions (Illustrative Indian solar benchmarks)
  const SEGMENT_CONFIG = {
    residential: {
      tariffPerUnit: 8.0,      // ₹8 / kWh
      costPerKw: 60000,        // ₹60,000 / kW
      unitsPerKwMonth: 135,    // 4.5 units/day * 30 days
      sqftPerKw: 100,
      formSelectVal: 'Residential Individual Home'
    },
    commercial: {
      tariffPerUnit: 9.5,      // ₹9.5 / kWh
      costPerKw: 56000,        // ₹56,000 / kW
      unitsPerKwMonth: 138,
      sqftPerKw: 95,
      formSelectVal: 'Commercial Building / Office'
    },
    industrial: {
      tariffPerUnit: 8.5,      // ₹8.5 / kWh
      costPerKw: 52000,        // ₹52,000 / kW
      unitsPerKwMonth: 140,
      sqftPerKw: 90,
      formSelectVal: 'Industrial Factory / Warehouse'
    }
  };

  let latestCalcState = {
    bill: 6000,
    segment: 'residential',
    capacityKw: 5.0,
    monthlySavings: 5100
  };

  function formatINR(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  }

  function formatCompactINR(amount) {
    if (amount >= 10000000) {
      return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    }
    if (amount >= 100000) {
      return '₹' + (amount / 100000).toFixed(2) + ' Lakh';
    }
    return formatINR(amount);
  }

  function getSelectedSegment() {
    let selected = 'residential';
    propTypeRadios.forEach((radio) => {
      if (radio.checked) selected = radio.value;
    });
    return selected;
  }

  function calculateSolarEstimate() {
    if (!billInput) return;

    let rawBill = parseFloat(billInput.value);
    if (isNaN(rawBill) || rawBill < 500) rawBill = 500;
    if (rawBill > 1000000) rawBill = 1000000;

    const segmentKey = getSelectedSegment();
    const cfg = SEGMENT_CONFIG[segmentKey] || SEGMENT_CONFIG.residential;

    // Update live badge
    if (billDisplay) {
      billDisplay.textContent = `${formatINR(rawBill)} / month`;
    }

    // 1. Estimate monthly units consumed and target 85% solar offset
    const monthlyUnits = rawBill / cfg.tariffPerUnit;
    const targetOffsetUnits = monthlyUnits * 0.85;
    let idealCapacityKw = targetOffsetUnits / cfg.unitsPerKwMonth;

    // Round to nearest 0.5 kW, minimum 1 kW
    idealCapacityKw = Math.max(1, Math.round(idealCapacityKw * 2) / 2);

    // 2. Check optional rooftop area constraint
    const userRoofArea = parseFloat(roofAreaInput ? roofAreaInput.value : '');
    let finalCapacityKw = idealCapacityKw;
    let isRoofConstrained = false;

    if (!isNaN(userRoofArea) && userRoofArea >= 50) {
      const maxKwByRoof = Math.max(1, Math.floor((userRoofArea / cfg.sqftPerKw) * 2) / 2);
      if (maxKwByRoof < idealCapacityKw) {
        finalCapacityKw = maxKwByRoof;
        isRoofConstrained = true;
      }
    }

    const requiredRoofSqft = Math.round(finalCapacityKw * cfg.sqftPerKw);

    if (roofAreaFeedback) {
      if (isRoofConstrained) {
        roofAreaFeedback.textContent = `Note: Your entered area (${userRoofArea.toLocaleString('en-IN')} sq. ft.) caps system size at ${finalCapacityKw} kW (ideal for bill was ${idealCapacityKw} kW).`;
        roofAreaFeedback.style.color = '#14532D';
      } else {
        roofAreaFeedback.textContent = `Benchmark: ~${cfg.sqftPerKw} sq. ft. of shadow-free roof area is required per 1 kW of solar capacity.`;
        roofAreaFeedback.style.color = '';
      }
    }

    // 3. Calculate cost, monthly savings, annual savings, payback
    const estimatedCost = finalCapacityKw * cfg.costPerKw;
    const monthlyUnitsGenerated = finalCapacityKw * cfg.unitsPerKwMonth;
    const rawMonthlySavings = monthlyUnitsGenerated * cfg.tariffPerUnit;
    // Cap savings at 90% of actual bill to account for fixed meter charges
    const monthlySavings = Math.min(rawMonthlySavings, rawBill * 0.9);
    const annualSavings = monthlySavings * 12;
    const paybackYears = annualSavings > 0 ? (estimatedCost / annualSavings).toFixed(1) : '—';
    const lifetimeSavings25Yr = annualSavings * 25;

    // 4. Update DOM
    if (resCapacity) resCapacity.textContent = `${finalCapacityKw} kW`;
    if (resRoofReq) resRoofReq.textContent = `Requires ~${requiredRoofSqft.toLocaleString('en-IN')} sq. ft. shadow-free roof`;
    if (resCost) resCost.textContent = formatINR(estimatedCost);
    if (resMonthlySavings) resMonthlySavings.textContent = formatINR(monthlySavings);
    if (resAnnualSavings) resAnnualSavings.textContent = formatINR(annualSavings);
    if (resPayback) resPayback.textContent = `${paybackYears} Years`;
    if (resLifetimeSavings) resLifetimeSavings.textContent = formatCompactINR(lifetimeSavings25Yr);

    latestCalcState = {
      bill: Math.round(rawBill),
      segment: segmentKey,
      capacityKw: finalCapacityKw,
      monthlySavings: Math.round(monthlySavings)
    };
  }

  if (billInput && billSlider) {
    billSlider.addEventListener('input', () => {
      billInput.value = billSlider.value;
      calculateSolarEstimate();
    });

    billInput.addEventListener('input', () => {
      const val = parseFloat(billInput.value) || 1000;
      billSlider.value = Math.min(Math.max(val, 1000), 100000);
      calculateSolarEstimate();
    });
  }

  propTypeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      propPills.forEach((pill) => {
        const input = pill.querySelector('input');
        pill.classList.toggle('active', Boolean(input && input.checked));
      });
      calculateSolarEstimate();
    });
  });

  if (roofAreaInput) {
    roofAreaInput.addEventListener('input', calculateSolarEstimate);
  }

  if (calcResetBtn) {
    calcResetBtn.addEventListener('click', () => {
      if (billInput) billInput.value = 6000;
      if (billSlider) billSlider.value = 6000;
      if (roofAreaInput) roofAreaInput.value = '';
      propTypeRadios.forEach((radio) => {
        radio.checked = radio.value === 'residential';
      });
      propPills.forEach((pill) => {
        const input = pill.querySelector('input');
        pill.classList.toggle('active', Boolean(input && input.checked));
      });
      calculateSolarEstimate();
    });
  }

  // Pre-fill consultation form when clicking "Use This Estimate for Free Consultation"
  if (calcApplyBtn) {
    calcApplyBtn.addEventListener('click', () => {
      const formBill = document.getElementById('monthlyBill');
      const formProp = document.getElementById('propertyType');
      const formMsg = document.getElementById('message');
      const cfg = SEGMENT_CONFIG[latestCalcState.segment] || SEGMENT_CONFIG.residential;

      if (formBill) formBill.value = latestCalcState.bill;
      if (formProp) formProp.value = cfg.formSelectVal;
      if (formMsg) {
        formMsg.value = `Interested in an illustrative ~${latestCalcState.capacityKw} kW solar installation (Est. monthly bill: ₹${latestCalcState.bill.toLocaleString('en-IN')}). Please share consultation details.`;
      }
    });
  }

  // Pre-fill service inquiry when clicking "Learn More" on any service card
  const serviceLinks = document.querySelectorAll('[data-service]');
  serviceLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const serviceName = link.getAttribute('data-service');
      const formMsg = document.getElementById('message');
      if (formMsg && serviceName) {
        formMsg.value = `Inquiry regarding ${serviceName}: I would like to learn more about system sizing and consultation for my property.`;
      }
    });
  });

  // Initial calculator run
  calculateSolarEstimate();

  /* ==========================================================================
     5. FAQ ACCORDION
     ========================================================================== */
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const targetId = trigger.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);

      // Close other open items for a clean accordion experience
      faqTriggers.forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherPanelId = otherTrigger.getAttribute('aria-controls');
          const otherPanel = document.getElementById(otherPanelId);
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      // Toggle clicked item
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (targetPanel) {
        targetPanel.hidden = isExpanded;
      }
    });
  });

  /* ==========================================================================
     6. CONTACT FORM FRONTEND VALIDATION (DEMO MODE)
     ========================================================================== */
  const consultationForm = document.getElementById('consultation-form');
  const formSuccessBox = document.getElementById('form-success-box');
  const formSuccessSummary = document.getElementById('form-success-summary');
  const resetFormBtn = document.getElementById('reset-form-btn');

  function setFieldError(fieldId, errorMsg) {
    const inputEl = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (inputEl) {
      inputEl.classList.toggle('input-error', Boolean(errorMsg));
    }
    if (errEl) {
      errEl.textContent = errorMsg || '';
    }
  }

  function validateConsultationForm() {
    let isValid = true;

    const fullName = document.getElementById('fullName');
    const phoneNumber = document.getElementById('phoneNumber');
    const emailAddress = document.getElementById('emailAddress');
    const city = document.getElementById('city');
    const propertyType = document.getElementById('propertyType');
    const monthlyBill = document.getElementById('monthlyBill');

    // 1. Full Name
    if (!fullName || fullName.value.trim().length < 2) {
      setFieldError('fullName', 'Please enter your full name (at least 2 characters).');
      isValid = false;
    } else {
      setFieldError('fullName', '');
    }

    // 2. Phone Number (Accepts Indian 10-digit or +91 format)
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{4}[\-\s]?\d{5}$/;
    const cleanedPhone = phoneNumber ? phoneNumber.value.trim() : '';
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      setFieldError('phoneNumber', 'Enter a valid 10-digit Indian phone number (e.g., +91 99999 00000).');
      isValid = false;
    } else {
      setFieldError('phoneNumber', '');
    }

    // 3. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedEmail = emailAddress ? emailAddress.value.trim() : '';
    if (!cleanedEmail || !emailRegex.test(cleanedEmail)) {
      setFieldError('emailAddress', 'Please enter a valid email address.');
      isValid = false;
    } else {
      setFieldError('emailAddress', '');
    }

    // 4. City
    if (!city || city.value.trim().length < 2) {
      setFieldError('city', 'Please enter your city or town name.');
      isValid = false;
    } else {
      setFieldError('city', '');
    }

    // 5. Property Type
    if (!propertyType || !propertyType.value) {
      setFieldError('propertyType', 'Please select a property type.');
      isValid = false;
    } else {
      setFieldError('propertyType', '');
    }

    // 6. Monthly Electricity Bill
    const billVal = monthlyBill ? parseFloat(monthlyBill.value) : NaN;
    if (isNaN(billVal) || billVal < 500) {
      setFieldError('monthlyBill', 'Please enter a monthly bill of ₹500 or more.');
      isValid = false;
    } else {
      setFieldError('monthlyBill', '');
    }

    return isValid;
  }

  if (consultationForm) {
    // Clear error state on input
    const watchedFields = ['fullName', 'phoneNumber', 'emailAddress', 'city', 'propertyType', 'monthlyBill'];
    watchedFields.forEach((fieldId) => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.addEventListener('input', () => setFieldError(fieldId, ''));
        el.addEventListener('change', () => setFieldError(fieldId, ''));
      }
    });

    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateConsultationForm()) return;

      const userName = document.getElementById('fullName').value.trim();
      const userCity = document.getElementById('city').value.trim();
      const userProp = document.getElementById('propertyType').value;

      consultationForm.hidden = true;
      if (formSuccessBox) {
        formSuccessBox.hidden = false;
      }
      if (formSuccessSummary) {
        formSuccessSummary.textContent = `Thank you, ${userName}! Your sample consultation request for a ${userProp} in ${userCity} has been validated on the frontend. Because this is a demonstration website, no data has been sent to any real company or external server.`;
      }
    });
  }

  if (resetFormBtn && consultationForm && formSuccessBox) {
    resetFormBtn.addEventListener('click', () => {
      consultationForm.reset();
      formSuccessBox.hidden = true;
      consultationForm.hidden = false;
    });
  }

  /* ==========================================================================
     7. WHATSAPP & SOCIAL MEDIA PLACEHOLDER NOTIFICATION TOAST
     ========================================================================== */
  const demoToast = document.getElementById('demo-toast');
  const demoToastTitle = document.getElementById('demo-toast-title');
  const demoToastMsg = document.getElementById('demo-toast-msg');
  const demoToastClose = document.getElementById('demo-toast-close');
  const contactWhatsappBtn = document.getElementById('contact-whatsapp-btn');
  const floatingWhatsappBtn = document.getElementById('floating-whatsapp-btn');
  const socialPlaceholders = document.querySelectorAll('[data-social-demo]');

  let toastTimeout = null;

  function showDemoToast(title, message) {
    if (!demoToast) return;
    if (demoToastTitle) demoToastTitle.textContent = title;
    if (demoToastMsg) demoToastMsg.textContent = message;
    demoToast.hidden = false;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      hideDemoToast();
    }, 5500);
  }

  function hideDemoToast() {
    if (!demoToast) return;
    demoToast.hidden = true;
  }

  if (demoToastClose) {
    demoToastClose.addEventListener('click', hideDemoToast);
  }

  function handleWhatsAppPlaceholderClick() {
    showDemoToast(
      'WhatsApp Inquiry (Demo Placeholder)',
      'This WhatsApp inquiry button is intentionally non-functional in this portfolio demo until a real business WhatsApp number (+91 99999 00000 is fictional) is configured.'
    );
  }

  if (contactWhatsappBtn) {
    contactWhatsappBtn.addEventListener('click', handleWhatsAppPlaceholderClick);
  }

  if (floatingWhatsappBtn) {
    floatingWhatsappBtn.addEventListener('click', handleWhatsAppPlaceholderClick);
  }

  socialPlaceholders.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = link.getAttribute('data-social-demo') || 'Social Media';
      showDemoToast(
        `${platform} Link (Demo Placeholder)`,
        `This ${platform} icon is a demonstration placeholder. No real company social profiles are linked.`
      );
    });
  });

  // Dynamic current year fallback
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
