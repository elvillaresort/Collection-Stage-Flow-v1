# Strategy Hub - Comprehensive User Guide

## Overview
The Strategy Hub (Communication Hub) is your central command center for managing client-approved communication templates, AI personas, and testing collection strategies through intelligent simulation. This guide will walk you through every feature step-by-step.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Tab 1: Approved Script Registry](#tab-1-approved-script-registry)
3. [Tab 2: AI Persona Hub](#tab-2-ai-persona-hub)
4. [Tab 3: Intelligence Playground](#tab-3-intelligence-playground)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Strategy Hub
1. Log into the PCCS Collection System
2. Navigate to the sidebar menu
3. Click on **"Strategy Hub"** (icon: Sparkles ✨)
4. You'll see three main tabs at the top:
   - **Approved Script Registry** 📄
   - **AI Persona Hub** 🤖
   - **Intelligence Playground** 🧠

### Understanding the Interface
- **Header**: Shows the current section and action buttons
- **Tabs**: Switch between different management areas
- **Search Bar**: Filter templates by client name or title
- **Action Buttons**: Context-specific actions (Upload, Create, Deploy)

---

## Tab 1: Approved Script Registry

### Purpose
Manage client-mandated communication templates that have been officially approved for use in collection campaigns.

### Step-by-Step: Adding a New Template

#### Step 1: Open the Template Form
1. Click the **"Upload Approved Script"** button in the header, OR
2. Click the **"Add Original Approved Script"** card at the bottom of the template grid

#### Step 2: Fill in Template Details

**Required Fields:**
- **Client Creditor** (e.g., "BDO Unibank", "Home Credit")
  - This automatically generates a Client ID
  - Example: "BDO Unibank" → Client ID: "BDO"

- **Script Name** (e.g., "Initial SMS Reminder v2")
  - Use descriptive names with version numbers
  - Include the purpose: "Initial", "Follow-up", "PTP Reminder", etc.

- **Linguistic Content**
  - Copy-paste the EXACT wording approved by the client
  - Include all placeholders like `[NAME]`, `[AMOUNT]`, `[LOAN_ID]`
  - Example:
    ```
    "Hello [NAME], si [AGENT] ito mula sa PCCS. May balance pa po kayo na $[AMOUNT] for loan [LOAN_ID]. Para iwas legal issue, pay today via GCash: [LINK]. Salamat po."
    ```

**Optional Fields:**
- **Target Channel**: Select from:
  - SMS
  - WhatsApp
  - Email
  - Voice
  - Field Visit

- **Category**: Choose the template type:
  - `INITIAL_DEMAND` - First contact
  - `FOLLOW_UP` - Subsequent reminders
  - `PTP_REMINDER` - Promise to Pay reminders
  - `SETTLEMENT_OFFER` - Settlement negotiations
  - `LEGAL_WARNING` - Legal escalation notices
  - `FIELD_ADVISORY` - Field visit notifications
  - `CUSTOM` - Custom category

#### Step 3: Save the Template
1. Click **"Commit to Script Registry"**
2. The template will appear in your template grid
3. You can now use it in campaigns and link it to AI personas

### Managing Existing Templates

#### Viewing Templates
- Templates are displayed in a card grid
- Each card shows:
  - **Template Name** and **Client Name**
  - **Official Badge** (green shield = approved)
  - **Content Preview** (first 4 lines)
  - **Channel Badge** (SMS, Email, etc.)
  - **Category Badge**
  - **Version Number**
  - **Last Revision Date**

#### Searching Templates
1. Use the search bar at the top
2. Type client name or template title
3. Results filter in real-time

#### Deploying a Template
1. Find the template card
2. Click **"Deploy Script"** button at the bottom
3. The template will be prioritized for all active campaigns using that channel

#### Deleting a Template
1. Click the trash icon (🗑️) in the top-right of the template card
2. Confirm deletion
3. ⚠️ **Warning**: This action cannot be undone

---

## Tab 2: AI Persona Hub

### Purpose
Create and configure AI personas that define how the system communicates with debtors. Each persona has specific behavioral traits, tone, and can be linked to approved scripts.

### Step-by-Step: Creating a New Persona

#### Step 1: Open the Persona Form
1. Click **"Design New Persona"** button in the header, OR
2. Click the **"Blueprint New Collector Persona"** card

#### Step 2: Define Persona Identity

**Required Fields:**
- **Persona Descriptor** (e.g., "The Strategic Negotiator")
  - Choose a memorable name that reflects the persona's approach
  - Examples:
    - "The Empathetic Counselor"
    - "The Firm Deadline Enforcer"
    - "The Credit Score Advisor"

- **Linguistic Instructions**
  - Detailed instructions on how the AI should behave
  - Example:
    ```
    "Always use respectful Taglish. Emphasize the benefits of clearing the record. 
    Never use threatening language. Focus on payment solutions that work for the debtor's situation."
    ```

**Configuration Options:**
- **Base Tone**: Select the primary communication style:
  - `FIRM` - Direct and authoritative
  - `EMPATHETIC` - Understanding and supportive
  - `PROFESSIONAL` - Formal and business-like
  - `PERSUASIVE` - Convincing and motivational
  - `NEGOTIATOR` - Collaborative and solution-focused

- **Contextual Script Binding**
  - Link this persona to a specific approved template
  - Select from your template registry
  - Choose "Global / Unlinked" if the persona should work with any template

- **Linguistic Traits** (Comma-separated)
  - Define specific behavioral characteristics
  - Example: `"Approachable, Direct, Firm with Deadlines, Emphasizes Credit Score"`
  - These traits guide the AI's response style

#### Step 3: Save the Persona
1. Click **"Instantiate Persona"**
2. The persona appears in your persona grid
3. You can now use it in the Intelligence Playground

### Understanding Persona Cards

Each persona card displays:
- **Persona Name** and **Base Tone Specialist** badge
- **Description** of the persona's approach
- **Behavioral Traits** as colored badges
- **Target Logic** (e.g., "Debtor Psychology Management")
- **Linked Registry** (which template it's bound to)
- **"Simulate Collection Stream"** button to test it

### Testing a Persona
1. Click **"Simulate Collection Stream"** on any persona card
2. This automatically opens the Intelligence Playground tab
3. The persona and linked template are pre-selected
4. You can immediately start testing scenarios

---

## Tab 3: Intelligence Playground

### Purpose
Test and simulate real-time conversations between AI personas and debtors before deploying strategies to live campaigns.

### Step-by-Step: Running a Simulation

#### Step 1: Select Your Configuration

**Choose Simulation Persona:**
1. In the left sidebar, find the **"Simulation Persona"** dropdown
2. Select a persona from your created personas
3. This determines how the AI will respond

**Choose Approved Script Context:**
1. In the **"Approved Script Context"** dropdown
2. Select a template from your registry
3. This provides the base content and context for the conversation

#### Step 2: Start the Simulation

**Initial Setup:**
- The system automatically initializes when you select both persona and script
- You'll see system messages:
  - `[SYSTEM] Initializing Linguistic Simulation Node...`
  - `[SYSTEM] Waiting for Persona Selection and Input Scenario...`

**Sending Test Scenarios:**
1. Type a scenario in the input field at the bottom
2. Examples of test scenarios:
   - `"Debtor claims identity theft"`
   - `"Debtor promises to pay next week"`
   - `"Debtor says they lost their job"`
   - `"Debtor wants to negotiate settlement"`
   - `"Debtor is angry and threatening"`

3. Press **Enter** or click the **Send** button (📤)

#### Step 3: Analyze Responses

**Understanding Message Types:**
- `[SYSTEM]` - System status messages (green)
- `[AI]` - AI persona responses (blue)
- `[USER]` - Your test inputs (white)

**Response Analysis:**
- The AI will respond based on:
  - Selected persona's traits and tone
  - Linked template's approved content
  - The specific scenario you provided
  - Compliance and best practices

**Example Flow:**
```
[USER] Debtor claims identity theft
[AI] I understand your concern. We take identity theft claims very seriously. 
     Could you please provide a police report or a formal affidavit so we can 
     halt the collection process and initiate an internal investigation?
```

#### Step 4: Iterate and Refine

**Testing Multiple Scenarios:**
1. Continue sending different scenarios
2. Observe how the persona handles each situation
3. Note any responses that need adjustment

**Refining Your Setup:**
- If responses don't match your expectations:
  1. Go back to **AI Persona Hub**
  2. Edit the persona's instructions or traits
  3. Return to Playground and test again

### Advanced Playground Features

**System Information:**
- **Latency**: Shows response time (typically 124ms)
- **Model**: Displays the AI model in use (Nexus-7b)

**Session Management:**
- Each simulation session is independent
- You can switch personas/templates mid-session
- Previous messages remain visible for context

---

## Best Practices

### Template Management

1. **Version Control**
   - Always include version numbers in template names
   - Keep old versions for reference
   - Document changes in template names

2. **Client Compliance**
   - Only upload officially approved scripts
   - Never modify approved content
   - Keep client-specific templates organized

3. **Placeholder Usage**
   - Use clear placeholder names: `[NAME]`, `[AMOUNT]`, `[LOAN_ID]`
   - Document all placeholders in template description
   - Test placeholders in Playground

### Persona Design

1. **Clear Instructions**
   - Be specific in linguistic instructions
   - Include examples of desired responses
   - Define boundaries (what NOT to say)

2. **Tone Selection**
   - Match persona tone to campaign stage
   - Early stage: Empathetic or Professional
   - Late stage: Firm or Negotiator

3. **Template Linking**
   - Link personas to relevant templates
   - Test combinations in Playground
   - Consider creating personas for specific client templates

### Playground Testing

1. **Comprehensive Scenarios**
   - Test common objections
   - Test edge cases (identity theft, job loss, etc.)
   - Test compliance scenarios

2. **Iterative Refinement**
   - Test → Review → Adjust → Test again
   - Keep notes on what works
   - Share successful configurations with team

3. **Compliance Verification**
   - Ensure responses follow regulations
   - Verify no threatening language
   - Confirm proper handling of disputes

---

## Troubleshooting

### Templates Not Appearing
**Problem**: Template doesn't show in registry after creation
**Solution**: 
- Refresh the page
- Check if you're logged in with proper permissions
- Verify template was saved (check browser console)

### Persona Not Responding in Playground
**Problem**: AI doesn't respond to test scenarios
**Solution**:
- Ensure both persona AND template are selected
- Check that persona has linguistic instructions
- Wait for system initialization (green dot should be active)

### Responses Don't Match Expectations
**Problem**: AI responses don't align with persona settings
**Solution**:
- Review persona's linguistic instructions
- Check if template is properly linked
- Test with different scenarios
- Consider refining persona traits

### Can't Delete Template/Persona
**Problem**: Delete button doesn't work
**Solution**:
- Ensure you have proper permissions (Admin/Manager role)
- Check browser console for errors
- Try refreshing the page

### Search Not Working
**Problem**: Search doesn't filter templates
**Solution**:
- Clear search field and try again
- Check spelling of client name or template title
- Ensure templates are loaded (check loading indicator)

---

## Quick Reference

### Keyboard Shortcuts
- **Enter**: Send message in Playground
- **Escape**: Close modals
- **Tab**: Navigate between form fields

### Status Indicators
- 🟢 **Green Shield**: Official/Approved template
- 📄 **Document Icon**: Draft/Unapproved template
- 🟢 **Green Dot**: Playground session active
- ⚠️ **Warning**: Action requires confirmation

### Common Workflows

**New Campaign Setup:**
1. Create/Select templates for campaign
2. Create personas matching campaign tone
3. Link personas to templates
4. Test in Playground
5. Deploy templates to campaign

**Template Update:**
1. Create new version of template
2. Update version number
3. Test in Playground with existing personas
4. Deploy new version

**Persona Refinement:**
1. Test persona in Playground
2. Identify issues
3. Edit persona instructions/traits
4. Re-test in Playground
5. Deploy to campaigns

---

## Support

For additional help:
- Check the system logs for error messages
- Contact your system administrator
- Review compliance guidelines before deploying templates
- Consult with client compliance teams for template approval

---

**Last Updated**: 2024
**Version**: 1.0

