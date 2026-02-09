/**
 * Scroll Seed Registry
 *
 * Lists the official UNC Student Government governing documents that must
 * be uploaded as .txt to The Scroll before the RAG system can operate.
 * Each entry corresponds to a PDF on studentgovernment.unc.edu — the admin
 * downloads the PDF, converts it to plain text, and uploads it here.
 */

export const SEED_DOCUMENTS = [
  {
    key: 'unc-constitution',
    title: 'UNC Student Constitution',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/14304/2024/02/UNC-Constitution_Feb-2024.pdf',
    version: 'Feb 2024',
    description: 'The constitution governing all student government bodies at UNC-Chapel Hill.',
    category: 'policies',
    required: true,
  },
  {
    key: 'usg-student-code',
    title: 'USG Student Code',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/14304/2023/11/USG-Code-11.7.23.pdf',
    version: 'Nov 2023',
    description: 'The Undergraduate Student Government code of procedures, bylaws, and governance rules.',
    category: 'policies',
    required: true,
  },
  {
    key: 'joint-code',
    title: 'Joint Code',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/14304/2023/01/Joint-Code-Jan-1-2023.pdf',
    version: 'Jan 2023',
    description: 'The joint governance code shared between USG and GPSG.',
    category: 'policies',
    required: true,
  },
  {
    key: 'gpsg-code',
    title: 'GPSG Code',
    pdfUrl: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/14304/2023/01/GPSG-Code-October-2022.pdf',
    version: 'Oct 2022',
    description: 'The Graduate and Professional Student Government code.',
    category: 'policies',
    required: true,
  },
]

// Minimum number of seed documents that must be uploaded before Grok chat activates
export const MIN_SEED_COUNT = 1
