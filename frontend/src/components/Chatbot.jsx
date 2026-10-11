import React, { useState } from 'react';

const botKnowledge = [
  {
    keywords: ['hi', 'hello', 'hey', 'greetings', 'selam'],
    response: "Selam! How can I help you with your architectural or structural project today?"
  },
  {
    keywords: ['service', 'design', 'architecture', 'structural', 'supervision', 'what do you do', 'consulting', 'mep', 'electrical', 'sanitary', 'interior', 'landscape'],
    response: "We provide full building design and consultancy services:<br>&bull; Comprehensive Building Design (Architectural, Structural, Electrical &amp; Sanitary-Mechanical)<br>&bull; Interior Design Study<br>&bull; Landscape Design Study<br>&bull; Construction Supervision &amp; Contract Administration<br>&bull; Preparation of Bills of Quantity (BOQ)<br>&bull; Feasibility Studies &amp; Asset Valuation<br><br>All design work is produced using AutoCAD, ArchiCAD, Revit, and structural packages like STAAD, SAP2000, and ETABS."
  },
  {
    keywords: ['cost', 'price', 'pricing', 'quote', 'quotation', 'fee', 'charge', 'rate', 'how much'],
    response: "Design fees are calculated per discipline (architectural, structural, electrical, sanitary) based on your project's built-up area and scope, plus asset valuation if needed. Request a formal quotation through our contact form and our team will size it to your project."
  },
  {
    keywords: ['location', 'where', 'address', 'office', 'city', 'place', 'branch'],
    response: "Our Head Office is in Addis Ababa, and our branch office is in Hawassa (Atota, W/Amanuel road, in front of Hayole School). We take on projects across Ethiopia."
  },
  {
    keywords: ['cat', 'grade', 'license', 'cat-1', 'cat 1', 'certification', 'qualified', 'registered', 'legal'],
    response: "Yes — Selam Consulting is a Category One (CAT&#8209;I) registered consultant with the Addis Ababa City Administration Infrastructure &amp; Construction Authority, licensed for Architecture and Engineering consultancy. We also hold a separate Certificate of Competence for Asset Valuation consultancy."
  },
  {
    keywords: ['permit', 'code', 'ebcs', 'approval', 'municipal', 'government'],
    response: "All our designs follow Ethiopian Building Codes and standards, and we prepare the full drawing and documentation package required for municipal permitting."
  },
  {
    keywords: ['time', 'duration', 'long', 'timeline', 'weeks', 'months', 'fast'],
    response: "Design timelines depend on project scale, but most architectural &amp; structural design packages are delivered within a few weeks of finalizing the brief and site data."
  },
  {
    keywords: ['team', 'staff', 'employee', 'engineer', 'who', 'experience', 'manager'],
    response: "Selam Consulting was established in April 2017 and has grown to a team of about 30 professionals &mdash; architects, structural, electrical, sanitary and geotechnical engineers &mdash; led by General Manager Ato Beniyam Alemayehu Beyen."
  },
  {
    keywords: ['project', 'portfolio', 'built', 'example', 'completed', 'work'],
    response: "We've delivered mixed-use towers, hotels, residential villas, worship halls, schools and youth centers across Hawassa, Addis Ababa and other regions &mdash; see our Projects page for a selection, or ask me about a specific project type."
  },
  {
    keywords: ['contact', 'call', 'phone', 'email', 'talk', 'number', 'appointment', 'meeting'],
    response: "Direct Phone: +251 91 606 7138 / +251 96 104 7689<br>Email: selamconsultantplc12@gmail.com<br>Telegram: t.me/selamconsulting<br><br>You can also request a call directly through the contact form!"
  },
  {
    keywords: ['thanks', 'thank you', 'ok', 'okay', 'great', 'cool', 'perfect'],
    response: "You're very welcome! Let me know if you need any other project details."
  }
];

const chipQuickReplies = {
  services: "We offer Grade-I Architectural Design, Structural Engineering, MEP (Electrical &amp; Sanitary) Design, Landscape Design, and Contract Administration &amp; Site Supervision.",
  pricing: "Consultancy costs depend on your project size, discipline mix, and scope. Request a formal quotation using our quick contact form!",
  location: "We're based in Addis Ababa (Head Office) with a branch office in Hawassa, supporting projects nationwide.",
  permits: "We deliver fully compliant design and documentation packages adhering to Ethiopian Building Codes for municipal permitting.",
  cat1: "CAT-I licensed consultancy, registered with the Addis Ababa City Administration, capable of executing high-rise, mixed-use, and major infrastructure developments.",
  contact: "Phone: +251 91 606 7138<br>Email: selamconsultantplc12@gmail.com"
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! Welcome to <strong>Selam Consulting Architects &amp; Engineers</strong>. How can I assist you today?'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const getSmartResponse = (input) => {
    const clean = input.toLowerCase().trim();
    for (const item of botKnowledge) {
      if (item.keywords.some(kw => clean.includes(kw))) {
        return item.response;
      }
    }
    return "I'd be happy to help with that! Could you specify whether your inquiry is regarding **Architectural Design**, **Structural Engineering**, or **Project Quotations**?";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputText('');

    setTimeout(() => {
      const reply = getSmartResponse(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  const handleChip = (query) => {
    const reply = chipQuickReplies[query] || "How else can I assist you with this project?";
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: query.toUpperCase() },
      { sender: 'bot', text: reply }
    ]);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat Window Panel */}
      <div className={`chat-window ${isOpen ? 'active' : ''}`} id="chat-window">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="bot-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div>
              <h4 className="bot-name">Selam AI Assistant</h4>
              <span className="bot-status"><span className="status-dot"></span>Online &middot; Instant Answers</span>
            </div>
          </div>
          <button className="chat-close-btn" id="chat-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        {/* Chat Messages Container */}
        <div className="chat-body" id="chat-body">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`chat-msg ${m.sender === 'user' ? 'user-msg' : 'bot-msg'}`}
              dangerouslySetInnerHTML={{ __html: m.text }}
            />
          ))}
        </div>

        {/* Quick Action Chips */}
        <div className="chat-chips">
          <button type="button" className="chip-btn" onClick={() => handleChip('services')}>Our Services</button>
          <button type="button" className="chip-btn" onClick={() => handleChip('pricing')}>Cost &amp; Estimates</button>
          <button type="button" className="chip-btn" onClick={() => handleChip('location')}>Office Location</button>
          <button type="button" className="chip-btn" onClick={() => handleChip('permits')}>Building Permits</button>
          <button type="button" className="chip-btn" onClick={() => handleChip('cat1')}>CAT-I License</button>
          <button type="button" className="chip-btn" onClick={() => handleChip('contact')}>Contact Details</button>
        </div>

        {/* Chat Input Field */}
        <form className="chat-input-area" id="chat-form" onSubmit={handleSend}>
          <input
            type="text"
            id="chat-input"
            placeholder="Type your message..."
            autoComplete="off"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <button
        className="chat-toggle-btn"
        id="chat-toggle-btn"
        aria-label="Open Chat"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <svg className="chat-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span className="chat-badge-pulse"></span>
      </button>
    </div>
  );
}
