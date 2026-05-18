import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Layers, 
  ArrowRight, 
  Zap, 
  Target, 
  Cpu, 
  Globe,
  MapPin
} from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { matchAnalysisService, SYNONYMS } from '../../features/jobs/services/matchAnalysisService';
import { pdfExtractionService } from '../../features/resumes/services/pdfExtractionService';

const LONDON_JOBS = [
  {
    id: 'ldn-1',
    company: 'Revolut',
    title: 'Lead Frontend Engineer (Wealth & Trading)',
    location: 'London, UK (Hybrid)',
    compensation: '£95,000 - £130,000',
    tags: ['React', 'TypeScript', 'Redux', 'FinTech', 'AWS'],
    jd: 'Join our Wealth & Trading team in London. Seeking a Lead Frontend Engineer to architect trading dashboards and manage high-performance data streams with React and TypeScript. FinTech experience is a big plus.'
  },
  {
    id: 'ldn-2',
    company: 'Deliveroo',
    title: 'Staff Platform Engineer',
    location: 'London, UK (Remote / Hybrid)',
    compensation: '£110,000 - £145,000',
    tags: ['Docker', 'Kubernetes', 'Go', 'AWS', 'Terraform'],
    jd: 'Looking for a Staff Platform Engineer to scale our core delivery dispatch networks. Must have expertise in Go, Kubernetes, and AWS infrastructure. Scale and high concurrency experience required.'
  }
];

const HYDERABAD_JOBS = [
  {
    id: 'hyd-1',
    company: 'CRED',
    title: 'DevOps & Platform Architect',
    location: 'Hyderabad, India (Hybrid)',
    compensation: '₹35L - ₹48L',
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
    jd: 'Seeking a seasoned DevOps Architect to scale our cloud infrastructure. Must be an expert in Kubernetes, AWS, and Infrastructure as Code (Terraform). Strong background in building robust CI/CD pipelines and ensuring high availability for financial systems.'
  },
  {
    id: 'hyd-2',
    company: 'Stripe',
    title: 'Fullstack Engineer (API & Integrations)',
    location: 'Hyderabad, India (Remote)',
    compensation: '₹45L - ₹60L',
    tags: ['Ruby on Rails', 'React', 'PostgreSQL', 'API Design', 'Security'],
    jd: 'Looking for a Fullstack Engineer to build world-class APIs. You will work across the stack with Ruby on Rails and React. Deep understanding of relational databases (PostgreSQL), RESTful API design, and web security principles is critical.'
  }
];

const BENGALURU_JOBS = [
  {
    id: 'blr-1',
    company: 'Razorpay',
    title: 'Senior Software Engineer (React / TypeScript)',
    location: 'Bengaluru, India (Hybrid)',
    compensation: '₹28L - ₹36L',
    tags: ['React', 'TypeScript', 'Node.js', 'Redux', 'AWS'],
    jd: 'Looking for a Senior Frontend Engineer with deep expertise in React and TypeScript. Must have experience building scalable payment interfaces, managing complex state with Redux, and working closely with backend teams (Node.js). AWS experience is a plus.'
  },
  {
    id: 'blr-2',
    company: 'Swiggy',
    title: 'Staff Frontend Engineer (AI Platform)',
    location: 'Bengaluru, India (Remote / Hybrid)',
    compensation: '₹40L - ₹52L',
    tags: ['React', 'Next.js', 'TailwindCSS', 'AI Agents', 'OpenAI'],
    jd: 'Join the AI platform team. Looking for a Staff Engineer to lead the development of our LLM-powered internal tools. Requires mastery of React, Next.js, and modern CSS (Tailwind). Experience integrating with OpenAI APIs and building conversational interfaces is highly desired.'
  }
];

export const LandingPage: React.FC = () => {
  const { session, isLoading } = useAuth();
  
  // Widget State
  const [jobText, setJobText] = React.useState('');
  const [resumeText, setResumeText] = React.useState('');
  const [resumeFileName, setResumeFileName] = React.useState<string | null>(null);
  
  // Value-First Geolocation & Select Job state
  const [searchRole, setSearchRole] = React.useState('');
  const isSearching = searchRole.trim().length >= 2;
  const [detectedLocation, setDetectedLocation] = React.useState('London, UK');
  const [showMatchModal, setShowMatchModal] = React.useState(false);

  // Postcode/Pincode Override States
  const [isChangingLocation, setIsChangingLocation] = React.useState(false);
  const [postalInput, setPostalInput] = React.useState('');
  const [postalError, setPostalError] = React.useState('');
  const [isLoadingPostal, setIsLoadingPostal] = React.useState(false);

  React.useEffect(() => {
    // 1. Silent IP Geolocation Lookup
    fetch('https://ipapi.co/json/')
      .then((res) => {
        if (!res.ok) throw new Error('IP lookup failed');
        return res.json();
      })
      .then((data) => {
        const city = data.city || '';
        const country = data.country_code || '';
        if (city.toLowerCase().includes('london') || country.toLowerCase() === 'gb') {
          setDetectedLocation('London, UK');
        } else if (city.toLowerCase().includes('hyderabad')) {
          setDetectedLocation('Hyderabad, India');
        } else if (city.toLowerCase().includes('bengaluru') || city.toLowerCase().includes('bangalore') || country.toLowerCase() === 'in') {
          if (city.toLowerCase().includes('hyderabad')) {
            setDetectedLocation('Hyderabad, India');
          } else {
            setDetectedLocation('Bengaluru, India');
          }
        } else {
          setDetectedLocation('London, UK');
        }
      })
      .catch(() => {
        // 2. Fallback Timezone/Language Heuristics
        if (
          navigator.language.includes('in') || 
          Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Calcutta') || 
          Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Asia')
        ) {
          setDetectedLocation('Bengaluru, India');
        } else {
          setDetectedLocation('London, UK');
        }
      });
  }, []);

  const handlePostalLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = postalInput.trim().toUpperCase();
    if (!query) return;

    setIsLoadingPostal(true);
    setPostalError('');

    const lowerQuery = query.toLowerCase();

    // 1. Direct City Name Check with spelling-tolerant fuzzy matches
    if (lowerQuery.includes('bang') || lowerQuery.includes('beng') || lowerQuery.includes('blr')) {
      setDetectedLocation('Bengaluru, India');
      setIsChangingLocation(false);
      setPostalInput('');
      setIsLoadingPostal(false);
      return;
    }
    if (lowerQuery.includes('hyd')) {
      setDetectedLocation('Hyderabad, India');
      setIsChangingLocation(false);
      setPostalInput('');
      setIsLoadingPostal(false);
      return;
    }
    if (lowerQuery.includes('lon') || lowerQuery.includes('ldn') || lowerQuery.includes('uk')) {
      setDetectedLocation('London, UK');
      setIsChangingLocation(false);
      setPostalInput('');
      setIsLoadingPostal(false);
      return;
    }

    // 2. Postcode/Pincode API Fallback
    const isNumeric = /^\d+$/.test(query);

    try {
      if (isNumeric) {
        // India Pincode lookup
        if (query.length !== 6) {
          throw new Error('Indian Pincode must be exactly 6 digits.');
        }
        const res = await fetch(`https://api.postalpincode.in/pincode/${query}`);
        const data = await res.json();
        
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffices = data[0].PostOffice;
          let isHyderabad = false;
          let isBengaluru = false;
          
          for (const po of postOffices) {
            const district = (po.District || '').toLowerCase();
            const state = (po.State || '').toLowerCase();
            const poName = (po.Name || '').toLowerCase();
            
            if (
              district.includes('hyderabad') || 
              state.includes('hyderabad') || 
              poName.includes('hyderabad')
            ) {
              isHyderabad = true;
              break;
            }
            if (
              district.includes('bangalore') || 
              district.includes('bengaluru') || 
              state.includes('karnataka') ||
              poName.includes('bangalore') ||
              poName.includes('bengaluru')
            ) {
              isBengaluru = true;
              break;
            }
          }
          
          if (isHyderabad) {
            setDetectedLocation('Hyderabad, India');
            setIsChangingLocation(false);
            setPostalInput('');
          } else if (isBengaluru) {
            setDetectedLocation('Bengaluru, India');
            setIsChangingLocation(false);
            setPostalInput('');
          } else {
            setDetectedLocation('Bengaluru, India');
            setIsChangingLocation(false);
            setPostalInput('');
          }
        } else {
          throw new Error('Invalid pincode. No region found.');
        }
      } else {
        // Heuristic: Check if it resembles a UK postcode (length 3 to 8 characters)
        const cleanQuery = query.replace(/\s+/g, '');
        const isUKPostcodeHeuristic = cleanQuery.length >= 3 && cleanQuery.length <= 8 && /[A-Z]/.test(cleanQuery) && /[0-9]/.test(cleanQuery);
        
        if (!isUKPostcodeHeuristic) {
          throw new Error("Please enter a valid UK postcode, Indian pincode, or city name (e.g. 'Bengaluru', 'London').");
        }

        // UK Postcode lookup using api.postcodes.io
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok && data.status === 200 && data.result) {
          setDetectedLocation('London, UK');
          setIsChangingLocation(false);
          setPostalInput('');
        } else {
          const outcodeRes = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(query)}`);
          const outcodeData = await outcodeRes.json();
          if (outcodeRes.ok && outcodeData.status === 200 && outcodeData.result) {
            setDetectedLocation('London, UK');
            setIsChangingLocation(false);
            setPostalInput('');
          } else {
            throw new Error('Invalid UK postcode. Please check your spelling.');
          }
        }
      }
    } catch (err: any) {
      setPostalError(err.message || 'Location resolution failed. Try again.');
    } finally {
      setIsLoadingPostal(false);
    }
  };

  const generateDynamicJobs = (query: string, passedLocation: string) => {
    let activeLocation = passedLocation;
    let resolvedRole = query;
    let normalizedQuery = query.toLowerCase().trim();

    // Smart fallback if they type a city/location instead of a job role
    if (normalizedQuery.includes('bang') || normalizedQuery.includes('beng') || normalizedQuery.includes('blr') || normalizedQuery.includes('india')) {
      activeLocation = 'Bengaluru, India';
      resolvedRole = 'Software Engineer';
    } else if (normalizedQuery.includes('hyd')) {
      activeLocation = 'Hyderabad, India';
      resolvedRole = 'DevOps & Platform Architect';
    } else if (normalizedQuery.includes('lon') || normalizedQuery.includes('ldn') || normalizedQuery.includes('uk')) {
      activeLocation = 'London, UK';
      resolvedRole = 'Frontend Engineer';
    }

    const location = activeLocation;
    const isUK = location.includes('London');
    const isHyd = location.includes('Hyderabad');
    
    // 1. Normalization & Abbreviations parsing
    let normalized = resolvedRole.toLowerCase().trim();
    
    normalized = normalized.replace(/\bsr\.?\b/g, 'senior');
    normalized = normalized.replace(/\bjr\.?\b/g, 'junior');
    normalized = normalized.replace(/\bfront\s*end\b/g, 'frontend');
    normalized = normalized.replace(/\bback\s*end\b/g, 'backend');
    normalized = normalized.replace(/\bdev\s*ops\b/g, 'devops');
    normalized = normalized.replace(/\bprogrammer\b/g, 'software developer');
    normalized = normalized.replace(/\bjs\s+developer\b/g, 'javascript frontend developer');
    normalized = normalized.replace(/\bjavascript\s+developer\b/g, 'javascript frontend developer');
    
    if (normalized === 'pm') normalized = 'product manager';
    else if (normalized === 'swe') normalized = 'software engineer';
    else if (normalized === 'sde') normalized = 'software development engineer';
    else if (normalized === 'qa') normalized = 'quality assurance engineer';
    else if (normalized === 'hr') normalized = 'hr specialist';
    else if (normalized === 'bdr' || normalized === 'sdr') normalized = 'sales development representative';
    else if (normalized === 'sre') normalized = 'site reliability engineer';

    const cleanQuery = normalized
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // 2. Classify Sector to customize details
    let sector = 'tech';
    const qLower = normalized;
    
    if (qLower.includes('nurse') || qLower.includes('doctor') || qLower.includes('physician') || qLower.includes('dentist') || qLower.includes('pharmacist') || qLower.includes('health') || qLower.includes('medical')) {
      sector = 'healthcare';
    } else if (qLower.includes('sales') || qLower.includes('account executive') || qLower.includes('bd') || qLower.includes('development representative') || qLower.includes('partnerships')) {
      sector = 'sales';
    } else if (qLower.includes('marketing') || qLower.includes('seo') || qLower.includes('sem') || qLower.includes('growth') || qLower.includes('content') || qLower.includes('writer') || qLower.includes('copywriter') || qLower.includes('brand')) {
      sector = 'marketing';
    } else if (qLower.includes('accountant') || qLower.includes('finance') || qLower.includes('auditor') || qLower.includes('tax') || qLower.includes('controller') || qLower.includes('bookkeeper') || qLower.includes('cfo') || qLower.includes('treasury')) {
      sector = 'finance';
    } else if (qLower.includes('recruiter') || qLower.includes('talent') || qLower.includes('generalist') || qLower.includes('people ops') || qLower.includes('hr')) {
      sector = 'hr';
    } else if (qLower.includes('teacher') || qLower.includes('lecturer') || qLower.includes('professor') || qLower.includes('tutor') || qLower.includes('instructional') || qLower.includes('education')) {
      sector = 'education';
    } else if (qLower.includes('support') || qLower.includes('customer service') || qLower.includes('help desk') || qLower.includes('success')) {
      sector = 'support';
    } else if (qLower.includes('electrician') || qLower.includes('plumber') || qLower.includes('mechanic') || qLower.includes('driver') || qLower.includes('warehouse') || qLower.includes('logistic') || qLower.includes('supply chain')) {
      sector = 'trades';
    }

    // Curated details per sector
    let companies: string[] = [];
    let comp = '';
    let tags: string[] = [];
    let jd1 = '';
    let jd2 = '';

    switch (sector) {
      case 'healthcare':
        companies = isUK 
          ? ['NHS Trust (Royal London)', 'Bupa Health Centre', 'King\'s College Hospital']
          : (isHyd ? ['Apollo Hospitals', 'Yashoda Hospitals', 'Care Hospitals'] : ['Manipal Hospitals', 'Fortis Hospital', 'Narayana Health']);
        comp = isUK ? `£38k - £54k` : `₹6L - ₹12L`;
        tags = [cleanQuery, 'Healthcare', 'Clinical Care', 'Patient Safety'];
        jd1 = `We are seeking a dedicated and experienced Senior ${cleanQuery} to deliver high-quality patient care in ${location}. You will lead clinical procedures, maintain strict safety standards, and collaborate with medical specialists.`;
        jd2 = `Looking for a Lead ${cleanQuery} to manage operational workflows and coordinate staff inside our premier health center in ${location}. Focuses on patient-centric protocols and compliance.`;
        break;

      case 'sales':
        companies = isUK
          ? ['Salesforce UK', 'Oracle London', 'HubSpot UK']
          : (isHyd ? ['Microsoft India', 'Tech Mahindra', 'GMR Group'] : ['Flipkart Sales', 'Zoho Corp', 'Infosys BD']);
        comp = isUK ? `£45k - £85k` : `₹8L - ₹18L`;
        tags = [cleanQuery, 'Sales', 'Negotiation', 'Revenue Growth'];
        jd1 = `Seeking a high-velocity Senior ${cleanQuery} to expand our corporate client footprint in ${location}. You will own the full sales cycle, prepare premium proposals, and meet aggressive quarterly revenue goals.`;
        jd2 = `Looking for a Lead ${cleanQuery} to manage and scale regional sales pipelines. Direct experience running client relations and closing major commercial contracts in ${location} is highly preferred.`;
        break;

      case 'marketing':
        companies = isUK
          ? ['WPP Group London', 'Publicis UK', 'Dentsu International']
          : (isHyd ? ['Tata Interactive', 'Genpact Marketing', 'ValueLabs'] : ['Razorpay Growth', 'InMobi', 'Byju\'s Marketing']);
        comp = isUK ? `£42k - £72k` : `₹7L - ₹15L`;
        tags = [cleanQuery, 'Marketing', 'Brand Strategy', 'Analytics'];
        jd1 = `We are hiring a creative Senior ${cleanQuery} to spearhead multi-channel campaigns in ${location}. You will drive organic/paid traffic acquisition, orchestrate user activation, and optimize advertising spend.`;
        jd2 = `Seeking a Lead ${cleanQuery} to run full-funnel customer acquisition campaigns in ${location}. Requires strong proficiency in Google Analytics, content strategy, and SEO optimization frameworks.`;
        break;

      case 'finance':
        companies = isUK
          ? ['Deloitte UK', 'PwC London', 'EY UK']
          : (isHyd ? ['KPMG India', 'State Bank of India', 'ICICI Bank'] : ['HDFC Finance', 'Goldman Sachs Bengaluru', 'PhonePe Corporate']);
        comp = isUK ? `£50k - £95k` : `₹10L - ₹24L`;
        tags = [cleanQuery, 'Finance', 'Auditing', 'Compliance'];
        jd1 = `Seeking a Senior ${cleanQuery} to manage asset valuation, direct corporate tax structuring, and run financial audits in ${location}. Must hold active professional licensing (ACA/ACCA/CA).`;
        jd2 = `Looking for a Lead ${cleanQuery} to lead corporate financial planning, direct quarterly reporting, and optimize cost structures in ${location}. Requires robust experience in financial forecasting.`;
        break;

      case 'hr':
        companies = isUK
          ? ['Randstad London', 'Michael Page UK', 'Adecco Group']
          : (isHyd ? ['Cognizant HR', 'Infosys Talent', 'Wipro Careers'] : ['Flipkart People Ops', 'TCS Talent Acquisition', 'Swiggy People Team']);
        comp = isUK ? `£35k - £65k` : `₹6L - ₹14L`;
        tags = [cleanQuery, 'Talent Ops', 'HR Strategy', 'Relations'];
        jd1 = `We are seeking a Senior ${cleanQuery} to drive end-to-end recruitment pipelines and manage employee experience initiatives in ${location}. Focuses on employee retention and onboarding.`;
        jd2 = `Looking for a Lead ${cleanQuery} to direct people strategy, implement structural performance metrics, and foster inclusive workplace initiatives at our regional site in ${location}.`;
        break;

      case 'education':
        companies = isUK
          ? ['University College London', 'Imperial College London', 'King\'s College London']
          : (isHyd ? ['Osmania University', 'IIIT Hyderabad', 'BITS Pilani Hyderabad'] : ['IISc Bengaluru', 'R.V. College of Engineering', 'PES University']);
        comp = isUK ? `£36k - £60k` : `₹5L - ₹12L`;
        tags = [cleanQuery, 'Education', 'Instructional', 'Pedagogy'];
        jd1 = `Seeking a Senior ${cleanQuery} to craft curriculum structures, deliver interactive modules, and mentor aspiring students in ${location}. Strong communication skills are absolute prerequisites.`;
        jd2 = `Looking for a Lead ${cleanQuery} to direct department-wide academic frameworks and oversee research collaborations in ${location}. Solid background in pedagogy is highly desirable.`;
        break;

      case 'support':
        companies = isUK
          ? ['Zendesk London', 'Freshworks UK', 'Concentric Support']
          : (isHyd ? ['Teleperformance India', 'Sutherland Global', 'Tech Mahindra Support'] : ['Freshworks Bengaluru', 'Swiggy Support Ops', 'Razorpay Support']);
        comp = isUK ? `£30k - £52k` : `₹5L - ₹10L`;
        tags = [cleanQuery, 'Support Ops', 'Zendesk', 'Client Success'];
        jd1 = `We are seeking a Senior ${cleanQuery} to manage complex client support tickets and drive resolution rates in ${location}. Direct experience working with Zendesk or Salesforce is preferred.`;
        jd2 = `Looking for a Lead ${cleanQuery} to lead support operations, establish service level agreements (SLAs), and coordinate escalation response teams in ${location}.`;
        break;

      case 'trades':
        companies = isUK
          ? ['DHL Express London', 'Royal Mail', 'British Gas Services']
          : (isHyd ? ['Gati Logistics', 'Blue Dart Hyderabad', 'TSRTC Logistics'] : ['Delhivery Bengaluru', 'VRL Logistics', 'Flipkart Supply Chain']);
        comp = isUK ? `£28k - £48k` : `₹4L - ₹9L`;
        tags = [cleanQuery, 'Logistics', 'Operations', 'Safety Protocols'];
        jd1 = `We are seeking a highly reliable Senior ${cleanQuery} to coordinate physical inventory operations, verify incoming deliveries, and maintain strict equipment protocols in ${location}.`;
        jd2 = `Looking for a Lead ${cleanQuery} to manage operational teams, optimize routing logistics, and enforce safety compliance frameworks at our hub in ${location}.`;
        break;

      default: // Tech & Engineering default
        companies = isUK
          ? ['HSBC Tech London', 'Barclays Investment', 'British Telecom Dev']
          : (isHyd ? ['Tata Consultancy', 'Dr. Reddy\'s Digital', 'Cyient Labs'] : ['Flipkart Engineering', 'Infosys R&D', 'Wipro Digital']);
        comp = isUK ? `£65k - £110k` : `₹16L - ₹32L`;
        tags = [cleanQuery, 'Engineering', 'Software', 'Architecture'];
        jd1 = `We are seeking a dedicated Senior ${cleanQuery} to join our flagship engineering team in ${location}. In this role, you will lead high-impact technical initiatives, design resilient systems, and mentor junior colleagues.`;
        jd2 = `Seeking a Lead ${cleanQuery} to spearhead architecture and drive execution of highly scalable systems in ${location}. Focuses on React, Node.js, and cloud native architectures.`;
        break;
    }

    return [
      {
        id: `dyn-1-${cleanQuery.toLowerCase().replace(/\s+/g, '-')}`,
        company: companies[0] || 'Global Enterprise',
        title: `Senior ${cleanQuery}`,
        location: `${location} (Hybrid)`,
        compensation: comp,
        tags: tags,
        jd: jd1
      },
      {
        id: `dyn-2-${cleanQuery.toLowerCase().replace(/\s+/g, '-')}`,
        company: companies[1] || 'Regional Leader',
        title: `Lead ${cleanQuery}`,
        location: `${location} (Remote)`,
        compensation: comp,
        tags: tags,
        jd: jd2
      }
    ];
  };

  const getRegionalJobs = () => {
    if (detectedLocation.includes('London')) {
      return LONDON_JOBS;
    } else if (detectedLocation.includes('Hyderabad')) {
      return HYDERABAD_JOBS;
    } else {
      return BENGALURU_JOBS;
    }
  };
  const activeJobs = getRegionalJobs();

  const handleSelectJob = (jobJd: string, jobTitle: string, jobCompany: string) => {
    setJobText(jobJd);
    setShowMatchModal(true);
    trackEvent('landing_job_card_selected', { title: jobTitle, company: jobCompany });
  };
  const [result, setResult] = React.useState<{ score: number, matchingSkills: string[], missingSkills: string[], warnings?: string[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [hasAnalyzed, setHasAnalyzed] = React.useState(false);
  const [isPastingResume, setIsPastingResume] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setResumeFileName(file.name);
    
    try {
      const text = await pdfExtractionService.extractText(file);
      setResumeText(text);
      trackEvent('resume_upload_landing', { fileName: file.name });
    } catch (err) {
      console.error("Extraction failed", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = () => {
    if (!jobText || !resumeText) return;
    setIsAnalyzing(true);
    
    // Simulate a brief "processing" for effect
    setTimeout(() => {
      const analysis = matchAnalysisService.calculateMatchScore(jobText, resumeText);
      setResult(analysis);
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      
      // Critical GTM Sync: Capture this as an 'Aha! Moment' for the dashboard
      trackEvent('landing_page_analysis', { score: analysis.score });
      trackEvent('aha_moment', { type: 'sandbox_match', score: analysis.score });
    }, 800);
  };

  // Smart Redirect: If already logged in, skip the landing page
  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#FC6100]/30 selection:text-[#FC6100]">
      {/* Navbar */}
      <nav className="h-24 flex items-center justify-between px-6 md:px-12 border-b border-white/5 sticky top-0 bg-[#0D0D0D]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
        <div className="w-14 h-14 flex items-center justify-center -ml-2">
          <img 
            src="/logo.png" 
            alt="Udyog Marg" 
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(252,97,0,0.3)]" 
          />
        </div>
          <span className="text-xl font-bold tracking-tight font-display">Udyog Marg</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
                  <button 
                    onClick={() => {
                      if (hasAnalyzed) {
                        localStorage.setItem('udyog_marg_sandbox_state', JSON.stringify({
                          jobText,
                          resumeText,
                          timestamp: new Date().toISOString()
                        }));
                        window.location.href = '/signup';
                      }
                    }}
                    disabled={!hasAnalyzed}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border shadow-lg flex items-center gap-2 ${
                      hasAnalyzed 
                        ? 'bg-[#FC6100] hover:bg-[#E35205] border-[#FC6100]/30 text-white shadow-[#FC6100]/20 hover:scale-[1.02]' 
                        : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                    title={!hasAnalyzed ? "Calculate match score below to unlock alpha registration" : "Click to claim your account"}
                  >
                    {hasAnalyzed ? 'Join Alpha 🚀' : '🔒 Locked: Try Demo'}
                  </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative px-6 overflow-hidden flex flex-col items-center justify-start transition-all duration-500 ease-in-out ${isSearching ? 'pt-6 pb-2' : 'pt-10 pb-4'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FC6100]/30 blur-[120px] -mr-48 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FC6100]/20 blur-[120px] -ml-48 -mb-24"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4 flex flex-col items-center">
          <div className={`inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full transition-all duration-500 ease-in-out overflow-hidden ${isSearching ? 'opacity-0 max-h-0 py-0 border-none mb-0' : 'opacity-100 max-h-12'}`}>
             <div className="w-2 h-2 bg-[#FC6100] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">The Job Search OS v1.0</span>
          </div>

          <h1 className={`font-bold tracking-tighter leading-[0.95] transition-all duration-500 ease-in-out ${isSearching ? 'text-2xl md:text-3xl' : 'text-4xl md:text-6xl'}`}>
            Stop searching.{!isSearching && <br />} Start <span className="text-[#FC6100] italic">Engineering.</span>
          </h1>

          <p className={`text-gray-400 max-w-2xl font-medium leading-relaxed transition-all duration-500 ease-in-out ${isSearching ? 'opacity-0 max-h-0 text-[0px] overflow-hidden mt-0' : 'opacity-100 max-h-24 text-sm md:text-base'}`}>
            Udyog Marg is the high-performance execution engine for your career. 
            Automate the boring, master the interview, and dominate your pipeline.
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 ease-in-out ${isSearching ? 'opacity-0 max-h-0 overflow-hidden pt-0 mt-0' : 'opacity-100 max-h-16 pt-1'}`}>
            <button 
              onClick={() => document.getElementById('demo-scanner-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="hero-demo-cta"
              className="w-full sm:w-auto px-10 py-5 bg-[#FC6100] text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#E35205] transition-all tactile-press border border-white/10 flex items-center justify-center gap-2"
            >
              Try the Live Demo <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
 
        {/* Value-First: Ultra-Fresh Tech Opportunities Grid */}
        <div className="w-full max-w-6xl mx-auto relative z-10 px-4 flex flex-col items-center" style={{ marginTop: '16px' }}>
          <div className="text-center flex flex-col items-center w-full max-w-2xl mx-auto mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FC6100]/10 border border-[#FC6100]/30 rounded-md mb-2">
              <span className="w-1.5 h-1.5 bg-[#FC6100] rounded-full animate-ping"></span>
              <span className="text-[8px] font-black uppercase tracking-widest text-[#FC6100]">Local Job Feed</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ marginBottom: '12px' }}>Live Job Matches</h2>
            
            <div className="w-full relative" style={{ marginBottom: '12px' }}>
              <input 
                type="text"
                placeholder="E.g. Frontend Engineer, DevOps, Product Manager..."
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className="w-full px-6 py-4 h-16 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#FC6100]/50 transition-colors text-base leading-normal align-middle shadow-inner animate-in fade-in zoom-in-95 duration-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-semibold tracking-wide text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ marginTop: '16px', marginBottom: '20px' }}>
              <span>Prioritizing roles in your region:</span>
              {!isChangingLocation ? (
                <div className="flex items-center gap-2">
                  <span className="text-[#FC6100] bg-[#FC6100]/10 border border-[#FC6100]/30 px-3.5 py-1.5 rounded-full font-black flex items-center gap-2 shadow-sm text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#FC6100] animate-bounce" />
                    {detectedLocation}
                  </span>
                  <button 
                    onClick={() => {
                      setIsChangingLocation(true);
                      setPostalError('');
                    }}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-[#FC6100]/20 hover:text-white border border-white/10 hover:border-[#FC6100]/40 rounded-full text-[10px] text-gray-300 font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    change
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostalLookup} className="flex items-center gap-2 tracking-normal lowercase font-bold">
                  <input 
                    type="text"
                    placeholder="Enter city, pincode, or postcode..."
                    value={postalInput}
                    onChange={(e) => setPostalInput(e.target.value)}
                    disabled={isLoadingPostal}
                    className="px-3 py-1.5 bg-black/60 border border-[#FC6100]/30 focus:border-[#FC6100] rounded text-xs text-white placeholder-gray-600 focus:outline-none w-56 tracking-normal normal-case"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={isLoadingPostal}
                    className="px-3 py-1.5 bg-[#FC6100] hover:bg-[#E35205] text-white text-[10px] font-black uppercase tracking-wider rounded transition-all shadow-sm"
                  >
                    {isLoadingPostal ? '...' : 'Verify'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsChangingLocation(false);
                      setPostalInput('');
                      setPostalError('');
                    }}
                    className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider transition-colors ml-1 font-bold"
                  >
                    cancel
                  </button>
                </form>
              )}
              {postalError && (
                <span className="text-red-500 lowercase tracking-normal normal-case font-medium ml-2">{postalError}</span>
              )}
            </div>
          </div>

          {searchRole.trim().length < 2 ? (
            <div className="w-full flex flex-col items-center justify-center py-20 px-8 bg-white/[0.01] border border-white/5 rounded-[32px] text-center max-w-2xl mx-auto space-y-6" style={{ marginTop: '20px' }}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FC6100]">
                <Globe className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Discover Regional Targets</h3>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                  Type your target role or key skills above to retrieve live matches matching your background in <span className="text-white font-semibold">{detectedLocation}</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in duration-300" style={{ marginTop: '12px' }}>
              {(() => {
                const filtered = activeJobs.filter(job => 
                  job.title.toLowerCase().includes(searchRole.toLowerCase()) || 
                  job.tags.some(t => t.toLowerCase().includes(searchRole.toLowerCase()))
                );
                const displayedJobs = filtered.length > 0 
                  ? filtered 
                  : generateDynamicJobs(searchRole, detectedLocation);

                return displayedJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="bg-white/[0.02] border border-white/5 hover:border-[#FC6100]/30 hover:bg-[#FC6100]/[0.01] p-6 rounded-[20px] transition-all duration-300 flex flex-col justify-between group/card relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FC6100]/5 blur-2xl rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    
                    <div className="space-y-4 relative z-10">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-[#FC6100] group-hover/card:bg-[#FC6100] group-hover/card:text-white transition-all uppercase shadow-md shrink-0">
                            {job.company.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">{job.company}</p>
                            <h3 className="text-base font-bold text-white mt-1.5 group-hover/card:text-[#FC6100] transition-colors leading-tight">{job.title}</h3>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md shrink-0 tracking-widest">{job.compensation}</span>
                      </div>

                      {/* Location & Tags */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider leading-none">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {job.location}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {job.tags.map((tag) => (
                            <span key={tag} className="text-[8px] font-black text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between relative z-10">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest group-hover/card:text-[#FC6100] transition-colors">Verify ATS Fit & Gaps</span>
                      <button 
                        onClick={() => handleSelectJob(job.jd, job.title, job.company)}
                        className="px-5 py-2.5 bg-[#FC6100] hover:bg-[#E35205] text-white text-[8px] font-black uppercase tracking-widest rounded-md transition-all border border-white/10 shadow-lg shadow-[#FC6100]/5 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Calculate Match ⚡
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Match Scanner Modal */}
        {showMatchModal && (
          <div className="fixed inset-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-5xl bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 md:p-12 relative shadow-[0_20px_50px_rgba(252,97,0,0.15)] animate-in zoom-in-95 duration-300 my-auto">
              
              <button 
                onClick={() => setShowMatchModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-[60] font-black text-sm hover:scale-110"
                title="Close Scanner"
              >
                ✕
              </button>

              <div className="text-center space-y-2 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Sovereign Sandbox</p>
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight">Match Intelligence Scanner</h3>
              </div>

              {/* Visual Stepper Pathway */}
              <div id="demo-scanner-section" className="w-full max-w-4xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${jobText ? 'bg-[#FC6100]/5 border-[#FC6100]/30 shadow-[0_0_15px_rgba(252,97,0,0.05)]' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${jobText ? 'bg-[#FC6100] text-white shadow-[0_0_8px_rgba(252,97,0,0.4)]' : 'bg-white/10 text-gray-500'}`}>01</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Step 1</p>
                <p className="text-xs font-bold text-white mt-0.5">Paste Job Details</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${resumeText ? 'bg-[#FC6100]/5 border-[#FC6100]/30 shadow-[0_0_15px_rgba(252,97,0,0.05)]' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${resumeText ? 'bg-[#FC6100] text-white' : 'bg-white/10 text-gray-500'}`}>02</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Step 2</p>
                <p className="text-xs font-bold text-white mt-0.5">Provide Resume</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${hasAnalyzed ? 'bg-green-500/5 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${hasAnalyzed ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-500'}`}>03</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Step 3</p>
                <p className="text-xs font-bold text-white mt-0.5">Unlock & Customize</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Match Widget - Radical Value */}
        <div id="demo-widget" className="w-full max-w-4xl mx-auto bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in duration-1000 delay-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${jobText ? 'bg-[#FC6100]/20 border-[#FC6100]/50 text-[#FC6100]' : 'bg-white/5 border-white/10 text-gray-500'}`}>01</span>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Paste Job Description</label>
              </div>
              <textarea 
                value={jobText}
                data-testid="demo-job-textarea"
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the requirements section here..."
                className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm focus:border-[#FC6100]/50 transition-colors resize-none placeholder:text-gray-700 scrollbar-hide"
              />
            </div>
            
            {/* Step 2 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${resumeText ? 'bg-[#FC6100]/20 border-[#FC6100]/50 text-[#FC6100]' : 'bg-white/5 border-white/10 text-gray-500'}`}>02</span>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isPastingResume ? 'Paste Your Resume' : 'Upload Your Resume (PDF or Word)'}
                  </label>
                </div>
                <button 
                  onClick={() => {
                    setIsPastingResume(!isPastingResume);
                    setResumeText('');
                    setResumeFileName(null);
                  }}
                  className="text-[9px] font-black uppercase tracking-widest text-[#FC6100] hover:underline"
                >
                  {isPastingResume ? 'Switch to Document Upload' : 'Don\'t have a PDF or Word file? Paste Text'}
                </button>
              </div>

              {isPastingResume ? (
                <textarea 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume or LinkedIn profile text here..."
                  className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm focus:border-[#FC6100]/50 transition-colors resize-none placeholder:text-gray-700 scrollbar-hide"
                />
              ) : (
                <div className="relative group/upload h-48 bg-black/40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:border-[#FC6100]/30 overflow-hidden">
                  <input 
                    type="file" 
                    accept=".pdf,.docx"
                    data-testid="demo-resume-upload"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  
                  {isExtracting ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#FC6100] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Extracting Data...</p>
                    </div>
                  ) : resumeFileName ? (
                    <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                      <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                        <Target className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">{resumeFileName}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setResumeFileName(null); setResumeText(''); }}
                        className="text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 relative z-20"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white/5 rounded-xl group-hover/upload:bg-[#FC6100]/10 transition-colors">
                        <Layers className="w-6 h-6 text-gray-500 group-hover/upload:text-[#FC6100] transition-colors" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-xs font-bold text-white">Drag or Click to Upload</p>
                        <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest mt-1">PDF or Word (.docx)</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {!resumeText && !resumeFileName && !isPastingResume && (
                <button 
                  onClick={() => {
                    setResumeText("Standard Software Engineer with expertise in React, Node.js, and Cloud Infrastructure.");
                    setResumeFileName("Sample_Engineer_Resume.pdf");
                    trackEvent('demo_sample_resume_used');
                  }}
                  className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  Or Try with Sample Resume
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-8">
            <button 
              onClick={handleAnalyze}
              data-testid="demo-analyze-btn"
              disabled={!jobText || !resumeText || isAnalyzing}
              className={`px-12 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-200 transition-all tactile-press disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isAnalyzing ? 'Analyzing Algorithm...' : 'Calculate ATS Match'}
            </button>

            {result && (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 justify-center">
                  <span className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-500 text-[10px] font-black">03</span>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">The Verdict</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 text-center flex flex-col items-center justify-center space-y-2">
                    <p className="text-6xl font-bold text-[#FC6100] tracking-tighter">{result.score}%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Match Accuracy</p>
                  </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00FF00]">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills.length > 0 ? result.matchingSkills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                    )) : <span className="text-xs text-gray-600 italic">No matches detected.</span>}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Critical Gaps</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.length > 0 ? result.missingSkills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                    )) : <span className="text-xs text-gray-600 italic">None! Ready to apply.</span>}
                  </div>
                </div>

              </div>

                {/* The Conversion Hook */}
                <div className="md:col-span-3 pt-10 text-center space-y-6 border-t border-white/5 mt-6 bg-[#FC6100]/5 rounded-3xl p-8 border border-[#FC6100]/20 max-w-2xl mx-auto shadow-[0_0_30px_rgba(252,97,0,0.02)]">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC6100]">
                     Match Solved. What's Next?
                   </p>
                   <p className="text-sm text-gray-300 font-medium max-w-md mx-auto leading-relaxed">
                     Your sandbox matches are saved! Claim your account now to inject this job into your tracking pipeline, resolve missing skills, and auto-draft a tailored cover letter instantly.
                   </p>
                    <button 
                     data-testid="demo-signup-cta"
                     onClick={() => {
                       trackEvent('cta_click', { location: 'sandbox_result' });
                       
                       // PERSIST SANDBOX STATE
                       localStorage.setItem('udyog_marg_sandbox_state', JSON.stringify({
                         jobText,
                         resumeText,
                         timestamp: new Date().toISOString()
                       }));
 
                       // Force a small delay to ensure storage write before navigation
                       setTimeout(() => {
                         window.location.href = '/signup';
                       }, 50);
                     }}
                     className="px-8 py-4 bg-[#FC6100] hover:bg-[#E35205] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 shadow-lg shadow-[#FC6100]/10 flex items-center gap-2 mx-auto hover:scale-[1.02]"
                    >
                      Claim Your Free Account & Tailor Now <ArrowRight className="w-4 h-4" />
                    </button>
                   
                   <div className="pt-6">
                     <button 
                       onClick={() => setShowScanner(!showScanner)}
                       className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                     >
                       {showScanner ? 'Hide Technical Scan' : 'View Intelligence Scanner Output'}
                     </button>
                   </div>
                </div>

                {/* The Delta Scanner View (Hidden by default) */}
                {showScanner && (
                  <div className="md:col-span-3 pt-8 space-y-6 animate-in fade-in zoom-in duration-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 text-center">Scanner Analysis</p>
                    <div className="p-8 bg-black/60 border border-white/5 rounded-3xl text-sm leading-relaxed text-gray-400 max-h-64 overflow-y-auto font-mono scrollbar-hide">
                      {(() => {
                        const allTerms = [
                          ...result.matchingSkills,
                          ...result.missingSkills
                        ].flatMap(skill => {
                          return [skill, ...(SYNONYMS[skill] || [])];
                        });
                        allTerms.sort((a, b) => b.length - a.length);
                        const combinedRegex = new RegExp(`(${allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
                        return jobText.split(combinedRegex).map((part, index) => {
                          const lowerPart = part.toLowerCase();
                          const isMatch = result.matchingSkills.some(s => {
                            return s.toLowerCase() === lowerPart || (SYNONYMS[s] || []).some(syn => syn.toLowerCase() === lowerPart);
                          });
                          const isMissing = result.missingSkills.some(s => {
                            return s.toLowerCase() === lowerPart || (SYNONYMS[s] || []).some(syn => syn.toLowerCase() === lowerPart);
                          });
                          if (isMatch) return <span key={index} className="text-[#00FF00] bg-[#00FF00]/10 px-1 rounded font-bold">{part}</span>;
                          if (isMissing) return <span key={index} className="text-white border-b border-white/40">{part}</span>;
                          return part;
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Intelligence Core - Visual Demo */}
      <section className="py-64 px-6 relative overflow-hidden flex flex-col items-center bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center space-y-20 flex flex-col items-center relative z-10">
          <div className="space-y-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Matching System (Live Now)</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight text-center">
              Know your fit.<br />
              Before you <span className="text-[#FC6100] italic">Apply.</span>
            </h2>
            <p className="text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto text-center">
              Udyog Marg analyzes the difference between your resume and the job description in real-time. Get an accurate match score, identify missing keywords, and prepare your application for the win.
            </p>
          </div>

          <div className="relative group w-full max-w-2xl mx-auto py-10">
            <div className="absolute inset-0 bg-[#FC6100]/10 blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img 
              src="./landing/match_intelligence_demo.png" 
              alt="Match Intelligence Demo" 
              className="relative rounded-[40px] border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.01] z-10 mx-auto w-full h-auto object-contain"
            />
          </div>

          <div className="grid grid-cols-3 gap-16 pt-16 w-full max-w-3xl border-t border-white/10 mx-auto mb-32">
            <div className="space-y-4 text-center">
              <p className="text-5xl font-bold text-white tracking-tighter">87%</p>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Match Accuracy</p>
            </div>
            <div className="space-y-4 border-x border-white/10 text-center">
              <p className="text-5xl font-bold text-white tracking-tighter">100%</p>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Privacy Secured</p>
            </div>
            <div className="space-y-4 text-center">
              <p className="text-5xl font-bold text-white tracking-tighter">AI</p>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Powered Insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Symmetric Expansion Zone */}
      <div className="h-64 w-full bg-transparent"></div>

      {/* Feature Grid */}
      <section id="features" className="py-64 px-6 bg-white/[0.02] border-y border-white/5 flex flex-col items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-32">
          <div className="flex flex-col items-center text-center space-y-10 group w-full">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-2xl group-hover:shadow-[#FC6100]/20 mx-auto">
              <Zap className="w-12 h-12 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold tracking-tight text-center">Universal Importer</h3>
              <p className="text-gray-400 leading-relaxed font-medium max-w-[320px] mx-auto text-center text-lg">
                Paste any LinkedIn or Indeed URL. Our engine scrapes the data in seconds, building your pipeline with zero manual entry.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-10 group w-full">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-2xl group-hover:shadow-[#FC6100]/20 mx-auto">
              <Target className="w-12 h-12 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold tracking-tight text-center">Match Intelligence</h3>
              <p className="text-gray-400 leading-relaxed font-medium max-w-[320px] mx-auto text-center text-lg">
                Real-time analysis between your resume and the job description. Know your fit percentage and missing keywords instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-10 group w-full">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-2xl group-hover:shadow-[#FC6100]/20 mx-auto">
              <Cpu className="w-12 h-12 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold tracking-tight text-center">Interview Prep Mode</h3>
              <p className="text-gray-400 leading-relaxed font-medium max-w-[320px] mx-auto text-center text-lg">
                Personalized prep guides, "Trap" question strategies, and AI-drafted elevator pitches tailored to your specific resume gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Symmetric Expansion Zone */}
      <div className="h-64 w-full bg-transparent"></div>

      {/* Social Proof Placeholder */}
      <section className="py-48 px-6 bg-black flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-24">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">Engineered for the 1%.</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12 opacity-20 grayscale hover:grayscale-0 transition-all duration-700 w-full">
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">TECH CRUNCH</div>
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">PRODUCT HUNT</div>
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">HACKER NEWS</div>
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">THE VERGE</div>
          </div>
        </div>
      </section>

      {/* Final Expansion Zone */}
      <div className="h-64 w-full bg-transparent"></div>

      {/* Footer */}
      <footer className="py-40 px-6 border-t border-white/5 bg-black flex flex-col items-center w-full">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-20 text-center">
          <div className="space-y-6 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center mx-auto">
              <img src="/logo.png" alt="Udyog Marg" className="w-full h-full object-contain" />
            </div>
              <span className="text-2xl font-bold tracking-tight">Udyog Marg</span>
            </div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] max-w-sm mx-auto text-center">Build your legacy. Dominate the hunt.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 w-full">
            <Link to="/legal#privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/legal#terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/legal#security" className="hover:text-white transition-colors">Security Audit</Link>
          </div>
          
          <div className="pt-12 border-t border-white/5 w-full flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              <Globe className="w-4 h-4 text-[#FC6100]" />
              Deployed in London, UK
            </div>
            <p className="text-[9px] font-bold text-gray-800 uppercase tracking-widest">&copy; 2026 Udyog Marg AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
