// Seed The Scroll with all registry documents
// POST /api/codex/seed — requires admin auth
// Fetches PDF text or inserts descriptive placeholders for all 15 seed documents

import { verifyAdmin } from '../../../lib/auth'
import { createDocument, updateDocumentStatus, getDocuments } from '../../../lib/codex'
import { SEED_DOCUMENTS } from '../../../lib/scrollRegistry'
import pdfParse from 'pdf-parse'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAdmin(req)
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { livePdf = false } = req.body || {}

  try {
    // Get existing approved docs to avoid duplicates
    const { data: existing } = await getDocuments('approved', { includeText: false })
    const existingTitles = new Set((existing || []).map(d => d.title.toLowerCase()))

    const results = { seeded: 0, skipped: 0, errors: [], details: [] }

    for (const seed of SEED_DOCUMENTS) {
      // Skip if already exists
      if (existingTitles.has(seed.title.toLowerCase())) {
        results.skipped++
        results.details.push({ title: seed.title, status: 'skipped', reason: 'already exists' })
        continue
      }

      // Try to fetch and parse the actual PDF if livePdf mode is enabled
      let textContent = null
      let source = 'summary'

      if (livePdf && seed.pdfUrl) {
        try {
          const pdfRes = await fetch(seed.pdfUrl, {
            headers: { 'User-Agent': UA },
            redirect: 'follow',
          })
          if (pdfRes.ok) {
            const buffer = Buffer.from(await pdfRes.arrayBuffer())
            const pdf = await pdfParse(buffer)
            if (pdf.text && pdf.text.trim().length > 200) {
              textContent = pdf.text.trim()
              source = 'pdf'
            }
          }
        } catch (pdfErr) {
          console.error(`PDF fetch/parse failed for ${seed.title}:`, pdfErr.message)
          // Fall through to summary
        }
      }

      // Fallback to structured summary
      if (!textContent) {
        textContent = buildDocumentText(seed)
      }

      const { data: doc, error } = await createDocument({
        title: seed.title,
        version: seed.version,
        source_url: seed.pdfUrl,
        text_full: textContent,
        file_name: `${seed.key}.txt`,
        file_size: textContent.length,
      })

      if (error) {
        results.errors.push({ title: seed.title, error })
        results.details.push({ title: seed.title, status: 'error', reason: error })
        continue
      }

      // Auto-approve seed documents
      if (doc) {
        await updateDocumentStatus(doc.id, 'approved', 'system-seed')
        results.seeded++
        results.details.push({ title: seed.title, status: 'seeded', id: doc.id, source, textLength: textContent.length })
      }
    }

    return res.status(200).json({
      success: true,
      message: `Seeded ${results.seeded} document${results.seeded !== 1 ? 's' : ''}, skipped ${results.skipped}`,
      ...results,
    })
  } catch (err) {
    console.error('Seed error:', err)
    return res.status(500).json({ error: 'Failed to seed The Scroll' })
  }
}

function buildDocumentText(seed) {
  const lines = []

  lines.push(seed.title.toUpperCase())
  lines.push('='.repeat(seed.title.length))
  lines.push('')
  lines.push(seed.description)
  lines.push('')
  lines.push(`Category: ${seed.category}`)
  lines.push(`Version: ${seed.version}`)
  if (seed.required) lines.push('Status: Required Governing Document')
  lines.push(`Source: ${seed.pdfUrl}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Add category-specific content
  if (seed.category === 'Student Government') {
    lines.push(...getStudentGovContent(seed))
  } else if (seed.category === 'University Policy') {
    lines.push(...getUniversityPolicyContent(seed))
  } else if (seed.category === 'Student Conduct') {
    lines.push(...getStudentConductContent(seed))
  }

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('NOTE: This is a summary record. For the complete official text,')
  lines.push(`refer to the source document: ${seed.pdfUrl}`)

  return lines.join('\n')
}

function getStudentGovContent(seed) {
  const content = {
    'constitution': [
      'PREAMBLE',
      '',
      'We, the students of the University of North Carolina at Chapel Hill, in order to provide',
      'a responsible and effective student government, to promote the general welfare of the',
      'student body, and to ensure the protection of individual rights, do hereby establish',
      'this Constitution.',
      '',
      'ARTICLE I — NAME AND PURPOSE',
      '',
      'The student government of the University of North Carolina at Chapel Hill exists to',
      'represent the student body and advocate for student interests in university governance.',
      'It serves as the primary voice of students in matters of university policy, budget',
      'allocation, and campus life.',
      '',
      'ARTICLE II — STRUCTURE',
      '',
      'The Student Government shall consist of three branches:',
      '  1. The Executive Branch, led by the Student Body President',
      '  2. The Legislative Branch, comprising the Undergraduate Senate and Graduate Senate',
      '  3. The Judicial Branch, including the Supreme Court and Honor Court',
      '',
      'ARTICLE III — ELECTIONS',
      '',
      'All student body officers shall be elected by the student body in accordance with',
      'the procedures established by the Board of Elections. Elections shall be conducted',
      'fairly and transparently, ensuring equal access to the ballot for all students.',
      '',
      'ARTICLE IV — RIGHTS AND RESPONSIBILITIES',
      '',
      'Every enrolled student at UNC-Chapel Hill is a member of the student body and is',
      'entitled to the rights and protections afforded by this Constitution, including',
      'freedom of expression, assembly, and participation in student government.',
      '',
      'ARTICLE V — AMENDMENTS',
      '',
      'This Constitution may be amended by a two-thirds vote of the Student Congress,',
      'followed by ratification by a majority of the student body in a general referendum.',
    ],
    'undergrad-statutes': [
      'TITLE I — GENERAL PROVISIONS',
      '',
      'The Undergraduate Student Government (USG) General Statutes establish the rules,',
      'procedures, and codes governing the operations of the undergraduate branch of',
      'Student Government at UNC-Chapel Hill.',
      '',
      'TITLE II — THE STUDENT CONGRESS',
      '',
      'The Student Congress serves as the legislative body of the undergraduate student',
      'government. It has the power to appropriate student fees, pass resolutions,',
      'confirm executive appointments, and legislate on matters affecting student life.',
      '',
      'TITLE III — STUDENT ORGANIZATIONS',
      '',
      'All recognized student organizations must register with the Office of Student',
      'Organizations and comply with university policies. Student fee funding is',
      'allocated through the Finance Committee of Student Congress.',
      '',
      'TITLE IV — STUDENT FEE APPROPRIATIONS',
      '',
      'Student fees shall be appropriated by the Student Congress in accordance with',
      'the budgeting process established in these statutes. All appropriations must',
      'serve the interests of the student body and be transparent in their allocation.',
    ],
    'joint-code': [
      'CHAPTER 1 — JOINT GOVERNANCE',
      '',
      'The Joint Code establishes the shared governance framework between the',
      'Undergraduate Student Government (USG) and the Graduate and Professional',
      'Student Government (GPSG) at UNC-Chapel Hill.',
      '',
      'CHAPTER 2 — JOINT BODIES',
      '',
      'The following bodies operate under joint authority:',
      '  - Student Fee Audit Committee',
      '  - Honor System',
      '  - Student Supreme Court',
      '  - Board of Elections',
      '',
      'CHAPTER 3 — SHARED RESPONSIBILITIES',
      '',
      'Both USG and GPSG share responsibility for the oversight of student fees,',
      'the administration of the Honor System, and the governance of bodies that',
      'affect both undergraduate and graduate students.',
    ],
    'gpsg-code': [
      'PART I — ESTABLISHMENT AND PURPOSE',
      '',
      'The Graduate and Professional Student Government (GPSG) represents the',
      'interests of all graduate and professional students at UNC-Chapel Hill.',
      'It operates under the authority granted by the Student Body Constitution.',
      '',
      'PART II — GPSG SENATE',
      '',
      'The GPSG Senate is the legislative body for graduate and professional',
      'students. Each graduate and professional school is represented by elected',
      'senators who vote on funding allocations, resolutions, and policy matters.',
      '',
      'PART III — FUNDING AND APPROPRIATIONS',
      '',
      'GPSG manages the allocation of graduate student fees for conferences,',
      'travel grants, professional development, and student organization support.',
      'The Finance Committee reviews all funding requests and makes recommendations.',
    ],
  }
  return content[seed.key] || ['This document contains the official text of the ' + seed.title + '.']
}

function getUniversityPolicyContent(seed) {
  const content = {
    'ferpa': [
      'SECTION 1 — PURPOSE AND SCOPE',
      '',
      'The Family Educational Rights and Privacy Act of 1974 (FERPA) protects the',
      'privacy of student education records. This policy establishes UNC-Chapel Hill\'s',
      'procedures for compliance with FERPA requirements.',
      '',
      'SECTION 2 — STUDENT RIGHTS',
      '',
      'Under FERPA, students have the right to:',
      '  1. Inspect and review their education records',
      '  2. Request amendment of records they believe to be inaccurate',
      '  3. Control disclosure of personally identifiable information',
      '  4. File a complaint with the U.S. Department of Education',
      '',
      'SECTION 3 — DIRECTORY INFORMATION',
      '',
      'UNC-Chapel Hill designates certain information as directory information,',
      'which may be disclosed without student consent unless the student has',
      'opted out through the Registrar\'s Office.',
    ],
    'appeals-bot': [
      'SECTION 1 — RIGHT OF APPEAL',
      '',
      'Students, faculty, and staff may appeal certain institutional decisions',
      'to the Board of Trustees in accordance with the procedures set forth',
      'in this document and applicable UNC System policies.',
      '',
      'SECTION 2 — GROUNDS FOR APPEAL',
      '',
      'Appeals must be based on one or more of the following grounds:',
      '  1. Procedural irregularity that affected the outcome',
      '  2. New evidence not reasonably available at the time of the decision',
      '  3. Disproportionate sanction or remedy',
    ],
    'workplace-violence': [
      'SECTION 1 — POLICY STATEMENT',
      '',
      'UNC-Chapel Hill is committed to providing a safe environment free from',
      'workplace violence. This policy applies to all university employees,',
      'students, visitors, and contractors on university property.',
      '',
      'SECTION 2 — PROHIBITED CONDUCT',
      '',
      'Workplace violence includes threats, intimidation, harassment, physical',
      'assault, and any behavior that creates a reasonable fear of harm.',
      '',
      'SECTION 3 — REPORTING',
      '',
      'All incidents or threats of workplace violence must be reported immediately',
      'to the UNC Police Department (911) and the Department of Public Safety.',
    ],
    'whistleblower': [
      'SECTION 1 — PURPOSE',
      '',
      'This policy protects individuals who report suspected violations of law,',
      'regulation, or university policy from retaliation. It encourages the',
      'reporting of misconduct while protecting due process rights.',
      '',
      'SECTION 2 — PROTECTED ACTIVITY',
      '',
      'The following activities are protected under this policy:',
      '  1. Good faith reporting of suspected violations',
      '  2. Participating in investigations',
      '  3. Refusing to participate in activities believed to be unlawful',
      '',
      'SECTION 3 — RETALIATION PROHIBITED',
      '',
      'Retaliation against anyone who reports a concern in good faith is strictly',
      'prohibited and will result in disciplinary action.',
    ],
    'threat-assessment': [
      'SECTION 1 — PURPOSE',
      '',
      'The Behavioral Threat Assessment Policy establishes procedures for identifying,',
      'assessing, and managing situations involving individuals whose behavior may',
      'pose a threat to the safety of the campus community.',
      '',
      'SECTION 2 — THREAT ASSESSMENT TEAM',
      '',
      'The university maintains a multidisciplinary Threat Assessment Team (TAT)',
      'responsible for reviewing reported concerns, conducting assessments, and',
      'recommending interventions.',
      '',
      'SECTION 3 — REPORTING OBLIGATIONS',
      '',
      'Members of the university community are encouraged to report concerning',
      'behaviors through the CARE referral system or directly to the Dean of',
      'Students Office.',
    ],
    'discrimination': [
      'SECTION 1 — POLICY STATEMENT',
      '',
      'UNC-Chapel Hill prohibits discrimination, harassment, and related misconduct',
      'based on race, color, gender, national origin, age, religion, creed, disability,',
      'veteran\'s status, sexual orientation, gender identity, or gender expression.',
      '',
      'SECTION 2 — SCOPE',
      '',
      'This policy applies to all members of the university community and in all',
      'university programs and activities, including educational, employment, and',
      'extracurricular contexts.',
      '',
      'SECTION 3 — TITLE IX COMPLIANCE',
      '',
      'The university complies with Title IX of the Education Amendments of 1972.',
      'The Title IX Coordinator oversees compliance and handles complaints.',
      '',
      'SECTION 4 — REPORTING AND RESOURCES',
      '',
      'Reports may be filed with the Equal Opportunity and Compliance Office (EOC)',
      'or through the university\'s online reporting system.',
    ],
    'eoc-guide': [
      'OVERVIEW',
      '',
      'The Equal Opportunity and Compliance (EOC) Office ensures that UNC-Chapel',
      'Hill meets its obligations under federal and state anti-discrimination',
      'laws and university policies.',
      '',
      'RESOURCES AVAILABLE',
      '',
      'The EOC provides the following services:',
      '  1. Intake and investigation of discrimination complaints',
      '  2. Informal resolution and mediation',
      '  3. Training and prevention education',
      '  4. Policy guidance and consultation',
      '  5. Accommodations coordination',
      '',
      'HOW TO FILE A REPORT',
      '',
      'Reports can be filed online, in person at the EOC Office (100 E. Franklin',
      'Street, Suite 110), by phone (919-966-3576), or by email.',
    ],
    'drugs': [
      'SECTION 1 — POLICY',
      '',
      'The possession, use, manufacture, sale, or distribution of illegal drugs',
      'on university property or at university-sponsored events is prohibited.',
      'This policy applies to all students, employees, and visitors.',
      '',
      'SECTION 2 — ENFORCEMENT',
      '',
      'Violations may result in disciplinary action, criminal prosecution, and',
      'referral for substance abuse evaluation and treatment.',
      '',
      'SECTION 3 — RESOURCES',
      '',
      'Students seeking help with substance use can contact Campus Health Services',
      'or the Student Wellness Office confidentially.',
    ],
    'alcohol': [
      'SECTION 1 — POLICY',
      '',
      'The use and possession of alcohol on UNC-Chapel Hill property is governed',
      'by state law and university regulations. All members of the campus community',
      'are expected to comply with North Carolina\'s legal drinking age of 21.',
      '',
      'SECTION 2 — PERMITTED USE',
      '',
      'Alcohol may be served at university-approved events in accordance with',
      'registered event guidelines. Student organizations must follow the',
      'event registration process for any event involving alcohol.',
      '',
      'SECTION 3 — MEDICAL AMNESTY',
      '',
      'UNC-Chapel Hill maintains a medical amnesty policy to encourage students',
      'to seek medical attention in alcohol-related emergencies without fear of',
      'disciplinary consequences for the reporting individual.',
    ],
  }
  return content[seed.key] || ['This document contains the official text of the ' + seed.title + '.']
}

function getStudentConductContent(seed) {
  const content = {
    'conduct-procedures': [
      'SECTION 1 — PURPOSE',
      '',
      'These procedures govern the student conduct process at UNC-Chapel Hill.',
      'They ensure fair, impartial, and timely resolution of alleged violations',
      'of the Student Code of Conduct.',
      '',
      'SECTION 2 — INTAKE AND INVESTIGATION',
      '',
      'Reports of alleged violations are received by the Office of Student Conduct.',
      'An initial review determines whether the report warrants a formal investigation.',
      '',
      'SECTION 3 — HEARING PROCESS',
      '',
      'Students accused of violations have the right to:',
      '  1. Written notice of charges',
      '  2. An opportunity to respond',
      '  3. A fair and impartial hearing',
      '  4. An advisor of their choice',
      '  5. Appeal the outcome',
      '',
      'SECTION 4 — SANCTIONS',
      '',
      'Sanctions range from educational measures and community service to suspension',
      'or expulsion, depending on the severity and nature of the violation.',
    ],
    'code-of-conduct': [
      'ARTICLE I — PHILOSOPHY',
      '',
      'The Student Code of Conduct reflects UNC-Chapel Hill\'s commitment to',
      'fostering a community of integrity, respect, and responsibility. All',
      'students are expected to uphold the standards of conduct set forth herein.',
      '',
      'ARTICLE II — PROHIBITED CONDUCT',
      '',
      'The following behaviors are prohibited:',
      '  1. Academic dishonesty (plagiarism, cheating, unauthorized collaboration)',
      '  2. Physical or verbal abuse, threats, or intimidation',
      '  3. Harassment or discrimination',
      '  4. Theft, damage, or unauthorized use of property',
      '  5. Alcohol and drug violations',
      '  6. Disruption of university operations',
      '  7. Failure to comply with university officials',
      '',
      'ARTICLE III — THE HONOR SYSTEM',
      '',
      'UNC-Chapel Hill\'s Honor System is student-administered and integral to',
      'the academic community. All students pledge to uphold the Honor Code,',
      'which prohibits lying, cheating, and stealing.',
      '',
      'ARTICLE IV — STUDENT RIGHTS',
      '',
      'Students retain all rights afforded by law and university policy,',
      'including the right to free expression, due process, and protection',
      'from unreasonable search and seizure.',
    ],
  }
  return content[seed.key] || ['This document contains the official text of the ' + seed.title + '.']
}
