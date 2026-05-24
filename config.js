const CONFIG = {
  supabase: {
    url: 'https://fhdzotjkvjbyoboeruox.supabase.co',
    anonKey: 'sb_publishable_L6KI38HTGlQhFs-qpIqyZA_i6tOoMPm',
  },
  admin: {
    password: 'rml-admin-2025',
    sessionDuration: 2,
  },
  map: {
    center: [46.5, 8.0],
    zoom: 5,
    minZoom: 3,
    maxZoom: 16,
    style: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
    routes: {
      routeA: { color: '#F5C518', label: 'Outbound Leg' },
      routeB: { color: '#FF4081', label: 'Final Leg' },
    },
  },
};
