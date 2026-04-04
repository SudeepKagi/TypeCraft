const passages = {
  words: [
    "quantum computing utilizes superposition and entanglement to perform calculations",
    "cybernetic enhancements bridge the gap between biological limits and digital potential",
    "rhythm is the foundation of consistency across prolonged periods of intense coding",
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
    "I'm not a great programmer; I'm just a good programmer with great habits. — Kent Beck",
    "The function of good software is to make the complex appear to be simple. — Grady Booch",
    "First, solve the problem. Then, write the code. — John Johnson",
    "Code is like humor. When you have to explain it, it’s bad. — Cory House",
    "Simplicity is the soul of efficiency. — Austin Freeman",
    "Experience is the name everyone gives to their mistakes. — Oscar Wilde"
  ],
  code: [
    "const [state, setState] = useState(initial);",
    "app.get('/api/stats', (req, res) => { res.json({ status: 'ok' }); });",
    ".container { display: flex; align-items: center; justify-content: center; }",
    "SELECT * FROM users WHERE active = true ORDER BY created_at DESC;",
    "function debounce(fn, ms) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), ms); }; }",
    "const fetchData = async () => { try { const res = await axios.get(url); setData(res.data); } catch (err) { console.error(err); } };"
  ]
};

const generateRacePassage = (mode = 'quotes', targetWordCount = 30) => {
  const library = passages[mode] || passages.quotes;
  let result = [];
  let currentWords = 0;
  let pool = [...library];

  while (currentWords < targetWordCount) {
    if (pool.length === 0) pool = [...library];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const snippet = pool.splice(randomIndex, 1)[0];
    result.push(snippet);
    currentWords += snippet.split(' ').length;
  }

  return result.join(' ');
};

module.exports = { generateRacePassage };
