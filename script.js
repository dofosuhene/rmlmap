const LOCATIONS = [
  { id: 'hq', name: 'RML Group HQ', lat: 52.3010, lng: -0.6940, route: 'A' },
  { id: 'calais', name: 'Calais', lat: 50.9513, lng: 1.8587, route: 'A' },
  { id: 'lemans', name: 'Le Mans', lat: 47.9986, lng: 0.2022, route: 'A' },
  { id: 'geneva', name: 'Geneva', lat: 46.2044, lng: 6.1432, route: 'A' },
  { id: 'turin', name: 'Turin', lat: 45.0703, lng: 7.6869, route: 'A' },
  { id: 'como', name: 'Lake Como', lat: 45.8081, lng: 9.0852, route: 'A' },
  { id: 'monza', name: 'Monza Circuit', lat: 45.6156, lng: 9.2811, route: 'A' },
  { id: 'milan', name: 'Milan', lat: 45.4642, lng: 9.1900, route: 'A' },
  { id: 'modena', name: 'Modena', lat: 44.6471, lng: 10.9252, route: 'A' },
  { id: 'bologna', name: 'Bologna', lat: 44.4949, lng: 11.3426, route: 'B' },
  { id: 'stelvio', name: 'Stelvio Pass', lat: 46.5271, lng: 10.4525, route: 'B' },
];

const ROUTE_A_COORDS = [
  [52.3010, -0.6940],
  [52.0, -0.7], [51.6, -0.5], [51.3, 0.1], [51.0810, 1.1667],
  [51.0, 1.3], [50.9513, 1.8587],
  [50.5, 1.5], [49.8, 0.8], [49.2, 0.4], [48.6, 0.3], [47.9986, 0.2022],
  [48.0, 1.0], [48.0, 2.0], [47.8, 3.0], [47.5, 4.0],
  [47.0, 5.0], [46.5, 5.8], [46.2044, 6.1432],
  [46.0, 6.5], [45.8, 7.0], [45.5, 7.3], [45.0703, 7.6869],
  [45.2, 8.0], [45.4, 8.4], [45.6, 8.7], [45.8081, 9.0852],
  [45.75, 9.15], [45.7, 9.2], [45.6156, 9.2811],
  [45.55, 9.25], [45.4642, 9.1900],
  [45.4, 9.5], [45.2, 10.0], [44.9, 10.5], [44.6471, 10.9252],
];

const ROUTE_B_COORDS = [
  [44.6471, 10.9252],
  [44.55, 11.0], [44.4949, 11.3426],
  [44.7, 11.3], [45.0, 11.2], [45.3, 11.1],
  [45.6, 10.9], [45.9, 10.7], [46.2, 10.5], [46.5271, 10.4525],
];

const DAYS = [
  {
    day: 1, date: 'Monday, 25th May', name: 'The Departure',
    route: 'RML HQ, Wellingborough → Channel Tunnel → Calais → Le Mans, France',
    locations: ['hq', 'calais', 'lemans'],
    zoom: [50.5, 0.5], zoomLevel: 6,
  },
  {
    day: 2, date: 'Tuesday, 26th May', name: 'Through France',
    route: 'Le Mans → Turin, Italy',
    locations: ['lemans', 'turin'],
    zoom: [45.8, 5.5], zoomLevel: 6,
  },
  {
    day: 3, date: 'Wednesday, 27th May', name: 'Arrival in Modena',
    route: 'Turin → Modena, Italy',
    locations: ['turin', 'como', 'monza', 'milan', 'modena'],
    zoom: [45.2, 9.2], zoomLevel: 7,
  },
  {
    day: 4, date: 'Thursday 28th – Friday 29th May', name: 'Motor Valley Fest',
    route: 'Stay in Modena — Motorsport Club Exhibition',
    locations: ['modena'],
    zoom: [44.647, 10.925], zoomLevel: 13,
    isModena: true,
  },
  {
    day: 5, date: 'Saturday, 30th May', name: 'The Ultimate Driving Road',
    route: 'Modena → Bologna → Stelvio Pass',
    locations: ['modena', 'bologna', 'stelvio'],
    zoom: [45.5, 10.8], zoomLevel: 7,
  },
];

let map, routeALine, routeBLine;
let markers = {};
let carMarker = null;
let activeDay = null;
let timelineVisible = true;
let isMobile = window.innerWidth <= 768;

const TOUR_PATH = [...ROUTE_A_COORDS, ...ROUTE_B_COORDS.slice(1)];
let tourAnimId = null;
let tourProgress = 0;
let tourRunning = false;
let tourPaused = false;
let tourLastTime = 0;
const TOUR_DURATION = 30000;

function createMarkerIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<svg viewBox="0 0 36 48" style="pointer-events:none"><path d="M18 0C8.1 0 0 8.1 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.1 27.9 0 18 0zm0 27c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z" fill="${color}" stroke="#fff" stroke-width="1.5"/><circle cx="18" cy="18" r="5" fill="#12121a"/></svg>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });
}

function createCarIcon() {
  const useImg = new Image();
  useImg.src = 'car.png';
  const imgExists = document.createElement('img');
  imgExists.src = 'car.png';
  let html = `<svg viewBox="0 0 40 24" style="pointer-events:none;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6))"><rect x="2" y="8" width="36" height="12" rx="4" fill="#C8102E"/><rect x="8" y="2" width="24" height="10" rx="3" fill="#E31837"/><circle cx="10" cy="20" r="4" fill="#1a1a1a" stroke="#fff" stroke-width="1.5"/><circle cx="30" cy="20" r="4" fill="#1a1a1a" stroke="#fff" stroke-width="1.5"/><rect x="16" y="5" width="8" height="5" rx="1" fill="#fff" opacity="0.3"/></svg>`;
  html = `<div class="car-marker-inner">${html}</div>`;

  return L.divIcon({
    className: 'car-marker',
    html: html,
    iconSize: [40, 28],
    iconAnchor: [20, 14],
  });
}

function initMap() {
  map = L.map('map', {
    center: CONFIG.map.center,
    zoom: CONFIG.map.zoom,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom,
    zoomControl: false,
    gestureHandling: true,
  });

  L.tileLayer(CONFIG.map.style, {
    attribution: CONFIG.map.attribution,
    maxZoom: CONFIG.map.maxZoom,
    subdomains: 'abcd',
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const bounds = L.latLngBounds([52.8, -2.0], [43.5, 12.5]);
  map.fitBounds(bounds, { padding: isMobile ? [40, 40] : [60, 460], animate: false });

  renderRoutes();
  addMarkers();
  map.on('resize', () => {
    if (timelineVisible && !isMobile) {
      map.invalidateSize();
    }
  });
}

function renderRoutes() {
  L.polyline(ROUTE_A_COORDS, {
    color: CONFIG.map.routes.routeA.color,
    weight: 8,
    opacity: 0.15,
    lineJoin: 'round',
    lineCap: 'round',
  }).addTo(map);

  routeALine = L.polyline(ROUTE_A_COORDS, {
    color: CONFIG.map.routes.routeA.color,
    weight: 3,
    opacity: 0.85,
    lineJoin: 'round',
    lineCap: 'round',
  }).addTo(map);

  L.polyline(ROUTE_B_COORDS, {
    color: CONFIG.map.routes.routeB.color,
    weight: 8,
    opacity: 0.15,
    lineJoin: 'round',
    lineCap: 'round',
  }).addTo(map);

  routeBLine = L.polyline(ROUTE_B_COORDS, {
    color: CONFIG.map.routes.routeB.color,
    weight: 3,
    opacity: 0.85,
    lineJoin: 'round',
    lineCap: 'round',
  }).addTo(map);
}

function addMarkers() {
  LOCATIONS.forEach(loc => {
    const color = loc.route === 'A' ? CONFIG.map.routes.routeA.color : CONFIG.map.routes.routeB.color;
    const marker = L.marker([loc.lat, loc.lng], {
      icon: createMarkerIcon(color),
      riseOnHover: true,
    }).addTo(map);

    const label = L.tooltip({
      permanent: true,
      direction: 'top',
      offset: L.point(0, -4),
      className: 'location-label',
      opacity: 0.7,
    });
    label.setContent(loc.name);
    marker.bindTooltip(label);

    marker.on('click', () => {
      const dayIndex = DAYS.findIndex(d => d.locations.includes(loc.id));
      if (dayIndex >= 0) showModal(dayIndex);
    });

    markers[loc.id] = marker;
  });
}

function initCar() {
  carMarker = L.marker(TOUR_PATH[0], {
    icon: createCarIcon(),
    zIndexOffset: 10000,
  }).addTo(map);
}

function getPositionOnPath(progress) {
  const total = TOUR_PATH.length - 1;
  const idx = progress * total;
  const i = Math.min(Math.floor(idx), total - 1);
  const t = idx - i;
  const p1 = TOUR_PATH[i];
  const p2 = TOUR_PATH[Math.min(i + 1, total)];
  return [
    p1[0] + (p2[0] - p1[0]) * t,
    p1[1] + (p2[1] - p1[1]) * t,
  ];
}

function getCurrentDayIndex(progress) {
  const segCount = DAYS.length;
  const segProgress = progress * segCount;
  const idx = Math.min(Math.floor(segProgress), segCount - 1);
  return Math.max(0, idx);
}

function updateTourUI(progress) {
  const dayIdx = getCurrentDayIndex(progress);
  const day = DAYS[dayIdx];
  const pct = Math.round(progress * 100);

  const info = document.getElementById('tour-info');
  if (info && day) {
    info.innerHTML = `<span class="tour-location">${day.name}</span><span class="tour-pct">${pct}%</span>`;
  }

  const bar = document.getElementById('tour-progress-bar');
  if (bar) bar.style.width = pct + '%';

  DAYS.forEach((d, i) => {
    const card = document.querySelector(`.day-card[data-day="${i}"]`);
    if (card) card.classList.toggle('active', i === dayIdx);
  });
  highlightRouteSegment(dayIdx);
}

function animateTour(timestamp) {
  if (!tourRunning || tourPaused) {
    tourAnimId = null;
    return;
  }

  if (!tourLastTime) tourLastTime = timestamp;
  const dt = timestamp - tourLastTime;
  tourLastTime = timestamp;

  tourProgress += dt / TOUR_DURATION;

  if (tourProgress >= 1) {
    tourProgress = 1;
    const pos = getPositionOnPath(1);
    carMarker.setLatLng(pos);
    updateTourUI(1);
    stopTour();
    return;
  }

  const pos = getPositionOnPath(tourProgress);
  carMarker.setLatLng(pos);
  updateTourUI(tourProgress);

  map.panTo(pos, { animate: true, duration: 0.3 });

  tourAnimId = requestAnimationFrame(animateTour);
}

function startTour() {
  if (tourRunning && !tourPaused) return;
  if (tourProgress >= 1) {
    tourProgress = 0;
  }
  tourRunning = true;
  tourPaused = false;
  tourLastTime = 0;

  const btn = document.getElementById('tour-btn');
  if (btn) {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="4" y="2" width="2" height="10" rx="1" fill="white"/><rect x="8" y="2" width="2" height="10" rx="1" fill="white"/></svg>';
    btn.title = 'Pause';
  }

  if (tourAnimId) cancelAnimationFrame(tourAnimId);
  tourAnimId = requestAnimationFrame(animateTour);
}

function pauseTour() {
  if (!tourRunning) return;
  tourPaused = !tourPaused;
  if (tourPaused) {
    if (tourAnimId) cancelAnimationFrame(tourAnimId);
    tourAnimId = null;
    const btn = document.getElementById('tour-btn');
    if (btn) {
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,1 13,7 3,13" fill="white"/></svg>';
      btn.title = 'Resume';
    }
  } else {
    tourLastTime = 0;
    tourAnimId = requestAnimationFrame(animateTour);
    const btn = document.getElementById('tour-btn');
    if (btn) {
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="4" y="2" width="2" height="10" rx="1" fill="white"/><rect x="8" y="2" width="2" height="10" rx="1" fill="white"/></svg>';
      btn.title = 'Pause';
    }
  }
}

function stopTour() {
  tourRunning = false;
  tourPaused = false;
  if (tourAnimId) {
    cancelAnimationFrame(tourAnimId);
    tourAnimId = null;
  }
  const btn = document.getElementById('tour-btn');
  if (btn) {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,1 13,7 3,13" fill="white"/></svg>';
    btn.title = 'Replay';
  }
}

function resetTour() {
  stopTour();
  tourProgress = 0;
  const pos = TOUR_PATH[0];
  carMarker.setLatLng(pos);
  updateTourUI(0);
  map.panTo(pos, { animate: true, duration: 0.6 });
}

function showModal(dayIndex) {
  const day = DAYS[dayIndex];
  if (!day) return;

  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div class="modal-day-badge">
      <span class="day-number">${day.day}</span>
      <span class="day-name">${day.name}</span>
    </div>
    <h2 class="modal-title">${day.name}</h2>
    <div class="modal-date">${day.date}</div>
    <div class="modal-route-info">${day.route}</div>
  `;

  overlay.classList.remove('hidden');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('visible');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function flyToLocation(dayIndex, animate = true) {
  const day = DAYS[dayIndex];
  if (!day) return;

  activeDay = dayIndex;

  const zoom = day.zoomLevel || 7;
  const center = day.zoom;

  if (animate) {
    map.flyTo(center, zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  } else {
    map.setView(center, zoom);
  }

  DAYS.forEach((d, i) => {
    const card = document.querySelector(`.day-card[data-day="${i}"]`);
    if (card) {
      card.classList.toggle('active', i === dayIndex);
    }
  });

  highlightRouteSegment(dayIndex);
}

function highlightRouteSegment(dayIndex) {
  routeALine.setStyle({ opacity: 0.3, weight: 2 });
  routeBLine.setStyle({ opacity: 0.3, weight: 2 });

  LOCATIONS.forEach((loc, i) => {
    if (markers[loc.id]) {
      const color = loc.route === 'A' ? CONFIG.map.routes.routeA.color : CONFIG.map.routes.routeB.color;
      markers[loc.id].setIcon(createMarkerIcon(color));
    }
  });

  const day = DAYS[dayIndex];
  if (!day) return;

  const activeLocIds = day.locations;
  const routeAvisible = activeLocIds.some(id => LOCATIONS.find(l => l.id === id)?.route === 'A');
  const routeBvisible = activeLocIds.some(id => LOCATIONS.find(l => l.id === id)?.route === 'B');

  if (routeAvisible) {
    routeALine.setStyle({ opacity: 0.85, weight: 3 });
  }
  if (routeBvisible) {
    routeBLine.setStyle({ opacity: 0.85, weight: 3 });
  }

  activeLocIds.forEach(id => {
    const loc = LOCATIONS.find(l => l.id === id);
    if (loc && markers[loc.id]) {
      const color = loc.route === 'A' ? '#fff' : '#fff';
      markers[loc.id].setIcon(createMarkerIcon(color));
    }
  });
}

function buildTimeline() {
  const container = document.getElementById('timeline-scroll');

  DAYS.forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.dataset.day = index;

    card.innerHTML = `
      <div class="day-card-header">
        <span class="day-number">${day.day}</span>
        <div class="day-info">
          <div class="day-name">${day.name}</div>
          <div class="day-date">${day.date}</div>
        </div>
      </div>
      <div class="day-route">${day.route}</div>
    `;

    card.addEventListener('click', () => {
      flyToLocation(index);
      if (isMobile) {
        closeTimeline();
      }
    });

    container.appendChild(card);
  });
}

function toggleTimeline() {
  const panel = document.getElementById('timeline-panel');

  if (isMobile) {
    timelineVisible = panel.classList.contains('hidden');

    if (timelineVisible) {
      panel.classList.remove('hidden');
      requestAnimationFrame(() => panel.classList.add('expanded'));
    } else {
      panel.classList.remove('expanded');
      panel.classList.add('hidden');
    }
  } else {
    timelineVisible = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
  }

  setTimeout(() => map.invalidateSize(), 500);
}

function closeTimeline() {
  const panel = document.getElementById('timeline-panel');
  if (isMobile) {
    panel.classList.remove('expanded');
    panel.classList.add('hidden');
  } else {
    panel.classList.add('hidden');
  }
  timelineVisible = false;
  setTimeout(() => map.invalidateSize(), 500);
}

function openTimeline() {
  const panel = document.getElementById('timeline-panel');
  if (isMobile) {
    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.add('expanded'));
  } else {
    panel.classList.remove('hidden');
  }
  timelineVisible = true;
  setTimeout(() => map.invalidateSize(), 500);
}

function initResponsive() {
  const panel = document.getElementById('timeline-panel');

  if (isMobile) {
    panel.classList.add('hidden');
    timelineVisible = false;

    let touchStartY = 0;
    let touchCurrentY = 0;
    let isDragging = false;

    const dragHandle = panel.querySelector('.timeline-header');
    dragHandle.addEventListener('touchstart', (e) => {
      if (e.target.closest('#timeline-close')) return;
      touchStartY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    dragHandle.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      touchCurrentY = e.touches[0].clientY;
    }, { passive: true });

    dragHandle.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = touchCurrentY - touchStartY;
      if (diff > 60) {
        panel.classList.remove('expanded');
        panel.classList.add('hidden');
        timelineVisible = false;
      } else if (diff < -60) {
        panel.classList.add('expanded');
      } else {
        if (panel.classList.contains('expanded')) {
          panel.classList.remove('expanded');
          panel.classList.add('hidden');
          timelineVisible = false;
        } else if (!panel.classList.contains('hidden')) {
          panel.classList.add('expanded');
        }
      }
      touchStartY = 0;
      touchCurrentY = 0;
    }, { passive: true });

    map.on('click', () => {
      if (timelineVisible && panel.classList.contains('expanded')) {
        panel.classList.remove('expanded');
      }
    });
  }

  window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;

    if (wasMobile !== isMobile) {
      const toggle = document.getElementById('timeline-toggle');
      if (isMobile) {
        toggle.style.display = 'flex';
        panel.classList.add('hidden');
        panel.classList.remove('expanded');
        timelineVisible = false;
      } else {
        toggle.style.display = 'none';
        panel.classList.remove('hidden');
        panel.classList.remove('expanded');
        timelineVisible = true;
      }
      setTimeout(() => map.invalidateSize(), 300);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  buildTimeline();
  initResponsive();

  document.getElementById('modal-close').addEventListener('click', hideModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });

  document.getElementById('timeline-close').addEventListener('click', closeTimeline);
  document.getElementById('timeline-toggle').addEventListener('click', toggleTimeline);

  const tourBtn = document.getElementById('tour-btn');
  if (tourBtn) {
    tourBtn.addEventListener('click', () => {
      if (!tourRunning) {
        if (tourProgress >= 1) resetTour();
        setTimeout(startTour, 300);
      } else if (tourPaused) {
        pauseTour();
      } else {
        pauseTour();
      }
    });
  }

  initCar();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal();
    }
  });

  setTimeout(() => flyToLocation(0, false), 200);
});
