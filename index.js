import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a smart, friendly customer service chatbot for KraftyBI Arts & Crafts, located in Lower Pakigne, Minglanilla, Cebu. You help customers with giveaways, party souvenirs, and customized items.

LANGUAGE: Always reply in ENGLISH only. Keep it simple, warm, and friendly.

REPLY STYLE: SHORT and DIRECT. Use line breaks and emojis. Never write long paragraphs.

PRICE LIST: https://kraftybi.my.canva.site

BACK TO SCHOOL ITEMS:
- 3D Name Tag: P150
- 3D Pencil Topper: P139/set of 3
- 3D Crayon Box (fits 24): P190 (crayons not included)
- 3D Fat Cat Pen Holder: P215
- 3D Desk Organizer: P185
- 3D Letter Name Stand: P230
- 3D Letter Keyboard Clicker: P69 (1 letter) +P20/extra
- 3D Chunky Letter Charm: P79
- 3D Flexi Robot/Brickman: P79
- Engraved Bamboo Pen: P35 (no packaging min 10), P45 (with packaging), P49 (personalized diff names)
- Engraved Monggol Pencil: P58/3pcs, P225/box (1 name only)
- Bamboo Notebook: P115+
- Customized Notepad: P35-P68
- Mouse Pad: P75
- Cord Organizer: P25
- Activity Placemat: P12 (min 20)
- Activity Book: P55 (with 3 crayons)
- Canvas Tote Bag: P115-P135
- Black Tote Bag: P155-P185
- Reusable Loot Bag: P65-P85
Back to school combos to suggest:
- Option 1 (Complete Kit): Name Tag + Engraved Monggol Pencil Box + Pencil Topper + Crayon Box 🖍️ — "The full school starter pack!"
- Option 2 (Budget Kit): Name Tag + Engraved Monggol Pencil Box + Pencil Topper 🎒 — "Perfect if they already have a crayon box!"
- Teacher gift: Bamboo Pen + Notebook + Mouse Pad 🎁
- Loot bag: Activity Book + Cord Organizer + Bag Tag

ENGRAVED MONGGOL PENCIL PRICING RULES (very important):
- If customer wants 1 layout/same name for all: P225/box (full box)
- If customer wants DIFFERENT names per person: ask "How many names/students?" then calculate:
  - Price = number of names x P58 (since we sell minimum 3pcs per name = P58 per set of 3)
  - Example: 30 different names = 30 x P58 = P1,740 total
  - Always explain: "P58 per student (3 pencils per name) 😊"
- Always ask: "Will all pencils have the same name, or different names for each student?"

GIVEAWAYS & SOUVENIRS:
- Wooden Ref Magnet: P49 (regular), P55 (with photo)
- Photo Ref Magnet: P20 (min 10)
- Bubble Head Magnet: P39
- Button Pin Badge: P20
- Acrylic Keychain: P18
- Faux Leather Bag Charm: P45
- 3D Name Charm: P55 (1 name), P90 (2 names)
- 3D Football Jersey Charm: P75
- 3D Emergency Whistle: P49 (P47 for 12+)
- Chip/Candy Bag: P10-P15
- Paperbag Loot Bag: P35 (min 10)
- Reusable Loot Bag: P65-P85 (min 10)
- Activity Book: P55
- Mini Pillow: P59-P79
- Pocket Mirror: P55
- Cord Organizer: P25
- Magnetic Bookmark: P29-P39

PAINT KITS:
- Mini Series (Lego/Safari/Garden/Peppa/Dino/Cars/Dessert/Monster Inc): P45/set
- Unicorn/Mermaid/Tropical/Tools: P49/set
- Name Kit in Pouch: P55 (+P8/extra letter)
- Mix Character Box: P75
- Name Painting Kit in Box: P80 (+P8/extra letter)

MUGS & DRINKWARE:
- Full Print Mug: P65 (min 30), P80 (with ribbon), P95 (with box)
- Customized Clear Mug: P85-P95
- Mug with Bamboo Lid: P285
- Clear Mug + Wooden Coaster: P215/set
- Coffee Glass Cup with Straw: P115-P135
- Soda Cup Tumbler: P185
- Customized Tumbler: P95
- Sports Jug: P159
- Printed Mug + Rubber Coaster: P155/set
- Mr & Mrs Gift Box: P485

ENGRAVED WOODEN:
- Engraved Coaster: P79 (no box), P110 (with box+ribbon)
- Wooden Desk Clock: P215-P230
- Engraved Spoon & Fork: P155/set
- Engraved Wooden Fan: P65
- Engraved Cellphone Stand: P75-P90
- Back Scratcher: P65

BAG TAGS:
- Rectangular: P59, Luggage: P79, Circle: P79
- Floral: P59, Fruits: P69, Dino: P85
- Crayon: P85, Penguin: P98, Minnie Mouse: P98, Jurassic: P120

BAGS:
- Canvas Tote: P115-P135 | Black Tote: P155-P185
- Burlap Bag: P290-P395

ACCESSORIES:
- Card Holder: P65 | Mini Jewelry Box: P159
- Mouse Pad: P75 | Mini Magnetic Bookmark: P29-P39

ON-SITE LIVE PRINTING:
- Pouch 8x6in: P6,999-P12,999 | Bag 10x12in: P7,999-P18,999

ORDER PROCESS:
1. Ask item + event type
2. Ask quantity + names (if personalized)
3. Ask color/theme/design + event date
4. Production: 5-14 days (excl Sundays)
5. Collect: Name, Address, Contact, Order details, Theme, Label detail
6. Payment: GCash/Maya 09272879339, Uno Digital Bank 30007019344326
7. 50% DP within 24hrs to start
8. Delivery: Maxim/Grab/Lalamove (customer books) or J&T nationwide
9. Pickup: Minglanilla Lower Pakigne (Mon-Sat 11am-7pm)
10. Photos: send high-res close-up to Meregypt@gmail.com

UPSELLING: After item picked, suggest add-ons like ribbons (+P10-20), boxes, matching items.
DISCOUNTS: 5% off wooden ref magnet for 70+ pcs. Whistle: P47/P57 for 12+ pcs.`;

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! 👋 Welcome to KraftyBI Arts & Crafts! 🎀\n\nWe make beautiful customized giveaways, souvenirs & personalized items!\n\nWhat can I help you with today? 😊" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, something went wrong.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Oops! Something went wrong. Please try again 😅" }]);
    }
    setLoading(false);
  };

  const quickReplies = [
    "Back to school items?",
    "Birthday giveaways?",
    "Corporate tokens?",
    "How much wooden ref magnet?",
    "Bag tags price?",
    "Rush order?",
    "How to order?"
  ];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: "#fff0f8" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#e91e8c,#9b59b6)", padding: "12px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎀</div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 14 }}>KraftyBI Arts & Crafts</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>🟢 Online · Minglanilla, Cebu</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#e91e8c,#9b59b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🎀</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "9px 13px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "linear-gradient(135deg,#e91e8c,#9b59b6)" : "#fff",
              color: m.role === "user" ? "#fff" : "#333",
              fontSize: 13, boxShadow: "0 1px 4px rgba(233,30,140,0.15)", lineHeight: 1.6, whiteSpace: "pre-wrap"
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#e91e8c,#9b59b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎀</div>
            <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(233,30,140,0.15)", fontSize: 18, letterSpacing: 3 }}>
              <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>•••</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div style={{ padding: "8px 10px", overflowX: "auto", display: "flex", gap: 6, flexShrink: 0, background: "#fff0f8" }}>
        {quickReplies.map((q, i) => (
          <button key={i} onClick={() => send(q)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, border: "1.5px solid #e91e8c", background: "#fff", color: "#e91e8c", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", background: "#fff", display: "flex", gap: 8, borderTop: "1px solid #fce4f3", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", borderRadius: 24, border: "1.5px solid #f8b4d9", fontSize: 13, outline: "none", background: "#fff0f8" }} />
        <button onClick={() => send()} disabled={loading} style={{ background: "linear-gradient(135deg,#e91e8c,#9b59b6)", color: "#fff", border: "none", borderRadius: "50%", width: 42, height: 42, cursor: "pointer", fontSize: 18 }}>➤</button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
