(function() {

  // =========================================================================
  // TABLA FIJA DE USUARIOS, ROLES Y PINS
  // =========================================================================
  const DEFAULT_USERS = [
    {
      email: 'lucio@elite.com',
      pin: '1997',
      role: 'admin',
      name: 'Lucio (Dueño)'
    },
    {
      email: 'encargado@elite.com',
      pin: '4321',
      role: 'encargado',
      name: 'Marcos Gómez (Encargado)'
    },
    {
      email: 'carlos@elite.com',
      pin: '1111',
      role: 'barbero',
      name: 'Carlos R.'
    },
    {
      email: 'roberto@elite.com',
      pin: '2222',
      role: 'barbero',
      name: 'Roberto M.'
    },
    {
      email: 'luis@elite.com',
      pin: '3333',
      role: 'barbero',
      name: 'Luis G.'
    }
  ];

  // CATÁLOGO DE SERVICIOS
  const DEFAULT_SERVICES = [
    { id: 'fade', name: 'Fade Signature', price: 180, duration: '40 min' },
    { id: 'barba', name: 'Perfilado & Barba', price: 200, duration: '30 min' },
    { id: 'facial', name: 'Limpieza Facial con Vapor', price: 150, duration: '25 min' },
    { id: 'ceja', name: 'Delineado de Ceja a Navaja', price: 80, duration: '15 min' },
    { id: 'royal', name: 'Tratamiento Real ELITE VIP', price: 600, duration: '60 min' }
  ];

  // INVENTARIO
  const DEFAULT_INVENTORY = [
    { id: 1, name: 'Pomada Matte Fuerte (100g)', stock: 18, minAlert: 5, unitPrice: 220 },
    { id: 2, name: 'Aceite de Argán para Barba (50ml)', stock: 12, minAlert: 4, unitPrice: 190 },
    { id: 3, name: 'Navajas Platinum Japonesas (Caja 100)', stock: 6, minAlert: 2, unitPrice: 150 },
    { id: 4, name: 'Toallas Faciales de Eucalipto', stock: 25, minAlert: 10, unitPrice: 45 },
    { id: 5, name: 'Aftershave Tónico Refrescante', stock: 8, minAlert: 3, unitPrice: 180 }
  ];

  // CITAS DE SUCURSAL
  const DEFAULT_APPOINTMENTS = [
    { id: 101, client: 'Javier Morales', phone: '868-123-4567', service: 'Fade Signature', price: 180, barber: 'Carlos R.', time: '09:30 AM', status: 'Completado' },
    { id: 102, client: 'Arturo Peña', phone: '868-765-4321', service: 'Perfilado & Barba', price: 200, barber: 'Carlos R.', time: '10:30 AM', status: 'Completado' },
    { id: 103, client: 'Daniel Lozano', phone: '868-444-1122', service: 'Fade Signature', price: 180, barber: 'Roberto M.', time: '11:00 AM', status: 'Completado' },
    { id: 104, client: 'Fernando Soto', phone: '868-999-3322', service: 'Limpieza Facial con Vapor', price: 150, barber: 'Luis G.', time: '11:45 AM', status: 'Completado' },
    { id: 105, client: 'Mauricio Garza', phone: '868-555-8899', service: 'Tratamiento Real ELITE VIP', price: 600, barber: 'Carlos R.', time: '01:15 PM', status: 'Completado' },
    { id: 106, client: 'Alejandro Ruiz', phone: '868-222-3344', service: 'Fade Signature', price: 180, barber: 'Roberto M.', time: '02:00 PM', status: 'Completado' },
    { id: 107, client: 'Gabriel Cantú', phone: '868-777-1199', service: 'Perfilado & Barba', price: 200, barber: 'Luis G.', time: '02:45 PM', status: 'Pendiente' },
    { id: 108, client: 'Héctor Villarreal', phone: '868-333-8811', service: 'Delineado de Ceja a Navaja', price: 80, barber: 'Carlos R.', time: '03:30 PM', status: 'Pendiente' }
  ];

  const DEFAULT_HOURS = {
    weekday: 'Lunes a Sábado: 10:00 AM – 8:00 PM',
    weekend: 'Domingo: 11:00 AM – 4:00 PM'
  };

  function loadData(key, defaultVal) {
    const saved = localStorage.getItem('elite_' + key);
    if (!saved) {
      localStorage.setItem('elite_' + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try {
      return JSON.parse(saved);
    } catch(e) {
      return defaultVal;
    }
  }

  function saveData(key, val) {
    localStorage.setItem('elite_' + key, JSON.stringify(val));
  }

  let users = loadData('users', DEFAULT_USERS);
  let services = loadData('services', DEFAULT_SERVICES);
  let inventory = loadData('inventory', DEFAULT_INVENTORY);
  let appointments = loadData('appointments', DEFAULT_APPOINTMENTS);
  let hours = loadData('hours', DEFAULT_HOURS);
  let clockLog = loadData('clockLog', [
    { barber: 'Carlos R.', type: 'Entrada', time: '09:15 AM', date: 'Hoy' },
    { barber: 'Roberto M.', type: 'Entrada', time: '10:00 AM', date: 'Hoy' }
  ]);

  let currentAppointmentsPage = 1;
  const APPOINTMENTS_PAGE_SIZE = 10;

  let currentUser = JSON.parse(sessionStorage.getItem('elite_session')) || null;

  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPass = document.getElementById('login-pass');
  const loginError = document.getElementById('login-error');
  const adminLayout = document.getElementById('admin-layout');
  const topbarRoleTag = document.getElementById('topbar-role-tag');
  const topbarUserName = document.getElementById('topbar-user-name');
  const btnLogout = document.getElementById('btn-logout');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const mainContentArea = document.getElementById('main-content-area');

  // CONTROL DE INICIO DE SESIÓN CON PIN EXACTO
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputEmail = loginEmail.value.trim().toLowerCase();
      const inputPin = loginPass.value.trim();

      const matchedUser = users.find(u => 
        u.email.trim().toLowerCase() === inputEmail && u.pin.trim() === inputPin
      );

      if (matchedUser) {
        if (loginError) loginError.style.display = 'none';
        currentUser = {
          email: matchedUser.email,
          role: matchedUser.role,
          name: matchedUser.name
        };
        sessionStorage.setItem('elite_session', JSON.stringify(currentUser));
        loginPass.value = '';
        initApp();
      } else {
        if (loginError) {
          loginError.style.display = 'block';
          loginError.textContent = '⚠ Correo o PIN incorrecto. Verifica tus datos de acceso.';
        }
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('elite_session');
      currentUser = null;
      initApp();
    });
  }

  function initApp() {
    if (!currentUser) {
      if (loginOverlay) loginOverlay.style.display = 'flex';
      if (adminLayout) adminLayout.style.display = 'none';
      return;
    }

    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';

    topbarUserName.textContent = currentUser.name;
    topbarRoleTag.className = 'role-tag';

    if (currentUser.role === 'admin') {
      topbarRoleTag.textContent = '👑 Dueño / Administrador';
      topbarRoleTag.classList.add('role-admin');
    } else if (currentUser.role === 'encargado') {
      topbarRoleTag.textContent = '📋 Encargado de Sucursal';
      topbarRoleTag.classList.add('role-encargado');
    } else {
      topbarRoleTag.textContent = '✂ Barbero Oficial';
      topbarRoleTag.classList.add('role-barbero');
    }

    renderNavigation();
    navigateTab(getDefaultTabForRole());
  }

  function getDefaultTabForRole() {
    if (currentUser.role === 'barbero') return 'barbero_citas';
    return 'kpis';
  }

  // =========================================================================
  // ORDEN EXACTO DEL MENÚ LATERAL SEGÚN PETICIÓN
  // 1. Resumen & Ganancias
  // 2. Citas y Clientes
  // 3. Comisiones Staff
  // 4. Modificar precios
  // 5. Manejo de inventario
  // 6. Personal & pins
  // (y Modificar Horarios)
  // =========================================================================
  function renderNavigation() {
    sidebarMenu.innerHTML = '';
    const items = [];

    if (currentUser.role === 'admin') {
      items.push({ id: 'kpis', icon: '📊', label: 'Resumen & Ganancias' });
      items.push({ id: 'appointments', icon: '📅', label: 'Citas y Clientes' });
      items.push({ id: 'commissions', icon: '💰', label: 'Comisiones Staff' });
      items.push({ id: 'services_pricing', icon: '🏷️', label: 'Modificar Precios' });
      items.push({ id: 'inventory', icon: '📦', label: 'Manejo de Inventario' });
      items.push({ id: 'users_manager', icon: '👥', label: 'Personal & PINs' });
      items.push({ id: 'business_hours', icon: '⏱️', label: 'Modificar Horarios' });
    } else if (currentUser.role === 'encargado') {
      items.push({ id: 'kpis', icon: '📊', label: 'Ventas de Sucursal' });
      items.push({ id: 'appointments', icon: '📅', label: 'Citas y Clientes' });
      items.push({ id: 'inventory', icon: '📦', label: 'Manejo de Inventario' });
      items.push({ id: 'business_hours', icon: '⏱️', label: 'Ver Horarios' });
    } else if (currentUser.role === 'barbero') {
      items.push({ id: 'barbero_citas', icon: '✂', label: 'Mis Citas de Hoy' });
      items.push({ id: 'barbero_reloj', icon: '⏱️', label: 'Reloj Checador' });
      items.push({ id: 'barbero_servicios', icon: '💈', label: 'Mis Servicios Realizados' });
      items.push({ id: 'barbero_comisiones', icon: '💵', label: 'Mis Comisiones' });
    }

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'sidebar-link' + (index === 0 ? ' active' : '');
      li.innerHTML = `<span>${item.icon}</span> <span>${item.label}</span>`;
      li.onclick = () => {
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        li.classList.add('active');
        navigateTab(item.id);
      };
      sidebarMenu.appendChild(li);
    });
  }

  window.navigateTab = function(tabId) {
    switch (tabId) {
      case 'kpis': renderKPIsView(); break;
      case 'appointments': renderAppointmentsView(); break;
      case 'commissions': renderCommissionsView(); break;
      case 'services_pricing': renderPricingView(); break;
      case 'inventory': renderInventoryView(); break;
      case 'users_manager': renderUsersManagerView(); break;
      case 'business_hours': renderHoursView(); break;
      case 'barbero_citas': renderBarberoCitasView(); break;
      case 'barbero_reloj': renderBarberoRelojView(); break;
      case 'barbero_servicios': renderBarberoServiciosView(); break;
      case 'barbero_comisiones': renderBarberoComisionesView(); break;
    }
  };

  // 1. CIERRE SEMANAL & DESCARGA EN BLOCK DE NOTAS (.TXT)
  window.closeWeeklyCycle = function() {
    if (currentUser.role !== 'admin') return;

    const confirmReset = confirm(
      "¿Confirmas el CIERRE DE LA SEMANA y REINICIO de estadísticas?\n\n" +
      "1. Se descargará automáticamente un archivo de texto (.txt) con todas las citas, ventas y comisiones.\n" +
      "2. Las citas del sistema se reiniciarán a cero para iniciar la nueva semana limpia.\n" +
      "3. Tu catálogo de precios, inventario y usuarios permanecerán intactos."
    );

    if (!confirmReset) return;

    const totalSales = appointments.reduce((sum, a) => sum + (a.status === 'Completado' ? a.price : 0), 0);
    const totalClients = appointments.length;
    const totalCommissions = Math.round(totalSales * 0.50);
    const netProfit = totalSales - totalCommissions;

    const barberStats = {};
    appointments.forEach(a => {
      if (!barberStats[a.barber]) {
        barberStats[a.barber] = { totalSales: 0, count: 0, services: [] };
      }
      if (a.status === 'Completado') {
        barberStats[a.barber].totalSales += a.price;
        barberStats[a.barber].count++;
        barberStats[a.barber].services.push(`${a.service} ($${a.price})`);
      }
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const report = [];
    report.push("===============================================================================");
    report.push("                  ELITE BARBERSHOP - REPORTE DE CIERRE SEMANAL                 ");
    report.push("                        Matamoros, Tamaulipas, México                          ");
    report.push("===============================================================================");
    report.push(`Fecha de Emisión: ${dateStr} a las ${timeStr}`);
    report.push(`Generado por: ${currentUser.name}`);
    report.push("Estado del ciclo: FINALIZADO Y CERRADO\n");

    report.push("-------------------------------------------------------------------------------");
    report.push("1. RESUMEN FINANCIERO GENERAL DEL PERIODO");
    report.push("-------------------------------------------------------------------------------");
    report.push(`• Facturación Total Bruta:        $${totalSales.toLocaleString()} MXN`);
    report.push(`• Ganancia Neta Barbería (50%):   $${netProfit.toLocaleString()} MXN`);
    report.push(`• Total Comisiones Staff (50%):   $${totalCommissions.toLocaleString()} MXN`);
    report.push(`• Total de Clientes Atendidos:    ${totalClients} citas registradas\n`);

    report.push("-------------------------------------------------------------------------------");
    report.push("2. DESGLOSE DE COMISIONES POR BARBERO");
    report.push("-------------------------------------------------------------------------------");
    if (Object.keys(barberStats).length === 0) {
      report.push("No se registraron servicios completados en este ciclo.\n");
    } else {
      Object.keys(barberStats).forEach(bName => {
        const b = barberStats[bName];
        const comm = Math.round(b.totalSales * 0.50);
        report.push(`• BARBERO: ${bName.toUpperCase()}`);
        report.push(`  - Cortes / Servicios Realizados: ${b.count}`);
        report.push(`  - Facturación Generada:          $${b.totalSales.toLocaleString()} MXN`);
        report.push(`  - Comisión a Pagar (50%):        $${comm.toLocaleString()} MXN`);
        report.push(`  - Detalle de trabajos:           ${b.services.join(' | ') || 'Ninguno'}\n`);
      });
    }

    report.push("-------------------------------------------------------------------------------");
    report.push("3. REGISTRO COMPLETO DE CITAS Y SERVICIOS");
    report.push("-------------------------------------------------------------------------------");
    report.push("FOLIO   | HORA     | CLIENTE              | BARBERO      | ESTADO     | MONTO");
    report.push("-------------------------------------------------------------------------------");
    if (appointments.length === 0) {
      report.push("Sin citas registradas.");
    } else {
      appointments.forEach(a => {
        const folio = (`#${a.id}`).padEnd(8);
        const hora = (a.time || '--:--').padEnd(9);
        const cliente = (a.client || 'Cliente').padEnd(21);
        const barbero = (a.barber || 'Sin asignar').padEnd(13);
        const estado = (a.status || '').padEnd(11);
        const monto = `$${a.price} MXN`;
        report.push(`${folio}| ${hora}| ${cliente}| ${barbero}| ${estado}| ${monto}`);
      });
    }

    report.push("\n===============================================================================");
    report.push("          FIN DEL REPORTE - ESTADÍSTICAS REINICIADAS CORRECTAMENTE             ");
    report.push("===============================================================================");

    const reportText = report.join("\r\n");

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filenameDate = now.toISOString().slice(0, 10);
    link.href = fileUrl;
    link.download = `Reporte_Cierre_ELITE_${filenameDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    appointments = [];
    saveData('appointments', appointments);

    alert(
      "✅ ¡Cierre de semana completado!\n\n" +
      `Se ha descargado el archivo "Reporte_Cierre_ELITE_${filenameDate}.txt" en tu computadora con todo el respaldo.\n` +
      "Las estadísticas y citas han sido reiniciadas a cero para iniciar la nueva semana."
    );

    renderKPIsView();
  };

  // 2. RESUMEN & GANANCIAS CON MONITOREO DE ASISTENCIA EN VIVO
  function renderKPIsView() {
    let totalSales = appointments.reduce((sum, a) => sum + (a.status === 'Completado' ? a.price : 0), 0);
    let totalClients = appointments.length;
    let totalCommissions = Math.round(totalSales * 0.50);
    let netProfit = totalSales - totalCommissions;

    let html = `
      <div class="view-animated">
        <div class="section-header-box" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 class="section-header-title">${currentUser.role === 'admin' ? 'Balance General & Ganancias' : 'Ventas del Día - Sucursal Matamoros'}</h2>
            <p class="section-header-sub">Métricas en tiempo real de operaciones en piso.</p>
          </div>

          ${currentUser.role === 'admin' ? `
            <div>
              <button class="btn-reset-week" onclick="closeWeeklyCycle()">
                <span>🔄</span>
                <span>Cierre Semanal & Descargar Reporte (.txt)</span>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="kpi-grid">
          <div class="kpi-card terracotta">
            <div class="kpi-title">Ventas Brutas Periodo</div>
            <div class="kpi-val">$${totalSales.toLocaleString()} MXN</div>
          </div>
    `;

    if (currentUser.role === 'admin') {
      html += `
          <div class="kpi-card green">
            <div class="kpi-title">Ganancia Neta Barbería</div>
            <div class="kpi-val">$${netProfit.toLocaleString()} MXN</div>
          </div>
          <div class="kpi-card gold">
            <div class="kpi-title">Comisiones Staff a Pagar</div>
            <div class="kpi-val">$${totalCommissions.toLocaleString()} MXN</div>
          </div>
      `;
    }

    html += `
          <div class="kpi-card">
            <div class="kpi-title">Citas Registradas</div>
            <div class="kpi-val">${totalClients}</div>
          </div>
        </div>
    `;

    const barbersList = users.filter(u => u.role === 'barbero');

    html += `
        <div class="data-table-card">
          <div class="data-table-header">
            <h3>💈 Asistencia del Personal en Tiempo Real</h3>
          </div>
          <div class="barber-status-grid">
            ${barbersList.map(b => {
              const logs = clockLog.filter(c => c.barber === b.name);
              const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
              const isWorking = lastLog && lastLog.type === 'Entrada';
              const cutsDone = appointments.filter(a => a.barber === b.name && a.status === 'Completado').length;

              let badgeHtml = '';
              let detailsHtml = '';

              if (isWorking) {
                badgeHtml = `<span class="badge-shift-in"><span class="pulse-indicator"></span> En Turno</span>`;
                detailsHtml = `Entró a las: <strong style="color: var(--cyan);">${lastLog.time}</strong>`;
              } else if (lastLog && lastLog.type === 'Salida') {
                badgeHtml = `<span class="badge-shift-out">○ Fuera de Turno</span>`;
                detailsHtml = `Salió a las: <strong>${lastLog.time}</strong>`;
              } else {
                badgeHtml = `<span class="badge-shift-none">○ Sin Registro</span>`;
                detailsHtml = `Aún no ha checado hoy`;
              }

              return `
                <div class="barber-status-card">
                  <div class="barber-status-info">
                    <h4>${b.name}</h4>
                    <p>${detailsHtml}</p>
                    <p style="margin-top: 0.35rem; color: var(--gold); font-weight: 700;">Cortes hoy: ${cutsDone}</p>
                  </div>
                  <div>
                    ${badgeHtml}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    mainContentArea.innerHTML = html;
  }

  // =========================================================================
  // 3. CITAS Y CLIENTES CON CHECKBOXES MÚLTIPLES DE SERVICIOS
  // =========================================================================
  function renderAppointmentsView() {
    const sortedAppointments = [...appointments].sort((a, b) => b.id - a.id);

    const totalPages = Math.ceil(sortedAppointments.length / APPOINTMENTS_PAGE_SIZE) || 1;
    if (currentAppointmentsPage > totalPages) currentAppointmentsPage = totalPages;
    if (currentAppointmentsPage < 1) currentAppointmentsPage = 1;

    const startIndex = (currentAppointmentsPage - 1) * APPOINTMENTS_PAGE_SIZE;
    const paginatedAppointments = sortedAppointments.slice(startIndex, startIndex + APPOINTMENTS_PAGE_SIZE);

    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Citas y Clientes</h2>
          <p class="section-header-sub">Agenda general en Matamoros. Mostrando las citas más recientes primero.</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Registrar Nuevo Cliente / Walk-in</h3>
          </div>
          
          <form id="new-client-form">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 1.2rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Nombre del Cliente</label>
                <input type="text" id="nc-name" required class="form-control" placeholder="Ej. Roberto Garza" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Teléfono</label>
                <input type="text" id="nc-phone" required class="form-control" placeholder="868-..." />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Barbero Asignado</label>
                <select id="nc-barber" class="form-control">
                  ${users.filter(u => u.role === 'barbero').map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- CHIPS INTERACTIVOS DE SERVICIOS (SELECCIÓN MÚLTIPLE CON CHECKBOX) -->
            <div style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.2rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
                <label style="font-size: 0.78rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">
                  Servicios Solicitados (Puedes marcar varios)
                </label>
                <span id="nc-services-total-badge" style="font-size: 0.95rem; font-weight: 800; color: var(--cyan); background: rgba(0, 180, 216, 0.12); border: 1px solid var(--cyan); padding: 0.25rem 0.85rem; border-radius: 50px;">
                  Total (1 serv.): $180 MXN
                </span>
              </div>
              
              <div class="service-checkbox-chips">
                ${services.map((s, idx) => `
                  <label class="service-chip-label ${idx === 0 ? 'selected' : ''}" id="chip-lbl-${s.id}">
                    <input type="checkbox" name="nc-service-check" value="${s.price}" data-name="${s.name}" data-id="${s.id}" ${idx === 0 ? 'checked' : ''} onchange="toggleServiceChip(this)" />
                    <span class="chip-check-icon">✓</span>
                    <span class="chip-name">${s.name}</span>
                    <span class="chip-price">+$${s.price} MXN</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <button type="submit" class="btn-primary" style="max-width: 250px; font-size: 1rem;">
              + Registrar Cita
            </button>
          </form>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Citas Registradas (${sortedAppointments.length} citas en total)</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Servicio(s)</th>
                  <th>Barbero</th>
                  <th>Precio Total</th>
                  <th>Estatus</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${paginatedAppointments.length === 0 ? `
                  <tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay citas registradas en este momento.</td></tr>
                ` : paginatedAppointments.map(a => `
                  <tr>
                    <td><strong>#${a.id}</strong></td>
                    <td>${a.time}</td>
                    <td><strong>${a.client}</strong></td>
                    <td>${a.phone}</td>
                    <td><span style="color: var(--text-main); font-weight: 600;">${a.service}</span></td>
                    <td>${a.barber}</td>
                    <td><strong style="color: var(--cyan);">$${a.price.toLocaleString()} MXN</strong></td>
                    <td><span style="color: ${a.status === 'Completado' ? 'var(--green)' : 'var(--gold)'}; font-weight: 700;">● ${a.status}</span></td>
                    <td>
                      ${a.status !== 'Completado' ? `
                        <button class="btn-sm btn-success" onclick="completeAppointment(${a.id})">Cobrar / Finalizar</button>
                      ` : '<span style="color: var(--text-muted); font-size: 0.82rem;">Cobrado</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="pagination-container">
            <span class="page-indicator-text">
              Página ${currentAppointmentsPage} de ${totalPages} (Mostrando ${paginatedAppointments.length} de ${sortedAppointments.length} citas)
            </span>
            <div class="pagination-controls">
              <button class="btn-page" onclick="changeAppointmentsPage(-1)" ${currentAppointmentsPage <= 1 ? 'disabled' : ''}>
                ← Anterior
              </button>
              <button class="btn-page" onclick="changeAppointmentsPage(1)" ${currentAppointmentsPage >= totalPages ? 'disabled' : ''}>
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    window.toggleServiceChip = function(input) {
      const lbl = document.getElementById('chip-lbl-' + input.getAttribute('data-id'));
      if (lbl) {
        if (input.checked) lbl.classList.add('selected');
        else lbl.classList.remove('selected');
      }
      updateNewClientTotal();
    };

    function updateNewClientTotal() {
      const checks = document.querySelectorAll('input[name="nc-service-check"]');
      let total = 0;
      let count = 0;
      checks.forEach(c => {
        if (c.checked) {
          total += parseInt(c.value, 10);
          count++;
        }
      });
      const badge = document.getElementById('nc-services-total-badge');
      if (badge) {
        badge.textContent = `Total (${count} serv.): $${total.toLocaleString()} MXN`;
      }
      return { total, count };
    }

    document.getElementById('new-client-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const checkedInputs = document.querySelectorAll('input[name="nc-service-check"]:checked');
      if (checkedInputs.length === 0) {
        return alert('Por favor selecciona al menos un servicio con las casillas.');
      }

      const serviceNames = [];
      let totalSum = 0;
      checkedInputs.forEach(inp => {
        serviceNames.push(inp.getAttribute('data-name'));
        totalSum += parseInt(inp.value, 10);
      });

      const maxId = appointments.reduce((max, a) => Math.max(max, a.id), 100);
      const newApp = {
        id: maxId + 1,
        client: document.getElementById('nc-name').value.trim(),
        phone: document.getElementById('nc-phone').value.trim(),
        service: serviceNames.join(' + '),
        price: totalSum,
        barber: document.getElementById('nc-barber').value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Pendiente'
      };

      appointments.push(newApp);
      saveData('appointments', appointments);
      currentAppointmentsPage = 1;
      renderAppointmentsView();
    });
  }

  window.changeAppointmentsPage = function(delta) {
    currentAppointmentsPage += delta;
    renderAppointmentsView();
  };

  window.completeAppointment = function(id) {
    const item = appointments.find(a => a.id === id);
    if (item) {
      item.status = 'Completado';
      saveData('appointments', appointments);
      if (currentUser.role === 'barbero') renderBarberoCitasView();
      else renderAppointmentsView();
    }
  };

  // =========================================================================
  // 4. COMISIONES STAFF
  // =========================================================================
  function renderCommissionsView() {
    const barberStats = {};
    appointments.forEach(a => {
      if (!barberStats[a.barber]) {
        barberStats[a.barber] = { totalSales: 0, count: 0 };
      }
      if (a.status === 'Completado') {
        barberStats[a.barber].totalSales += a.price;
        barberStats[a.barber].count++;
      }
    });

    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Comisiones Staff</h2>
          <p class="section-header-sub">Desglose de cortes y pago de comisiones (50% por servicio).</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Resumen de Pagos por Barbero</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Barbero</th>
                  <th>Cortes Completados</th>
                  <th>Facturación Generada</th>
                  <th>Comisión a Pagar (50%)</th>
                  <th>Ganancia Neta Local (50%)</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(barberStats).length === 0 ? `
                  <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No hay servicios completados registrados.</td></tr>
                ` : Object.keys(barberStats).map(name => {
                  const b = barberStats[name];
                  const comm = Math.round(b.totalSales * 0.50);
                  const localShare = b.totalSales - comm;
                  return `
                    <tr>
                      <td><strong>${name}</strong></td>
                      <td>${b.count} servicios</td>
                      <td>$${b.totalSales.toLocaleString()} MXN</td>
                      <td><strong style="color: var(--gold); font-size: 1.15rem;">$${comm.toLocaleString()} MXN</strong></td>
                      <td><strong style="color: var(--green); font-size: 1.15rem;">$${localShare.toLocaleString()} MXN</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 5. MODIFICAR PRECIOS
  // =========================================================================
  function renderPricingView() {
    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Modificar Precios</h2>
          <p class="section-header-sub">Configuración de tarifas oficiales de ELITE Barbershop en Matamoros.</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Catálogo de Servicios Oficiales (MXN)</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Duración Estimada</th>
                  <th>Precio Actual (MXN)</th>
                  <th>Nuevo Precio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${services.map(s => `
                  <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.duration}</td>
                    <td><span style="color: var(--cyan); font-weight: 800; font-size: 1.15rem;">$${s.price} MXN</span></td>
                    <td>
                      <input type="number" id="price-input-${s.id}" value="${s.price}" class="form-control" style="max-width: 140px;" />
                    </td>
                    <td>
                      <button class="btn-sm btn-outline-cyan" onclick="updateServicePrice('${s.id}')">Guardar Precio</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  window.updateServicePrice = function(serviceId) {
    const input = document.getElementById('price-input-' + serviceId);
    const newPrice = parseInt(input.value, 10);
    if (isNaN(newPrice) || newPrice <= 0) return alert('Por favor ingresa un precio válido.');

    const s = services.find(item => item.id === serviceId);
    if (s) {
      s.price = newPrice;
      saveData('services', services);
      alert(`¡Precio de "${s.name}" actualizado a $${newPrice} MXN con éxito!`);
      renderPricingView();
    }
  };

  // =========================================================================
  // 6. MANEJO DE INVENTARIO
  // =========================================================================
  function renderInventoryView() {
    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Manejo de Inventario</h2>
          <p class="section-header-sub">Control de insumos, pomadas y productos para la venta en Matamoros.</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Stock de Productos en Sucursal</h3>
            <button class="btn-sm btn-outline-cyan" onclick="addNewProductPrompt()">+ Agregar Producto</button>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio Venta</th>
                  <th>Existencias</th>
                  <th>Alerta Stock</th>
                  <th>Modificar Stock</th>
                </tr>
              </thead>
              <tbody>
                ${inventory.map(item => `
                  <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>$${item.unitPrice} MXN</td>
                    <td>
                      <span style="font-size: 1.15rem; font-weight: 900; color: ${item.stock <= item.minAlert ? 'var(--red)' : 'var(--text-main)'}">
                        ${item.stock} pzas
                      </span>
                    </td>
                    <td>
                      ${item.stock <= item.minAlert 
                        ? '<span style="color: var(--red); font-weight: 800;">⚠ Stock Bajo</span>' 
                        : '<span style="color: var(--green); font-weight: 600;">Normal</span>'}
                    </td>
                    <td>
                      <button class="btn-sm btn-danger" onclick="adjustStock(${item.id}, -1)">- 1</button>
                      <button class="btn-sm btn-success" onclick="adjustStock(${item.id}, 1)" style="margin-left: 0.4rem;">+ 1</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  window.adjustStock = function(id, delta) {
    const p = inventory.find(i => i.id === id);
    if (p) {
      p.stock = Math.max(0, p.stock + delta);
      saveData('inventory', inventory);
      renderInventoryView();
    }
  };

  window.addNewProductPrompt = function() {
    const name = prompt('Nombre del nuevo producto:');
    if (!name) return;
    const stock = parseInt(prompt('Cantidad inicial en existencias:'), 10) || 10;
    const price = parseInt(prompt('Precio de venta al público (MXN):'), 10) || 150;
    inventory.push({ id: Date.now(), name, stock, minAlert: 3, unitPrice: price });
    saveData('inventory', inventory);
    renderInventoryView();
  };

  // =========================================================================
  // 7. PERSONAL & PINS
  // =========================================================================
  function renderUsersManagerView() {
    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Personal & PINs</h2>
          <p class="section-header-sub">Administra quién puede entrar al sistema, su rol y su PIN secreto.</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Agregar Nuevo Miembro al Equipo</h3>
          </div>
          <form id="new-user-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) 130px; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">NOMBRE COMPLETO</label>
              <input type="text" id="nu-name" required class="form-control" placeholder="Ej. Roberto Martínez" />
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">CORREO / USUARIO</label>
              <input type="email" id="nu-email" required class="form-control" placeholder="roberto@elite.com" />
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">ROL</label>
              <select id="nu-role" class="form-control">
                <option value="barbero">Barbero</option>
                <option value="encargado">Encargado de Sucursal</option>
                <option value="admin">Administrador / Dueño</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">PIN / CONTRASEÑA</label>
              <input type="text" id="nu-pin" required class="form-control" placeholder="Ej. 2026" />
            </div>
            <button type="submit" class="btn-primary" style="padding: 0.9rem; font-size: 0.95rem;">Guardar</button>
          </form>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Personal Registrado con Acceso</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario / Correo</th>
                  <th>Rol Asignado</th>
                  <th>PIN Actual</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${users.map((u, idx) => `
                  <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>
                      <span class="role-tag ${u.role === 'admin' ? 'role-admin' : u.role === 'encargado' ? 'role-encargado' : 'role-barbero'}">
                        ${u.role === 'admin' ? '👑 Dueño' : u.role === 'encargado' ? '📋 Encargado' : '✂ Barbero'}
                      </span>
                    </td>
                    <td><code style="background: rgba(255,255,255,0.08); padding: 0.35rem 0.7rem; border-radius: 6px; color: var(--cyan); font-weight: 800;">${u.pin}</code></td>
                    <td>
                      ${u.email !== 'lucio@elite.com' ? `
                        <button class="btn-sm btn-danger" onclick="deleteUser(${idx})">Eliminar</button>
                      ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Principal</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('new-user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('nu-name').value.trim();
      const email = document.getElementById('nu-email').value.trim().toLowerCase();
      const role = document.getElementById('nu-role').value;
      const pin = document.getElementById('nu-pin').value.trim();

      if (users.some(u => u.email.toLowerCase() === email)) {
        return alert('Ya existe un usuario con ese correo electrónico.');
      }

      users.push({ email, pin, role, name });
      saveData('users', users);
      alert(`¡Usuario ${name} registrado con éxito! Podrá ingresar con el PIN ${pin}.`);
      renderUsersManagerView();
    });
  }

  window.deleteUser = function(index) {
    if (confirm(`¿Estás seguro de eliminar el acceso a ${users[index].name}?`)) {
      users.splice(index, 1);
      saveData('users', users);
      renderUsersManagerView();
    }
  };

  // HORARIOS
  function renderHoursView() {
    const canEdit = currentUser.role === 'admin';
    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">${canEdit ? 'Modificar Horarios de Apertura' : 'Horarios Oficiales de la Sucursal'}</h2>
          <p class="section-header-sub">Horario de operación de ELITE Barbershop en Matamoros.</p>
        </div>

        <div class="data-table-card" style="max-width: 600px;">
          <div class="form-group">
            <label>LUNES A SÁBADO</label>
            <input type="text" id="hours-weekday" class="form-control" value="${hours.weekday}" ${!canEdit ? 'disabled' : ''} />
          </div>
          <div class="form-group">
            <label>DOMINGO</label>
            <input type="text" id="hours-weekend" class="form-control" value="${hours.weekend}" ${!canEdit ? 'disabled' : ''} />
          </div>
          ${canEdit ? `
            <button class="btn-primary" onclick="saveNewHours()">Guardar Horarios</button>
          ` : '<p style="color: var(--text-muted); font-size: 0.85rem;">Solo el Dueño/Administrador tiene permisos para modificar los horarios.</p>'}
        </div>
      </div>
    `;
  }

  window.saveNewHours = function() {
    hours.weekday = document.getElementById('hours-weekday').value;
    hours.weekend = document.getElementById('hours-weekend').value;
    saveData('hours', hours);
    alert('¡Horarios actualizados con éxito!');
  };

  // =========================================================================
  // VISTAS BARBERO
  // =========================================================================
  function renderBarberoCitasView() {
    const myName = currentUser.name;
    const myApps = appointments.filter(a => a.barber === myName).sort((a, b) => b.id - a.id);

    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Mis Citas Asignadas</h2>
          <p class="section-header-sub">Silla personal asignada a ${myName}.</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Agenda (${myApps.length} Clientes asignados)</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Servicio(s)</th>
                  <th>Estatus</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${myApps.length === 0 ? `
                  <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No tienes citas asignadas en este momento.</td></tr>
                ` : myApps.map(a => `
                  <tr>
                    <td><strong>${a.time}</strong></td>
                    <td>${a.client}</td>
                    <td>${a.phone}</td>
                    <td><span style="color: var(--text-main); font-weight: 600;">${a.service}</span></td>
                    <td><span style="color: ${a.status === 'Completado' ? 'var(--green)' : 'var(--gold)'}; font-weight: 700;">● ${a.status}</span></td>
                    <td>
                      ${a.status !== 'Completado' ? `
                        <button class="btn-sm btn-success" onclick="completeAppointment(${a.id})">Marcar Completado</button>
                      ` : '<span style="color: var(--green); font-size: 0.82rem;">✔ Listo</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderBarberoRelojView() {
    const myName = currentUser.name;
    const lastEntry = clockLog.filter(c => c.barber === myName).slice(-1)[0] || { type: 'Sin registro', time: '--:--' };
    const isIn = lastEntry.type === 'Entrada';

    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Reloj Checador de Asistencia</h2>
          <p class="section-header-sub">Registro de jornada laboral de ${myName}.</p>
        </div>

        <div class="clock-card">
          <div style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 2px;">Hora Actual</div>
          <div class="clock-digital" id="digital-clock-display">12:00:00</div>
          
          <div>
            <span class="clock-status-tag ${isIn ? 'status-in' : 'status-out'}">
              ${isIn ? '● Activo en Turno' : '○ Fuera de Turno'}
            </span>
          </div>

          <div class="clock-buttons-row">
            <button class="btn-clock btn-clock-in" onclick="clockAction('Entrada')">Marcar Entrada</button>
            <button class="btn-clock btn-clock-out" onclick="clockAction('Salida')">Marcar Salida</button>
          </div>
        </div>

        <div class="data-table-card" style="max-width: 600px; margin: 0 auto;">
          <div class="data-table-header">
            <h3>Historial de Asistencia</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Hora</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${clockLog.filter(c => c.barber === myName).map(l => `
                  <tr>
                    <td><strong style="color: ${l.type === 'Entrada' ? 'var(--green)' : 'var(--red)'};">${l.type}</strong></td>
                    <td>${l.time}</td>
                    <td>${l.date}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    function tick() {
      const el = document.getElementById('digital-clock-display');
      if (el) el.textContent = new Date().toLocaleTimeString();
    }
    tick();
    setInterval(tick, 1000);
  }

  window.clockAction = function(type) {
    const myName = currentUser.name;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    clockLog.push({ barber: myName, type: type, time: timeStr, date: 'Hoy' });
    saveData('clockLog', clockLog);
    alert(`¡${type} registrada a las ${timeStr}!`);
    renderBarberoRelojView();
  };

  function renderBarberoServiciosView() {
    const myName = currentUser.name;
    const completed = appointments.filter(a => a.barber === myName && a.status === 'Completado').sort((a, b) => b.id - a.id);

    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Mis Servicios Realizados</h2>
          <p class="section-header-sub">Historial de cortes atendidos por ${myName}.</p>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Servicios Completados (${completed.length})</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Servicio(s)</th>
                  <th>Precio Total</th>
                </tr>
              </thead>
              <tbody>
                ${completed.length === 0 ? `
                  <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No tienes servicios completados aún.</td></tr>
                ` : completed.map(c => `
                  <tr>
                    <td>${c.time}</td>
                    <td><strong>${c.client}</strong></td>
                    <td>${c.service}</td>
                    <td>$${c.price} MXN</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderBarberoComisionesView() {
    const myName = currentUser.name;
    const completed = appointments.filter(a => a.barber === myName && a.status === 'Completado');
    const myTotalSales = completed.reduce((sum, c) => sum + c.price, 0);
    const myCommission = Math.round(myTotalSales * 0.50);

    mainContentArea.innerHTML = `
      <div class="view-animated">
        <div class="section-header-box">
          <h2 class="section-header-title">Mis Comisiones Personales</h2>
          <p class="section-header-sub">Reporte privado de ganancias de ${myName} (50% de comisión).</p>
        </div>

        <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
          <div class="kpi-card gold">
            <div class="kpi-title">Mi Comisión Ganada</div>
            <div class="kpi-val">$${myCommission.toLocaleString()} MXN</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Servicios Realizados</div>
            <div class="kpi-val">${completed.length} cortes</div>
          </div>
        </div>

        <div class="data-table-card">
          <div class="data-table-header">
            <h3>Desglose de Mis Ganancias</h3>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio(s)</th>
                  <th>Precio Cobrado</th>
                  <th>Mi Comisión (50%)</th>
                </tr>
              </thead>
              <tbody>
                ${completed.length === 0 ? `
                  <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Sin comisiones registradas aún.</td></tr>
                ` : completed.map(c => `
                  <tr>
                    <td>${c.client}</td>
                    <td>${c.service}</td>
                    <td>$${c.price} MXN</td>
                    <td><strong style="color: var(--gold); font-size: 1.15rem;">+$${Math.round(c.price * 0.5)} MXN</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  initApp();
})();