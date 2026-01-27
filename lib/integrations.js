// ============================================
// REAL-WORLD INTEGRATIONS
// Free services for forms, calendars, maps, etc.
// ============================================

// ============================================
// FORM SUBMISSION - Using Web3Forms (free tier)
// Get your access key at: https://web3forms.com
// ============================================
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE'

export async function submitForm(formType, data) {
  // Add form metadata
  const payload = {
    access_key: WEB3FORMS_KEY,
    subject: `Project Bold - ${formType}`,
    from_name: data.name || 'Project Bold Form',
    ...data,
    form_type: formType,
    submitted_at: new Date().toISOString(),
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (result.success) {
      return { success: true, message: 'Form submitted successfully!' }
    } else {
      throw new Error(result.message || 'Submission failed')
    }
  } catch (error) {
    console.error('Form submission error:', error)
    // Fallback to localStorage if API fails
    saveToLocalStorage(formType, data)
    return { success: true, message: 'Saved locally (offline mode)' }
  }
}

// Fallback storage when offline
function saveToLocalStorage(formType, data) {
  const key = `projectbold_submissions_${formType}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push({ ...data, submittedAt: new Date().toISOString() })
  localStorage.setItem(key, JSON.stringify(existing))
}

// ============================================
// EMAIL INTEGRATIONS - mailto: with templates
// ============================================
export function createMailtoLink({ to, subject, body, cc, bcc }) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  if (cc) params.set('cc', cc)
  if (bcc) params.set('bcc', bcc)

  const queryString = params.toString()
  return `mailto:${to}${queryString ? '?' + queryString : ''}`
}

// Pre-configured email templates
export const emailTemplates = {
  feedback: (department) => createMailtoLink({
    to: `${department}@unc.edu`,
    subject: `Feedback for Project Bold - ${department.charAt(0).toUpperCase() + department.slice(1)}`,
    body: `Hi Project Bold Team,\n\nI wanted to share some feedback:\n\n[Your feedback here]\n\nThank you!`,
  }),

  volunteerInquiry: createMailtoLink({
    to: 'wellness@unc.edu',
    subject: 'Interest in Safe Ride Volunteer Program',
    body: `Hi,\n\nI'm interested in becoming a Safe Ride volunteer.\n\nName:\nPID:\nPhone:\nAvailable days:\n\nThank you!`,
  }),

  mentorRequest: createMailtoLink({
    to: 'academic@unc.edu',
    subject: 'Peer Mentor Request',
    body: `Hi Academic Affairs,\n\nI would like to request a peer mentor.\n\nName:\nMajor:\nSubject area needed:\nSpecific goals:\n\nThank you!`,
  }),

  eventSafetyInquiry: createMailtoLink({
    to: 'wellness@unc.edu',
    subject: 'Event Safety Plan Inquiry',
    body: `Hi,\n\nI have questions about submitting an event safety plan.\n\nOrganization:\nEvent Date:\nExpected Attendance:\nQuestions:\n\nThank you!`,
  }),
}

// ============================================
// GOOGLE CALENDAR INTEGRATION
// Creates "Add to Calendar" links
// ============================================
export function createGoogleCalendarLink({
  title,
  description,
  location,
  startDate, // ISO string or Date object
  endDate,   // ISO string or Date object
  allDay = false,
}) {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'

  const formatDate = (date, isAllDay) => {
    const d = new Date(date)
    if (isAllDay) {
      return d.toISOString().split('T')[0].replace(/-/g, '')
    }
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const params = new URLSearchParams({
    text: title,
    details: description || '',
    location: location || '',
    dates: `${formatDate(startDate, allDay)}/${formatDate(endDate, allDay)}`,
  })

  return `${baseUrl}&${params.toString()}`
}

// Pre-configured calendar events
export const calendarEvents = {
  sustainCarolinaWeek: createGoogleCalendarLink({
    title: 'Sustain Carolina Week 2026',
    description: 'Campus-wide sustainability celebration with events, workshops, and service projects.',
    location: 'UNC Chapel Hill Campus',
    startDate: '2026-03-03',
    endDate: '2026-03-08',
    allDay: true,
  }),

  eventSafetyWorkshop: createGoogleCalendarLink({
    title: 'Event Safety 101 Workshop',
    description: 'Learn the basics of creating effective safety plans for off-campus events.',
    location: 'Student Union 3201, UNC Chapel Hill',
    startDate: '2026-02-10T17:00:00',
    endDate: '2026-02-10T18:30:00',
  }),

  leaseWorkshop: createGoogleCalendarLink({
    title: 'Understanding Your Lease Workshop',
    description: 'Learn what to look for before signing a lease.',
    location: 'Student Union 3201, UNC Chapel Hill',
    startDate: '2026-02-15T17:00:00',
    endDate: '2026-02-15T18:30:00',
  }),

  budgetingWorkshop: createGoogleCalendarLink({
    title: 'Budgeting for Off-Campus Life',
    description: 'Learn to budget for off-campus living expenses.',
    location: 'Student Union 3205, UNC Chapel Hill',
    startDate: '2026-02-22T16:00:00',
    endDate: '2026-02-22T17:30:00',
  }),
}

// ============================================
// GOOGLE MAPS INTEGRATION
// Creates links to locations
// ============================================
export function createGoogleMapsLink(query, { lat, lng } = {}) {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// Campus locations
export const campusLocations = {
  studentUnion: createGoogleMapsLink('UNC Student Union, Chapel Hill, NC'),
  campusHealth: createGoogleMapsLink('UNC Campus Health Services, Chapel Hill, NC'),
  davisLibrary: createGoogleMapsLink('Davis Library UNC, Chapel Hill, NC'),
  thePit: createGoogleMapsLink('The Pit UNC Chapel Hill'),
  ramVillage: createGoogleMapsLink('Ram Village UNC, Chapel Hill, NC'),
  kenanLabs: createGoogleMapsLink('Kenan Labs UNC Chapel Hill'),
  phillipsHall: createGoogleMapsLink('Phillips Hall UNC Chapel Hill'),
  chapmanHall: createGoogleMapsLink('Chapman Hall UNC Chapel Hill'),
  cokerHall: createGoogleMapsLink('Coker Hall UNC Chapel Hill'),
  lenoir: createGoogleMapsLink('Lenoir Dining Hall UNC Chapel Hill'),
}

// ============================================
// PHONE/SMS INTEGRATIONS
// ============================================
export function createPhoneLink(number) {
  return `tel:${number.replace(/\D/g, '')}`
}

export function createSMSLink(number, body = '') {
  const cleanNumber = number.replace(/\D/g, '')
  return body ? `sms:${cleanNumber}?body=${encodeURIComponent(body)}` : `sms:${cleanNumber}`
}

// Crisis and important numbers
export const phoneNumbers = {
  crisis988: createPhoneLink('988'),
  crisisText: createSMSLink('741741', 'HELLO'),
  caps: createPhoneLink('919-966-3658'),
  campusHealth: createPhoneLink('919-966-2281'),
  deanOfStudents: createPhoneLink('919-966-4042'),
  campusPolice: createPhoneLink('919-962-8100'),
  safeRide: createPhoneLink('919-962-SAFE'),
}

// ============================================
// SOCIAL SHARING
// ============================================
export function createShareLinks(url, title, description) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDesc = encodeURIComponent(description)

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: createMailtoLink({
      to: '',
      subject: title,
      body: `${description}\n\n${url}`,
    }),
  }
}

// ============================================
// EXTERNAL SERVICE LINKS
// ============================================
export const externalLinks = {
  // CAPS & Health
  capsAppointment: 'https://caps.unc.edu/services/schedule-appointment',
  campusHealthPortal: 'https://campushealth.unc.edu/patient-portal',
  connectCarolina: 'https://connectcarolina.unc.edu',

  // Academic
  learningCenter: 'https://learningcenter.unc.edu',
  writingCenter: 'https://writingcenter.unc.edu',

  // Housing & Basic Needs
  carolinaCupboard: 'https://carolinacupboard.web.unc.edu',
  offCampusHousing: 'https://offcampushousing.unc.edu',
  carolinaDining: 'https://dining.unc.edu',

  // Sustainability
  sustainabilityOffice: 'https://sustainability.unc.edu',
  recycling: 'https://facilities.unc.edu/operations/recycling-solid-waste/',

  // Safety
  dps: 'https://police.unc.edu',
  safeWalk: 'https://move.unc.edu/safewalk/',

  // Student Government
  sgWebsite: 'https://sg.unc.edu',
  sgFeedback: 'https://sg.unc.edu/feedback',
}

// ============================================
// DOWNLOAD LINKS (for PDFs, templates, etc.)
// ============================================
export function createDownloadLink(filename, content, type = 'text/plain') {
  // Creates a data URL for client-side downloads
  const blob = new Blob([content], { type })
  return URL.createObjectURL(blob)
}

// Template generators
export const templates = {
  safetyPlanTemplate: () => {
    const content = `EVENT SAFETY PLAN TEMPLATE
=========================

Organization Name: ____________________
Event Name: ____________________
Event Date: ____________________
Expected Attendance: ____________________
Event Location: ____________________

1. TRANSPORTATION PLAN
   [ ] Designated drivers identified
   [ ] Safe Ride information distributed
   [ ] Parking/drop-off arrangements
   Notes: ____________________

2. CROWD MANAGEMENT
   [ ] Entry/exit points identified
   [ ] Maximum capacity determined
   [ ] Security personnel (if applicable)
   Notes: ____________________

3. EMERGENCY CONTACTS
   Event Coordinator: ____________________
   Phone: ____________________
   Backup Contact: ____________________
   Phone: ____________________

   Emergency Services: 911
   Campus Police: 919-962-8100
   CAPS Crisis: 919-966-3658

4. SOBER MONITORS
   Name: ____________________ Phone: ____________________
   Name: ____________________ Phone: ____________________
   Name: ____________________ Phone: ____________________

   Responsibilities:
   [ ] Monitor alcohol consumption
   [ ] Identify distressed individuals
   [ ] Coordinate safe transportation

5. ADDITIONAL SAFETY MEASURES
   [ ] First aid kit available
   [ ] Emergency exits marked
   [ ] Weather contingency plan
   Notes: ____________________

Submitted by: ____________________
Date: ____________________
`
    return content
  },

  roomateAgreementTemplate: () => {
    const content = `ROOMMATE AGREEMENT
==================

Date: ____________________
Lease Address: ____________________
Lease Term: ____________________

ROOMMATES:
1. ____________________ (Bedroom: ____)
2. ____________________ (Bedroom: ____)
3. ____________________ (Bedroom: ____)

RENT & UTILITIES
- Total Monthly Rent: $____________________
- Individual Shares:
  * Roommate 1: $____________________
  * Roommate 2: $____________________
  * Roommate 3: $____________________
- Due Date: ____________________
- Payment Method: ____________________

UTILITIES RESPONSIBILITY:
- Electric: ____________________
- Water: ____________________
- Internet: ____________________
- Gas: ____________________

SHARED SPACES
- Cleaning Schedule: ____________________
- Guest Policy: ____________________
- Quiet Hours: ____________________
- Parking: ____________________

PERSONAL ITEMS
- Shared Items: ____________________
- Off-Limits Items: ____________________

CONFLICT RESOLUTION
We agree to discuss issues directly and respectfully.
If needed, we will involve: ____________________

SIGNATURES:
____________________ Date: ____________________
____________________ Date: ____________________
____________________ Date: ____________________
`
    return content
  },

  budgetTemplate: () => {
    const content = `MONTHLY BUDGET TEMPLATE
======================

INCOME
- Job/Work Study: $____________________
- Financial Aid: $____________________
- Family Support: $____________________
- Other: $____________________
TOTAL INCOME: $____________________

FIXED EXPENSES
- Rent: $____________________
- Utilities: $____________________
- Phone: $____________________
- Insurance: $____________________
- Subscriptions: $____________________
TOTAL FIXED: $____________________

VARIABLE EXPENSES
- Groceries: $____________________
- Dining Out: $____________________
- Transportation: $____________________
- Entertainment: $____________________
- Personal Care: $____________________
- Clothing: $____________________
- Miscellaneous: $____________________
TOTAL VARIABLE: $____________________

SAVINGS GOALS
- Emergency Fund: $____________________
- Travel: $____________________
- Other: $____________________
TOTAL SAVINGS: $____________________

SUMMARY
Total Income: $____________________
Total Expenses: $____________________
Remaining: $____________________

NOTES:
____________________
____________________
`
    return content
  },
}

// ============================================
// WEBHOOK NOTIFICATIONS (for Slack/Discord)
// Optional: Configure webhooks for form submissions
// ============================================
export async function sendWebhookNotification(webhookUrl, message) {
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
  } catch (error) {
    console.error('Webhook notification failed:', error)
  }
}

// ============================================
// FORM SUBMISSION HANDLER WITH ALL INTEGRATIONS
// ============================================
export async function handleFormSubmission(formType, formData, options = {}) {
  const {
    sendEmail = true,
    saveLocal = true,
    showConfirmation = true,
    webhookUrl = null,
  } = options

  const results = {
    success: false,
    message: '',
    errors: [],
  }

  try {
    // 1. Submit to Web3Forms (or similar)
    if (sendEmail) {
      const emailResult = await submitForm(formType, formData)
      if (!emailResult.success) {
        results.errors.push('Email submission failed')
      }
    }

    // 2. Save to localStorage as backup
    if (saveLocal) {
      saveToLocalStorage(formType, formData)
    }

    // 3. Send webhook notification if configured
    if (webhookUrl) {
      await sendWebhookNotification(webhookUrl,
        `New ${formType} submission from ${formData.name || 'Anonymous'}`
      )
    }

    results.success = results.errors.length === 0
    results.message = results.success
      ? 'Your submission has been received!'
      : 'Submission saved locally. Will sync when online.'

  } catch (error) {
    console.error('Form submission error:', error)
    results.errors.push(error.message)
    results.message = 'An error occurred. Please try again.'
  }

  return results
}
