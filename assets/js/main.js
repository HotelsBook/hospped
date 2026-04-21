/**
 * Hospped - Funcionalidades Principais
 * Versão Enterprise - Completa e Otimizada
 */

(function() {
  'use strict';

  // ===== CONFIGURAÇÃO =====
  const CONFIG = {
    storageKeys: {
      user: 'hospped_user',
      requests: 'hospped_requests',
      quickSearch: 'hospped_quick_search'
    },
    api: {
      baseUrl: 'https://hospped-api.onrender.com', // Substituir quando backend estiver ativo
      endpoints: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        requests: '/api/requests'
      }
    },
    selectors: {
      mobileMenuBtn: '.mobile-menu-btn',
      navMenu: 'nav ul',
      authModal: '#authModal',
      authTrigger: '[data-auth-trigger]',
      contactForm: '#contactForm',
      quickSearchForm: '#quickSearchForm'
    }
  };

  // ===== UTILITÁRIOS =====
  const Utils = {
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    formatDate: function(date, format = 'DD/MM/YYYY') {
      if (!(date instanceof Date) || isNaN(date)) return '';
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return format.replace('DD', d).replace('MM', m).replace('YYYY', y);
    },

    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    storage: {
      get: function(key) {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.error('Erro ao ler localStorage:', e);
          return null;
        }
      },
      set: function(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          console.error('Erro ao salvar em localStorage:', e);
          return false;
        }
      },
      remove: function(key) {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (e) {
          console.error('Erro ao remover do localStorage:', e);
          return false;
        }
      }
    },

    validate: {
      email: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      phone: function(phone) {
        return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone.replace(/\s/g, ''));
      },
      required: function(value) {
        return value && value.trim() !== '';
      }
    }
  };

  // ===== MENU MOBILE =====
  function initMobileMenu() {
    const menuBtn = document.querySelector(CONFIG.selectors.mobileMenuBtn);
    const navMenu = document.querySelector(CONFIG.selectors.navMenu);
    
    if (!menuBtn || !navMenu) return;

    menuBtn.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== MODAL DE AUTENTICAÇÃO =====
  function initAuthModal() {
    const modal = document.querySelector(CONFIG.selectors.authModal);
    if (!modal) return;

    const openBtns = document.querySelectorAll(CONFIG.selectors.authTrigger);
    const closeBtn = modal.querySelector('.modal-close');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');

    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      showForm('login');
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
      hideFormErrors();
    }

    function showForm(type) {
      if (loginForm && registerForm) {
        loginForm.classList.toggle('hidden', type !== 'login');
        registerForm.classList.toggle('hidden', type !== 'register');
      }
    }

    function hideFormErrors() {
      document.querySelectorAll('.form-error.visible').forEach(el => {
        el.classList.remove('visible');
      });
    }

    openBtns.forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    }));

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    if (toggleToRegister) toggleToRegister.addEventListener('click', e => { e.preventDefault(); showForm('register'); });
    if (toggleToLogin) toggleToLogin.addEventListener('click', e => { e.preventDefault(); showForm('login'); });

    // Login
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideFormErrors();

        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!Utils.validate.email(email)) {
          showFormError(loginForm, 'Informe um e-mail válido.');
          return;
        }
        if (!password || password.length < 8) {
          showFormError(loginForm, 'A senha deve ter pelo menos 8 caracteres.');
          return;
        }

        // Demo mode - substituir por chamada à API quando backend estiver ativo
        const userData = {
          email,
          name: email.split('@')[0].replace(/\./g, ' ').replace(/^\w/, c => c.toUpperCase()),
          type: 'client',
          token: 'demo-' + Date.now()
        };

        Utils.storage.set(CONFIG.storageKeys.user, userData);
        closeModal();
        updateUserInterface(userData);
        showAlert('Login realizado com sucesso.', 'success');
      });
    }

    // Registro
    if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideFormErrors();

        const name = document.getElementById('registerName')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const company = document.getElementById('registerCompany')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;

        if (!name || !Utils.validate.email(email) || !password) {
          showFormError(registerForm, 'Preencha todos os campos obrigatórios corretamente.');
          return;
        }
        if (password.length < 8) {
          showFormError(registerForm, 'A senha deve ter pelo menos 8 caracteres.');
          return;
        }

        const userData = {
          email, name, company,
          type: 'client',
          token: 'demo-' + Date.now(),
          createdAt: new Date().toISOString()
        };

        Utils.storage.set(CONFIG.storageKeys.user, userData);
        closeModal();
        updateUserInterface(userData);
        showAlert('Cadastro realizado com sucesso. Bem-vindo, ' + name + '.', 'success');
      });
    }
  }

  function showFormError(form, message) {
    const errorEl = form.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      errorEl.setAttribute('role', 'alert');
      setTimeout(() => errorEl.classList.remove('visible'), 5000);
    }
  }

  // ===== INTERFACE DO USUÁRIO =====
  function updateUserInterface(userData) {
    const userActions = document.querySelector('.user-actions');
    if (!userActions || !userData) return;

    const userName = Utils.escapeHtml(userData.name || userData.email?.split('@')[0] || 'Usuário');
    userActions.innerHTML = '<button class="btn-user" id="userMenuBtn">' + userName + '</button>';
    
    document.getElementById('userMenuBtn')?.addEventListener('click', function() {
      if (confirm('Deseja sair da conta?')) {
        Utils.storage.remove(CONFIG.storageKeys.user);
        location.reload();
      }
    });
  }

  function getCurrentUser() {
    return Utils.storage.get(CONFIG.storageKeys.user);
  }

  // ===== MÁSCARA DE TELEFONE =====
  function initPhoneMask() {
    const phoneInput = document.getElementById('contactPhone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        value = value.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
      }
      e.target.value = value.slice(0, 15);
    });
  }

  // ===== QUICK SEARCH =====
  function initQuickSearch() {
    const form = document.querySelector(CONFIG.selectors.quickSearchForm);
    if (!form) return;

    form.addEventListener('submit', function(e) {
      const formData = {
        destination: document.getElementById('searchDestination')?.value || '',
        checkIn: document.getElementById('searchCheckIn')?.value || '',
        checkOut: document.getElementById('searchCheckOut')?.value || '',
        guests: document.getElementById('searchGuests')?.value || '2',
        timestamp: new Date().toISOString()
      };
      Utils.storage.set(CONFIG.storageKeys.quickSearch, formData);
    });
  }

  function prefillContactForm() {
    const searchData = Utils.storage.get(CONFIG.storageKeys.quickSearch);
    if (!searchData) return;

    const fieldMap = { destination: 'destination', checkIn: 'checkIn', checkOut: 'checkOut', guests: 'guests' };
    Object.entries(fieldMap).forEach(([searchKey, formKey]) => {
      const field = document.getElementById(formKey);
      if (field && searchData[searchKey]) field.value = searchData[searchKey];
    });
    Utils.storage.remove(CONFIG.storageKeys.quickSearch);
  }

  // ===== FORMULÁRIO DE CONTATO =====
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Validação em tempo real
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', function() {
        if (this.classList.contains('error') && this.value.trim()) {
          this.classList.remove('error');
        }
      });
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      let isValid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        showAlert('Preencha todos os campos obrigatórios corretamente.', 'error');
        return;
      }

      const formData = {
        id: 'REQ-' + Date.now(),
        requestType: form.querySelector('input[name="requestType"]:checked')?.value,
        companyName: document.getElementById('companyName')?.value,
        segment: document.getElementById('segment')?.value,
        companySize: document.getElementById('companySize')?.value,
        contactName: document.getElementById('contactName')?.value,
        contactPosition: document.getElementById('contactPosition')?.value,
        contactEmail: document.getElementById('contactEmail')?.value,
        contactPhone: document.getElementById('contactPhone')?.value,
        travelVolume: document.getElementById('travelVolume')?.value,
        destinations: document.getElementById('destinations')?.value,
        additionalInfo: document.getElementById('additionalInfo')?.value,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Demo: salvar localmente
      const requests = Utils.storage.get(CONFIG.storageKeys.requests) || [];
      requests.unshift(formData);
      Utils.storage.set(CONFIG.storageKeys.requests, requests);

      // Em produção: enviar para API
      // await fetch(CONFIG.api.baseUrl + CONFIG.api.endpoints.requests, { ... })

      showAlert('Solicitação enviada com sucesso. Retornaremos em até 24 horas úteis.', 'success');
      form.reset();
    });
  }

  function validateField(field) {
    const value = field.value.trim();
    const isValid = Utils.validate.required(value);
    
    if (!isValid) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');
    }
    return isValid;
  }

  // ===== ALERTS =====
  function showAlert(message, type) {
    document.querySelectorAll('.alert').forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.textContent = message;
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'polite');

    const mainContent = document.querySelector('.container') || document.body;
    mainContent.insertBefore(alert, mainContent.firstChild);

    setTimeout(function() {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  // ===== INICIALIZAÇÃO =====
  function init() {
    initMobileMenu();
    initAuthModal();
    initPhoneMask();
    initQuickSearch();
    initContactForm();

    const user = getCurrentUser();
    if (user) updateUserInterface(user);

    if (document.getElementById('contactForm')) {
      setTimeout(prefillContactForm, 50);
      
      // Preencher segmento se veio da URL
      const params = new URLSearchParams(window.location.search);
      const segmento = params.get('segmento');
      if (segmento) {
        const select = document.getElementById('segment');
        if (select) select.value = segmento;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();