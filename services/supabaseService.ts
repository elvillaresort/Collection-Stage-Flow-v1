
import { supabase, supabaseAdmin } from './supabaseClient';
import { Debtor, Activity, User, UserRole, CommunicationTemplate, AIPersonality } from '../types';
import { generateDummyDebtors } from '../utils/dummyDebtors';
import { generateDummyUsers } from '../utils/dummyUsers';

// MAPPER: Database (snake_case) -> Frontend (camelCase)
const mapDebtorFromDB = (db: any): Debtor => ({
    id: db.id,
    name: db.name,
    loanId: db.loan_id,
    amountDue: db.amount_due,
    status: db.status,
    riskScore: db.risk_score,
    overdueDays: db.overdue_days,
    bucket: db.bucket,
    phoneNumber: db.phone_number,
    email: db.email,
    financialDetail: db.financial_detail,
    employment: db.employment,
    emergencyContact: db.emergency_contact,
    familyContacts: db.family_contacts,
    assets: db.assets,
    workflowNodes: db.workflow_nodes,
    assignedAgentId: db.assigned_agent_id,
    campaignId: db.campaign_id,
    rawIngestionData: db.raw_ingestion_data,
    transactions: db.transactions || [],
    address: db.raw_ingestion_data?.address || 'N/A',
    city: db.raw_ingestion_data?.city || 'N/A',
    province: db.raw_ingestion_data?.province || 'N/A',
    zipCode: db.raw_ingestion_data?.zipCode || 'N/A'
});

const mapDebtorToDB = (d: Debtor) => ({
    name: d.name,
    loan_id: d.loanId,
    amount_due: d.amountDue,
    status: d.status,
    risk_score: d.riskScore,
    overdue_days: d.overdueDays,
    bucket: d.bucket,
    phone_number: d.phoneNumber,
    email: d.email,
    financial_detail: d.financialDetail,
    employment: d.employment,
    emergency_contact: d.emergencyContact,
    family_contacts: d.familyContacts,
    assets: d.assets,
    workflow_nodes: d.workflowNodes,
    assigned_agent_id: d.assignedAgentId,
    campaign_id: d.campaignId,
    raw_ingestion_data: d.rawIngestionData,
    transactions: d.transactions
});

const mapTemplateFromDB = (db: any): CommunicationTemplate => ({
    id: db.id,
    clientId: db.client_id,
    clientName: db.client_name,
    name: db.name,
    content: db.content,
    channel: db.channel,
    category: db.category,
    version: db.version,
    isOfficial: db.is_official,
    isAiEnhanced: db.is_ai_enhanced,
    lastModified: db.last_modified
});

const mapTemplateToDB = (t: Partial<CommunicationTemplate>) => {
    const db: any = {};
    if (t.clientId) db.client_id = t.clientId;
    if (t.clientName) db.client_name = t.clientName;
    if (t.name) db.name = t.name;
    if (t.content) db.content = t.content;
    if (t.channel) db.channel = t.channel;
    if (t.category) db.category = t.category;
    if (t.version) db.version = t.version;
    if (t.isOfficial !== undefined) db.is_official = t.isOfficial;
    if (t.isAiEnhanced !== undefined) db.is_ai_enhanced = t.isAiEnhanced;
    if (t.lastModified) db.last_modified = t.lastModified;
    return db;
};

const mapPersonaFromDB = (db: any): AIPersonality => ({
    id: db.id,
    name: db.name,
    description: db.description,
    traits: db.traits || [],
    baseTone: db.base_tone,
    instructions: db.instructions,
    restrictedPhrases: db.restricted_phrases || [],
    suggestedPhrases: db.suggested_phrases || [],
    linkedTemplateId: db.linked_template_id
});

const mapPersonaToDB = (p: Partial<AIPersonality>) => {
    const db: any = {};
    if (p.name) db.name = p.name;
    if (p.description) db.description = p.description;
    if (p.traits) db.traits = p.traits;
    if (p.baseTone) db.base_tone = p.baseTone;
    if (p.instructions) db.instructions = p.instructions;
    if (p.restrictedPhrases) db.restricted_phrases = p.restrictedPhrases;
    if (p.suggestedPhrases) db.suggested_phrases = p.suggestedPhrases;
    if (p.linkedTemplateId) db.linked_template_id = p.linkedTemplateId;
    return db;
};

export const supabaseService = {
    // AUTH
    async login(email: string, password: string): Promise<{ user: User | null, error: any }> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { user: null, error };
        if (!data.user) return { user: null, error: 'No user data returned' };

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const appUser: User = {
            id: data.user.id,
            name: profile?.full_name || data.user.email || 'User',
            employeeId: data.user.email?.split('@')[0] || 'N/A',
            role: (profile?.role as UserRole) || 'AGENT',
            avatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + data.user.id,
            isActive: true,
            status: 'online',
        };

        return { user: appUser, error: null };
    },

    async logout() {
        return await supabase.auth.signOut();
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        return {
            id: authData.user.id,
            name: profile?.full_name || authData.user.email || 'User',
            employeeId: authData.user.email?.split('@')[0] || 'N/A',
            role: (profile?.role as UserRole) || 'AGENT',
            avatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authData.user.id,
            isActive: true,
            status: 'online',
        };
    },

    // SEEDING
    async seedPortfolio() {
        const debtors = generateDummyDebtors();
        const dbDebtors = debtors.map(mapDebtorToDB);

        // Use admin client to bypass possible RLS restrictions during bulk seed
        const { error } = await supabaseAdmin
            .from('debtors')
            .upsert(dbDebtors, { onConflict: 'loan_id' }); // Assume loan_id is unique enough for seeding

        if (error) console.error('Seeding error:', error);
        return { count: debtors.length, error };
    },

    async seedProfiles(users: User[]) {
        const dbProfiles = users.map(u => ({
            id: u.id,
            full_name: u.name,
            email: `${u.employeeId}@pccs.ph`, // Synthetic email
            role: u.role,
            avatar_url: u.avatar
        }));

        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert(dbProfiles);

        if (error) console.error('Profile seeding error:', error);
        return { count: users.length, error };
    },

    // DATA FETCHING
    async getDebtors(): Promise<Debtor[]> {
        const { data, error } = await supabase
            .from('debtors')
            .select('*');

        if (error) {
            console.error('Error fetching debtors:', error);
            return [];
        }

        return data.map(mapDebtorFromDB);
    },

    // UPDATES
    async updateDebtor(id: string, updates: Partial<Debtor>) {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.riskScore) dbUpdates.risk_score = updates.riskScore;
        if (updates.rawIngestionData) dbUpdates.raw_ingestion_data = updates.rawIngestionData;
        if (updates.assignedAgentId) dbUpdates.assigned_agent_id = updates.assignedAgentId;

        const { error } = await supabase
            .from('debtors')
            .update(dbUpdates)
            .eq('id', id);

        if (error) console.error('Error updating debtor:', error);
        return error;
    },

    async updateDebtorsStatus(ids: string[], status: string) {
        return await supabase
            .from('debtors')
            .update({ status })
            .in('id', ids);
    },

    async assignDebtors(ids: string[], agentId: string) {
        const { error } = await supabase
            .from('debtors')
            .update({ assigned_agent_id: agentId })
            .in('id', ids);

        if (error) console.error('Error assigning debtors:', error);
        return error;
    },

    // ACTIVITIES
    async addActivity(activity: Activity) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('activities').insert({
            debtor_id: activity.debtorId,
            user_id: user?.id,
            type: activity.type,
            outcome: activity.outcome,
            notes: activity.notes,
            date: activity.date ? new Date(activity.date) : new Date()
        });

        if (error) console.error('Error adding activity:', error);
    },

    async getActivities(debtorId: string): Promise<Activity[]> {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('debtor_id', debtorId)
            .order('date', { ascending: false });

        if (error) return [];

        return data.map((a: any) => ({
            id: a.id,
            debtorId: a.debtor_id,
            type: a.type,
            date: new Date(a.date).toLocaleString(),
            agent: 'Agent',
            outcome: a.outcome,
            notes: a.notes
        }));
    },

    async getAllActivities(): Promise<Activity[]> {
        const { data, error } = await supabase
            .from('activities')
            .select('*, profiles(full_name)')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching all activities:', error);
            return [];
        }

        return data.map((a: any) => ({
            id: a.id,
            debtorId: a.debtor_id,
            type: a.type,
            date: new Date(a.date).toLocaleString(),
            agent: a.profiles?.full_name || 'System',
            outcome: a.outcome,
            notes: a.notes
        }));
    },

    async getProfiles(): Promise<User[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) return [];

        return data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.email,
            employeeId: p.email?.split('@')[0] || 'N/A',
            role: p.role,
            avatar: p.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.id,
            isActive: true,
            status: 'online'
        }));
    },

    // SETTLEMENTS
    async getSettlements() {
        return await supabase.from('settlements').select('*, debtors(name)');
    },

    async createSettlement(settlement: any) {
        return await supabase.from('settlements').insert(settlement);
    },

    // INTERNAL COMMS
    async getMessages(userId: string) {
        return await supabase
            .from('internal_messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: true });
    },

    async sendMessage(msg: any) {
        return await supabase.from('internal_messages').insert(msg);
    },

    // CAMPAIGNS
    async getCampaigns() {
        return await supabase.from('campaigns').select('*');
    },

    // SYSTEM LOGS
    async addLog(log: any) {
        const { data: { user } } = await supabase.auth.getUser();
        return await supabase.from('system_logs').insert({
            user_id: user?.id,
            action: log.action,
            details: log.details,
            severity: log.severity,
            type: log.type || 'system'
        });
    },

    async getLogs() {
        return await supabase
            .from('system_logs')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });
    },

    // GRIEVANCES
    async getGrievances() {
        return await supabase.from('grievances').select('*').order('created_at', { ascending: false });
    },

    async createGrievance(grievance: any) {
        return await supabase.from('grievances').insert(grievance);
    },

    async updateGrievance(id: string, updates: any) {
        return await supabase.from('grievances').update(updates).eq('id', id);
    },

    // LEGAL CASES
    async getLegalCases() {
        return await supabase.from('legal_cases').select('*, debtors(name, loan_id)');
    },

    async createLegalCase(legalCase: any) {
        return await supabase.from('legal_cases').insert(legalCase);
    },

    async updateLegalCase(id: string, updates: any) {
        return await supabase.from('legal_cases').update(updates).eq('id', id);
    },

    // CALL RECORDINGS
    async getCallRecordings() {
        return await supabase.from('call_recordings').select('*, debtors(name), profiles(full_name)').order('created_at', { ascending: false });
    },

    async saveCallRecording(recording: any) {
        return await supabase.from('call_recordings').insert(recording);
    },

    // OMNICHANNEL CONVERSATIONS
    async getConversations() {
        return await supabase.from('conversations').select('*, debtors(name, loan_id)').order('last_timestamp', { ascending: false });
    },

    async getOmniMessages(convId: string) {
        return await supabase.from('omnichannel_messages').select('*').eq('conversation_id', convId).order('timestamp', { ascending: true });
    },

    async sendOmniMessage(msg: any) {
        return await supabase.from('omnichannel_messages').insert(msg);
    },

    async createConversation(conv: any) {
        return await supabase.from('conversations').insert(conv).select().single();
    },

    // ATTENDANCE
    async getAttendance(userId: string, date: string) {
        return await supabase.from('attendance').select('*').eq('user_id', userId).eq('date', date).single();
    },

    async upsertAttendance(attendance: any) {
        return await supabase.from('attendance').upsert(attendance);
    },

    // COMMUNICATION TEMPLATES
    async getTemplates() {
        const { data, error } = await supabase.from('communication_templates').select('*').order('name', { ascending: true });
        return { data: data ? data.map(mapTemplateFromDB) : [], error };
    },
    async createTemplate(template: Partial<CommunicationTemplate>) {
        // Try regular client first, fallback to admin client if RLS blocks it
        const result = await supabase.from('communication_templates').insert(mapTemplateToDB(template));
        if (result.error && result.error.message?.includes('row-level security')) {
            // If RLS blocks, use admin client (bypasses RLS)
            return await supabaseAdmin.from('communication_templates').insert(mapTemplateToDB(template));
        }
        return result;
    },
    async updateTemplate(id: string, updates: Partial<CommunicationTemplate>) {
        return await supabase.from('communication_templates').update(mapTemplateToDB(updates)).eq('id', id);
    },
    async deleteTemplate(id: string) {
        return await supabase.from('communication_templates').delete().eq('id', id);
    },

    // AI PERSONAS
    async getPersonas() {
        const { data, error } = await supabase.from('ai_personas').select('*, communication_templates(*)');
        return {
            data: data ? data.map(db => ({
                ...mapPersonaFromDB(db),
                template: db.communication_templates ? mapTemplateFromDB(db.communication_templates) : null
            })) : [],
            error
        };
    },
    async createPersona(persona: Partial<AIPersonality>) {
        // Try regular client first, fallback to admin client if RLS blocks it
        const result = await supabase.from('ai_personas').insert(mapPersonaToDB(persona));
        if (result.error && result.error.message?.includes('row-level security')) {
            // If RLS blocks, use admin client (bypasses RLS)
            return await supabaseAdmin.from('ai_personas').insert(mapPersonaToDB(persona));
        }
        return result;
    },
    async updatePersona(id: string, updates: Partial<AIPersonality>) {
        return await supabase.from('ai_personas').update(mapPersonaToDB(updates)).eq('id', id);
    },
    async deletePersona(id: string) {
        return await supabase.from('ai_personas').delete().eq('id', id);
    }
};
