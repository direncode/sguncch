import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'

const documents = [
  {
    id: 'ferpa',
    name: 'Policies and Procedures Under the Family Educational Rights and Privacy Act of 1974 ("FERPA")',
    category: 'University Policy',
    size: '3.6 MB',
    url: 'https://policies.unc.edu/files/2024/10/Policies-and-Procedures-Under-the-Family-Educational-Rights-and-Privacy-Act-of-1974-FERPA.pdf',
    localPath: '/documents/Policies-and-Procedures-Under-the-Family-Educational-Rights-and-Privacy-Act-of-1974-FERPA.pdf',
  },
  {
    id: 'appeals-bot',
    name: 'Procedure for Appeals to the Board of Trustees',
    category: 'University Policy',
    size: '1.1 MB',
    url: 'https://policies.unc.edu/files/2024/10/Procedure-for-Appeals-to-the-Board-of-Trustees.pdf',
    localPath: '/documents/Procedure-for-Appeals-to-the-Board-of-Trustees.pdf',
  },
  {
    id: 'gpsg-code',
    name: 'GPSG Code',
    category: 'Student Government',
    size: '1.3 MB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/GPSG_Code_08_25_25.pdf',
    localPath: '/documents/GPSG_Code_08_25_25.pdf',
  },
  {
    id: 'undergrad-statutes',
    name: 'Undergraduate General Statutes',
    category: 'Student Government',
    size: '1.8 MB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/Undergraduate_General_Statutes_09_03_2025.pdf',
    localPath: '/documents/Undergraduate_General_Statutes_09_03_2025.pdf',
  },
  {
    id: 'joint-code',
    name: 'Joint Code of the Student Government',
    category: 'Student Government',
    size: '1017 KB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2023/02/Joint_Code_of_the_Student_Government_01_12_23.pdf',
    localPath: '/documents/Joint_Code_of_the_Student_Government_01_12_23.pdf',
  },
  {
    id: 'constitution',
    name: 'Constitution of the Student Body',
    category: 'Student Government',
    size: '361 KB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/Constitution_of_the_Student_Body_8_20_25.pdf',
    localPath: '/documents/Constitution_of_the_Student_Body_8_20_25.pdf',
  },
  {
    id: 'workplace-violence',
    name: 'Workplace Violence Policy',
    category: 'University Policy',
    size: '1.6 MB',
    url: 'https://policies.unc.edu/files/2024/10/Workplace-Violence-Policy.pdf',
    localPath: '/documents/Workplace-Violence-Policy.pdf',
  },
  {
    id: 'whistleblower',
    name: 'Whistleblower Policy',
    category: 'University Policy',
    size: '1.2 MB',
    url: 'https://policies.unc.edu/files/2024/10/Whistleblower-Policy.pdf',
    localPath: '/documents/Whistleblower-Policy.pdf',
  },
  {
    id: 'threat-assessment',
    name: 'Behavioral Threat Assessment Policy',
    category: 'University Policy',
    size: '1.2 MB',
    url: 'https://policies.unc.edu/files/2024/10/Behavioral-Threat-Assessment-Policy.pdf',
    localPath: '/documents/Behavioral-Threat-Assessment-Policy.pdf',
  },
  {
    id: 'discrimination',
    name: 'Policy on Prohibited Discrimination, Harassment, and Related Misconduct Including Sex-Based Harassment, Sexual Assault, Interpersonal Violence, and Stalking',
    category: 'University Policy',
    size: '7.2 MB',
    url: 'https://policies.unc.edu/files/2024/10/Policy-on-Prohibited-Discrimination-Harassment-and-Related-Misconduct.pdf',
    localPath: '/documents/Policy-on-Prohibited-Discrimination-Harassment-and-Related-Misconduct.pdf',
  },
  {
    id: 'eoc-guide',
    name: 'EOC Comprehensive Resource Guide',
    category: 'University Policy',
    size: '826 KB',
    url: 'https://eoc.unc.edu/files/2024/08/eoc-comprehensive-resource-guide.pdf',
    localPath: '/documents/eoc-comprehensive-resource-guide.pdf',
  },
  {
    id: 'drugs',
    name: 'Illegal Drugs Policy',
    category: 'University Policy',
    size: '947 KB',
    url: 'https://policies.unc.edu/files/2024/10/Illegal-Drugs-Policy.pdf',
    localPath: '/documents/Illegal-Drugs-Policy.pdf',
  },
  {
    id: 'alcohol',
    name: 'Alcohol Policy',
    category: 'University Policy',
    size: '4.6 MB',
    url: 'https://policies.unc.edu/files/2024/10/Alcohol-Policy.pdf',
    localPath: '/documents/Alcohol-Policy.pdf',
  },
  {
    id: 'conduct-procedures',
    name: 'Student Conduct Procedures',
    category: 'Student Conduct',
    size: '6.7 MB',
    url: 'https://dos.unc.edu/files/2024/08/Student-Conduct-Procedures.pdf',
    localPath: '/documents/Student-Conduct-Procedures.pdf',
  },
  {
    id: 'code-of-conduct',
    name: 'The Student Code of Conduct',
    category: 'Student Conduct',
    size: '3.4 MB',
    url: 'https://dos.unc.edu/files/2024/08/The-Student-Code-of-Conduct.pdf',
    localPath: '/documents/The-Student-Code-of-Conduct.pdf',
  },
]

const categories = ['All', ...new Set(documents.map(d => d.category))]

export default function Documents() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categoryColors = {
    'University Policy': { bg: 'bg-[#388bfd]/10', text: 'text-[#388bfd]', border: 'border-[#388bfd]' },
    'Student Government': { bg: 'bg-[#a371f7]/10', text: 'text-[#a371f7]', border: 'border-[#a371f7]' },
    'Student Conduct': { bg: 'bg-[#d29922]/10', text: 'text-[#d29922]', border: 'border-[#d29922]' },
  }

  return (
    <Layout>
      <Head>
        <title>Document Catalogue | Project Bold</title>
        <meta name="description" content="UNC governance documents, policies, and student government codes" />
      </Head>

      {/* Header */}
      <div className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#388bfd]/10 border border-[#388bfd] rounded text-[10px] font-semibold text-[#388bfd] uppercase tracking-wider">
              {documents.length} Documents
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#f0f6fc] tracking-tight mb-2">Document Catalogue</h1>
          <p className="text-[#8b949e] max-w-2xl">
            Official UNC governance documents, university policies, student government codes, and conduct procedures.
          </p>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#388bfd] transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded transition ${
                  selectedCategory === cat
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]'
                    : 'text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid gap-3">
          {filtered.map(doc => {
            const colors = categoryColors[doc.category] || categoryColors['University Policy']
            return (
              <div
                key={doc.id}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#484f58] transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* PDF Icon */}
                    <div className="w-10 h-12 bg-[#f85149]/10 border border-[#f85149]/30 rounded flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#f85149] uppercase">PDF</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#f0f6fc] text-sm mb-1 leading-snug">{doc.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-[#6e7681] font-mono">{doc.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewDoc(previewDoc?.id === doc.id ? null : doc)}
                      className="px-3 py-1.5 text-xs font-medium text-[#8b949e] border border-[#30363d] rounded hover:text-[#00d4ff] hover:border-[#00d4ff] transition"
                    >
                      {previewDoc?.id === doc.id ? 'Close' : 'Preview'}
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-[#f0f6fc] bg-[#388bfd] rounded hover:bg-[#58a6ff] transition"
                    >
                      Open
                    </a>
                  </div>
                </div>

                {/* Inline Preview */}
                {previewDoc?.id === doc.id && (
                  <div className="mt-4 border-t border-[#30363d] pt-4">
                    <iframe
                      src={doc.url}
                      className="w-full h-[600px] rounded-lg border border-[#30363d] bg-white"
                      title={doc.name}
                    />
                    <p className="text-[10px] text-[#6e7681] mt-2">
                      If the preview doesn't load, click "Open" to view in a new tab.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6e7681] text-sm">No documents match your search.</p>
          </div>
        )}
      </main>
    </Layout>
  )
}
