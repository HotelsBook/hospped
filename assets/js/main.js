/**
 * Hospped - Funcionalidades Principais
 * Versão profissional sem dependências externas
 */

(function() {
  'use strict';

  // ===== MENU MOBILE =====
  function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (menuBtn && navMenu) {
      menuBtn.addEventListener('click', function() {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));
        navMenu.classList.toggle('active');
      });

      // Fechar menu ao clicar em link
      navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          navMenu.classList.remove('active');
          menuBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ===== MODAL DE AUTENTICAÇÃO =====
  function initAuthModal() {
    const modal = document.getElementById('authModal');
    const openBtns = document.querySelectorAll('[data-auth-trigger]');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');

    if (!modal) return;

    // Abrir modal
    openBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        showLogin();
      });
    });

    // Fechar modal
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Alternar entre login e registro
    function showLogin() {
      if (loginForm) loginForm.classList.remove('hidden');
      if (registerForm) registerForm.classList.add('hidden');
    }

    function showRegister() {
      if (loginForm) loginForm.classList.add('hidden');
      if (registerForm) registerForm.classList.remove('hidden');
    }

    if (toggleToRegister) {
      toggleToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
      });
    }

    if (toggleToLogin) {
      toggleToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
      });
    }

    // Submissão do formulário de login (demo)
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
          showFormError(loginForm, 'Preencha todos os campos obrigatórios.');
          return;
        }

        // Demo: simular autenticação
        // Em produção: integrar com backend FastAPI
        const userData = {
          email: email,
          name: email.split('@')[0],
          type: 'client',
          token: 'demo-token-' + Date.now()
        };

        localStorage.setItem('hospped_user', JSON.stringify(userData));
        closeModal();
        updateUserInterface(userData);
        showAlert('Login realizado com sucesso.', 'success');
      });
    }

    // Submissão do formulário de registro (demo)
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const company = document.getElementById('registerCompany').value;
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
          showFormError(registerForm, 'Preencha todos os campos obrigatórios.');
          return;
        }

        // Demo: simular registro
        const userData = {
          email: email,
          name: name,
          company: company,
          type: 'client',
          token: 'demo-token-' + Date.now()
        };

        localStorage.setItem('hospped_user', JSON.stringify(userData));
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
      setTimeout(function() {
        errorEl.classList.remove('visible');
      }, 5000);
    }
  }

  function updateUserInterface(userData) {
    const userActions = document.querySelector('.user-actions');
    if (!userActions || !userData) return;

    userActions.innerHTML = 
      '<span class="btn-user" id="userMenuBtn">' + escapeHtml(userData.name) + '</span>';
    
    // Adicionar menu dropdown (simplificado)
    document.getElementById('userMenuBtn').addEventListener('click', function() {
      if (confirm('Deseja sair da conta?')) {
        localStorage.removeItem('hospped_user');
        location.reload();
      }
    });
  }

  function getCurrentUser() {
    try {
      const user = localStorage.getItem('hospped_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== DATE PICKER CUSTOMIZADO =====
  function initDatePickers() {
    const dateInputs = document.querySelectorAll('.date-picker-input');
    
    dateInputs.forEach(function(input) {
      const wrapper = input.closest('.date-picker-wrapper');
      const dropdown = wrapper.querySelector('.date-picker-dropdown');
      const grid = dropdown.querySelector('.date-picker-grid');
      const monthDisplay = dropdown.querySelector('.date-picker-month');
      const prevBtn = dropdown.querySelector('.date-picker-prev');
      const nextBtn = dropdown.querySelector('.date-picker-next');
      const applyBtn = dropdown.querySelector('.date-picker-apply');
      const clearBtn = dropdown.querySelector('.date-picker-clear');
      
      let currentDate = new Date();
      let selectedDates = [];
      const minDate = new Date(); // Não permitir datas passadas
      minDate.setHours(0, 0, 0, 0);

      function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Atualizar título
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthDisplay.textContent = monthNames[month] + ' ' + year;

        // Limpar grid (exceto cabeçalho)
        const dayNames = grid.querySelectorAll('.date-picker-day-name');
        grid.innerHTML = '';
        dayNames.forEach(function(day) {
          grid.appendChild(day);
        });

        // Primeiro dia do mês
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Seg=0

        // Dias do mês
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Dias do mês anterior
        for (let i = 0; i < startingDay; i++) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'date-picker-day disabled';
          grid.appendChild(emptyCell);
        }

        // Dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
          const cell = document.createElement('div');
          cell.className = 'date-picker-day';
          cell.textContent = day;
          
          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);

          // Desabilitar datas passadas
          if (cellDate < minDate) {
            cell.classList.add('disabled');
          }

          // Marcar data atual
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (cellDate.getTime() === today.getTime()) {
            cell.classList.add('today');
          }

          // Marcar datas selecionadas
          if (selectedDates.some(function(d) {
            return d.getTime() === cellDate.getTime();
          })) {
            cell.classList.add('selected');
          }

          cell.addEventListener('click', function() {
            if (cell.classList.contains('disabled')) return;

            // Toggle seleção
            const existingIndex = selectedDates.findIndex(function(d) {
              return d.getTime() === cellDate.getTime();
            });

            if (existingIndex > -1) {
              selectedDates.splice(existingIndex, 1);
            } else {
              selectedDates.push(cellDate);
              // Ordenar datas
              selectedDates.sort(function(a, b) { return a - b; });
            }

            renderCalendar(date);
          });

          grid.appendChild(cell);
        }
      }

      // Navegação entre meses
      prevBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
      });

      nextBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
      });

      // Aplicar seleção
      applyBtn.addEventListener('click', function() {
        if (selectedDates.length > 0) {
          const formatDate = function(d) {
            return String(d.getDate()).padStart(2, '0') + '/' + 
                   String(d.getMonth() + 1).padStart(2, '0') + '/' + 
                   d.getFullYear();
          };
          
          if (selectedDates.length === 1) {
            input.value = formatDate(selectedDates[0]);
          } else {
            input.value = formatDate(selectedDates[0]) + ' - ' + formatDate(selectedDates[1]);
          }
        }
        dropdown.classList.remove('active');
        selectedDates = [];
        renderCalendar(currentDate);
      });

      // Limpar seleção
      clearBtn.addEventListener('click', function() {
        input.value = '';
        selectedDates = [];
        dropdown.classList.remove('active');
        renderCalendar(currentDate);
      });

      // Toggle dropdown
      input.addEventListener('click', function() {
        const isActive = dropdown.classList.contains('active');
        // Fechar todos os dropdowns
        document.querySelectorAll('.date-picker-dropdown').forEach(function(d) {
          d.classList.remove('active');
        });
        if (!isActive) {
          dropdown.classList.add('active');
          renderCalendar(currentDate);
        }
      });

      // Fechar ao clicar fora
      document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });

      // Renderizar inicial
      renderCalendar(currentDate);
    });
  }

  // ===== FORMULÁRIO DE SOLICITAÇÃO DE RESERVA =====
  function initBookingForm() {
    const form = document.getElementById('bookingRequestForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Validação básica
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) {
        showAlert('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      // Coletar dados do formulário
      const formData = {
        checkIn: document.getElementById('checkIn').value,
        checkOut: document.getElementById('checkOut').value,
        destination: document.getElementById('destination').value,
        hotelPreference: document.getElementById('hotelPreference').value,
        guests: document.getElementById('guests').value,
        rooms: document.getElementById('rooms').value,
        travelPurpose: document.getElementById('travelPurpose').value,
        companyName: document.getElementById('companyName').value,
        contactName: document.getElementById('contactName').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value,
        additionalInfo: document.getElementById('additionalInfo').value,
        timestamp: new Date().toISOString()
      };

      // Demo: salvar solicitação localmente
      // Em produção: enviar para backend via API
      const requests = JSON.parse(localStorage.getItem('hospped_requests') || '[]');
      requests.push(formData);
      localStorage.setItem('hospped_requests', JSON.stringify(requests));

      // Feedback ao usuário
      showAlert('Solicitação enviada com sucesso. Nossa equipe entrará em contato em até 24 horas.', 'success');
      form.reset();

      // Atualizar dashboard se estiver na página do usuário
      if (typeof renderUserRequests === 'function') {
        renderUserRequests();
      }
    });
  }

  // ===== ALERTS =====
  function showAlert(message, type) {
    // Remover alerts existentes
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(function(alert) {
      alert.remove();
    });

    // Criar novo alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.textContent = message;
    alert.setAttribute('role', 'alert');

    // Inserir no topo do conteúdo principal
    const mainContent = document.querySelector('.section-container') || document.body;
    mainContent.insertBefore(alert, mainContent.firstChild);

    // Auto-remover após 5 segundos
    setTimeout(function() {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.3s ease';
      setTimeout(function() { alert.remove(); }, 300);
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

    const requests = JSON.parse(localStorage.getItem('hospped_requests') || '[]');
    const userRequests = requests.filter(function(r) {
      return r.contactEmail === user.email;
    });

    if (userRequests.length === 0) {
      container.innerHTML = '<p class="text-center">Nenhuma solicitação encontrada.</p>';
      return;
    }

    container.innerHTML = userRequests.map(function(req) {
      return '<div class="request-item">' +
        '<div class="request-item-header">' +
          '<strong>' + escapeHtml(req.destination) + '</strong>' +
          '<span class="request-item-status pending">Em análise</span>' +
        '</div>' +
        '<div class="request-item-dates">' + escapeHtml(req.checkIn) + ' a ' + escapeHtml(req.checkOut) + '</div>' +
        '<div class="request-item-destination">' + (req.hotelPreference ? 'Hotel: ' + escapeHtml(req.hotelPreference) : 'Sem preferência') + '</div>' +
      '</div>';
    }).join('');
  }

  // ===== INICIALIZAÇÃO =====
  function init() {
    initMobileMenu();
    initAuthModal();
    initDatePickers();
    initBookingForm();

    // Verificar usuário logado
    const user = getCurrentUser();
    if (user) {
      updateUserInterface(user);
    }

    // Renderizar solicitações se estiver no dashboard
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