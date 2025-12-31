import { Debtor, CaseStatus, Activity, CommunicationType, Strategy } from './types';

export const DUMMY_CLIENT_CAMPAIGNS = [
  { id: 'client-1', name: 'Standard Chartered Bank', logo: '🏦', status: 'active', totalExposure: 1200000, activeCases: 450 },
  { id: 'client-2', name: 'Home Credit Phils', logo: '💳', status: 'active', totalExposure: 840000, activeCases: 320 },
  { id: 'client-3', name: 'BDO Unibank', logo: '🏛️', status: 'active', totalExposure: 2500000, activeCases: 680 },
  { id: 'client-4', name: 'Security Bank', logo: '🔒', status: 'active', totalExposure: 950000, activeCases: 290 }
];

const generateDummyDebtors = (): Debtor[] => {
  const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Sofia', 'Luis', 'Carmen', 'Antonio', 'Isabel', 'Ramon', 'Teresa', 'Diego', 'Patricia', 'Manuel', 'Luz'];
  const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Ramos', 'Flores', 'Gonzales', 'Rivera', 'Cruz', 'Bautista', 'Aquino', 'Villanueva', 'Castro', 'Santiago', 'Fernandez', 'Lopez', 'Perez', 'Hernandez'];
  const cities = [
    { name: 'Makati City', province: 'Metro Manila', zip: '1200' },
    { name: 'Quezon City', province: 'Metro Manila', zip: '1100' },
    { name: 'Manila', province: 'Metro Manila', zip: '1000' },
    { name: 'Pasig City', province: 'Metro Manila', zip: '1600' },
    { name: 'Taguig City', province: 'Metro Manila', zip: '1630' },
    { name: 'Mandaluyong City', province: 'Metro Manila', zip: '1550' },
    { name: 'Caloocan City', province: 'Metro Manila', zip: '1400' },
    { name: 'City of Malolos', province: 'Bulacan', zip: '3000' },
    { name: 'Cebu City', province: 'Cebu', zip: '6000' },
    { name: 'Davao City', province: 'Davao del Sur', zip: '8000' }
  ];
  const streets = ['Rizal St', 'Bonifacio Ave', 'Mabini St', 'Aguinaldo Rd', 'Luna St', 'Burgos Ave', 'Del Pilar St', 'Quezon Blvd', 'Roxas Ave', 'Magsaysay St'];
  const barangays = ['Brgy. San Antonio', 'Brgy. Poblacion', 'Brgy. Santo Niño', 'Brgy. San Jose', 'Brgy. Santa Cruz', 'Brgy. Bagong Silang', 'Brgy. Maligaya', 'Brgy. Pag-asa'];
  const employers = ['SM Supermalls', 'Ayala Corporation', 'Jollibee Foods Corp', 'Globe Telecom', 'PLDT Inc', 'BDO Unibank', 'Metrobank', 'San Miguel Corp', 'Aboitiz Group', 'Robinsons Land'];
  const jobTitles = ['Sales Associate', 'Customer Service Rep', 'Administrative Assistant', 'Accounting Clerk', 'IT Support', 'Marketing Coordinator', 'Operations Manager', 'HR Assistant', 'Warehouse Staff', 'Delivery Driver'];

  const debtors: Debtor[] = [];

  // Add user's account first
  debtors.push({
    id: 'DBT-001',
    name: 'Armando De Jesus Santiago Jr.',
    loanId: 'LN-2024-001',
    amountDue: 125000,
    overdueDays: 15,
    status: CaseStatus.CONTACTED,
    riskScore: 'Low',
    bucket: '1-30',
    phoneNumber: '+63 975 019 1977',
    secondaryPhone: '+63 44 791 2345',
    email: 'jon.santiago@email.ph',
    address: '18 Jacinto St. Canalate',
    city: 'City of Malolos',
    province: 'Bulacan',
    zipCode: '3000',
    creditScore: 720,
    dueDate: '2024-12-13',
    financialDetail: {
      principal: 100000,
      interest: 15000,
      penalties: 10000,
      totalDue: 125000
    },
    employment: {
      employerName: 'Tech Solutions Inc.',
      jobTitle: 'Senior Developer',
      startDate: '2020-03-15',
      address: 'BGC, Taguig City',
      phone: '+63 2 8888 9999',
      email: 'hr@techsolutions.ph',
      monthlyIncome: 85000
    },
    emergencyContact: {
      name: 'Maria Santiago',
      relationship: 'Spouse',
      phone: '+63 917 888 7777',
      email: 'maria.santiago@email.ph'
    },
    transactions: [
      { id: 'tx1', date: '2024-11-15', amount: 25000, type: 'Payment', notes: 'Bank Transfer' },
      { id: 'tx2', date: '2024-10-15', amount: 25000, type: 'Payment', notes: 'Online Payment' }
    ],
    totalDue: 125000,
    rawIngestionData: { source: 'Manual Entry', importDate: '2024-12-01' }
  });

  // Generate 49 more realistic accounts
  for (let i = 2; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const barangay = barangays[Math.floor(Math.random() * barangays.length)];
    const employer = employers[Math.floor(Math.random() * employers.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];

    const overdueDays = Math.floor(Math.random() * 180) + 1;
    const principal = Math.floor(Math.random() * 150000) + 20000;
    const interest = Math.floor(principal * 0.15);
    const penalties = Math.floor(principal * (overdueDays / 365) * 0.36);
    const totalDue = principal + interest + penalties;

    let bucket = '1-30';
    let riskScore = 'Low';
    let status = CaseStatus.PENDING;

    if (overdueDays > 120) {
      bucket = '120+';
      riskScore = 'Critical';
      status = CaseStatus.LEGAL;
    } else if (overdueDays > 90) {
      bucket = '90-120';
      riskScore = 'High';
      status = CaseStatus.BROKEN_PROMISE;
    } else if (overdueDays > 60) {
      bucket = '60-90';
      riskScore = 'High';
      status = CaseStatus.PROMISE_TO_PAY;
    } else if (overdueDays > 30) {
      bucket = '30-60';
      riskScore = 'Medium';
      status = CaseStatus.CONTACTED;
    } else {
      status = CaseStatus.CONTACTED;
    }

    const mobilePrefix = ['917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '975', '976', '977', '978', '979'];
    const phonePrefix = mobilePrefix[Math.floor(Math.random() * mobilePrefix.length)];
    const phoneNumber = `+63 ${phonePrefix} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`;

    const monthlyIncome = Math.floor(Math.random() * 60000) + 20000;
    const creditScore = Math.floor(Math.random() * 300) + 500;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - overdueDays);

    debtors.push({
      id: `DBT-${String(i).padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      loanId: `LN-2024-${String(i).padStart(3, '0')}`,
      amountDue: totalDue,
      overdueDays,
      status,
      riskScore,
      bucket,
      phoneNumber,
      secondaryPhone: Math.random() > 0.5 ? `+63 2 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}` : undefined,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@email.ph`,
      address: `${Math.floor(Math.random() * 500 + 1)} ${street}, ${barangay}`,
      city: city.name,
      province: city.province,
      zipCode: city.zip,
      creditScore,
      dueDate: dueDate.toISOString().split('T')[0],
      financialDetail: {
        principal,
        interest,
        penalties,
        totalDue
      },
      employment: {
        employerName: employer,
        jobTitle,
        startDate: `${Math.floor(Math.random() * 5) + 2018}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
        address: `${city.name}, ${city.province}`,
        phone: `+63 2 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `hr@${employer.toLowerCase().replace(/\s+/g, '')}.ph`,
        monthlyIncome
      },
      emergencyContact: {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][Math.floor(Math.random() * 4)],
        phone: `+63 ${mobilePrefix[Math.floor(Math.random() * mobilePrefix.length)]} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `emergency${i}@email.ph`
      },
      transactions: Math.random() > 0.5 ? [
        {
          id: `tx${i}-1`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 10000) + 5000,
          type: 'Payment',
          notes: ['Bank Transfer', 'Cash Payment', 'Online Payment', 'Check Payment'][Math.floor(Math.random() * 4)]
        }
      ] : [],
      totalDue,
      rawIngestionData: {
        source: ['CSV Import', 'API Integration', 'Manual Entry'][Math.floor(Math.random() * 3)],
        importDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
  }

  return debtors;
};

export const DUMMY_DEBTORS: Debtor[] = generateDummyDebtors();

export const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: 'act1',
    debtorId: 'DBT-001',
    type: CommunicationType.VOICE,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Agent Maria Santos',
    notes: 'Debtor answered, promised to pay ₱25,000 by end of week',
    outcome: 'Promise to Pay'
  },
  {
    id: 'act2',
    debtorId: 'DBT-002',
    type: CommunicationType.SMS,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Agent Pedro Reyes',
    notes: 'Payment reminder sent via SMS',
    outcome: 'Message Sent'
  },
  {
    id: 'act3',
    debtorId: 'DBT-003',
    type: CommunicationType.EMAIL,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Agent Lisa Fernandez',
    notes: 'Formal demand letter sent via email',
    outcome: 'Email Delivered'
  },
  {
    id: 'act4',
    debtorId: 'DBT-001',
    type: CommunicationType.WHATSAPP,
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Agent Carlos Mendoza',
    notes: 'Payment arrangement discussion via WhatsApp',
    outcome: 'In Discussion'
  }
];

export const DUMMY_STRATEGIES: Strategy[] = [
  {
    id: 'strat-1',
    name: 'Early Stage Soft Touch',
    description: 'Gentle reminder approach for 1-30 DPD',
    targetBucket: '1-30',
    actions: [
      { day: 1, type: CommunicationType.SMS, template: 'Friendly reminder' },
      { day: 3, type: CommunicationType.EMAIL, template: 'Payment due notice' },
      { day: 7, type: CommunicationType.VOICE, template: 'Courtesy call' }
    ]
  },
  {
    id: 'strat-2',
    name: 'Intensive Recovery',
    description: 'Multi-channel approach for 60+ DPD',
    targetBucket: '60-90',
    actions: [
      { day: 1, type: CommunicationType.VOICE, template: 'Urgent payment demand' },
      { day: 1, type: CommunicationType.SMS, template: 'Legal action warning' },
      { day: 3, type: CommunicationType.EMAIL, template: 'Formal demand letter' },
      { day: 7, type: CommunicationType.FIELD_VISIT, template: 'Field verification' }
    ]
  }
];
