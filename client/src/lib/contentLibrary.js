const content = {
  words: [
    "quantum computing utilizes superposition and entanglement to perform calculations",
    "the quick brown fox jumps over the lazy dog in a recursive loop",
    "cybernetic enhancements bridge the gap between biological limits and digital potential",
    "rhythm is the foundation of consistency across prolonged periods of intense coding",
    "neon lights flicker against the chrome surfaces of a sprawling megalopolis",
    "encryption algorithms protect sensitive data from unauthorized access in the cloud",
    "distributed ledger technology ensures transparency and security in financial transactions",
    "artificial neural networks simulate human cognition for complex pattern recognition",
    "low level assembly languages require precise memory management and register allocation",
    "modern web frameworks leverage virtual dom manipulation for optimal rendering speeds",
    "serverless architecture abstracts infrastructure management allowing developers to focus on logic",
    "asynchronous programming models enable non-blocking operations in single-threaded environments",
    "containerization with docker ensures consistent environments from development to production",
    "generative ai models are reshaping how we approach creative and technical workflows",
    "high frequency trading systems demand sub-millisecond latency for competitive advantage"
  ],
  quotes: [
    "Talk is cheap. Show me the code. — Linus Torvalds",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
    "I'm not a great programmer; I'm just a good programmer with great habits. — Kent Beck",
    "The function of good software is to make the complex appear to be simple. — Grady Booch",
    "In the future, everyone will be world-famous for fifteen minutes. — Andy Warhol",
    "First, solve the problem. Then, write the code. — John Johnson",
    "Experience is the name everyone gives to their mistakes. — Oscar Wilde",
    "Simplicity is the soul of efficiency. — Austin Freeman",
    "Java is to JavaScript what car is to Carpet. — Chris Heilmann",
    "Code is like humor. When you have to explain it, it’s bad. — Cory House"
  ],
  code: [
    "const [state, setState] = useState(initial);",
    "export const useTyping = (passage) => { const [status, setStatus] = useState('idle'); }",
    "app.get('/api/stats', (req, res) => { res.json({ status: 'ok' }); });",
    ".container { display: flex; align-items: center; justify-content: center; }",
    "SELECT * FROM users WHERE active = true ORDER BY created_at DESC;",
    "function debounce(fn, ms) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), ms); }; }",
    "const fetchData = async () => { try { const res = await axios.get(url); setData(res.data); } catch (err) { console.error(err); } };",
    "npm install @prisma/client lucide-react framer-motion socket.io-client",
    "git commit -m 'feat: implement time warp visual triggers' --no-verify",
    "docker-compose up -d --build postgres redis api-server",
    "<div className='grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-neutral-900/50 backdrop-blur-xl'>",
    "export default function Page() { return <Suspense fallback={<Loader />}> <TypedContent /> </Suspense> }"
  ]
};

export const getRandomContent = (mode) => {
  const library = content[mode] || content.words;
  return library[Math.floor(Math.random() * library.length)];
};

/**
 * Generates a passage of text based on the mode and approximate word count needed.
 * @param {string} mode - 'words', 'quotes', or 'code'
 * @param {number} targetWordCount - Minimum words required (e.g. 100 for 30s)
 * @returns {string} The generated passage.
 */
export const generatePassage = (mode, targetWordCount = 40) => {
  const library = content[mode] || content.words;
  let passage = [];
  let currentWords = 0;

  // Use a pool to avoid immediate repeats
  let pool = [...library];
  
  while (currentWords < targetWordCount) {
    if (pool.length === 0) pool = [...library];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const snippet = pool.splice(randomIndex, 1)[0];
    
    passage.push(snippet);
    currentWords += snippet.split(' ').length;
  }

  return passage.join(' ');
};
