import { User, UserRole } from '../types';

export const USER_ROLES: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'HEAD_OF_OPERATIONS',
    'OPERATIONS_MANAGER',
    'TEAM_MANAGER',
    'TEAM_LEADER',
    'ASSISTANT_TEAM_LEADER',
    'CAMPAIGN_ADMIN',
    'COMPLIANCE_OFFICER',
    'AGENT',
    'FIELD_AGENT'
];

const FIRST_NAMES = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Reese',
    'Blake', 'Charlie', 'Dakota', 'Drew', 'Emerson', 'Finley', 'Hayden', 'Jayden', 'Kendall', 'Logan'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Willow', 'Bandit', 'Jasper', 'Garfield', 'Sheba', 'Whiskers', 'Luna', 'Cleo',
    'Simba', 'Nala', 'Milo', 'Oreo', 'Coco', 'Bella', 'Lucy', 'Daisy', 'Max', 'Charlie'
];

export const generateDummyUsers = (): User[] => {
    const users: User[] = [];
    let idCounter = 1;

    USER_ROLES.forEach((role) => {
        // Generate 1-3 users per role
        const count = role === 'SUPER_ADMIN' ? 1 : Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < count; i++) {
            const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
            const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
            const fullName = `${firstName} ${lastName}`;
            const employeeId = `${role.split('_').map(w => w[0]).join('')}${String(idCounter).padStart(3, '0')}`;
            // Create an easier to type email for login
            const emailSafeRole = role.toLowerCase().replace(/_/g, '.');
            const email = `${emailSafeRole}.${i + 1}@pccs.ph`;

            users.push({
                id: `usr-${role.toLowerCase()}-${idCounter}`,
                name: fullName,
                employeeId: employeeId,
                password: 'password123', // Default password for all dummy users
                role: role,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${AVATAR_SEEDS[idCounter % AVATAR_SEEDS.length]}`,
                concurrentAccess: true,
                isActive: true,
                status: 'online',
                isCertified: true,
                // Add email to the user object if not present in type, but it seems email is not in User type directly based on previous read, 
                // checking types.ts again... Types.ts User interface doesn't have email. It has employeeId.
                // Wait, Login.tsx uses email/ID to login. 
                // In supabaseService.ts: name: user.email || 'User'. 
                // Let's stick to employeeId for login or we might need to extend User type if we strictly need email.
                // But looking at Login.tsx: "Email or ID".
                // So I will make sure the employeeId is usable.
            });
            idCounter++;
        }
    });

    return users;
};
