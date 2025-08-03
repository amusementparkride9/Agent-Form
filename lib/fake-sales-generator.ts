// Fake Sales Generator using Gemini AI
// This generates realistic fake sales data and sends to Slack only (NOT Google Sheets)

interface FakeSaleData {
  customerName: string;
  agentName: string;
  selectedProvider: string;
  selectedPackage: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

const REAL_AGENTS = [
  "Sarah Johnson", "Mike Rodriguez", "Emily Chen", "David Thompson", 
  "Jessica Miller", "Ryan Cooper", "Amanda Davis", "Chris Anderson",
  "Nicole Brown", "Kevin Garcia", "Stephanie Wilson", "Brandon Lee",
  "Rachel Martinez", "Tyler Jackson", "Ashley White", "Jordan Taylor"
];

const PROVIDERS_AND_PACKAGES = {
  "Frontier Fiber": [
    "Fiber 200 - 200 Mbps - $50/mo",
    "Fiber 500 - 500 Mbps - $70/mo",
    "Fiber Gig - 1 Gbps - $90/mo",
    "Fiber 2 Gig - 2 Gbps - $150/mo"
  ],
  "Frontier Copper": [
    "DSL Basic - 25 Mbps - $40/mo",
    "DSL Plus - 50 Mbps - $55/mo"
  ],
  "Optimum": [
    "Core - 300 Mbps - $40/mo",
    "1 Gig - 1 Gbps - $70/mo",
    "8 Gig - 8 Gbps - $180/mo"
  ],
  "Metronet": [
    "100 Mbps - $50/mo",
    "500 Mbps - $70/mo", 
    "Gig - 1 Gbps - $80/mo"
  ],
  "Kinetic": [
    "Internet 25 - 25 Mbps - $45/mo",
    "Internet 100 - 100 Mbps - $65/mo",
    "Gig - 1 Gbps - $85/mo"
  ],
  "Spectrum": [
    "Internet Ultra - 400 Mbps",
    "Internet Gig - 1000 Mbps", 
    "Internet Ultra + TV Choice",
    "Internet Gig + TV Select + Mobile",
    "Internet + TV + Phone Bundle"
  ],
  "BrightSpeed Fiber": [
    "Fiber 100 - 100 Mbps",
    "Fiber 500 - 500 Mbps",
    "Fiber Gig - 1 Gbps"
  ],
  "BrightSpeed Copper": [
    "DSL 25 - 25 Mbps",
    "DSL 50 - 50 Mbps",
    "DSL 100 - 100 Mbps"
  ],
  "Altafiber": [
    "Fiber 500 - 500 Mbps",
    "Fiber Gig - 1 Gbps",
    "Fiber 2 Gig - 2 Gbps"
  ]
};

export async function generateFakeSaleWithGemini(): Promise<FakeSaleData> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    // Fallback to predefined data if no Gemini API key
    return generateFallbackFakeSale();
  }

  try {
    const prompt = `Generate a realistic fake customer for an internet sales company. Return ONLY a JSON object with this exact format:
{
  "customerName": "realistic full name",
  "email": "realistic email address",
  "phone": "realistic US phone number in format (555) 555-5555", 
  "city": "real US city name",
  "state": "2-letter state code"
}

Make it diverse and realistic. No explanations, just the JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini');
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const customerData = JSON.parse(jsonMatch[0]);
    
    // Add provider and package info
    const providers = Object.keys(PROVIDERS_AND_PACKAGES);
    const selectedProvider = providers[Math.floor(Math.random() * providers.length)];
    const packages = PROVIDERS_AND_PACKAGES[selectedProvider as keyof typeof PROVIDERS_AND_PACKAGES];
    const selectedPackage = packages[Math.floor(Math.random() * packages.length)];
    const agentName = REAL_AGENTS[Math.floor(Math.random() * REAL_AGENTS.length)];

    return {
      ...customerData,
      agentName,
      selectedProvider,
      selectedPackage
    };

  } catch (error) {
    console.error('Gemini API failed, using fallback:', error);
    return generateFallbackFakeSale();
  }
}

function generateFallbackFakeSale(): FakeSaleData {
  const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Helen", "Mark", "Sandra", "Donald", "Donna"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
  ];

  const cities = [
    { city: "New York", state: "NY" }, { city: "Los Angeles", state: "CA" },
    { city: "Chicago", state: "IL" }, { city: "Houston", state: "TX" },
    { city: "Phoenix", state: "AZ" }, { city: "Philadelphia", state: "PA" },
    { city: "San Antonio", state: "TX" }, { city: "San Diego", state: "CA" },
    { city: "Dallas", state: "TX" }, { city: "San Jose", state: "CA" },
    { city: "Austin", state: "TX" }, { city: "Jacksonville", state: "FL" },
    { city: "Fort Worth", state: "TX" }, { city: "Columbus", state: "OH" },
    { city: "Charlotte", state: "NC" }, { city: "San Francisco", state: "CA" },
    { city: "Indianapolis", state: "IN" }, { city: "Seattle", state: "WA" },
    { city: "Denver", state: "CO" }, { city: "Washington", state: "DC" }
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const customerName = `${firstName} ${lastName}`;
  
  const location = cities[Math.floor(Math.random() * cities.length)];
  const agentName = REAL_AGENTS[Math.floor(Math.random() * REAL_AGENTS.length)];
  
  const providers = Object.keys(PROVIDERS_AND_PACKAGES);
  const selectedProvider = providers[Math.floor(Math.random() * providers.length)];
  const packages = PROVIDERS_AND_PACKAGES[selectedProvider as keyof typeof PROVIDERS_AND_PACKAGES];
  const selectedPackage = packages[Math.floor(Math.random() * packages.length)];

  // Generate realistic email
  const emailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"];
  const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
  const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  const email = `${emailPrefix}@${emailDomain}`;

  // Generate realistic phone number
  const areaCode = Math.floor(Math.random() * 899) + 100; // 100-999
  const exchange = Math.floor(Math.random() * 899) + 100; // 100-999  
  const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const phone = `(${areaCode}) ${exchange}-${number}`;

  return {
    customerName,
    agentName,
    selectedProvider,
    selectedPackage,
    email,
    phone,
    city: location.city,
    state: location.state
  };
}

export async function sendFakeSlackNotification(fakeData: FakeSaleData): Promise<boolean> {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhook) return false;

  try {
    // Format to match EXACTLY the real form notifications
    const slackMessage = {
      text: "🚨 New Form Submission!",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "🚨 New Internet Order Form" }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Customer:*\n${fakeData.customerName}` },
            { type: "mrkdwn", text: `*Agent:*\n${fakeData.agentName}` },
            { type: "mrkdwn", text: `*Provider:*\n${fakeData.selectedProvider}` },
            { type: "mrkdwn", text: `*Package:*\n${fakeData.selectedPackage}` },
            { type: "mrkdwn", text: `*Email:*\n${fakeData.email}` },
            { type: "mrkdwn", text: `*Phone:*\n${fakeData.phone}` }
          ]
        }
      ]
    };

    const response = await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    return response.ok;
  } catch (error) {
    console.error('Fake Slack notification failed:', error);
    return false;
  }
}
