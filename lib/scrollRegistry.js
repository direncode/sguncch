/**
 * Scroll Seed Registry
 *
 * Lists all official UNC governing documents that should be uploaded as .txt
 * to The Scroll. These appear in the admin Scroll overview as a seed checklist.
 * Each entry corresponds to a PDF in the Document Catalogue.
 */

export const SEED_DOCUMENTS = [
  // Student Government
  {
    key: 'constitution',
    title: 'Constitution of the Student Body',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/Constitution_of_the_Student_Body_8_20_25.pdf',
    version: 'Aug 2025',
    description: 'The constitution governing all student government bodies at UNC-Chapel Hill.',
    category: 'Student Government',
    required: true,
  },
  {
    key: 'undergrad-statutes',
    title: 'Undergraduate General Statutes',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/Undergraduate_General_Statutes_09_03_2025.pdf',
    version: 'Sep 2025',
    description: 'The Undergraduate Student Government general statutes and governance rules.',
    category: 'Student Government',
    required: true,
  },
  {
    key: 'joint-code',
    title: 'Joint Code of the Student Government',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2023/02/Joint_Code_of_the_Student_Government_01_12_23.pdf',
    version: 'Jan 2023',
    description: 'The joint governance code shared between USG and GPSG.',
    category: 'Student Government',
    required: true,
  },
  {
    key: 'gpsg-code',
    title: 'GPSG Code',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/GPSG_Code_08_25_25.pdf',
    version: 'Aug 2025',
    description: 'The Graduate and Professional Student Government code.',
    category: 'Student Government',
    required: true,
  },
  // University Policy
  {
    key: 'ferpa',
    title: 'FERPA Policies and Procedures',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Policies-and-Procedures-Under-the-Family-Educational-Rights-and-Privacy-Act-of-1974-FERPA.pdf',
    version: 'Oct 2024',
    description: 'Policies and procedures under the Family Educational Rights and Privacy Act of 1974.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'appeals-bot',
    title: 'Procedure for Appeals to the Board of Trustees',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Procedure-for-Appeals-to-the-Board-of-Trustees.pdf',
    version: 'Oct 2024',
    description: 'Procedures for filing appeals to the UNC Board of Trustees.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'workplace-violence',
    title: 'Workplace Violence Policy',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Workplace-Violence-Policy.pdf',
    version: 'Oct 2024',
    description: 'University policy on workplace violence prevention and response.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'whistleblower',
    title: 'Whistleblower Policy',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Whistleblower-Policy.pdf',
    version: 'Oct 2024',
    description: 'Policy protecting individuals who report suspected violations.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'threat-assessment',
    title: 'Behavioral Threat Assessment Policy',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Behavioral-Threat-Assessment-Policy.pdf',
    version: 'Oct 2024',
    description: 'Policy for assessing and managing behavioral threats on campus.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'discrimination',
    title: 'Policy on Prohibited Discrimination, Harassment, and Related Misconduct',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Policy-on-Prohibited-Discrimination-Harassment-and-Related-Misconduct.pdf',
    version: 'Oct 2024',
    description: 'Policy on discrimination, harassment, sexual assault, interpersonal violence, and stalking.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'eoc-guide',
    title: 'EOC Comprehensive Resource Guide',
    pdfUrl: 'https://eoc.unc.edu/files/2024/08/eoc-comprehensive-resource-guide.pdf',
    version: 'Aug 2024',
    description: 'Equal Opportunity and Compliance comprehensive resource guide.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'drugs',
    title: 'Illegal Drugs Policy',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Illegal-Drugs-Policy.pdf',
    version: 'Oct 2024',
    description: 'University policy on illegal drugs.',
    category: 'University Policy',
    required: false,
  },
  {
    key: 'alcohol',
    title: 'Alcohol Policy',
    pdfUrl: 'https://policies.unc.edu/files/2024/10/Alcohol-Policy.pdf',
    version: 'Oct 2024',
    description: 'University policy on alcohol use and regulation.',
    category: 'University Policy',
    required: false,
  },
  // Student Conduct
  {
    key: 'conduct-procedures',
    title: 'Student Conduct Procedures',
    pdfUrl: 'https://dos.unc.edu/files/2024/08/Student-Conduct-Procedures.pdf',
    version: 'Aug 2024',
    description: 'Procedures for the student conduct process at UNC.',
    category: 'Student Conduct',
    required: false,
  },
  {
    key: 'code-of-conduct',
    title: 'The Student Code of Conduct',
    pdfUrl: 'https://dos.unc.edu/files/2024/08/The-Student-Code-of-Conduct.pdf',
    version: 'Aug 2024',
    description: 'The official student code of conduct at UNC-Chapel Hill.',
    category: 'Student Conduct',
    required: false,
  },
]

// Minimum number of seed documents that must be uploaded before Grok chat activates
export const MIN_SEED_COUNT = 1
