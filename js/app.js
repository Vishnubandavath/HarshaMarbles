(function () {
  "use strict";

  if (typeof CONFIG === "undefined") {
    console.error("config.js must load before app.js");
    return;
  }

  const phoneE164 = "+" + CONFIG.phone;
  const waBase = "https://wa.me/" + CONFIG.whatsapp;

  function waLink(text) {
    const t = encodeURIComponent(text || "Hello");
    return waBase + "?text=" + t;
  }

  /* Navbar scroll */
  const nav = document.querySelector(".navbar");
  function onScroll() {
    if (window.scrollY > 40) nav?.classList.add("scrolled");
    else nav?.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Dynamic links from CONFIG */
  document.querySelectorAll("[data-config-phone]").forEach(function (el) {
    el.setAttribute("href", "tel:" + phoneE164);
  });
  document.querySelectorAll("[data-config-wa]").forEach(function (el) {
    el.setAttribute("href", waLink("Hello"));
  });
  document.querySelectorAll("[data-config-maps]").forEach(function (el) {
    el.setAttribute("href", CONFIG.maps);
  });

  const contactForm = document.getElementById("contact-form");
  if (contactForm && CONFIG.formEndpoint && !CONFIG.formEndpoint.includes("YOUR_ID")) {
    contactForm.setAttribute("action", CONFIG.formEndpoint);
  }

  /* Lead storage */
  const LEAD_KEY = "harsha_marble_lead";

  function getLead() {
    try {
      return JSON.parse(localStorage.getItem(LEAD_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveLead(partial) {
    const cur = getLead();
    Object.assign(cur, partial);
    localStorage.setItem(LEAD_KEY, JSON.stringify(cur));
    return cur;
  }

  async function submitLeadToFormspree(data) {
    if (!CONFIG.formEndpoint || CONFIG.formEndpoint.includes("YOUR_ID")) return false;
    const fd = new FormData();
    fd.append("name", data.name || "");
    fd.append("phone", data.phone || "");
    fd.append("email", data.email || "");
    fd.append(
      "message",
      data.message || "Lead from website chatbot"
    );
    fd.append("_subject", "Marble Polishing — Chat lead");
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /* Chatbot */
  const chatToggle = document.getElementById("chat-toggle");
  const chatPanel = document.getElementById("chat-panel");
  const chatClose = document.getElementById("chat-close");
  const chatMessages = document.getElementById("chat-messages-inner");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const quickBtns = document.querySelectorAll("[data-chat-quick]");

  let quoteStep = null;

  const responses = {
    price:
      "Our indicative rates: Marble ₹10/sq.ft, Mosaic ₹15/sq.ft. Final quote depends on area and stone condition. We can schedule a site visit in Hyderabad — shall we note your area?",
    services:
      "We offer: Marble polishing, Italian marble diamond polishing, granite polishing, kota stone, tandur stone polishing, and tile cleaning — using professional equipment and safe chemicals.",
    location:
      "Visit us at " +
      CONFIG.address +
      ". Tap Location in the footer or the map link to open Google Maps. We serve Shaikpet and all of Hyderabad.",
    contact:
      "Phone / WhatsApp: " +
      phoneE164 +
      " (24/7). Full address and map: scroll to Contact on this page, or use the Location button.",
    productsIntro:
      "Harsha Naik Marble Polishing Service in Shaikpet has a wide range of products and services for different customer needs. Our team is courteous and quick to help, and we answer your queries clearly. For the full address, phone, and map, open the Contact section at the top of this page (or use the menu).",
    faqMenu:
      "Ask about durability, flooring, designs, delivery, bathroom marble, or marble for home — or type 1 to 6. I can also help with price, services, and location.",
  };

  const faqByNumber = {
    1: "Is marble a durable material? — Yes. Marble is highly durable and does not need replacement for years. Regular cleaning and polishing keep the quality intact.",
    2: "Can I use marble for flooring? — Yes. Marble is an excellent choice for home or office flooring. Earthy, neutral colours and patterns help reduce visible dust.",
    3: "What marble designs are available? — We are among the trusted marble polishing dealers in Hyderabad. Contact us directly to discuss the variety of marble and finishes that suit your project.",
    4: "Do you deliver marble to the construction site? — Many dealers offer delivery depending on order size and location. Please contact us with your site details and we will confirm what is possible.",
    5: "Which marble is best for a bathroom? — Granoblastic-texture marble in white or black works well. Waterproof the surface as needed; for wet areas, follow expert advice on finish (polish vs. slip-safe texture).",
    6: "Best types of marble for home? — Options include Italian marble, Indian marble, onyx, Jodhpur pink, and more — choice depends on budget, traffic, and look. We can guide you after understanding your space.",
  };

  function addMsg(text, from) {
    const div = document.createElement("div");
    div.className = "msg " + (from === "user" ? "user" : "bot");
    div.style.whiteSpace = "pre-wrap";
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
  }

  function addFaqFull() {
    var lines = [
      "FREQUENTLY ASKED QUESTIONS",
      "",
      faqByNumber[1],
      "",
      faqByNumber[2],
      "",
      faqByNumber[3],
      "",
      faqByNumber[4],
      "",
      faqByNumber[5],
      "",
      faqByNumber[6],
    ];
    addMsg(lines.join("\n"), "bot");
  }

  function politeFallback(userText) {
    var lower = userText.toLowerCase().replace(/[^\w\s\u0900-\u0fff]/g, " ");
    var keywords = [
      "marble",
      "granite",
      "polish",
      "polishing",
      "floor",
      "flooring",
      "stone",
      "kota",
      "tandur",
      "italian",
      "tile",
      "shine",
      "scratch",
      "seal",
      "hyderabad",
      "shaikpet",
      "villa",
      "office",
      "commercial",
      "restoration",
      "honing",
      "diamond",
    ];
    var found = null;
    for (var i = 0; i < keywords.length; i++) {
      if (lower.indexOf(keywords[i]) !== -1) {
        found = keywords[i];
        break;
      }
    }
    if (found) {
      return (
        "Thank you for your message. At Harsha Naik Marble Polishing we specialise in marble, granite, and stone care in Hyderabad — including polishing, restoration, and sealing. Your note mentioned \"" +
        found +
        "\" — for accurate advice we usually do a quick site check. Please call or WhatsApp " +
        phoneE164 +
        " (24/7), or use Get quote below. We're glad to help politely and clearly."
      );
    }
    return (
      "Thank you for reaching out. We focus on marble polishing, granite polishing, and floor care in Hyderabad. For our full address and contact details, scroll to the Contact section on this page. You can also tap Price, Services, Location, About us, or FAQ — or call / WhatsApp " +
      phoneE164 +
      " anytime."
    );
  }

  function matchFaqAnswer(lower) {
    var t = lower.trim();
    if (/^[1-6]$/.test(t)) return faqByNumber[parseInt(t, 10)];
    if (/^(faq|question)\s*[1-6]$/i.test(t)) {
      var n = parseInt(t.replace(/\D/g, ""), 10);
      if (n >= 1 && n <= 6) return faqByNumber[n];
    }
    if (
      /\bdurable|durability|how long|years|replacement\b/.test(lower) &&
      !/\bfloor|bathroom|bath\b/.test(lower)
    )
      return faqByNumber[1];
    if (
      /\bflooring\b/.test(lower) ||
      (/\bfloor\b/.test(lower) && /\bmarble\b/.test(lower) && !/\bbathroom\b/.test(lower))
    )
      return faqByNumber[2];
    if (/\bvariety|designs?|dealer|which marble|what marble\b/.test(lower)) return faqByNumber[3];
    if (/\bdeliver|delivery|construction site\b/.test(lower)) return faqByNumber[4];
    if (/\bbathroom|bath\b/.test(lower)) return faqByNumber[5];
    if (/\bbest marble|italian marble|onyx|jodhpur|marble for home\b/.test(lower)) return faqByNumber[6];
    return null;
  }

  function handleUserText(raw) {
    const text = raw.trim();
    if (!text) return;

    addMsg(text, "user");

    if (quoteStep === "name") {
      saveLead({ name: text });
      quoteStep = "phone";
      addMsg("Thanks! What's your phone number?", "bot");
      return;
    }

    if (quoteStep === "phone") {
      saveLead({ phone: text });
      quoteStep = null;
      const lead = getLead();
      addMsg("Got it! We'll reach out soon. You can also continue on WhatsApp.", "bot");
      submitLeadToFormspree({
        name: lead.name,
        phone: lead.phone,
        message: "Quote request via chatbot",
      });
      return;
    }

    const lower = text.toLowerCase();
    var faqHit = matchFaqAnswer(lower);
    if (faqHit) {
      addMsg(faqHit, "bot");
      return;
    }

    if (/\bfaq|frequently asked|questions?\b/.test(lower) && lower.length < 40) {
      addFaqFull();
      return;
    }

    if (lower.includes("price") || lower.includes("rate") || lower.includes("sq.ft") || lower.includes("cost"))
      addMsg(responses.price, "bot");
    else if (lower.includes("service") || lower.includes("what do you do") || lower.includes("polishing work"))
      addMsg(responses.services, "bot");
    else if (lower.includes("location") || lower.includes("map") || lower.includes("address") || lower.includes("where"))
      addMsg(responses.location, "bot");
    else if (lower.includes("contact") || lower.includes("call") || lower.includes("phone") || lower.includes("whatsapp"))
      addMsg(responses.contact, "bot");
    else if (lower.includes("about") || lower.includes("who are you") || lower.includes("establishment"))
      addMsg(responses.productsIntro, "bot");
    else addMsg(politeFallback(text), "bot");
  }

  function openChat() {
    chatPanel?.classList.add("open");
    chatToggle?.setAttribute("aria-expanded", "true");
  }

  function closeChat() {
    chatPanel?.classList.remove("open");
    chatToggle?.setAttribute("aria-expanded", "false");
  }

  chatToggle?.addEventListener("click", function () {
    if (chatPanel?.classList.contains("open")) closeChat();
    else openChat();
  });
  chatClose?.addEventListener("click", closeChat);

  quickBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const key = btn.getAttribute("data-chat-quick");
      if (key === "price") addMsg(responses.price, "bot");
      else if (key === "services") addMsg(responses.services, "bot");
      else if (key === "location") addMsg(responses.location, "bot");
      else if (key === "contact") addMsg(responses.contact, "bot");
      else if (key === "about") addMsg(responses.productsIntro, "bot");
      else if (key === "faq") {
        addMsg(responses.faqMenu, "bot");
        setTimeout(function () {
          addFaqFull();
        }, 400);
      }
    });
  });

  chatSend?.addEventListener("click", function () {
    const v = chatInput.value;
    chatInput.value = "";
    handleUserText(v);
  });

  chatInput?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = chatInput.value;
      chatInput.value = "";
      handleUserText(v);
    }
  });

  document.getElementById("chat-quote-start")?.addEventListener("click", function () {
    openChat();
    quoteStep = "name";
    addMsg("Let's get you a quote. What's your name?", "bot");
  });

  const waHandoff = document.getElementById("chat-wa-handoff");
  if (waHandoff) {
    waHandoff.setAttribute("href", waLink("Hello"));
    waHandoff.addEventListener("click", function () {
      const lead = getLead();
      let t = "Hello";
      if (lead.name || lead.phone) {
        t = "Hello! I'm interested in marble polishing.";
        if (lead.name) t += " My name is " + lead.name + ".";
        if (lead.phone) t += " Phone: " + lead.phone + ".";
      }
      waHandoff.setAttribute("href", waLink(t));
    });
  }

  /* Initial welcome — automated intro + products blurb */
  function initWelcome() {
    if (!chatMessages || chatMessages.children.length > 0) return;
    addMsg(
      "Hi — welcome to Harsha Naik Marble Polishing (Shaikpet, Hyderabad). Tap Price, Services, Location, Contact, About us, or FAQ — or type your question.",
      "bot"
    );
    setTimeout(function () {
      addMsg(responses.productsIntro, "bot");
    }, 400);
    setTimeout(function () {
      addMsg(
        "Tip: Scroll to the Contact section on this page for our full address, map link, and phone. You can also ask about marble durability, flooring, delivery, bathroom marble, and more.",
        "bot"
      );
    }, 850);
  }
  initWelcome();
})();
