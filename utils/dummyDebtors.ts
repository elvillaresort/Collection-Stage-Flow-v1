import { Debtor, CaseStatus, CommunicationType } from '../types';

const FIRST_NAMES = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Sofia', 'Luis', 'Carmen', 'Antonio', 'Isabel', 'Ramon', 'Teresa', 'Diego', 'Patricia', 'Manuel', 'Luz'];
const LAST_NAMES = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Ramos', 'Flores', 'Gonzales', 'Rivera', 'Cruz', 'Bautista', 'Aquino', 'Villanueva', 'Castro', 'Santiago', 'Fernandez', 'Lopez', 'Perez', 'Hernandez'];
const CITIES = [
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
const STREETS = ['Rizal St', 'Bonifacio Ave', 'Mabini St', 'Aguinaldo Rd', 'Luna St', 'Burgos Ave', 'Del Pilar St', 'Quezon Blvd', 'Roxas Ave', 'Magsaysay St'];
const BARANGAYS = ['Brgy. San Antonio', 'Brgy. Poblacion', 'Brgy. Santo Niño', 'Brgy. San Jose', 'Brgy. Santa Cruz', 'Brgy. Bagong Silang', 'Brgy. Maligaya', 'Brgy. Pag-asa'];
const EMPLOYERS = ['SM Supermalls', 'Ayala Corporation', 'Jollibee Foods Corp', 'Globe Telecom', 'PLDT Inc', 'BDO Unibank', 'Metrobank', 'San Miguel Corp', 'Aboitiz Group', 'Robinsons Land', 'Accenture', 'Convergys', 'Sutherland', 'Teleperformance'];
const JOB_TITLES = ['Sales Associate', 'Customer Service Rep', 'Administrative Assistant', 'Accounting Clerk', 'IT Support', 'Marketing Coordinator', 'Operations Manager', 'HR Assistant', 'Warehouse Staff', 'Delivery Driver', 'Call Center Agent', 'Team Lead', 'Supervisor', 'Manager'];

export const generateDummyDebtors = (): Debtor[] => {
    const debtors: Debtor[] = [];

    // 1. SPECIFIC ACCOUNT: Armando De Jesus Santiago Jr (The User)
    // Designed to test ALL features: High overdue, vital status, multiple contacts, rich history.
    debtors.push({
        id: 'DBT-USER-001',
        name: 'Armando De Jesus Santiago Jr',
        loanId: 'LN-VIP-2024-001',
        amountDue: 450000.75,
        overdueDays: 45,
        status: CaseStatus.CONTACTED,
        riskScore: 'Medium',
        bucket: '30-60',
        phoneNumber: '+63 917 123 4567', // Primary
        secondaryPhone: '+63 998 765 4321',
        email: 'jon.santiago@email.com',
        address: '18 Jacinto St. Canalate',
        city: 'City of Malolos',
        province: 'Bulacan',
        zipCode: '3000',
        creditScore: 780,
        disbursalDate: '2023-01-15',
        dueDate: '2024-11-13', // 45 days ago from assumed ~Dec 28
        financialDetail: {
            principal: 400000,
            interest: 35000,
            penalties: 15000.75,
            totalDue: 450000.75
        },
        employment: {
            employerName: 'Freelance Tech Consultant',
            jobTitle: 'Senior Systems Architect',
            startDate: '2019-05-01',
            address: 'Home Office, Malolos',
            phone: '+63 44 791 0000',
            email: 'armando.santiago@tech.ph',
            monthlyIncome: 125000
        },
        emergencyContact: {
            name: 'Maria Santiago',
            relationship: 'Spouse',
            phone: '+63 917 111 2222',
            email: 'maria.s@email.com'
        },
        transactions: [
            { id: 'TX-001', date: '2024-10-15', amount: 50000, type: 'Payment', notes: 'Partial payment via BDO' },
            { id: 'TX-002', date: '2024-09-15', amount: 50000, type: 'Payment', notes: 'Partial payment via GCash' }
        ],
        familyContacts: [
            { name: 'Jon Santiago Sr.', relationship: 'Father', phone: '+63 922 333 4444' },
            { name: 'Elena Santiago', relationship: 'Sister', phone: '+63 918 555 6666' }
        ],
        assets: [
            { type: 'Vehicle', description: 'Toyota Fortuner 2023', details: 'Plate ABC 1234', estimateValue: 1800000 },
            { type: 'Property', description: 'Residential House', details: 'Malolos, Bulacan', estimateValue: 5000000 }
        ],
        campaignId: 'client-3', // BDO Unibank
        employer: 'Freelance Tech Consultant',
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        assignedAgentId: 'admin-1', // Assigned to Super Admin for visibility
        rawIngestionData: { source: 'VIP Manual Entry', importDate: new Date().toISOString() }
    });

    // 2. Generate Bulk Random Accounts
    for (let i = 2; i <= 60; i++) {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const street = STREETS[Math.floor(Math.random() * STREETS.length)];
        const barangay = BARANGAYS[Math.floor(Math.random() * BARANGAYS.length)];
        const employer = EMPLOYERS[Math.floor(Math.random() * EMPLOYERS.length)];
        const jobTitle = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];

        const campaignId = `client-${Math.floor(Math.random() * 4) + 1}`; // Random client 1-4

        // Varied Status Logic
        const overdueDays = Math.floor(Math.random() * 200) + 1;
        let bucket = '1-30';
        let riskScore: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        let status = CaseStatus.PENDING;

        if (overdueDays > 120) {
            bucket = '120+';
            riskScore = 'Critical';
            status = Math.random() > 0.7 ? CaseStatus.LEGAL : CaseStatus.BROKEN_PROMISE;
        } else if (overdueDays > 90) {
            bucket = '90-120';
            riskScore = 'High';
            status = Math.random() > 0.5 ? CaseStatus.BROKEN_PROMISE : CaseStatus.CONTACTED;
        } else if (overdueDays > 60) {
            bucket = '60-90';
            riskScore = 'High';
            status = CaseStatus.PROMISE_TO_PAY;
        } else if (overdueDays > 30) {
            bucket = '30-60';
            riskScore = 'Medium';
            status = CaseStatus.CONTACTED;
        } else {
            status = Math.random() > 0.5 ? CaseStatus.PENDING : CaseStatus.CONTACTED;
        }

        const principal = Math.floor(Math.random() * 200000) + 20000;
        const interest = Math.floor(principal * 0.18);
        const penalties = Math.floor(principal * (overdueDays / 365) * 0.5);
        const totalDue = principal + interest + penalties;

        // Phone generator
        const mobilePrefix = ['917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929', '930', '975', '976', '977', '978', '979'];
        const phonePrefix = mobilePrefix[Math.floor(Math.random() * mobilePrefix.length)];
        const phoneNumber = `+63 ${phonePrefix} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`;

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
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.ph`,
            address: `${Math.floor(Math.random() * 500 + 1)} ${street}, ${barangay}`,
            city: city.name,
            province: city.province,
            zipCode: city.zip,
            creditScore: Math.floor(Math.random() * 400) + 450,
            disbursalDate: new Date(dueDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
                startDate: '2022-01-01',
                address: `${city.name}, ${city.province}`,
                email: `hr@${employer.toLowerCase().replace(/\s/g, '')}.ph`,
                monthlyIncome: Math.floor(Math.random() * 80000) + 18000
            },
            emergencyContact: {
                name: `${lastName} Relative`,
                relationship: 'Relative',
                phone: phoneNumber,
                email: 'relative@email.ph'
            },
            transactions: [],
            familyContacts: [],
            assets: [],
            campaignId,
            employer,
            rawIngestionData: { source: 'Bulk Generator', importDate: new Date().toISOString() }
        });
    }

    return debtors;
};
