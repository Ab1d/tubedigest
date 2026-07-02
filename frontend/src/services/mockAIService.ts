export interface SectionItem {
  number: number;
  title: string;
  summary: string;
  timestamp?: string;
}

export interface AnalogyItem {
  concept: string;
  analogy: string;
  visual?: string;
}

export interface SummaryData {
  id: string;
  videoUrl: string;
  videoId: string;
  videoTitle: string;
  channelName: string;
  duration: string;
  thumbnailUrl: string;
  summary: {
    tldr: string;
    simpleSummary: string[];
    deepSummary: string[];
    sections: SectionItem[];
    analogies: AnalogyItem[];
    keyTakeaways: string[];
  };
  createdAt: string;
}

const MOCK_SUMMARIES: SummaryData[] = [
  {
    id: "quantum-computing",
    videoId: "example1",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    videoTitle: "How Quantum Computing Will Change the World Forever",
    channelName: "Veritasium",
    duration: "18:42",
    thumbnailUrl: "https://i.ytimg.com/vi/7HPYlBMjWnY/hqdefault.jpg",
    summary: {
      tldr: "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously, enabling computers to solve complex problems exponentially faster than classical computers. This technology will revolutionize drug discovery, cryptography, and artificial intelligence within the next decade.",
      sections: [],
      simpleSummary: [
        "Imagine a regular computer as a person flipping light switches — each switch is either on or off, one at a time. A quantum computer is like having a magical hand that can flip all the switches at once, exploring every possible combination simultaneously.",
        "This is possible because quantum computers use something called 'qubits' instead of regular bits. While a normal bit is just 0 or 1, a qubit can be 0, 1, or both at the same time thanks to a quantum property called 'superposition.'",
        "Another key concept is 'entanglement.' When qubits become entangled, the state of one instantly affects the other, no matter how far apart they are. Einstein called this 'spooky action at a distance.' This allows quantum computers to process information in ways that classical computers simply cannot match.",
        "Right now, quantum computers are still in their infancy. They are expensive, fragile, and require temperatures colder than outer space to operate. But companies like Google, IBM, and startups around the world are racing to build practical quantum machines that could transform medicine, finance, and cybersecurity.",
      ],
      deepSummary: [
        "The foundation of quantum computing lies in the principles of quantum mechanics, a branch of physics that describes nature at the smallest scales. Unlike classical computers that process information in binary form (bits), quantum computers leverage the strange behaviors of subatomic particles to perform calculations.",
        "**Qubits: The Building Blocks.** A classical bit is straightforward — it is either 0 or 1. A qubit, however, can exist in a superposition of both states simultaneously. Think of it like a coin spinning in the air: while it is spinning, it is neither heads nor tails, but some combination of both. When you measure the qubit (like catching the coin), it collapses to a definite state.",
        "Superposition gives quantum computers their massive parallel processing capability. Where a classical computer with n bits can represent one of 2^n states at a time, a quantum computer with n qubits can represent all 2^n states simultaneously. This is why quantum computers excel at specific types of problems.",
        "**Quantum Entanglement.** When qubits become entangled, their quantum states become correlated in such a way that the quantum state of each particle cannot be described independently. Measuring one qubit immediately determines the state of its entangled partner, even if they are light-years apart. This property is what Einstein famously called 'spooky action at a distance.'",
        "**Quantum Gates and Circuits.** Just as classical computers use logic gates (AND, OR, NOT) to manipulate bits, quantum computers use quantum gates to manipulate qubits. However, quantum gates operate differently — they rotate the qubit's state on the Bloch sphere, enabling complex transformations that can explore vast solution spaces efficiently.",
        "**Decoherence: The Biggest Challenge.** Qubits are extremely fragile. Any interaction with the environment — heat, electromagnetic radiation, or even vibrations — can cause decoherence, where qubits lose their quantum properties and behave like classical bits. This is why quantum computers are kept at temperatures near absolute zero (-273°C) and shielded from all outside interference.",
        "**Applications with Real Impact.** Quantum simulation could revolutionize drug discovery by modeling molecular interactions at the quantum level. In cryptography, Shor's algorithm can factor large numbers exponentially faster than any classical algorithm, potentially breaking current encryption standards. Grover's algorithm offers quadratic speedup for searching unsorted databases. In finance, quantum optimization could solve portfolio optimization problems that are currently intractable.",
        "**The Current Landscape.** As of 2025, IBM has deployed quantum processors with over 1,000 qubits, though error rates remain a challenge. Google's Sycamore processor achieved quantum supremacy in 2019. Hundreds of startups are working on quantum software, hardware, and error correction. Most experts predict that fault-tolerant quantum computers capable of solving practically useful problems are still 5–10 years away.",
      ],
      analogies: [
        {
          concept: "SUPERPOSITION",
          analogy: "Think of a coin spinning in the air — while it is spinning, it is neither heads nor tails, but some probability of both at the same time. A qubit in superposition is like that spinning coin. Only when it lands (is measured) does it become definitively heads or tails. This is fundamentally different from a normal computer bit, which is like a coin already sitting flat on a table — it is either heads or tails, period.",
          visual: "Imagine a glowing golden coin suspended in mid-air, spinning so fast it becomes a blur of light, with trails of light forming both a heads and tails pattern simultaneously.",
        },
        {
          concept: "QUANTUM ENTANGLEMENT",
          analogy: "Think of entanglement like having two magic dice — no matter how far apart you roll them, they always land on matching numbers. If one shows a 6, the other instantly shows a 6 too, even if it is on the other side of the universe. Einstein called this 'spooky action at a distance.' In quantum computing, this means operations on one qubit can instantly affect its entangled partner, creating powerful computational shortcuts.",
          visual: "Imagine two glowing dice connected by a shimmering golden thread that stretches across a starry sky, both showing the same number simultaneously.",
        },
        {
          concept: "DECOHERENCE",
          analogy: "Imagine trying to balance a pencil perfectly on its tip. In theory, it could stay there forever. But the slightest breeze, vibration, or even someone walking nearby will make it fall. A qubit is like that perfectly balanced pencil — it needs absolute isolation from the environment. Any disturbance causes it to 'fall' from its delicate quantum state back to a regular classical state.",
          visual: "Imagine a delicate crystal pencil balanced on its tip inside a perfectly still, dark glass chamber, with frost forming on the walls as the temperature drops to absolute zero.",
        },
      ],
      keyTakeaways: [
        "Quantum computers can process information exponentially faster than classical computers for specific problems like factoring and simulation.",
        "Superposition allows qubits to exist in multiple states simultaneously, unlike classical bits which are either 0 or 1.",
        "Quantum entanglement enables instant correlation between particles regardless of distance, creating powerful computational shortcuts.",
        "Practical quantum computers are still 5–10 years away from widespread commercial use due to decoherence challenges.",
        "Industries most impacted: drug discovery, financial modeling, cryptography, and artificial intelligence.",
        "Current quantum computers require temperatures near absolute zero and extreme isolation to operate.",
      ],
    },
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "machine-learning",
    videoId: "example2",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    videoTitle: "Machine Learning Explained in 10 Minutes",
    channelName: "3Blue1Brown",
    duration: "10:15",
    thumbnailUrl: "https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg",
    summary: {
      tldr: "Machine Learning is a way for computers to learn patterns from data without being explicitly programmed. By using algorithms that iteratively improve through exposure to examples, machines can recognize images, understand language, make predictions, and even create art. It is the technology behind everything from Netflix recommendations to self-driving cars.",
      sections: [],
      simpleSummary: [
        "Imagine teaching a child to recognize apples. Instead of writing down every possible rule ('red, round, has a stem'), you simply show them thousands of pictures — some apples, some not. Over time, they learn to identify apples on their own. Machine learning works the same way: we feed computers massive amounts of data, and they figure out the patterns themselves.",
        "There are three main types of machine learning. Supervised learning is like having a teacher with answer keys — the computer learns from labeled examples. Unsupervised learning is like exploring a new city without a map — the computer finds hidden patterns on its own. Reinforcement learning is like training a dog with treats — the computer learns through trial and error, getting rewards for good decisions.",
        "At the heart of modern machine learning are neural networks, which are loosely inspired by how the human brain works. These networks contain layers of interconnected 'neurons' that process information. Deep learning uses networks with many layers, allowing computers to understand increasingly complex patterns — from simple edges in an image to recognizing entire faces.",
        "Machine learning is already everywhere: it powers the voice assistant on your phone, recommends your next favorite show, filters spam from your inbox, and helps doctors detect diseases early. As data grows and computers become more powerful, machine learning will continue to transform every industry.",
      ],
      deepSummary: [
        "Machine Learning (ML) is a subset of artificial intelligence that focuses on building systems that can learn from and make decisions based on data. Unlike traditional programming where developers write explicit rules, ML algorithms build mathematical models from training data to make predictions or decisions without being explicitly programmed for every scenario.",
        "**The Three Paradigms of Machine Learning.** Supervised learning trains models on labeled datasets where each input is paired with the correct output. The algorithm learns to map inputs to outputs by minimizing the difference between its predictions and the true labels. Common applications include spam detection, sentiment analysis, and medical diagnosis. Algorithms include linear regression, decision trees, support vector machines, and neural networks.",
        "Unsupervised learning works with unlabeled data, finding hidden structures and patterns. Clustering algorithms like K-means group similar data points together. Dimensionality reduction techniques like PCA help visualize high-dimensional data. These methods are crucial for customer segmentation, anomaly detection, and recommendation systems.",
        "Reinforcement learning involves an agent learning to make decisions by interacting with an environment. The agent receives rewards or penalties based on its actions and learns to maximize cumulative reward over time. This approach has achieved remarkable success in game playing (AlphaGo, AlphaStar), robotics, and autonomous systems.",
        "**Neural Networks and Deep Learning.** Neural networks are composed of layers of artificial neurons, each performing a weighted sum of its inputs followed by a non-linear activation function. The 'deep' in deep learning refers to networks with many hidden layers. Training involves backpropagation — using gradient descent to adjust weights across all layers to minimize prediction error.",
        "Convolutional Neural Networks (CNNs) excel at image processing by using convolutional filters that detect features like edges, textures, and shapes. Recurrent Neural Networks (RNNs) and their modern variant, Transformers, handle sequential data like text and speech. The Transformer architecture, introduced in 2017, powers large language models like GPT and has revolutionized natural language processing.",
        "**Training Challenges and Solutions.** Overfitting occurs when models memorize training data rather than learning generalizable patterns. Techniques like dropout, data augmentation, and regularization help prevent this. The bias-variance tradeoff describes the tension between model simplicity and complexity. Hyperparameter tuning — adjusting learning rates, batch sizes, and network architectures — is crucial for optimal performance.",
        "**Real-World Applications and Ethical Considerations.** Machine learning drives recommendation engines at Netflix and Spotify, powers autonomous vehicles at Tesla and Waymo, enables medical image analysis for early cancer detection, and supports fraud detection in financial services. However, ML systems can perpetuate biases present in training data, raise privacy concerns, and create accountability challenges when automated systems make harmful decisions.",
      ],
      analogies: [
        {
          concept: "SUPERVISED LEARNING",
          analogy: "Supervised learning is like a student preparing for an exam with an answer key. They practice problems, check their answers, and learn from their mistakes. The more practice problems they do (with correct answers), the better they get. Similarly, a supervised learning algorithm sees thousands of labeled examples and adjusts itself to get better at predicting the right answer.",
          visual: "Imagine a student sitting at a desk with a stack of practice papers, each with a red 'correct' stamp. A wise teacher points to each mistake, guiding the student toward understanding.",
        },
        {
          concept: "NEURAL NETWORK",
          analogy: "A neural network is like a massive postal sorting system. Letters (data) come in and pass through multiple sorting stations (layers). At each station, workers (neurons) decide which path to send the letter down based on its features. Early stations might just check if the letter is heavy or light. Later stations look at the destination zip code. By the end, every letter is perfectly sorted — just as a neural network classifies inputs into the right category.",
          visual: "Imagine a vast, glowing conveyor belt system inside a grand cathedral-like building, with millions of tiny luminous gates routing streams of light along branching pathways.",
        },
        {
          concept: "GRADIENT DESCENT",
          analogy: "Gradient descent is like a hiker trying to find the bottom of a valley while blindfolded. They feel the slope under their feet and take a step in the steepest downward direction. They repeat this process until the ground feels flat — they have reached the bottom. In machine learning, the 'valley' represents prediction error, and the algorithm is trying to find the model parameters that minimize this error.",
          visual: "Imagine a blindfolded hiker carefully stepping down a misty mountain slope, with each step taking them closer to a serene valley floor where a clear stream flows.",
        },
      ],
      keyTakeaways: [
        "Machine learning enables computers to learn patterns from data without explicit programming.",
        "The three main types are supervised learning (labeled data), unsupervised learning (finding patterns), and reinforcement learning (trial and error).",
        "Neural networks, inspired by the human brain, are the foundation of modern deep learning.",
        "Convolutional Neural Networks excel at image tasks; Transformers dominate language tasks.",
        "Machine learning powers recommendation systems, voice assistants, medical diagnosis, and autonomous vehicles.",
        "Key challenges include overfitting, bias in training data, and the need for large amounts of quality data.",
      ],
    },
    createdAt: "2025-01-14T16:45:00Z",
  },
  {
    id: "deep-work",
    videoId: "example3",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    videoTitle: "The Science of Deep Work and Focus",
    channelName: "Thomas Frank",
    duration: "14:28",
    thumbnailUrl: "https://i.ytimg.com/vi/gTaJhjQHcf8/hqdefault.jpg",
    summary: {
      tldr: "Deep work is the ability to focus without distraction on cognitively demanding tasks. In our constantly connected world, this skill is becoming increasingly rare and increasingly valuable. By structuring your environment, scheduling focused blocks of time, and eliminating distractions, you can produce higher quality work in less time and achieve meaningful professional goals.",
      sections: [],
      simpleSummary: [
        "Think about the last time you were so absorbed in a task that you lost track of time. That is deep work — intense, distraction-free focus that pushes your cognitive abilities to their limit. It is the state where you do your best thinking, solve the hardest problems, and create your most valuable work.",
        "Most of us today live in a state of 'shallow work' — constantly checking emails, responding to notifications, and jumping between tasks. Research shows that every time you switch tasks, it takes an average of 23 minutes to fully refocus. These constant interruptions destroy our ability to think deeply and creatively.",
        "Deep work is not just about being more productive — it is about doing work that matters. In a world full of distractions, the ability to focus deeply is becoming a superpower. It allows you to learn complex skills faster, produce higher quality output, and stand out professionally.",
        "The good news is that deep work is a skill you can develop. Start by scheduling specific blocks of time for focused work. Turn off all notifications. Create rituals that signal to your brain that it is time to focus. Over time, your ability to concentrate will strengthen, just like a muscle.",
      ],
      deepSummary: [
        "Deep Work, a concept popularized by Cal Newport, refers to professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. These efforts create new value, improve your skill, and are hard to replicate. In our hyper-connected world, deep work is becoming both increasingly rare and increasingly valuable.",
        "**The Cognitive Cost of Context Switching.** Research from the University of California, Irvine shows that knowledge workers switch tasks every 3 minutes on average. After each interruption, it takes approximately 23 minutes to return to the original task. This 'attention residue' — fragments of previous tasks lingering in working memory — significantly degrades cognitive performance. Gloria Mark's research demonstrates that as we become more accustomed to interruptions, our attention spans actually shrink over time.",
        "**The Deep Work Hypothesis.** Cal Newport argues that the ability to perform deep work is becoming the superpower of the 21st century knowledge economy. As AI and automation handle more routine tasks, the value of deep cognitive work increases. Two core abilities thrive in this economy: the ability to quickly master hard things, and the ability to produce at an elite level in terms of both quality and speed. Both require deep work.",
        "**The Neuroscience of Focus.** When we focus deeply, our brains enter a state of 'flow,' described by Mihaly Csikszentmihalyi. In this state, the prefrontal cortex shows decreased activity in the transient hypofrontality phenomenon, allowing for heightened performance and creative insights. Myelin, the fatty tissue that wraps around neurons, increases with deep practice, making neural circuits fire faster and more efficiently.",
        "**Strategies for Deep Work.** The Monastic Philosophy involves eliminating shallow obligations entirely — retreating to focused work for extended periods. The Bimodal Philosophy divides your time into deep work periods and open periods. The Rhythmic Philosophy establishes a regular habit of deep work sessions. The Journalistic Philosophy fits deep work into available time slots throughout the day.",
        "**Environmental Design.** Your physical and digital environment profoundly impacts your ability to focus. Create a dedicated workspace for deep work. Use website blockers during focus sessions. The 'grand gesture' approach — such as checking into a hotel for a day of focused work — can signal psychological commitment to deep work. Keep your phone in another room.",
        "**The Four Disciplines of Execution.** Focus on the wildly important — identify a small number of ambitious goals. Act on lead measures — track behaviors that drive success (hours of deep work), not just outcomes. Keep a compelling scoreboard — a visible record of your deep work hours. Create a cadence of accountability — regular reviews of your progress.",
        "**Recovery and Sustainable Practice.** Deep work is cognitively demanding and requires adequate rest. The workday is not uniformly suited for deep work — most people peak in the morning. Strategic use of evening downtime, quality sleep, and deliberate rest actually enhances deep work capacity. Working 4 hours of deep focus often produces more value than 8 hours of distracted effort.",
      ],
      analogies: [
        {
          concept: "CONTEXT SWITCHING COST",
          analogy: "Imagine trying to write a novel while also being a restaurant hostess. Every few minutes, someone walks in and you have to greet them, find a table, and then return to your writing. Each interruption breaks your creative flow. By the time you settle back into writing, another guest arrives. After eight hours, you have been 'working' all day but barely written a page. That is what constant task-switching does to your brain — it keeps you busy but destroys your ability to produce meaningful work.",
          visual: "Imagine an author at a beautiful oak desk with a half-written manuscript, constantly being interrupted by a bell ringing, forcing them to get up and leave the room each time.",
        },
        {
          concept: "MYELIN BUILDING",
          analogy: "Think of deep work like paving a highway. The first time you drive through a forest, it is slow and difficult — just a dirt path. But every time you travel that same route, you pave it more, add lanes, and smooth the surface. Eventually, it becomes a superhighway where information travels at incredible speed. Deep work literally builds myelin around your neural pathways, making your brain faster and more efficient at specific tasks.",
          visual: "Imagine a narrow dirt path through a dense forest gradually transforming into a gleaming multi-lane highway, with bright white light traveling along it at increasing speeds.",
        },
        {
          concept: "ATTENTION RESIDUE",
          analogy: "Attention residue is like trying to read a book while a TV plays in the background. Even if you are not watching the TV, fragments of sound and motion keep pulling at the edge of your awareness. You can read the words, but they do not sink in. Similarly, when you check an email and then return to a report, part of your brain is still thinking about that email. The residue of the previous task contaminates your current focus, making deep thinking impossible.",
          visual: "Imagine a person reading a book at a desk while ghostly, semi-transparent images of emails and notifications float around their head like persistent spirits, pulling their attention away from the page.",
        },
      ],
      keyTakeaways: [
        "Deep work — intense, distraction-free focus — is the most valuable skill in the modern knowledge economy.",
        "Context switching costs an average of 23 minutes of lost focus per interruption.",
        "The ability to focus deeply is like a muscle — it strengthens with regular practice and weakens when neglected.",
        "Schedule specific blocks of time for deep work and protect them as you would any important meeting.",
        "Environmental design matters: remove distractions, turn off notifications, and create dedicated focus spaces.",
        "Recovery is essential: deep work is cognitively demanding and requires quality rest for sustained performance.",
      ],
    },
    createdAt: "2025-01-13T09:15:00Z",
  },
];

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return 'unknown';
}

export function getRandomSummary(videoUrl: string): SummaryData {
  const randomIndex = Math.floor(Math.random() * MOCK_SUMMARIES.length);
  const mock = MOCK_SUMMARIES[randomIndex];
  return {
    ...mock,
    id: `${mock.id}-${Date.now()}`,
    videoUrl,
    videoId: extractVideoId(videoUrl),
    createdAt: new Date().toISOString(),
  };
}

export function validateYouTubeUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
  ];
  return patterns.some((pattern) => pattern.test(url));
}

export function generateMockHistory(): SummaryData[] {
  return MOCK_SUMMARIES.map((mock, i) => ({
    ...mock,
    id: `${mock.id}-history-${i}`,
    videoId: 'mock-video-id',
    createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }));
}

export interface YouTubeMetadata {
  title: string;
  author: string;
  thumbnail: string;
}

/**
 * Fetch YouTube video metadata via oEmbed (no API key required)
 */
export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata | null> {
  try {
    const encodedUrl = encodeURIComponent(url);
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodedUrl}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || "YouTube Video",
      author: data.author_name || "YouTube Channel",
      thumbnail: data.thumbnail_url || "",
    };
  } catch {
    return null;
  }
}
