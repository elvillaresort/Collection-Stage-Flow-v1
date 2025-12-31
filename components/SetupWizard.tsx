
import * as React from 'react';
import { Shield, ArrowRight, Lock, User, Settings as SettingsIcon } from 'lucide-react';
import { User as UserType, SystemSettings } from '../types';

interface SetupWizardProps {
  onComplete: (data: { admin: UserType; settings: SystemSettings }) => void;
}

/**
 * SetupWizard component initializes the system by provisioning the root administrator
 * and defining the base system settings.
 */
const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const handleFinish = () => {
    onComplete({
      admin: {
        id: 'admin-1',
        name: 'System Superadmin',
        employeeId: 'superadmin',
        password: 'superadmin',
        role: 'ADMIN',
        avatar: 'https://picsum.photos/seed/superadmin/100/100',
        concurrentAccess: true,
        assignedDebtorIds: [],
        assignedCampaignIds: ['client-1', 'client-2', 'client-3'],
        isActive: true,
        status: 'online',
        isCertified: true 
      },
      settings: {
        localization: { currency: 'USD', currencySymbol: '$' },
        sentinel: {
          enabled: true,
          autoFreezeOnCritical: true,
          exfiltrationDetection: true,
          behavioralAnalytics: true,
          highValueMonitoring: true,
          threatLevel: 'NORMAL'
        },
        aegis: {
          browserIsolation: true,
          readOnlyModeOnUntrusted: true,
          disableCopyPaste: true,
          disableFileUpload: true,
          documentSanitization: true,
          pixelStreamQuality: 'high',
          credentialTheftProtection: true
        },
        recovery: { globalLockdown: false, systemStatus: 'Optimal', lastBackupDate: new Date().toLocaleDateString() },
        compliance: { 
          auditLogging: true, 
          encryption: true, 
          geoFencing: true, 
          copyPaste: true, 
          screenProtection: true, 
          screenshotControl: true,
          ipWhitelist: ['192.168.1.1', '10.0.0.1'],
          allowedSSID: ['PCCS_CORP_WIFI', 'PCCS_SECURE_GUEST']
        },
        integrations: {
          facebook: { id: 'fb-1', name: 'Meta API', status: 'disconnected' },
          googleMaps: { id: 'gm-1', name: 'Maps API', status: 'disconnected' },
          linkedin: { id: 'li-1', name: 'LinkedIn', status: 'disconnected' },
          viber: { id: 'vi-1', name: 'Viber', status: 'disconnected' },
          whatsapp: { id: 'wa-1', name: 'WhatsApp', status: 'disconnected' }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-left">
      <div className="max-w-md w-full bg-slate-900 rounded-[2rem] p-10 border border-white/10 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl"><Shield size={24}/></div>
          <h1 className="text-2xl font-black">Initialization</h1>
        </div>
        <p className="text-slate-400 font-medium">Configure master node parameters and provision root administrator for the PCCS cluster.</p>
        <button 
          onClick={handleFinish}
          className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          Begin Deployment <ArrowRight size={18}/>
        </button>
      </div>
    </div>
  );
};

export default SetupWizard;
