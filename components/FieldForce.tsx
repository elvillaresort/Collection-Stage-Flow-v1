import * as React from 'react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import {
  MapPin,
  Activity as ActivityIcon,
  ShieldCheck,
  X,
  Search,
  Camera,
  Zap,
  Loader2,
  Battery,
  Inbox,
  ChevronUp,
  Users,
  ChevronLeft,
  BarChart3,
  Trophy,
  ArrowUpRight,
  ChevronDown,
  MessageSquare,
  Phone,
  ScanFace,
  ChevronRight,
  ShieldQuestion,
  Layers
} from 'lucide-react';
import { Activity as ActivityType, SystemSettings, Debtor } from '../types';

interface MissionTask {
  id: string;
  debtorName: string;
  debtorId: string;
  address: string;
  status: 'pending' | 'en-route' | 'on-site' | 'completed' | 'failed';
  priority: 'high' | 'normal';
  eta?: string;
  proofUrl?: string;
}

interface FieldAgent {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'on-site' | 'offline';
  visitsCompleted: number;
  location: { lat: number; lng: number; label: string };
  batteryLevel: number;
  signalStrength: string;
  itinerary: MissionTask[];
  isIdentityVerified: boolean;
  lastVerificationPhoto?: string;
  lastVisitInfo?: string;
  contactRate: number;
  avgDuration: string;
  recoveryRate: number;
}

interface FieldForceProps {
  activities: ActivityType[];
  onSaveProof: (activity: ActivityType) => void;
  settings: SystemSettings;
  portfolio: Debtor[];
}

// Custom Map Style for "Clean Look" (Silver/Light)
const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

const FieldForce: React.FC<FieldForceProps> = ({ activities, onSaveProof, settings, portfolio }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyBa4hnmu-axCc-hdqPW0kJ7CwXTD5eCFYc"
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const [agents, setAgents] = useState<FieldAgent[]>([
    {
      id: 'FA-101',
      name: 'Ricardo Santos',
      status: 'online',
      visitsCompleted: 4,
      location: { lat: 14.5547, lng: 121.0244, label: 'Makati CBD' }, // Makati
      batteryLevel: 78,
      signalStrength: '4/5',
      isIdentityVerified: true,
      lastVerificationPhoto: 'https://picsum.photos/seed/ricardo-verify/400/400',
      lastVisitInfo: 'Confirmed PTP Ref-4402 at 11:20 AM',
      contactRate: 88,
      avgDuration: '04:12',
      recoveryRate: 72,
      itinerary: [
        { id: 't1', debtorName: 'Global Tech Corp', debtorId: '3', address: 'Plot 4, Knowledge Park, BGC', status: 'pending', priority: 'high' },
        { id: 't2', debtorName: 'Emma Wilson', debtorId: '5', address: '77, Lake View Estate, Pasig', status: 'pending', priority: 'normal' },
      ]
    },
    {
      id: 'FA-202',
      name: 'Maria Dela Cruz',
      status: 'on-site',
      visitsCompleted: 6,
      location: { lat: 14.6091, lng: 121.0223, label: 'San Juan' }, // Greenhills area
      batteryLevel: 92,
      signalStrength: '5/5',
      isIdentityVerified: true,
      lastVisitInfo: 'Served Demand QC-S21 at 09:45 AM',
      contactRate: 94,
      avgDuration: '05:45',
      recoveryRate: 81,
      itinerary: []
    },
    {
      id: 'FA-303',
      name: 'Juan Miguel',
      status: 'busy',
      visitsCompleted: 2,
      location: { lat: 14.5844, lng: 121.0568, label: 'Ortigas Center' }, // Ortigas
      batteryLevel: 45,
      signalStrength: '3/5',
      isIdentityVerified: true,
      lastVisitInfo: 'Negotiating Settlement Ref-9012',
      contactRate: 76,
      avgDuration: '03:20',
      recoveryRate: 64,
      itinerary: []
    },
    {
      id: 'FA-404',
      name: 'Elena Garcia',
      status: 'offline',
      visitsCompleted: 0,
      location: { lat: 14.5492, lng: 121.0506, label: 'BGC HQ' }, // BGC
      batteryLevel: 0,
      signalStrength: '0/5',
      isIdentityVerified: false,
      lastVisitInfo: 'Shift Ended',
      contactRate: 62,
      avgDuration: '04:30',
      recoveryRate: 55,
      itinerary: []
    }
  ]);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activePinPopupId, setActivePinPopupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pool' | 'vision' | 'performance' | 'registry' | 'evidence'>('vision');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mapZoom, setMapZoom] = useState(12);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [verificationStream, setVerificationStream] = useState<MediaStream | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [poolSearch, setPoolSearch] = useState('');
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [mapView, setMapView] = useState<'roadmap' | 'satellite'>('roadmap');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleMapView = () => {
    const nextView = mapView === 'roadmap' ? 'satellite' : 'roadmap';
    setMapView(nextView);
    if (map) map.setMapTypeId(nextView);
  };

  // Simulating live movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === 'offline') return agent;
        const dLat = (Math.random() - 0.5) * 0.001;
        const dLng = (Math.random() - 0.5) * 0.001;
        return {
          ...agent,
          location: {
            ...agent.location,
            lat: agent.location.lat + dLat,
            lng: agent.location.lng + dLng
          }
        };
      }));
    }, 3000);
    return () => clearInterval(moveInterval);
  }, []);

  const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId) || null, [selectedAgentId, agents]);

  const poolMatters = useMemo(() => {
    const assignedIds = new Set(agents.flatMap(a => a.itinerary.map(t => t.debtorId)));
    return portfolio.filter(d =>
      !assignedIds.has(d.id) && (d.riskScore === 'Critical' || d.riskScore === 'High') &&
      (d.name || '').toLowerCase().includes((poolSearch || '').toLowerCase())
    );
  }, [portfolio, agents, poolSearch]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    const bounds = new google.maps.LatLngBounds();
    // Default center on Metro Manila if no agents
    if (agents.length === 0) {
      bounds.extend({ lat: 14.5995, lng: 120.9842 });
    } else {
      agents.forEach(agent => {
        bounds.extend(agent.location);
      });
    }
    map.fitBounds(bounds);
    setMap(map);
  }, [agents]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleOptimization = async () => {
    setIsOptimizing(true);
    setShowNotification("Finding the best routes for your team...");
    if (map) {
      map.setZoom(11);
      setTimeout(() => map.setZoom(13), 1500);
    }
    await new Promise(r => setTimeout(r, 2000));
    setIsOptimizing(false);
    setShowNotification("Success! Best routes sent to all staff phones.");
    setTimeout(() => setShowNotification(null), 3000);
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setVerificationStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setIsCapturing(false); }
  };

  const stopCamera = () => {
    if (verificationStream) {
      verificationStream.getTracks().forEach(track => track.stop());
      setVerificationStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 400, 300);
        setCapturedSelfie(canvasRef.current.toDataURL('image/png'));
        stopCamera();
      }
    }
  };

  const submitVerification = async () => {
    setShowNotification("Confirming identity...");
    await new Promise(r => setTimeout(r, 1500));
    if (selectedAgent) {
      setAgents(prev => prev.map(a => a.id === selectedAgent.id ? { ...a, isIdentityVerified: true, lastVerificationPhoto: capturedSelfie || undefined } : a));
    }
    setShowVerificationModal(false);
    setCapturedSelfie(null);
    setShowNotification("Verified! You can now see the map.");
    setTimeout(() => setShowNotification(null), 3000);
  };

  const assignFromPool = (debtor: Debtor) => {
    if (!selectedAgentId) {
      setShowNotification("Select an agent before assigning matters.");
      setTimeout(() => setShowNotification(null), 3000);
      return;
    }
    const newTask: MissionTask = { id: 'task-' + Date.now(), debtorName: debtor.name, debtorId: debtor.id, address: debtor.address, status: 'pending', priority: debtor.riskScore === 'Critical' ? 'high' : 'normal' };
    setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, itinerary: [newTask].concat(a.itinerary) } : a));
    setShowNotification(`Dispatched Ocular Inspection for ${debtor.name}.`);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const getStatusStyles = (status: FieldAgent['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500 text-emerald-50 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
      case 'busy': return 'bg-amber-500 text-amber-50 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
      case 'on-site': return 'bg-blue-500 text-blue-50 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
      case 'offline': return 'bg-slate-500 text-slate-50 border-slate-400';
      default: return 'bg-slate-200 text-slate-500 border-slate-300';
    }
  };

  const topPerformer = useMemo(() => [...agents].sort((a, b) => b.recoveryRate - a.recoveryRate)[0], [agents]);

  // Click handler for markers
  const handleMarkerClick = (agent: FieldAgent) => {
    setSelectedAgentId(agent.id);
    setActivePinPopupId(agent.id);
    setActiveTab('vision');
    setIsPanelMinimized(false);
    if (map) {
      map.panTo(agent.location);
      map.setZoom(15);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-100px)] overflow-hidden bg-slate-50 animate-in fade-in duration-500">

      {/* Main Map Background Area using Google Maps */}
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 14.5995, lng: 120.9842 }} // Manila Center
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: mapView === 'roadmap' ? mapStyles : [],
              disableDefaultUI: true,
              zoomControl: false,
              streetViewControl: true,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            mapTypeId={mapView}
          >
            {agents.map(a => (
              <OverlayView
                key={a.id}
                {...{ key: a.id } as any}
                position={a.location}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2 hover:z-50 z-10">
                  {/* Custom Marker Avatar */}
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] md:border-4 border-white shadow-xl overflow-hidden cursor-pointer transition-all hover:scale-110 active:scale-95 ${selectedAgentId === a.id ? 'ring-4 ring-blue-500 scale-110 z-50' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleMarkerClick(a); }}
                    title={`Agent: ${a.name}`}
                  >
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.id}`} className={`w-full h-full object-cover transition-all ${a.status === 'offline' ? 'grayscale opacity-50' : 'hover:scale-105'}`} alt="" />
                  </div>
                  {/* Status Indicator Dot */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-white shadow-md transition-colors duration-500 ${getStatusStyles(a.status).split(' ')[0]}`}></div>

                  {/* Map Popup/Label (Only shows when active) */}
                  {activePinPopupId === a.id && (
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-4 min-w-[180px] md:min-w-[200px] z-50 animate-in slide-in-from-bottom-2 text-left pointer-events-none">
                      <div className="flex justify-between items-center mb-2 pointer-events-auto">
                        <h5 className="text-sm font-black text-slate-900 truncate leading-none">{a.name}</h5>
                        <button onClick={(e) => { e.stopPropagation(); setActivePinPopupId(null); }} className="hover:bg-slate-100 rounded-full p-1" title="Close Popup"><X size={14} className="text-slate-400" /></button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{a.status}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg truncate">
                        <MapPin size={10} /> {a.lastVisitInfo ? a.lastVisitInfo.split(' ').slice(0, 3).join(' ') + '...' : 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              </OverlayView>
            ))}
          </GoogleMap>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Waking up the map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Unified Control Hub */}
      <div className={`absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-20 flex flex-col items-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isPanelMinimized ? 'translate-y-[calc(100%-60px)] md:translate-y-[calc(100%-80px)]' : ''}`}>

        {/* The Action Dock */}
        <div className="bg-slate-900/95 backdrop-blur-2xl p-2.5 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-3 pointer-events-auto w-full md:w-auto">
          {/* Status Indicator */}
          <div className="flex items-center gap-4 px-5 border-r border-white/10 shrink-0">
            <div className="text-left">
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Online Staff</p>
              <p className="text-white font-black text-xs leading-none mt-1">{agents.filter(a => a.status !== 'offline').length} / {agents.length}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-2 flex-1 md:flex-none">
            {[
              { id: 'pool', label: 'Accounts' },
              { id: 'vision', label: 'Map Feed' },
              { id: 'performance', label: 'Stats' },
              { id: 'evidence', label: 'Photos' },
              { id: 'registry', label: 'Staff' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsPanelMinimized(false); }}
                className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id && !isPanelMinimized ? 'bg-white text-slate-900 shadow-lg scale-105' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
            <button
              onClick={toggleMapView}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${mapView === 'satellite' ? 'bg-amber-500 text-white' : 'bg-white text-slate-900'}`}
            >
              <Layers size={14} />
              <span>{mapView === 'roadmap' ? 'Satellite View' : 'Map View'}</span>
            </button>
            <button
              onClick={handleOptimization}
              disabled={isOptimizing}
              className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${isOptimizing ? 'animate-pulse' : ''}`}
            >
              {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
              <span>{isOptimizing ? 'Planning...' : 'Auto-Route'}</span>
            </button>
          </div>
        </div>

        {/* The Expandable Details Panel */}
        {!isPanelMinimized && (
          <div className="w-full md:w-[600px] lg:w-[800px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-6 duration-500 pointer-events-auto">
            <div className="max-h-[50vh] overflow-y-auto scrollbar-none p-6 text-left">
              {activeTab === 'vision' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {selectedAgentId && selectedAgent ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <button onClick={() => { setSelectedAgentId(null); if (map) map.setZoom(12); }} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600">
                          <ChevronLeft size={14} /> View All Staff
                        </button>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-100 hover:bg-blue-100"><Phone size={14} /> Call Agent</button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100"><MessageSquare size={14} /> Message</button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="relative shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAgent.id}`} className="w-20 h-20 rounded-[1.5rem] bg-white object-cover shadow-md border-4 border-white" alt="" />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${getStatusStyles(selectedAgent.status).split(' ')[0]}`}></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedAgent.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white rounded-lg border border-slate-100">ID: {selectedAgent.id}</span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyles(selectedAgent.status)}`}>{selectedAgent.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-emerald-500 font-black text-3xl">
                            {selectedAgent.batteryLevel}%
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Battery Level</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Jobs</span>
                            <span className="text-xs font-black text-blue-600">{selectedAgent.itinerary.length} Pending</span>
                          </div>
                          <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto">
                            {selectedAgent.itinerary.length > 0 ? selectedAgent.itinerary.map(task => (
                              <div key={task.id} className="p-5 flex items-center justify-between hover:bg-blue-50 group cursor-pointer transition-all">
                                <div>
                                  <p className="text-sm font-black text-slate-900 mb-1">{task.debtorName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={10} /> {task.address}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                              </div>
                            )) : (
                              <div className="p-12 text-center text-slate-300">
                                <Inbox size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No assigned visits</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Visit Success</p>
                              <p className="text-2xl font-black text-slate-900 text-left">{selectedAgent.contactRate}%</p>
                            </div>
                            <BarChart3 className="text-blue-500" size={32} />
                          </div>
                          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Recovery Rate</p>
                              <p className="text-2xl font-black text-slate-900 text-left">{selectedAgent.recoveryRate}%</p>
                            </div>
                            <Trophy className="text-amber-500" size={32} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {agents.map(agent => (
                        <button key={agent.id} onClick={() => handleMarkerClick(agent)} className="p-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-blue-400 hover:shadow-xl transition-all group text-left relative">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="relative">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.id}`} className="w-16 h-16 rounded-2xl bg-white shadow-md group-hover:scale-110 transition-all" alt="" />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${getStatusStyles(agent.status).split(' ')[0]}`}></div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600">{agent.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{agent.id}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pool' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 bg-slate-100/50 p-4 rounded-2xl border border-slate-200 mb-6 group focus-within:ring-4 ring-blue-500/10 transition-all">
                    <Search size={20} className="text-slate-400" />
                    <input type="text" placeholder="Search accounts to assign..." className="bg-transparent w-full text-sm font-black outline-none text-slate-800 placeholder:text-slate-400" value={poolSearch} onChange={(e) => setPoolSearch(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {poolMatters.length > 0 ? poolMatters.map(m => (
                      <div key={m.id} className="p-5 rounded-[2rem] border border-slate-100 flex flex-col justify-between bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group cursor-default">
                        <div className="mb-4">
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{m.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border ${m.riskScore === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{m.riskScore}</span>
                            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]"><MapPin size={8} className="inline mr-0.5" /> {m.address}</span>
                          </div>
                        </div>
                        <button onClick={() => assignFromPool(m)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                          Assign to Staff <ArrowUpRight size={14} />
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center opacity-30 grayscale">
                        <Inbox size={48} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">All accounts have been assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300 py-12 text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
                  <h4 className="text-lg font-black text-slate-900">Efficiency Dashboard</h4>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Generating real-time staff progress reports...</p>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300 py-12 text-center text-slate-300 font-black">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-black text-slate-900 uppercase">Verification Photos</h4>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Capture Proof from field visits here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Notification Toast */}
      {showNotification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{showNotification}</span>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowVerificationModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full" title="Close Panel"><X size={20} /></button>
            <h3 className="text-xl font-black text-slate-900 mb-2">Security Check</h3>
            <p className="text-xs text-slate-500 mb-6">Please take a quick photo to continue</p>
            <div className="aspect-square bg-slate-900 rounded-[2rem] mb-6 relative overflow-hidden border-4 border-slate-100 shadow-inner">
              {capturedSelfie ? (
                <img src={capturedSelfie} className="w-full h-full object-cover" alt="" />
              ) : isCapturing ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><ScanFace size={64} className="opacity-20" /></div>
              )}
            </div>

            {!capturedSelfie ? (
              <button onClick={isCapturing ? capturePhoto : startCamera} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30">
                {isCapturing ? 'Capture Coords' : 'Initiate Scan'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setCapturedSelfie(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Retry</button>
                <button onClick={submitVerification} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/30">Confirm</button>
              </div>
            )}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" width={400} height={400} />

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default FieldForce;
