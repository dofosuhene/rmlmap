const LOCATIONS = [
  { id: 'hq', name: 'RML Group HQ', flag: '🇬🇧', lat: 52.3010, lng: -0.6940, route: 'A' },
  { id: 'calais', name: 'Calais', flag: '🇫🇷', lat: 50.9513, lng: 1.8587, route: 'A' },
  { id: 'lemans', name: 'Le Mans', flag: '🇫🇷', lat: 47.9986, lng: 0.2022, route: 'A' },
  { id: 'geneva', name: 'Geneva', flag: '🇨🇭', lat: 46.2044, lng: 6.1432, route: 'A' },
  { id: 'turin', name: 'Turin', flag: '🇮🇹', lat: 45.0703, lng: 7.6869, route: 'A' },
  { id: 'como', name: 'Lake Como', flag: '🇮🇹', lat: 45.8081, lng: 9.0852, route: 'A' },
  { id: 'monza', name: 'Monza Circuit', flag: '🇮🇹', lat: 45.6156, lng: 9.2811, route: 'A' },
  { id: 'milan', name: 'Milan', flag: '🇮🇹', lat: 45.4642, lng: 9.1900, route: 'A' },
  { id: 'modena', name: 'Modena', flag: '🇮🇹', lat: 44.6471, lng: 10.9252, route: 'A' },
  { id: 'bologna', name: 'Bologna', flag: '🇮🇹', lat: 44.4949, lng: 11.3426, route: 'B' },
  { id: 'stelvio', name: 'Stelvio Pass', flag: '🇮🇹', lat: 46.5271, lng: 10.4525, route: 'B' },
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
    route: '🇬🇧 RML HQ, Wellingborough → 🇫🇷 Calais → 🇫🇷 Le Mans, France',
    locations: ['hq', 'calais', 'lemans'],
    zoom: [50.5, 0.5], zoomLevel: 6,
  },
  {
    day: 2, date: 'Tuesday, 26th May', name: 'Through France',
    route: '🇫🇷 Le Mans → 🇮🇹 Turin, Italy',
    locations: ['lemans', 'turin'],
    zoom: [45.8, 5.5], zoomLevel: 6,
  },
  {
    day: 3, date: 'Wednesday, 27th May', name: 'Arrival in Modena',
    route: '🇮🇹 Turin → 🇮🇹 Modena, Italy',
    locations: ['turin', 'como', 'monza', 'milan', 'modena'],
    zoom: [45.2, 9.2], zoomLevel: 7,
  },
  {
    day: 4, date: 'Thursday 28th – Friday 29th May', name: 'Motor Valley Fest',
    route: '🇮🇹 Modena — Motorsport Club Exhibition',
    locations: ['modena'],
    zoom: [44.647, 10.925], zoomLevel: 13,
    isModena: true,
  },
  {
    day: 5, date: 'Saturday, 30th May', name: 'The Ultimate Driving Road',
    route: '🇮🇹 Modena → 🇮🇹 Bologna → 🇮🇹 Stelvio Pass',
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
let supabaseClient = null;
let broadcastActive = false;
let broadcastData = null;
let animFrame = null;
let animLat = 52.3010;
let animLng = -0.6940;
let lastSeenInterval = null;
let autoFollow = true;
let isBroadcasting = false;
let broadcastWatchId = null;
let broadcastLastSent = 0;

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
  return L.divIcon({
    className: 'car-marker',
    html: `<div class="car-marker-float"><div class="car-marker-rotate"><svg viewBox="0 0 40 24" style="pointer-events:none"><rect x="2" y="8" width="36" height="12" rx="4" fill="#C8102E"/><rect x="8" y="2" width="24" height="10" rx="3" fill="#E31837"/><circle cx="10" cy="20" r="4" fill="#1a1a1a" stroke="#fff" stroke-width="1.5"/><circle cx="30" cy="20" r="4" fill="#1a1a1a" stroke="#fff" stroke-width="1.5"/><rect x="16" y="5" width="8" height="5" rx="1" fill="#fff" opacity="0.3"/></svg></div></div>`,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
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
    label.setContent(loc.flag + ' ' + loc.name);
    marker.bindTooltip(label);

    marker.on('click', () => {
      const dayIndex = DAYS.findIndex(d => d.locations.includes(loc.id));
      if (dayIndex >= 0) showModal(dayIndex);
    });

    markers[loc.id] = marker;
  });
}

function initCar() {
  if (!carMarker) {
    carMarker = L.marker([52.3010, -0.6940], {
      icon: createCarIcon(),
      zIndexOffset: 10000,
    }).addTo(map);
  }
}

function findClosestRoutePoint(lat, lng) {
  const allCoords = [...ROUTE_A_COORDS, ...ROUTE_B_COORDS.slice(1)];
  let minDist = Infinity;
  let closestIdx = 0;
  allCoords.forEach((c, i) => {
    const d = Math.sqrt((c[0] - lat) ** 2 + (c[1] - lng) ** 2);
    if (d < minDist) { minDist = d; closestIdx = i; }
  });
  return { index: closestIdx, distance: minDist };
}

function getDayFromRouteIndex(routeIdx) {
  const allCoords = [...ROUTE_A_COORDS, ...ROUTE_B_COORDS.slice(1)];
  const progress = routeIdx / (allCoords.length - 1);
  const segCount = DAYS.length;
  const segProgress = progress * segCount;
  return Math.min(Math.max(0, Math.floor(segProgress)), DAYS.length - 1);
}

function showModal(dayIndex) {
  const day = DAYS[dayIndex];
  if (!day) return;

  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div class="modal-badge">
      <span class="modal-day-num">${day.day}</span>
      <span class="modal-day-name">${day.name}</span>
    </div>
    <h2 class="modal-title">${day.name}</h2>
    <div class="modal-date">${day.date}</div>
    <div class="modal-route">${day.route}</div>
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
        <span class="day-card-number">${day.day}</span>
        <div class="day-card-info">
          <div class="day-card-name">${day.name}</div>
          <div class="day-card-date">${day.date}</div>
        </div>
      </div>
      <div class="day-card-route">${day.route}</div>
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
  const backdrop = document.getElementById('drawer-backdrop');

  if (isMobile) {
    timelineVisible = panel.classList.contains('hidden');

    if (timelineVisible) {
      panel.classList.remove('hidden');
      backdrop.classList.add('visible');
      requestAnimationFrame(() => panel.classList.add('expanded'));
    } else {
      panel.classList.remove('expanded');
      backdrop.classList.remove('visible');
      setTimeout(() => panel.classList.add('hidden'), 350);
    }
  } else {
    timelineVisible = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
  }

  setTimeout(() => map.invalidateSize(), 500);
}

function closeTimeline() {
  const panel = document.getElementById('timeline-panel');
  const backdrop = document.getElementById('drawer-backdrop');
  if (isMobile) {
    panel.classList.remove('expanded');
    backdrop.classList.remove('visible');
    setTimeout(() => panel.classList.add('hidden'), 350);
  } else {
    panel.classList.add('hidden');
  }
  timelineVisible = false;
  setTimeout(() => map.invalidateSize(), 500);
}

function openTimeline() {
  const panel = document.getElementById('timeline-panel');
  const backdrop = document.getElementById('drawer-backdrop');
  if (isMobile) {
    panel.classList.remove('hidden');
    backdrop.classList.add('visible');
    requestAnimationFrame(() => panel.classList.add('expanded'));
  } else {
    panel.classList.remove('hidden');
  }
  timelineVisible = true;
  setTimeout(() => map.invalidateSize(), 500);
}

function initResponsive() {
  const panel = document.getElementById('timeline-panel');
  const backdrop = document.getElementById('drawer-backdrop');

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
        backdrop.classList.remove('visible');
        setTimeout(() => panel.classList.add('hidden'), 350);
        timelineVisible = false;
      } else if (diff < -60) {
        panel.classList.add('expanded');
      } else {
        if (panel.classList.contains('expanded')) {
          panel.classList.remove('expanded');
          backdrop.classList.remove('visible');
          setTimeout(() => panel.classList.add('hidden'), 350);
          timelineVisible = false;
        } else if (!panel.classList.contains('hidden')) {
          panel.classList.add('expanded');
        }
      }
      touchStartY = 0;
      touchCurrentY = 0;
    }, { passive: true });

    backdrop.addEventListener('click', () => {
      panel.classList.remove('expanded');
      backdrop.classList.remove('visible');
      setTimeout(() => panel.classList.add('hidden'), 350);
      timelineVisible = false;
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

// ─── Live GPS Tracking (Supabase) ──────────────────────────────

function initLiveTracking() {
  if (!CONFIG.supabase.url || !CONFIG.supabase.anonKey) return;
  if (typeof supabase === 'undefined') return;

  supabaseClient = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
    realtime: { heartbeatIntervalMs: 15000 },
  });

  supabaseClient
    .channel('live-gps')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'locations' },
      handleLocationUpdate
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        supabaseClient.from('locations').select('*').limit(1).then(({ data }) => {
          if (data && data[0]) handleLocationData(data[0]);
        });
      }
    });
}

function handleLocationUpdate(payload) {
  handleLocationData(payload.new);
}

function handleLocationData(data) {
  if (!data || (!data.lat && !data.lng)) return;

  if (!data.broadcasting) {
    if (!broadcastData) {
      broadcastData = data;
    }
    broadcastActive = false;

    const badge = document.getElementById('live-badge');
    if (badge) {
      badge.classList.remove('hidden');
      badge.classList.add('ended');
      badge.querySelector('.live-dot').style.background = 'var(--color-text-muted)';
      badge.querySelector('.live-dot').style.boxShadow = 'none';
      badge.querySelector('.live-label').textContent = 'ENDED';
    }

    const stats = document.getElementById('live-stats');
    if (stats) stats.classList.remove('hidden');

    return;
  }

  broadcastData = data;
  broadcastActive = true;

  const badge = document.getElementById('live-badge');
  if (badge) {
    badge.classList.remove('hidden', 'ended');
    badge.querySelector('.live-dot').style.background = '';
    badge.querySelector('.live-dot').style.boxShadow = '';
    badge.querySelector('.live-label').textContent = 'LIVE';
  }

  showLiveStats(data);
  startCarAnimation();
  startLastSeenTimer(data);
  updateCarHeading(data.heading);

  if (autoFollow) {
    map.panTo([data.lat, data.lng], { animate: true, duration: 0.5 });
  }

  if (data.tour_day) {
    const dayIdx = data.tour_day - 1;
    DAYS.forEach((d, i) => {
      const card = document.querySelector(`.day-card[data-day="${i}"]`);
      if (card) card.classList.toggle('active', i === dayIdx);
    });
    highlightRouteSegment(dayIdx);
  }
}

function startCarAnimation() {
  if (!broadcastData) return;
  if (!animFrame) {
    function animate() {
      if (!broadcastData) { animFrame = null; return; }

      const dLat = broadcastData.lat - animLat;
      const dLng = broadcastData.lng - animLng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist > 0.00001) {
        animLat += dLat * 0.12;
        animLng += dLng * 0.12;
        carMarker.setLatLng([animLat, animLng]);
        animFrame = requestAnimationFrame(animate);
      } else {
        animLat = broadcastData.lat;
        animLng = broadcastData.lng;
        carMarker.setLatLng([animLat, animLng]);
        animFrame = null;
      }
    }
    animate();
  }
  updateCarHeading(broadcastData.heading);
}

function updateCarHeading(heading) {
  if (!carMarker || heading === null || heading === undefined) return;
  const el = carMarker.getElement();
  if (!el) return;
  const rotateEl = el.querySelector('.car-marker-rotate');
  if (rotateEl) rotateEl.style.transform = `rotate(${heading - 90}deg)`;
}

function showLiveStats(data) {
  const driverEl = document.getElementById('stat-driver');
  const speedEl = document.getElementById('stat-speed');
  const updatedEl = document.getElementById('stat-updated');

  if (driverEl) {
    driverEl.innerHTML = `<span class="stats-icon">🚗</span> ${data.driver_name || 'Driver'}`;
  }
  if (speedEl) {
    const speed = data.speed ? `${Math.round(data.speed * 3.6)} km/h` : '0 km/h';
    speedEl.textContent = speed;
  }
}

function startLastSeenTimer(data) {
  if (lastSeenInterval) clearInterval(lastSeenInterval);
  lastSeenInterval = setInterval(() => {
    const el = document.getElementById('stat-updated');
    if (!el || !broadcastData) return;
    const now = Date.now();
    const then = new Date(broadcastData.timestamp).getTime();
    const secs = Math.round((now - then) / 1000);
    if (secs < 5) el.textContent = 'Just now';
    else if (secs < 60) el.textContent = `${secs}s ago`;
    else if (secs < 3600) el.textContent = `${Math.floor(secs / 60)}m ago`;
    else el.textContent = `${Math.floor(secs / 3600)}h ago`;
  }, 1000);
}

// ─── Local Broadcast (integrated into main page) ──────────────

function showBroadcastPanel() {
  document.getElementById('broadcast-panel').classList.remove('hidden');
  const saved = localStorage.getItem('rml_driver_name');
  if (saved) document.getElementById('broadcast-name').value = saved;
  document.getElementById('broadcast-name').focus();
}

function hideBroadcastPanel() {
  if (isBroadcasting) return;
  document.getElementById('broadcast-panel').classList.add('hidden');
}

function startBroadcast() {
  if (!navigator.geolocation) {
    showToast('GPS not available');
    return;
  }

  const name = document.getElementById('broadcast-name').value.trim();
  if (!name) {
    document.getElementById('broadcast-name').focus();
    document.getElementById('broadcast-name').style.borderColor = '#C8102E';
    setTimeout(() => document.getElementById('broadcast-name').style.borderColor = '', 2000);
    showToast('Enter your name first');
    return;
  }

  localStorage.setItem('rml_driver_name', name);

  broadcastWatchId = navigator.geolocation.watchPosition(
    pos => {
      broadcastLastSent = 0;
      sendBroadcastLocation(pos);
    },
    err => {
      console.error('Broadcast GPS error:', err.message);
      if (err.code === 1) showToast('Location permission denied');
      else showToast('GPS error: ' + err.message);
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
  );

  isBroadcasting = true;

  document.getElementById('broadcast-form-view').classList.add('hidden');
  document.getElementById('broadcast-active-view').classList.remove('hidden');
  document.getElementById('broadcast-name-display').textContent = name;
  document.getElementById('broadcast-btn').classList.add('active');
  document.getElementById('bc-btn-label').textContent = 'Stop Broadcast';
  showBroadcastPanel();
}

function stopBroadcast() {
  if (broadcastWatchId !== null) {
    navigator.geolocation.clearWatch(broadcastWatchId);
    broadcastWatchId = null;
  }

  isBroadcasting = false;

  document.getElementById('broadcast-form-view').classList.remove('hidden');
  document.getElementById('broadcast-active-view').classList.add('hidden');
  document.getElementById('broadcast-btn').classList.remove('active');
  document.getElementById('bc-btn-label').textContent = 'Broadcast Location';

  if (supabaseClient) {
    supabaseClient
      .from('locations')
      .update({ broadcasting: false, timestamp: new Date().toISOString() })
      .eq('id', 1)
      .then(() => {});
  }

  hideBroadcastPanel();
}

function sendBroadcastLocation(pos) {
  const now = Date.now();
  if (now - broadcastLastSent < 2000) return;
  broadcastLastSent = now;

  const { latitude, longitude, accuracy, heading, speed } = pos.coords;
  const name = document.getElementById('broadcast-name').value.trim() || 'Driver';
  const tourDay = parseInt(document.getElementById('broadcast-day').value);
  const description = document.getElementById('broadcast-status').value.trim();

  document.getElementById('broadcast-active-meta').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} · ${speed ? Math.round(speed * 3.6) + ' km/h' : '0 km/h'}${description ? ' · “' + description + '”' : ''}`;

  supabaseClient
    .from('locations')
    .upsert({
      id: 1,
      driver_name: name,
      lat: latitude,
      lng: longitude,
      accuracy: accuracy || null,
      heading: heading || null,
      speed: speed || null,
      timestamp: new Date().toISOString(),
      tour_day: tourDay,
      status: description || 'driving',
      broadcasting: true,
    })
    .then(({ error }) => {
      if (error) console.error('Supabase error:', error);
    });
}

function showToast(msg) {
  const t = document.getElementById('live-toast');
  t.textContent = msg;
  t.className = 'toast show';
  setTimeout(() => t.className = 'toast', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  buildTimeline();
  initResponsive();
  initLiveTracking();

  document.getElementById('modal-close').addEventListener('click', hideModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });

  document.getElementById('timeline-close').addEventListener('click', closeTimeline);
  document.getElementById('timeline-toggle').addEventListener('click', toggleTimeline);

  const shareBtn = document.getElementById('live-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: 'RML Group - The Grand Tour', url: url });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          const toast = document.getElementById('live-toast') || (() => {
            const t = document.createElement('div');
            t.id = 'live-toast';
            t.className = 'toast';
            document.body.appendChild(t);
            return t;
          })();
          toast.textContent = 'Link copied!';
          toast.className = 'toast show';
          setTimeout(() => toast.className = 'toast', 2500);
        });
      }
    });
  }

  const followBtn = document.getElementById('follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      autoFollow = !autoFollow;
      followBtn.classList.toggle('active', autoFollow);
      if (autoFollow && broadcastData) {
        map.panTo([broadcastData.lat, broadcastData.lng], { animate: true, duration: 0.5 });
      }
    });
  }

  const broadcastBtn = document.getElementById('broadcast-btn');
  const broadcastPanel = document.getElementById('broadcast-panel');
  if (broadcastBtn && broadcastPanel) {
    broadcastBtn.addEventListener('click', () => {
      if (isBroadcasting) {
        stopBroadcast();
      } else {
        if (isMobile) {
          const panel = document.getElementById('timeline-panel');
          if (panel.classList.contains('hidden')) {
            openTimeline();
          }
        }
        broadcastPanel.classList.toggle('hidden');
        if (!broadcastPanel.classList.contains('hidden')) {
          const saved = localStorage.getItem('rml_driver_name');
          if (saved) document.getElementById('broadcast-name').value = saved;
          document.getElementById('broadcast-name').focus();
        }
      }
    });

    document.getElementById('broadcast-start-btn').addEventListener('click', startBroadcast);
    document.getElementById('broadcast-stop-btn').addEventListener('click', stopBroadcast);

    document.getElementById('broadcast-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startBroadcast();
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
