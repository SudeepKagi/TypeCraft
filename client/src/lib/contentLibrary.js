const content = {
  words: [
    "quantum computing utilizes superposition and entanglement to perform calculations",
    "the quick brown fox jumps over the lazy dog in a recursive loop",
    "cybernetic enhancements bridge the gap between biological limits and digital potential",
    "rhythm is the foundation of consistency across prolonged periods of intense coding",
    "neon lights flicker against the chrome surfaces of a sprawling megalopolis",
    "encryption algorithms protect sensitive data from unauthorized access in the cloud",
    "distributed ledger technology ensures transparency and security in financial transactions",
    "artificial neural networks simulate human cognition for complex pattern recognition"
  ],
  quotes: [
    "Talk is cheap. Show me the code. — Linus Torvalds",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
    "I'm not a great programmer; I'm just a good programmer with great habits. — Kent Beck",
    "The function of good software is to make the complex appear to be simple. — Grady Booch",
    "In the future, everyone will be world-famous for fifteen minutes. — Andy Warhol"
  ],
  code: [
    "const [state, setState] = useState(initial);",
    "export const useTyping = (passage) => { const [status, setStatus] = useState('idle'); }",
    "app.get('/api/stats', (req, res) => { res.json({ status: 'ok' }); });",
    ".container { display: flex; align-items: center; justify-content: center; }",
    "SELECT * FROM users WHERE active = true ORDER BY created_at DESC;",
    "function debounce(fn, ms) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), ms); }; }"
  ]
};

export const getRandomContent = (mode) => {
  const library = content[mode] || content.words;
  return library[Math.floor(Math.random() * library.length)];
};
