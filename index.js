// ============================================================
//  KraftyBI Arts & Crafts — Facebook Messenger Webhook Server
//  Powered by Groq (FREE & FAST) + Smart Learning Memory
// ============================================================

const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();
app.use(express.json());

// ── ENV VARIABLES ────────────────────────────────────────────
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN      = process.env.VERIFY_TOKEN;
const GROQ_API_KEY      = process.env.GROQ_API_KEY;

// ── Memory Files ─────────────────────────────────────────────
const MEMORY_FILE    = "/tmp/kb_customers.json";
const ORDERS_FILE    = "/tmp/kb_orders.json";
const ANALYTICS_FILE = "/tmp/kb_analytics.json";

function loadJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
function saveJSON(file, data) {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch {}
}

const conversations = {};

// ── SYSTEM PROMPT ────────────────────────────────────────────
function buildSystemPrompt(senderId) {
  const customers = loadJSON(MEMORY_FILE, {});
  const customer  = customers[senderId] || null;
  const analytics = loadJSON(ANALYTICS_FILE, { popular: {}, questions: {} });

  const popularItems = Object.entries(analytics.popular)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([k, v]) => k + " (" + v + "x)").join(", ") || "none yet";

  const returningInfo = customer
    ? "RETURNING CUSTOMER: Name: " + (customer.name || "unknown") + ", Past orders: " + JSON.stringify(customer.orders ? customer.orders.slice(-2) : []) + ". Greet them by name. Ask if they want the same as last time or something new."
    : "NEW CUSTOMER.";

  return "You are a smart, friendly customer service chatbot for KraftyBI Arts & Crafts, located in Lower Pakigne, Minglanilla, Cebu. You help customers with giveaways, party souvenirs, and customized items.\n\n" +
    returningInfo + "\n" +
    "POPULAR ITEMS THIS WEEK: " + popularItems + "\n\n" +
    "LANGUAGE: Always reply in ENGLISH only. Keep it simple, warm, and friendly.\n\n" +
    "REPLY STYLE: SHORT and DIRECT. Use line breaks and emojis. Never write long paragraphs.\n\n" +
    "PRICE LIST WEBSITE: https://kraftybi.my.canva.site\n\n" +
    "==== BACK TO SCHOOL ITEMS ====\n" +
    "- 3D Name Tag: P150\n" +
    "- 3D Pencil Topper: P139/set of 3\n" +
    "- 3D Crayon Box (fits 24): P190 (crayons not included)\n" +
    "- 3D Fat Cat Pen Holder: P215\n" +
    "- 3D Desk Organizer: P185\n" +
    "- 3D Letter Name Stand: P230\n" +
    "- 3D Letter Keyboard Clicker: P69 (1 letter) +P20/extra\n" +
    "- 3D Chunky Letter Charm: P79\n" +
    "- 3D Flexi Robot/Brickman: P79\n" +
    "- Engraved Bamboo Pen: P35 (no packaging min 10), P45 (with packaging), P49 (personalized diff names)\n" +
    "- Engraved Monggol Pencil Box: P225/box (1 name), P58/3pcs (diff names)\n" +
    "- Bamboo Notebook: P115+\n" +
    "- Customized Notepad: P35-P68\n" +
    "- Mouse Pad: P75\n" +
    "- Cord Organizer: P25\n" +
    "- Activity Placemat: P12 (min 20)\n" +
    "- Activity Book: P55 (with 3 crayons)\n" +
    "- Canvas Tote Bag: P115-P135\n" +
    "- Black Tote Bag: P155-P185\n" +
    "- Reusable Loot Bag: P65-P85\n\n" +
    "BACK TO SCHOOL COMBOS:\n" +
    "- Option 1 (Complete Kit): Name Tag + Engraved Monggol Pencil Box + Pencil Topper + Crayon Box - The full school starter pack!\n" +
    "- Option 2 (Budget Kit): Name Tag + Engraved Monggol Pencil Box + Pencil Topper - Perfect if they already have a crayon box!\n" +
    "- Teacher Gift: Bamboo Pen + Notebook + Mouse Pad\n" +
    "- Loot Bag: Activity Book + Cord Organizer + Bag Tag\n\n" +
    "ENGRAVED MONGGOL PENCIL PRICING RULES (very important):\n" +
    "- Same name for all: P225/box\n" +
    "- Different names: Ask how many names/students. Price = number of names x P58 (3 pencils per name)\n" +
    "- Example: 30 different names = 30 x P58 = P1,740\n" +
    "- Always ask: Same name or different names per student?\n\n" +
    "==== GIVEAWAYS & SOUVENIRS ====\n" +
    "- Wooden Ref Magnet: P49 (regular), P55 (with photo) — 5% discount for 70+ pcs\n" +
    "- Photo Ref Magnet: P20 (min 10)\n" +
    "- Bubble Head Magnet: P39\n" +
    "- Button Pin Badge: P20\n" +
    "- Acrylic Keychain: P18\n" +
    "- Faux Leather Bag Charm: P45\n" +
    "- 3D Name Charm: P55 (1 name), P90 (2 names)\n" +
    "- 3D Football Jersey Charm: P75\n" +
    "- 3D Emergency Whistle: P49 (1 color, P47 for 12+), P59 (two-tone, P57 for 12+)\n" +
    "- Chip/Candy Bag: P10-P15 (candies NOT included)\n" +
    "- Paperbag Loot Bag: P35 (min 10)\n" +
    "- Reusable Loot Bag: P65-P85 (min 10)\n" +
    "- Activity Book: P55\n" +
    "- Mini Pillow: P59-P79\n" +
    "- Pocket Mirror: P55-P57\n" +
    "- Cord Organizer: P25\n" +
    "- Magnetic Bookmark: P29-P39\n\n" +
    "==== PAINT KITS ====\n" +
    "- Mini Series (Lego/Safari/Garden/Peppa/Dino/Cars/Dessert/Monster Inc): P45/set\n" +
    "- Unicorn/Mermaid/Tropical/Tools: P49/set\n" +
    "- Name Kit in Pouch (3-5 letters + free figurine): P55 (+P8/extra letter)\n" +
    "- Mix Character Set in Box: P75\n" +
    "- Name Painting Kit in Box (2-5 letters): P80 (+P8/extra letter)\n\n" +
    "==== MUGS & DRINKWARE ====\n" +
    "- Full Print Mug: P65 (min 30, no packaging), P80 (with ribbon), P95 (with box) +P5 personalized\n" +
    "- Customized Clear Mug: P85 (plastic+ribbon), P95 (box+ribbon)\n" +
    "- Mug with Bamboo Lid & Handle: P285\n" +
    "- Clear Mug + Wooden Coaster: P215/set\n" +
    "- Coffee Glass Cup with Straw: P115, P135 (box)\n" +
    "- Soda Cup Tumbler: P185\n" +
    "- Customized Tumbler: P95\n" +
    "- Sports Jug: P159\n" +
    "- Printed Mug + Rubber Coaster: P155/set\n" +
    "- Mr & Mrs Gift Box: P485\n\n" +
    "==== ENGRAVED WOODEN ====\n" +
    "- Engraved Coaster: P79 (no box), P110 (with box+ribbon) +P10 other design\n" +
    "- Wooden Desk Clock: P215 (text), P230 (logo+text)\n" +
    "- Engraved Spoon & Fork: P155/set\n" +
    "- Engraved Wooden Fan: P65\n" +
    "- Engraved Cellphone Stand: P75 (1 side), P90 (2 sides)\n" +
    "- Back Scratcher: P65\n\n" +
    "==== BAG TAGS ====\n" +
    "- Rectangular: P59 (+P10 dual color)\n" +
    "- Luggage Tag: P79\n" +
    "- Circle Tag: P79\n" +
    "- Floral Tag: P59\n" +
    "- Fruits Tag: P69\n" +
    "- Dino Tag: P85\n" +
    "- Crayon Tag: P85\n" +
    "- Penguin Tag: P98\n" +
    "- Minnie Mouse Tag: P98\n" +
    "- Jurassic Tag: P120\n" +
    "- Custom Bag Tags: price depends on design/colors (min 10 pcs)\n\n" +
    "==== BAGS ====\n" +
    "- Canvas Tote Bag: P115 (customized), P135 (personalized) 12x14in\n" +
    "- Black Tote Bag: P155 (name/initial), P185 (full print) 12x14in\n" +
    "- Burlap Bag: P290 (small), P395 (medium)\n\n" +
    "==== ACCESSORIES ====\n" +
    "- Pocket Mirror: P55 (glossy), P57 (glitter)\n" +
    "- Card Holder: P65 (7 colors)\n" +
    "- Mini Jewelry Box: P159\n" +
    "- Mini Pillow: P59-P79\n" +
    "- Mini Magnetic Bookmark: P29-P39\n\n" +
    "==== ON-SITE LIVE PRINTING ====\n" +
    "- Pouch 8x6in: P6,999 (30pcs), P8,999 (50pcs), P12,999 (80pcs)\n" +
    "- Bag 10x12in: P7,999 (30pcs), P11,999 (50pcs), P18,999 (80pcs)\n" +
    "- Includes: 3-4hrs on-site, booth, letters A-Z, 15-20 designs\n" +
    "- +P300 transpo Cebu City, +P400 Mandaue\n\n" +
    "==== ORDER PROCESS ====\n" +
    "1. Ask what item and event type\n" +
    "2. Ask quantity and names (if personalized)\n" +
    "3. Ask color/theme/design + event date\n" +
    "4. Production: 5-14 days (excl Sundays)\n" +
    "5. Collect: Name, Address, Contact, Order details, Theme, Label detail\n" +
    "6. Payment: GCash/Maya 09272879339, Uno Digital Bank 30007019344326\n" +
    "7. 50% DP required within 24hrs to start production\n" +
    "8. Delivery: Maxim/Grab/Lalamove (customer books) or J&T nationwide\n" +
    "9. Pickup: Minglanilla Lower Pakigne (Mon-Sat 11am-7pm)\n" +
    "10. Design files: send to Meregypt@gmail.com\n" +
    "11. Photos: high resolution close-up required\n\n" +
    "GENERAL REPLY RULES (very important):\n" +
    "- ALWAYS keep replies SHORT. Maximum 5 lines per message.\n" +
    "- If customer says 'HM', 'how much', or 'magkano' WITHOUT specifying an item, reply:\n" +
    "  'Which item are you looking for? 😊\n" +
    "   Check our full list here: https://kraftybi.my.canva.site'\n" +
    "- If customer asks about an event without specifying items, reply:\n" +
    "  'What item are you looking for? 😊\n" +
    "   See all products: https://kraftybi.my.canva.site'\n" +
    "- Always be direct. Never give long explanations unless asked.\n" +
    "- When giving prices, use this format:\n" +
    "  [Item]: P[price] ([short note])\n" +
    "- End every product reply with: 'Full list: https://kraftybi.my.canva.site'\n\n" +
    "When order is confirmed, end with this hidden tag:\n" +
    "ORDER_SAVED:{\"name\":\"...\",\"event\":\"...\",\"date\":\"...\",\"address\":\"...\",\"contact\":\"...\",\"items\":[{\"item\":\"...\",\"qty\":1,\"price\":0}],\"subtotal\":0}";
}

// ── 1. Webhook Verification ──────────────────────────────────
app.get("/webhook", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else res.sendStatus(403);
});

// ── 2. Receive Messages ──────────────────────────────────────
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object !== "page") return res.sendStatus(404);

  for (const entry of body.entry) {
    for (const event of entry.messaging) {
      if (!event.message || event.message.is_echo) continue;
      const senderId = event.sender.id;
      const userText = event.message.text;
      if (!userText) continue;

      console.log("Message from " + senderId + ": " + userText);
      trackAnalytics(userText);
      await sendTyping(senderId);

      if (!conversations[senderId]) conversations[senderId] = [];
      conversations[senderId].push({ role: "user", content: userText });
      if (conversations[senderId].length > 20)
        conversations[senderId] = conversations[senderId].slice(-20);

      try {
        const reply = await callGroq(conversations[senderId], buildSystemPrompt(senderId));

        const orderMatch = reply.match(/ORDER_SAVED:(\{[\s\S]*?\})/);
        if (orderMatch) {
          try {
            const orderData = JSON.parse(orderMatch[1]);
            saveCustomerData(senderId, orderData);
            saveOrder(senderId, orderData);
          } catch(e) {}
        }

        const cleanReply = reply.replace(/ORDER_SAVED:[\s\S]*/, "").trim();
        conversations[senderId].push({ role: "assistant", content: cleanReply });
        await sendMessage(senderId, cleanReply);
      } catch (err) {
        console.error("Groq error:", err.message);
        await sendMessage(senderId, "Sorry, there was a technical issue. Please try again! 😅");
      }
    }
  }
  res.sendStatus(200);
});

// ── 3. Save Customer ─────────────────────────────────────────
function saveCustomerData(senderId, orderData) {
  const customers = loadJSON(MEMORY_FILE, {});
  if (!customers[senderId]) customers[senderId] = { name: orderData.name, orders: [] };
  else if (orderData.name) customers[senderId].name = orderData.name;
  customers[senderId].orders = customers[senderId].orders || [];
  customers[senderId].orders.push({
    date: orderData.date, event: orderData.event,
    items: orderData.items, subtotal: orderData.subtotal,
    createdAt: new Date().toISOString()
  });
  if (customers[senderId].orders.length > 5)
    customers[senderId].orders = customers[senderId].orders.slice(-5);
  saveJSON(MEMORY_FILE, customers);

  const analytics = loadJSON(ANALYTICS_FILE, { popular: {}, questions: {} });
  (orderData.items || []).forEach(function(it) {
    analytics.popular[it.item] = (analytics.popular[it.item] || 0) + (it.qty || 1);
  });
  saveJSON(ANALYTICS_FILE, analytics);
}

// ── 4. Save Order ────────────────────────────────────────────
function saveOrder(senderId, orderData) {
  const orders = loadJSON(ORDERS_FILE, []);
  orders.unshift({
    id: Date.now(), senderId,
    name: orderData.name || "Unknown",
    event: orderData.event || "-",
    date: orderData.date || "-",
    address: orderData.address || "-",
    contact: orderData.contact || "-",
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    createdAt: new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })
  });
  if (orders.length > 100) orders.pop();
  saveJSON(ORDERS_FILE, orders);
}

// ── 5. Track Analytics ───────────────────────────────────────
function trackAnalytics(text) {
  const analytics = loadJSON(ANALYTICS_FILE, { popular: {}, questions: {} });
  const keywords = ["magnet","mug","tumbler","bag","tag","keychain","coaster","pen","pencil","notebook","pillow","charm","clicker","giveaway","souvenir","price","how much","rush","delivery","color","photo","design","custom","corporate","birthday","wedding","christening","graduation","school","back to school"];
  keywords.forEach(function(kw) {
    if (text.toLowerCase().includes(kw))
      analytics.questions[kw] = (analytics.questions[kw] || 0) + 1;
  });
  saveJSON(ANALYTICS_FILE, analytics);
}

// ── 6. Dashboard ─────────────────────────────────────────────
app.get("/dashboard", (req, res) => {
  const orders    = loadJSON(ORDERS_FILE, []);
  const customers = loadJSON(MEMORY_FILE, {});
  const analytics = loadJSON(ANALYTICS_FILE, { popular: {}, questions: {} });

  const totalCustomers = Object.keys(customers).length;
  const totalOrders    = orders.length;
  const totalRevenue   = orders.reduce(function(s, o) { return s + (o.subtotal || 0); }, 0);
  const popular   = Object.entries(analytics.popular).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const questions = Object.entries(analytics.questions).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const ordersHTML = orders.map(function(o, i) {
    return "<div class='order-card'>" +
      "<div class='order-header'><span class='order-num'>Order #" + (totalOrders - i) + "</span><span class='order-time'>" + o.createdAt + "</span></div>" +
      "<div class='order-grid'>" +
      "<div><span class='label'>👤 Name</span> " + o.name + "</div>" +
      "<div><span class='label'>📍 Address</span> " + o.address + "</div>" +
      "<div><span class='label'>📅 Event Date</span> " + o.date + "</div>" +
      "<div><span class='label'>🎉 Event</span> " + o.event + "</div>" +
      "<div><span class='label'>📞 Contact</span> " + o.contact + "</div>" +
      "</div>" +
      "<table class='breakdown'><tr><th>Item</th><th>Qty</th><th>Price</th></tr>" +
      (o.items || []).map(function(it) {
        return "<tr><td>" + it.item + "</td><td>" + it.qty + "</td><td>P" + ((it.price || 0) * (it.qty || 1)).toLocaleString() + "</td></tr>";
      }).join("") +
      "<tr class='total-row'><td colspan='2'><b>Subtotal</b></td><td><b>P" + (o.subtotal || 0).toLocaleString() + "</b></td></tr>" +
      "<tr><td colspan='2'>Delivery</td><td>Lalamove/Maxim rate</td></tr>" +
      "</table></div>";
  }).join("") || "<p style='color:#aaa;text-align:center'>No orders yet</p>";

  res.send("<!DOCTYPE html><html><head><title>KraftyBI Dashboard</title>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif;background:#fff0f8;padding:16px}" +
    "h1{color:#e91e8c;font-size:22px;margin-bottom:16px}h2{color:#e91e8c;font-size:15px;margin-bottom:10px}" +
    ".overview{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}" +
    ".stat{background:#fff;border-radius:12px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(233,30,140,0.1)}" +
    ".stat-num{font-size:26px;font-weight:bold;color:#e91e8c}.stat-label{font-size:11px;color:#888;margin-top:4px}" +
    ".section{background:#fff;border-radius:12px;padding:14px;margin-bottom:14px;box-shadow:0 2px 8px rgba(233,30,140,0.08)}" +
    ".order-card{background:#fff5fb;border-radius:10px;padding:12px;margin-bottom:12px;border-left:4px solid #e91e8c}" +
    ".order-header{display:flex;justify-content:space-between;margin-bottom:8px}" +
    ".order-num{font-weight:bold;color:#e91e8c;font-size:13px}.order-time{font-size:11px;color:#aaa}" +
    ".order-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px;font-size:12px}" +
    ".label{font-weight:bold;color:#666;margin-right:4px}" +
    ".breakdown{width:100%;border-collapse:collapse;font-size:12px}" +
    ".breakdown th{background:#fce4f3;padding:6px;text-align:left;color:#e91e8c}" +
    ".breakdown td{padding:6px;border-bottom:1px solid #fce4f3}" +
    ".total-row td{background:#fff0f8;font-weight:bold}" +
    "table.sm{width:100%;border-collapse:collapse;font-size:13px}" +
    "table.sm td,table.sm th{padding:7px;border-bottom:1px solid #fce4f3}" +
    "table.sm th{color:#e91e8c}" +
    ".badge{background:#e91e8c;color:#fff;border-radius:20px;padding:2px 8px;font-size:11px}</style>" +
    "</head><body>" +
    "<h1>🎀 KraftyBI Arts & Crafts Dashboard</h1>" +
    "<div class='overview'>" +
    "<div class='stat'><div class='stat-num'>" + totalCustomers + "</div><div class='stat-label'>Customers</div></div>" +
    "<div class='stat'><div class='stat-num'>" + totalOrders + "</div><div class='stat-label'>Orders</div></div>" +
    "<div class='stat'><div class='stat-num'>P" + totalRevenue.toLocaleString() + "</div><div class='stat-label'>Revenue</div></div>" +
    "</div>" +
    "<div class='section'><h2>📦 Orders</h2>" + ordersHTML + "</div>" +
    "<div class='section'><h2>🏆 Popular Items</h2><table class='sm'><tr><th>Item</th><th>Times Ordered</th></tr>" +
    (popular.map(function(e) { return "<tr><td>" + e[0] + "</td><td><span class='badge'>" + e[1] + "x</span></td></tr>"; }).join("") || "<tr><td colspan='2' style='color:#aaa'>No data yet</td></tr>") +
    "</table></div>" +
    "<div class='section'><h2>❓ Most Asked</h2><table class='sm'><tr><th>Keyword</th><th>Times Asked</th></tr>" +
    (questions.map(function(e) { return "<tr><td>" + e[0] + "</td><td><span class='badge'>" + e[1] + "x</span></td></tr>"; }).join("") || "<tr><td colspan='2' style='color:#aaa'>No data yet</td></tr>") +
    "</table></div></body></html>");
});

// ── 7. Groq API ──────────────────────────────────────────────
async function callGroq(messages, systemPrompt) {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: systemPrompt }].concat(messages),
      max_tokens: 600,
      temperature: 0.7
    },
    { headers: { "Authorization": "Bearer " + GROQ_API_KEY, "Content-Type": "application/json" } }
  );
  return res.data.choices[0].message.content;
}

// ── 8. Send Message ──────────────────────────────────────────
async function sendMessage(recipientId, text) {
  const chunks = splitMessage(text, 1900);
  for (var i = 0; i < chunks.length; i++) {
    await axios.post(
      "https://graph.facebook.com/v19.0/me/messages?access_token=" + PAGE_ACCESS_TOKEN,
      { recipient: { id: recipientId }, message: { text: chunks[i] } }
    );
  }
}

// ── 9. Typing ────────────────────────────────────────────────
async function sendTyping(recipientId) {
  await axios.post(
    "https://graph.facebook.com/v19.0/me/messages?access_token=" + PAGE_ACCESS_TOKEN,
    { recipient: { id: recipientId }, sender_action: "typing_on" }
  ).catch(function() {});
}

// ── 10. Split Messages ───────────────────────────────────────
function splitMessage(text, maxLen) {
  if (text.length <= maxLen) return [text];
  var chunks = [], start = 0;
  while (start < text.length) {
    var end = start + maxLen;
    if (end < text.length) {
      var b = text.lastIndexOf("\n", end) || text.lastIndexOf(" ", end);
      if (b > start) end = b;
    }
    chunks.push(text.slice(start, end).trim());
    start = end;
  }
  return chunks;
}

// ── 11. Health Check ─────────────────────────────────────────
app.get("/", function(req, res) {
  res.send("KraftyBI Arts & Crafts Bot is running! 🎀");
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});
