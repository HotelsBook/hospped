/**
 * Hospped - Funcionalidades Principais
 * Versão profissional otimizada - sem dependências externas
 * 
 * Funcionalidades:
 * - Menu mobile responsivo
 * - Modal de autenticação (login/registro)
 * - Date picker customizado
 * - Formulário de reserva com validação
 * - Quick search com prefill automático
 * - Sistema de alerts
 * - Dashboard do usuário
 * - Máscara de telefone
 * - Acessibilidade e performance
 */

(function() {
  'use strict';

  // ===== CONSTANTES E CONFIGURAÇÕES =====
  const CONFIG = {
    storageKeys: {
      user: 'hospped_user',
      requests: 'hospped_requests',
      quickSearch: 'hospped_quick_search'
    },
    selectors: {
      mobileMenuBtn: '.mobile-menu-btn',
      navMenu: 'nav ul',
      authModal: '#authModal',
      authTrigger: '[data-auth-trigger]',
      loginForm: '#loginForm',
      registerForm: '#registerForm',
      bookingForm: '#bookingRequestForm',
      quickSearchForm: '#quickSearchForm',
      datePickerInput: '.date-picker-input',
      userRequestsList: '#userRequestsList',
      userActions: '.user-actions'
    },
    dates: {
      minDate: new Date().setHours(0, 0, 0, 0)
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

    parseDate: function(dateString) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return new Date(dateString);
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

    // Fechar menu ao clicar em link ou fora
    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    navMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
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
    const loginForm = document.querySelector(CONFIG.selectors.loginForm);
    const registerForm = document.querySelector(CONFIG.selectors.registerForm);
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');

    let currentForm = 'login';

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

    function showForm(formType) {
      currentForm = formType;
      if (loginForm && registerForm) {
        loginForm.classList.toggle('hidden', formType !== 'login');
        registerForm.classList.toggle('hidden', formType !== 'register');
      }
    }

    function hideFormErrors() {
      document.querySelectorAll('.form-error.visible').forEach(function(el) {
        el.classList.remove('visible');
      });
    }

    // Event listeners
    openBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (toggleToRegister) {
      toggleToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showForm('register');
      });
    }

    if (toggleToLogin) {
      toggleToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showForm('login');
      });
    }

    // Login form submission
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideFormErrors();

        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
          showFormError(loginForm, 'Preencha todos os campos obrigatórios.');
          return;
        }

        if (!isValidEmail(email)) {
          showFormError(loginForm, 'Informe um e-mail válido.');
          return;
        }

        // Demo: simular autenticação
        const userData = {
          email: email,
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

    // Register form submission
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideFormErrors();

        const name = document.getElementById('registerName')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const company = document.getElementById('registerCompany')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;

        if (!name || !email || !password) {
          showFormError(registerForm, 'Preencha todos os campos obrigatórios.');
          return;
        }

        if (!isValidEmail(email)) {
          showFormError(registerForm, 'Informe um e-mail válido.');
          return;
        }

        if (password.length < 8) {
          showFormError(registerForm, 'A senha deve ter pelo menos 8 caracteres.');
          return;
        }

        const userData = {
          email: email,
          name: name,
          company: company,
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

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const userActions = document.querySelector(CONFIG.selectors.userActions);
    if (!userActions || !userData) return;

    const userName = Utils.escapeHtml(userData.name || userData.email?.split('@')[0] || 'Usuário');
    
    userActions.innerHTML = 
      '<button class="btn-user" id="userMenuBtn" aria-haspopup="true" aria-expanded="false">' + 
        userName + 
      '</button>';
    
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

  // ===== DATE PICKER CUSTOMIZADO =====
  function initDatePickers() {
    const dateInputs = document.querySelectorAll(CONFIG.selectors.datePickerInput);
    
    dateInputs.forEach(function(input) {
      const wrapper = input.closest('.date-picker-wrapper');
      if (!wrapper) return;
      
      const dropdown = wrapper.querySelector('.date-picker-dropdown');
      if (!dropdown) return;

      const grid = dropdown.querySelector('.date-picker-grid');
      const monthDisplay = dropdown.querySelector('.date-picker-month');
      const prevBtn = dropdown.querySelector('.date-picker-prev');
      const nextBtn = dropdown.querySelector('.date-picker-next');
      const applyBtn = dropdown.querySelector('.date-picker-apply');
      const clearBtn = dropdown.querySelector('.date-picker-clear');
      
      let currentDate = new Date();
      let selectedDates = [];
      const minDate = new Date(CONFIG.dates.minDate);

      function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        if (monthDisplay) {
          monthDisplay.textContent = monthNames[month] + ' ' + year;
        }

        // Limpar grid mantendo cabeçalho
        const dayNames = Array.from(grid.querySelectorAll('.date-picker-day-name'));
        grid.innerHTML = '';
        dayNames.forEach(day => grid.appendChild(day));

        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Dias vazios do mês anterior
        for (let i = 0; i < startingDay; i++) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'date-picker-day disabled';
          emptyCell.setAttribute('aria-hidden', 'true');
          grid.appendChild(emptyCell);
        }

        // Dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
          const cell = document.createElement('div');
          cell.className = 'date-picker-day';
          cell.textContent = day;
          cell.setAttribute('role', 'button');
          cell.setAttribute('tabindex', '0');
          cell.setAttribute('aria-label', day + ' de ' + monthNames[month] + ' de ' + year);
          
          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);

          if (cellDate < minDate) {
            cell.classList.add('disabled');
            cell.setAttribute('aria-disabled', 'true');
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (cellDate.getTime() === today.getTime()) {
            cell.classList.add('today');
          }

          if (selectedDates.some(d => d.getTime() === cellDate.getTime())) {
            cell.classList.add('selected');
          }

          cell.addEventListener('click', handleDateSelect);
          cell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDateSelect.call(this);
            }
          });

          grid.appendChild(cell);
        }
      }

      function handleDateSelect() {
        if (this.classList.contains('disabled')) return;

        const day = parseInt(this.textContent, 10);
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        cellDate.setHours(0, 0, 0, 0);

        const existingIndex = selectedDates.findIndex(d => d.getTime() === cellDate.getTime());
        if (existingIndex > -1) {
          selectedDates.splice(existingIndex, 1);
        } else {
          selectedDates.push(cellDate);
          selectedDates.sort((a, b) => a - b);
          if (selectedDates.length > 2) selectedDates.shift();
        }

        renderCalendar(currentDate);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          currentDate.setMonth(currentDate.getMonth() - 1);
          renderCalendar(currentDate);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar(currentDate);
        });
      }

      if (applyBtn) {
        applyBtn.addEventListener('click', function() {
          if (selectedDates.length > 0) {
            if (selectedDates.length === 1) {
              input.value = Utils.formatDate(selectedDates[0]);
            } else {
              input.value = Utils.formatDate(selectedDates[0]) + ' - ' + Utils.formatDate(selectedDates[1]);
            }
          }
          closeDropdown();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', function() {
          input.value = '';
          selectedDates = [];
          closeDropdown();
        });
      }

      function openDropdown() {
        document.querySelectorAll('.date-picker-dropdown.active').forEach(d => {
          if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.add('active');
        renderCalendar(currentDate);
        input.setAttribute('aria-expanded', 'true');
      }

      function closeDropdown() {
        dropdown.classList.remove('active');
        selectedDates = [];
        input.setAttribute('aria-expanded', 'false');
        renderCalendar(currentDate);
      }

      input.addEventListener('click', function() {
        const isActive = dropdown.classList.contains('active');
        if (isActive) {
          closeDropdown();
        } else {
          openDropdown();
        }
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          openDropdown();
        }
        if (e.key === 'Escape') {
          closeDropdown();
        }
      });

      document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
          closeDropdown();
        }
      });

      renderCalendar(currentDate);
    });
  }

  // ===== MÁSCARA DE TELEFONE =====
  function initPhoneMask() {
    const phoneInput = document.getElementById('contactPhone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
      
      e.target.value = value.slice(0, 15);
    });

    phoneInput.addEventListener('blur', function() {
      if (this.value.length < 14) {
        this.value = '';
      }
    });
  }

  // ===== QUICK SEARCH COM PREFILL =====
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
      // Redirecionamento natural para contato.html via action do form
    });
  }

  function prefillContactForm() {
    const searchData = Utils.storage.get(CONFIG.storageKeys.quickSearch);
    if (!searchData) return;

    const fieldMap = {
      destination: 'destination',
      checkIn: 'checkIn',
      checkOut: 'checkOut',
      guests: 'guests'
    };

    Object.entries(fieldMap).forEach(([searchKey, formKey]) => {
      const field = document.getElementById(formKey);
      if (field && searchData[searchKey]) {
        field.value = searchData[searchKey];
      }
    });

    Utils.storage.remove(CONFIG.storageKeys.quickSearch);
  }

  // ===== FORMULÁRIO DE RESERVA =====
  function initBookingForm() {
    const form = document.querySelector(CONFIG.selectors.bookingForm);
    if (!form) return;

    // Validação em tempo real
    form.querySelectorAll('[required]').forEach(function(field) {
      field.addEventListener('blur', function() {
        validateField(this);
      });
      field.addEventListener('input', function() {
        if (this.classList.contains('error') && this.value.trim()) {
          this.classList.remove('error');
        }
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      let isValid = true;
      form.querySelectorAll('[required]').forEach(function(field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        showAlert('Preencha todos os campos obrigatórios corretamente.', 'error');
        return;
      }

      const formData = {
        id: 'REQ-' + Date.now(),
        checkIn: document.getElementById('checkIn')?.value,
        checkOut: document.getElementById('checkOut')?.value,
        destination: document.getElementById('destination')?.value,
        hotelPreference: document.getElementById('hotelPreference')?.value,
        guests: document.getElementById('guests')?.value,
        rooms: document.getElementById('rooms')?.value,
        travelPurpose: document.getElementById('travelPurpose')?.value,
        companyName: document.getElementById('companyName')?.value,
        contactName: document.getElementById('contactName')?.value,
        contactEmail: document.getElementById('contactEmail')?.value,
        contactPhone: document.getElementById('contactPhone')?.value,
        additionalInfo: document.getElementById('additionalInfo')?.value,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      const requests = Utils.storage.get(CONFIG.storageKeys.requests) || [];
      requests.unshift(formData);
      Utils.storage.set(CONFIG.storageKeys.requests, requests);

      showAlert('Solicitação enviada com sucesso. Nossa equipe entrará em contato em até 24 horas.', 'success');
      form.reset();

      if (typeof renderUserRequests === 'function') {
        renderUserRequests();
      }
    });
  }

  function validateField(field) {
    const value = field.value.trim();
    const isValid = value !== '';
    
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
    // Remover alerts existentes
    document.querySelectorAll('.alert').forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.textContent = message;
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'polite');

    const mainContent = document.querySelector('.section-container') || document.body;
    mainContent.insertBefore(alert, mainContent.firstChild);

    // Auto-remover com fade out
    setTimeout(function() {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  // ===== DASHBOARD DO USUÁRIO =====
  function renderUserRequests() {
    const container = document.getElementById('userRequestsList');
    if (!container) return;

    const user = getCurrentUser();
    if (!user) {
      container.innerHTML = '<p class="text-center">Faça login para visualizar suas solicitações.</p>';
      return;
    }

    const requests = Utils.storage.get(CONFIG.storageKeys.requests) || [];
    const userRequests = requests.filter(r => r.contactEmail === user.email);

    if (userRequests.length === 0) {
      container.innerHTML = '<p class="text-center">Nenhuma solicitação encontrada.</p>';
      return;
    }

    container.innerHTML = userRequests.map(function(req) {
      const statusClass = req.status || 'pending';
      const statusText = {
        pending: 'Em análise',
        approved: 'Aprovada',
        rejected: 'Não aprovada'
      }[statusClass] || 'Em análise';

      return '<article class="request-item">' +
        '<header class="request-item-header">' +
          '<strong>' + Utils.escapeHtml(req.destination) + '</strong>' +
          '<span class="request-item-status ' + statusClass + '">' + statusText + '</span>' +
        '</header>' +
        '<p class="request-item-dates">' + Utils.escapeHtml(req.checkIn) + ' a ' + Utils.escapeHtml(req.checkOut) + '</p>' +
        '<p class="request-item-destination">' + (req.hotelPreference ? 'Hotel: ' + Utils.escapeHtml(req.hotelPreference) : 'Sem preferência') + '</p>' +
        '<footer class="request-item-footer">' +
          '<small>Solicitado em: ' + new Date(req.timestamp).toLocaleDateString('pt-BR') + '</small>' +
        '</footer>' +
      '</article>';
    }).join('');
  }

  // ===== SMOOTH SCROLL PARA LINKS INTERNOS =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ===== INICIALIZAÇÃO =====
  function init() {
    initMobileMenu();
    initAuthModal();
    initDatePickers();
    initPhoneMask();
    initQuickSearch();
    initBookingForm();
    initSmoothScroll();

    // Verificar usuário logado
    const user = getCurrentUser();
    if (user) {
      updateUserInterface(user);
    }

    // Prefill do formulário de contato
    if (document.querySelector(CONFIG.selectors.bookingForm)) {
      setTimeout(prefillContactForm, 50);
    }

    // Renderizar dashboard
    if (document.getElementById('userRequestsList')) {
      renderUserRequests();
    }
  }

  // Executar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();