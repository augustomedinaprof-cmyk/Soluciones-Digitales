/**
 * SOLUCIONES DIGITALES - BACKEND + PANEL ADMINISTRADOR
 * 1) Cambiá ADMIN_PASSWORD.
 * 2) Implementá como Aplicación web: Ejecutar como "Yo" / Acceso "Cualquier persona".
 * 3) Copiá la URL /exec y pegala en SD_BACKEND_URL dentro del index.html público.
 * 4) Panel privado: URL_DEL_SCRIPT/exec?admin=1
 */
const ADMIN_PASSWORD = 'CAMBIAR_ESTA_CLAVE';
const DATA_KEY = 'SD_SITE_DATA_V1';
const IMAGE_FOLDER_KEY = 'SD_IMAGE_FOLDER_ID';
const SESSION_SECONDS = 21600; // 6 horas

function doGet(e) {
  e = e || {parameter:{}};
  if (String(e.parameter.admin || '') === '1') {
    return HtmlService.createHtmlOutputFromFile('Admin')
      .setTitle('Administrador | Soluciones Digitales')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  const data = getSiteData_();
  const callback = String(e.parameter.callback || '');
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function loginAdmin(password) {
  if (String(password || '') !== ADMIN_PASSWORD) throw new Error('Clave incorrecta.');
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('session_' + token, 'ok', SESSION_SECONDS);
  return {token: token, data: getSiteData_()};
}

function getAdminData(token) {
  requireSession_(token);
  return getSiteData_();
}

function saveAdminData(token, data) {
  requireSession_(token);
  if (!data || typeof data !== 'object' || !data.site) throw new Error('Datos inválidos.');
  PropertiesService.getScriptProperties().setProperty(DATA_KEY, JSON.stringify(data));
  return {ok:true, savedAt:new Date().toISOString()};
}

function restoreDefaults(token) {
  requireSession_(token);
  PropertiesService.getScriptProperties().deleteProperty(DATA_KEY);
  return getSiteData_();
}

function uploadAdminImage(token, dataUrl, fileName) {
  requireSession_(token);
  dataUrl = String(dataUrl || '');
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error('Imagen inválida.');
  const mime = m[1];
  if (!/^image\//.test(mime)) throw new Error('El archivo debe ser una imagen.');
  const bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > 5 * 1024 * 1024) throw new Error('La imagen supera 5 MB.');
  const safeName = String(fileName || ('imagen-' + Date.now())).replace(/[^a-zA-Z0-9._-]/g,'_');
  const blob = Utilities.newBlob(bytes, mime, safeName);
  const folder = getImageFolder_();
  const file = folder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(err) {}
  return {
    id: file.getId(),
    name: file.getName(),
    url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600'
  };
}

function requireSession_(token) {
  if (!token || CacheService.getScriptCache().get('session_' + token) !== 'ok') {
    throw new Error('La sesión venció. Volvé a ingresar la clave.');
  }
}

function getImageFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(IMAGE_FOLDER_KEY);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch(err) {}
  }
  const folder = DriveApp.createFolder('Soluciones Digitales - Imágenes Web');
  props.setProperty(IMAGE_FOLDER_KEY, folder.getId());
  return folder;
}

function getSiteData_() {
  const raw = PropertiesService.getScriptProperties().getProperty(DATA_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch(err) {}
  }
  return getDefaultData_();
}

function getDefaultData_() {
  return {
  "site": {
    "brandLeft": "SOLUCIONES",
    "brandAccent": "DIGITALES",
    "logo": "assets/logo.webp",
    "whatsapp": "5493816124427",
    "whatsappMessage": "Hola Soluciones Digitales, quiero hacer una consulta",
    "navWhatsAppLabel": "WhatsApp",
    "heroPrimaryLabel": "Solicitar presupuesto",
    "heroSecondaryLabel": "Ver nuestros trabajos",
    "contactButtonLabel": "Enviar consulta por WhatsApp",
    "trustItems": [
      "✓ Diseño personalizado",
      "✓ Adaptado a celular",
      "✓ Atención directa"
    ],
    "heroPill": "✦ Diseño + desarrollo a medida",
    "heroTitleMain": "Convertimos tus ideas en",
    "heroTitleAccent": "soluciones digitales.",
    "heroDescription": "Diseñamos invitaciones digitales y desarrollamos aplicaciones web para instituciones, negocios, profesionales y emprendimientos. Soluciones modernas, simples y adaptadas a cada necesidad.",
    "heroImage": "assets/apps-medida.webp",
    "heroFloat1": "🌐 Aplicaciones web",
    "heroFloat2": "💌 Invitaciones digitales",
    "servicesKicker": "Qué hacemos",
    "servicesTitle": "Servicios pensados para crecer con vos",
    "servicesDescription": "No usamos una única solución para todos. Diseñamos cada proyecto según el objetivo, el público y la forma de trabajo de cada cliente.",
    "portfolioKicker": "Portfolio",
    "portfolioTitle": "Algunos trabajos y soluciones",
    "portfolioDescription": "Proyectos orientados a resolver necesidades concretas, con interfaces simples y funcionamiento adaptable a PC, tablet y celular.",
    "invitationsKicker": "Invitaciones digitales",
    "invitationsTitle": "Tu evento empieza antes de llegar",
    "invitationsDescription": "Creamos una experiencia visual que podés compartir por WhatsApp o redes, con toda la información del evento organizada en un solo lugar.",
    "audiencesKicker": "¿Para quién?",
    "audiencesTitle": "Soluciones para distintos rubros",
    "processKicker": "Cómo trabajamos",
    "processTitle": "De la idea a una solución lista para usar",
    "contactKicker": "Contacto",
    "contactTitle": "¿Tenés una idea? Hagámosla digital.",
    "contactDescription": "Contanos brevemente qué necesitás. El botón enviará tu consulta directamente por WhatsApp a Soluciones Digitales.",
    "footerText": "Invitaciones digitales · Aplicaciones web · Desarrollo a medida"
  },
  "sections": {
    "services": true,
    "projects": true,
    "invitations": true,
    "audiences": true,
    "process": true,
    "contact": true
  },
  "services": [
    {
      "icon": "💌",
      "title": "Invitaciones digitales",
      "desc": "Invitaciones elegantes e interactivas para casamientos, 15 años, cumpleaños, bautismos y eventos especiales.",
      "tags": [
        "Ubicación",
        "Confirmación",
        "Cuenta regresiva"
      ],
      "visible": true
    },
    {
      "icon": "🏫",
      "title": "Aplicaciones institucionales",
      "desc": "Sistemas para escuelas, institutos y organizaciones: notas, asistencia, boletines, documentación, comunicación y reportes.",
      "tags": [
        "Alumnos",
        "Docentes",
        "Familias"
      ],
      "visible": true
    },
    {
      "icon": "🛍️",
      "title": "Aplicaciones para negocios",
      "desc": "Herramientas para turnos, reservas, ventas, stock, pedidos, clientes, gastos y procesos internos.",
      "tags": [
        "Ventas",
        "Stock",
        "Turnos"
      ],
      "visible": true
    },
    {
      "icon": "📊",
      "title": "Paneles y gestión",
      "desc": "Dashboards claros con indicadores, estadísticas y controles para tomar decisiones rápidamente.",
      "tags": [
        "Reportes",
        "Estadísticas"
      ],
      "visible": true
    },
    {
      "icon": "🎮",
      "title": "Experiencias interactivas",
      "desc": "Juegos, actividades educativas, rankings y experiencias web pensadas para aprender o promocionar de otra manera.",
      "tags": [
        "Gamificación",
        "Ranking"
      ],
      "visible": true
    },
    {
      "icon": "⚙️",
      "title": "Desarrollo a medida",
      "desc": "Si tu idea no entra en una categoría, la analizamos y construimos una solución específica para tu proyecto.",
      "tags": [
        "Personalizado",
        "Responsive"
      ],
      "visible": true
    }
  ],
  "projects": [
    {
      "title": "Mis Gastos",
      "desc": "Aplicación web para organizar ingresos, gastos, cuentas, vencimientos y movimientos desde distintos dispositivos.",
      "image": "assets/mis-gastos.webp",
      "link": "",
      "visible": true
    },
    {
      "title": "Sistemas para instituciones y negocios",
      "desc": "Aplicaciones personalizadas para gestión académica, ventas, stock, turnos, pagos, comunicación y administración.",
      "image": "assets/apps-medida.webp",
      "link": "",
      "visible": true
    }
  ],
  "invitations": [
    {
      "image": "assets/invitacion-boda.webp",
      "alt": "Invitación digital de casamiento",
      "visible": true
    },
    {
      "image": "assets/invitacion-15.webp",
      "alt": "Invitación digital de 15 años",
      "visible": true
    },
    {
      "image": "assets/invitacion-cumple.webp",
      "alt": "Invitación digital de cumpleaños",
      "visible": true
    },
    {
      "image": "assets/invitacion-bautismo.webp",
      "alt": "Invitación digital de bautismo",
      "visible": true
    }
  ],
  "audiences": [
    {
      "title": "🏫 Instituciones educativas",
      "desc": "Notas, asistencia, boletines, campus y gestión.",
      "visible": true
    },
    {
      "title": "🛍️ Comercios",
      "desc": "Ventas, productos, stock, pedidos y clientes.",
      "visible": true
    },
    {
      "title": "💇 Profesionales y servicios",
      "desc": "Turnos, reservas, agenda y seguimiento.",
      "visible": true
    },
    {
      "title": "🚀 Emprendimientos",
      "desc": "Herramientas a medida para organizar y crecer.",
      "visible": true
    },
    {
      "title": "🍽️ Gastronomía",
      "desc": "Menús, reservas, pedidos y catálogos.",
      "visible": true
    },
    {
      "title": "🏋️ Gimnasios y clubes",
      "desc": "Socios, cuotas, turnos y actividades.",
      "visible": true
    },
    {
      "title": "🎉 Eventos",
      "desc": "Invitaciones, confirmaciones y experiencias digitales.",
      "visible": true
    },
    {
      "title": "💡 Tu idea",
      "desc": "Contanos qué necesitás y analizamos la solución.",
      "visible": true
    }
  ],
  "process": [
    {
      "title": "Nos contás tu idea",
      "desc": "Entendemos qué necesitás, quiénes la van a usar y qué problema debe resolver.",
      "visible": true
    },
    {
      "title": "Diseñamos la propuesta",
      "desc": "Definimos funciones, estética y experiencia antes de avanzar con el desarrollo.",
      "visible": true
    },
    {
      "title": "Desarrollamos",
      "desc": "Construimos una solución adaptable, clara y pensada para funcionar en distintos dispositivos.",
      "visible": true
    },
    {
      "title": "Publicamos y acompañamos",
      "desc": "Dejamos el proyecto listo para usar y realizamos los ajustes acordados.",
      "visible": true
    }
  ],
  "contactOptions": [
    "Invitación digital",
    "Aplicación para institución",
    "Aplicación para negocio",
    "Sitio web",
    "Otra solución"
  ]
};;
}
