
"use strict";

const $ = id => document.getElementById(id);

const STAGES = [
  "ORIGEN",
  "ELECCIÓN",
  "ECO",
  "REFLEJO",
  "REPARA",
  "LEGADO"
];

const WORLDS = [
  "origin",
  "choice",
  "echo",
  "reflection",
  "repair",
  "final"
];

const STORAGE = "huella_v2";

function newState() {
  return {
    name: "",
    prologueDone: false,
    stage: 0,
    page: 0,
    choices: {},
    reflection: "",
    commitment: "",
    finished: false
  };
}

let state = newState();

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE));

  if (saved && typeof saved === "object") {
    state = { ...newState(), ...saved };
  }
} catch {}

let prologueIndex = 0;
let sceneVersion = 0;
let soundEnabled = false;
let audioContext;
let ready = false;

function save() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  } catch {}
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function name() {
  return state.name || "Tú";
}

function showScene(id, world = "cover", label = "") {
  sceneVersion++;

  document.querySelectorAll(".scene").forEach(scene => {
    scene.classList.toggle("active", scene.id === id);
  });

  document.body.dataset.world = world;
  $("chapterLabel").textContent = label || "HUELLA · TU HISTORIA";

  tone(440);
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("visible");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    $("toast").classList.remove("visible");
  }, 2600);
}

function tone(frequency = 500) {
  if (!soundEnabled) return;

  try {
    audioContext ||= new (
      window.AudioContext || window.webkitAudioContext
    )();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      .001,
      audioContext.currentTime + .3
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + .31);
  } catch {}
}

$("soundButton").onclick = () => {
  soundEnabled = !soundEnabled;
  $("soundButton").textContent = soundEnabled ? "♫" : "♪";
  tone(660);
};

/* ESTRELLAS DECORATIVAS */

for (let i = 0; i < 100; i++) {
  const star = document.createElement("span");

  star.className = "sparkle";
  star.textContent = ["✦", "✧", "·", "⋆"][i % 4];

  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.fontSize = 3 + Math.random() * 15 + "px";
  star.style.setProperty("--duration", 2 + Math.random() * 5 + "s");
  star.style.animationDelay = -Math.random() * 8 + "s";

  $("stars").appendChild(star);
}

for (let i = 0; i < 5; i++) {
  const star = document.createElement("div");

  star.className = "shooting-star";
  star.style.top = Math.random() * 65 + "%";
  star.style.left = 40 + Math.random() * 60 + "%";
  star.style.animationDelay = -i * 2.3 + "s";

  $("shootingStars").appendChild(star);
}

document.addEventListener("pointermove", e => {
  $("cursorGlow").style.left = e.clientX + "px";
  $("cursorGlow").style.top = e.clientY + "px";
});

/* PORTADA Y NOMBRE */

$("startButton").onclick = () => {

  if (state.finished) {
    showEnding();
    return;
  }

  if (state.name && state.prologueDone) {
    openUniverse();
    return;
  }

  $("nameInput").value = state.name;

  showScene(
    "identity",
    "origin",
    "TU HISTORIA COMIENZA AQUÍ"
  );
};

$("nameForm").onsubmit = e => {
  e.preventDefault();

  const value = $("nameInput").value.trim();

  if (!value) return;

  state.name = value;
  save();

  prologueIndex = 0;

  showScene("prologue", "cover", "ANTES DE DECIDIR");
  renderPrologue();
};

/* PRÓLOGO */

const PROLOGUE = [
  {
    symbol: "✦",
    title: "Todos los días <em>elegimos.</em>",
    text: "Desde lo más pequeño hasta lo más importante, nuestras decisiones influyen en nuestras relaciones, nuestras acciones y la persona que estamos llegando a ser."
  },
  {
    symbol: "✧",
    title: "Pero no siempre es <em>tan fácil.</em>",
    text: "A veces sabemos qué creemos correcto, pero el miedo al rechazo o la presión de nuestros amigos nos lleva a actuar de otra manera."
  },
  {
    symbol: "◎",
    title: "Nada termina <em>al decidir.</em>",
    text: "Cada acción puede provocar consecuencias que no imaginamos. Lo que hacemos afecta a otras personas, incluso cuando no era nuestra intención."
  },
  {
    symbol: "✺",
    title: "¿Quién estás <em>llegando a ser?</em>",
    text: "La autonomía moral significa pensar por nosotros mismos, decidir conscientemente y asumir la responsabilidad de nuestras acciones."
  },
  {
    symbol: "✦",
    title: "Ahora, la historia <em>es tuya.</em>",
    text: "Atravesarás cinco experiencias conectadas. Cada decisión dejará una marca invisible. Al final, todas ellas formarán tu propia huella."
  }
];

function dots(element, total, current) {
  element.innerHTML = Array.from(
    { length: total },
    (_, i) => `<span class="${i === current ? "current" : ""}"></span>`
  ).join("");
}

function renderPrologue() {
  const item = PROLOGUE[prologueIndex];

  $("prologueLabel").textContent =
    `PRÓLOGO · ${prologueIndex + 1} / ${PROLOGUE.length}`;

  $("prologueArt").textContent = item.symbol;

  $("prologueContent").innerHTML = `
    <h2 class="editorial-title appear">${item.title}</h2>
    <p class="appear">${item.text}</p>
  `;

  dots($("prologueDots"), PROLOGUE.length, prologueIndex);

  $("prologueNext").textContent =
    prologueIndex === PROLOGUE.length - 1
      ? "Entrar a mi universo ✦"
      : "Continuar →";
}

$("prologueNext").onclick = () => {
  if (prologueIndex < PROLOGUE.length - 1) {
    prologueIndex++;
    renderPrologue();
  } else {
    state.prologueDone = true;
    save();
    openUniverse();
  }
};

/* CONSTELACIÓN */

function openUniverse() {
  showScene("universe", "cover", "TU UNIVERSO INTERIOR");

  $("universeGreeting").textContent =
    `${name()}, cada estrella guarda una parte de tu historia.`;

  document.querySelectorAll(".star-node").forEach(node => {
    const index = Number(node.dataset.stage);

    node.classList.toggle("locked", index > state.stage);
    node.classList.toggle("current", index === state.stage);
    node.classList.toggle("completed", index < state.stage);
  });

  for (let i = 0; i < 5; i++) {
    $("line" + i).classList.toggle("lit", i < state.stage);
  }

  $("progressText").textContent =
    `${Math.min(state.stage, 5)} de 5 experiencias`;

  $("progressFill").style.width =
    Math.min(state.stage, 5) * 20 + "%";

  $("journeyButton").textContent =
    state.stage >= 5
      ? "Descubrir mi huella ✦"
      : `Continuar: ${STAGES[state.stage]} →`;
}

document.querySelectorAll(".star-node").forEach(node => {
  node.onclick = () => {
    const index = Number(node.dataset.stage);

    if (index > state.stage) {
      toast("Esta estrella aún está dormida.");
      return;
    }

    if (index < state.stage) {
      toast("Ya completaste esta parte de tu historia.");
      return;
    }

    openCurrentStage();
  };
});

$("journeyButton").onclick = openCurrentStage;
$("universeButton").onclick = openUniverse;

function openCurrentStage() {
  if (state.stage >= 5) {
    showFinal();
    return;
  }

  showScene(
    "story",
    WORLDS[state.stage],
    STAGES[state.stage]
  );

  renderStory();
}

/* COMPONENTES NARRATIVOS */

function narrative(title, text, extra = "", symbol = "") {
  $("storyContent").innerHTML = `
    <div class="narrative">
      ${symbol ? `<div class="narrative-symbol">${symbol}</div>` : ""}
      <h2>${title}</h2>
      ${text ? `<p>${text}</p>` : ""}
      ${extra}
    </div>
  `;

  setReady(true);
}

function setReady(value) {
  ready = value;
  $("storyNext").disabled = !value;
}

function optionList(key, options) {
  const saved = state.choices[key];

  return `
    <div class="options">
      ${options.map(option => `
        <button
          class="option ${saved === option.id ? "selected" : ""}"
          data-option="${option.id}"
          ${saved ? "disabled" : ""}
        >
          ${option.text}
        </button>
      `).join("")}
    </div>
  `;
}

function bindOptions(key, callback) {
  setReady(Boolean(state.choices[key]));

  document.querySelectorAll("[data-option]").forEach(button => {
    button.onclick = () => {
      if (state.choices[key]) return;

      state.choices[key] = button.dataset.option;
      save();

      document.querySelectorAll("[data-option]").forEach(b => {
        b.disabled = true;
        b.classList.toggle("selected", b === button);
      });

      if (callback) callback(state.choices[key]);

      setReady(true);
      tone(620);
    };
  });
}

/* MOTOR DE CONVERSACIONES */

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function addBubble(message) {
  const area = $("chatMessages");

  if (!area) return;

  const bubble = document.createElement("div");

  bubble.className =
    "bubble" + (message.sender === "you" ? " mine" : "");

  const senderClass =
    message.sender.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  bubble.innerHTML = `
    ${message.sender !== "you" ? `
      <span class="sender ${senderClass}">
        ${safe(message.sender)}
      </span>
    ` : ""}
    ${safe(message.text)}
    <span class="message-time">
      ${safe(message.time || "20:50")}
      ${message.sender === "you" ? "<span>✓✓</span>" : ""}
    </span>
  `;

  area.appendChild(bubble);
  area.scrollTop = area.scrollHeight;

  tone(message.sender === "you" ? 620 : 480);
}

async function playMessages(messages, version) {
  for (const message of messages) {

    if (version !== sceneVersion) return false;

    const area = $("chatMessages");

    if (!area) return false;

    if (message.sender !== "you") {
      const typing = document.createElement("div");

      typing.className = "typing";
      typing.textContent = `${message.sender} está escribiendo...`;

      area.appendChild(typing);
      area.scrollTop = area.scrollHeight;

      await sleep(700);

      if (version !== sceneVersion) return false;

      typing.remove();
    }

    addBubble(message);

    await sleep(400);
  }

  return version === sceneVersion;
}

function message(sender, text, time = "20:50") {
  return { sender, text, time };
}

async function chat(config) {

  const version = ++sceneVersion;

  setReady(false);

  $("storyContent").innerHTML = `
    <div class="chat-layout">

      <div class="chat-narrative">

        <div class="eyebrow">${config.label || "LA HISTORIA CONTINÚA"}</div>

        <h2>${config.title}</h2>

        <p>${config.description}</p>

        <div class="chat-options" id="chatOptions"></div>

      </div>

      <div class="phone">

        <div class="phone-status">
          <span>${config.time || "20:47"}</span>
          <span>▮▮▮ ◉ ▰</span>
        </div>

        <div class="chat-header">
          <span>‹</span>
          <div class="chat-avatar">
            ${config.contact === "Grupoo" ? "♧" : safe(config.contact[0])}
          </div>
          <div class="chat-contact">
            <strong>${safe(config.contact)}</strong>
            <small>
              ${config.contact === "Grupoo"
                ? "Nico, Sofía, Valeria, tú"
                : "en línea"}
            </small>
          </div>
          <span>⋮</span>
        </div>

        <div class="chat-messages" id="chatMessages">
          <div class="chat-date">${config.date || "HOY"}</div>
        </div>

        <div class="chat-input-area">
          <div class="fake-input">☺ &nbsp; Mensaje</div>
          <div class="send-icon">➤</div>
        </div>

      </div>

    </div>
  `;

  const success = await playMessages(config.messages, version);

  if (!success) return;

  if (!config.options) {
    setReady(true);
    return;
  }

  const existing = state.choices[config.key];

  async function respond(option) {

    if (version !== sceneVersion) return;

    $("chatOptions").innerHTML = "";

    addBubble(message("you", option.text, config.replyTime || "20:50"));

    await sleep(500);

    if (version !== sceneVersion) return;

    const finished = await playMessages(option.replies || [], version);

    if (finished) setReady(true);
  }

  if (existing) {
    const previous = config.options.find(o => o.id === existing);

    if (previous) {
      await respond(previous);
      return;
    }
  }

  config.options.forEach(option => {
    const button = document.createElement("button");

    button.className = "option";
    button.textContent = option.text;

    button.onclick = async () => {

      if (state.choices[config.key]) return;

      state.choices[config.key] = option.id;
      save();

      await respond(option);
    };

    $("chatOptions").appendChild(button);
  });
}

/* ORIGEN */

const origin = [

  () => narrative(
    `Toda historia comienza <em>con alguien.</em>`,
    `${safe(name())}, llevas varios años siendo parte de un grupo de amigos. Comparten trabajos, bromas, secretos y conversaciones que parecen no terminar nunca.`,
    "",
    "✦"
  ),

  () => narrative(
    "Tu círculo <em>de amigos.</em>",
    "",
    `
      <div class="characters">

        <div class="character" style="--character-color:#efb180">
          <div class="character-initial">N</div>
          <h3>Nico</h3>
          <p>Tu mejor amigo. Siempre hace bromas, aunque a veces no piensa en sus consecuencias.</p>
        </div>

        <div class="character" style="--character-color:#eaa1cf">
          <div class="character-initial">S</div>
          <h3>Sofía</h3>
          <p>Una amiga cercana que confía mucho en ustedes y valora la sinceridad.</p>
        </div>

        <div class="character" style="--character-color:#83c9bf">
          <div class="character-initial">V</div>
          <h3>Valeria</h3>
          <p>Le gusta mantener unido al grupo, aunque suele evitar los conflictos.</p>
        </div>

      </div>

      <p class="highlight">Una amistad. Cuatro personas. Muchas decisiones.</p>
    `
  ),

  () => chat({
    contact: "Grupoo",
    title: "Un día <em>cualquiera.</em>",
    description: "Es viernes por la tarde. Como siempre, el grupo está conversando después de clases.",
    messages: [
      message("Nico", "Genteee mañana salimos?", "16:20"),
      message("Valeria", "SIIII pero organicen bien esta vez", "16:21"),
      message("Sofía", "Yo creo que sí puedo", "16:21"),
      message("Nico", `${name()} no te olvides de avisar jajaja`, "16:22"),
      message("Sofía", "Nico te escribo al privado un toque", "16:23")
    ]
  }),

  () => narrative(
    "La confianza <em>también importa.</em>",
    "Esa tarde, Sofía le cuenta a Nico que está pasando por un momento difícil en su casa. Le pide expresamente que no comparta esa información con nadie. Tú sabes que ella confía en él.",
    "",
    "✧"
  ),

  () => {

    const options = [
      { id: "honestidad", text: "✦ Honestidad — Actuar con sinceridad." },
      { id: "respeto", text: "✧ Respeto — Considerar los límites de los demás." },
      { id: "lealtad", text: "♡ Lealtad — Cuidar mis amistades sin justificar el daño." },
      { id: "responsabilidad", text: "◎ Responsabilidad — Asumir mis acciones." }
    ];

    narrative(
      "¿Qué valor quieres <em>defender?</em>",
      "Antes de continuar, elige un valor que quieras tener presente en tus próximas decisiones.",
      optionList("value", options)
    );

    bindOptions("value");
  }
];

/* ELECCIÓN */

const choice = [

  () => narrative(
    "Esa misma <em>noche...</em>",
    "Son las 8:47. Estás revisando tu celular cuando recibes una notificación de Grupoo. Nico acaba de compartir algo que no debía.",
    `<div class="ornament">✧　　♫　　✧</div>`,
    "✉"
  ),

  () => chat({
    contact: "Grupoo",
    title: "Un mensaje <em>inesperado.</em>",
    description: "Nico está a punto de compartir una captura de su conversación privada con Sofía. Espera que tú lo apoyes.",
    key: "first",
    messages: [
      message("Nico", "Genteee no saben lo que me contó Sofía JAJAJA", "20:47"),
      message("Valeria", "Qué pasó?", "20:47"),
      message("Nico", "Tengo captura y todo", "20:48"),
      message("Valeria", "Pero no era algo privado?", "20:48"),
      message("Nico", `Ay tampoco es para tanto. ${name()}, tú qué dices?`, "20:49")
    ],
    options: [
      {
        id: "encourage",
        text: "JAJAJA a ver cuenta pues",
        replies: [
          message("Nico", "Sabía que ibas a querer saber JAJA"),
          message("Nico", "Ya les mando la captura"),
          message("Valeria", "Ay Nico...")
        ]
      },
      {
        id: "stop",
        text: "No la mandes, te lo contó en confianza",
        replies: [
          message("Nico", "Ay no exageres"),
          message("Nico", "Solo somos nosotros"),
          message("Valeria", "Igual creo que no deberías mandarla")
        ]
      },
      {
        id: "avoid",
        text: "No sé, mejor no me meto",
        replies: [
          message("Nico", "Bueno entonces les cuento"),
          message("Valeria", "No sé si sea buena idea")
        ]
      }
    ]
  }),

  () => {

    const stopped = state.choices.first === "stop";

    narrative(
      stopped
        ? "Intentaste poner <em>un límite.</em>"
        : "La conversación <em>continuó.</em>",
      stopped
        ? "A pesar de tu mensaje, Nico termina compartiendo la captura. Valeria le pide que la borre, pero algunos compañeros ya la han visto."
        : "Nico comparte la captura y continúa haciendo bromas. Valeria no vuelve a decir nada. La información empieza a circular fuera del grupo.",
      "",
      "✧"
    );
  },

  () => chat({
    contact: "Nico",
    title: "Entre la amistad <em>y tus valores.</em>",
    description: "Nico te escribe en privado. Ahora tienes que decidir si lo que hizo debería quedar entre ustedes.",
    key: "second",
    messages: [
      message("Nico",
        state.choices.first === "stop"
          ? `Oe ${name()}, pensé que eras mi amigo/a`
          : `Oe ${name()}, no le digas nada a Sofía ya?`,
        "21:02"
      ),
      message("Nico", "No quiero que se moleste conmigo", "21:03"),
      message("Nico", "Prométeme que no le vas a decir", "21:03")
    ],
    options: [
      {
        id: "promise",
        text: "Ya, no le voy a decir nada",
        replies: [
          message("Nico", "Gracias, sabía que podía contar contigo")
        ]
      },
      {
        id: "honest",
        text: "Creo que deberías hablar con ella y decirle la verdad",
        replies: [
          message("Nico", "Pero se va a molestar"),
          message("Nico", "No sé, déjame pensarlo")
        ]
      },
      {
        id: "distance",
        text: "No quiero estar en medio de esto",
        replies: [
          message("Nico", "Ya bueno, olvídalo")
        ]
      }
    ]
  })
];

/* ECO */

const echo = [

  () => narrative(
    "A la mañana <em>siguiente.</em>",
    "Llegas al colegio. Sofía está más callada de lo normal. Alguien le contó que su conversación privada fue compartida y ahora no sabe en quién puede confiar.",
    `
      <div class="ripple-art">
        <span></span><span></span><span></span>
        <b>✦</b>
      </div>
    `
  ),

  () => {

    const first = state.choices.first;

    let opening;

    if (first === "encourage") {
      opening = `Me dijeron que tú también le pediste a Nico que contara lo que pasó. Es verdad, ${name()}?`;
    } else if (first === "avoid") {
      opening = `Tú estabas en el grupo ayer, no? Sabías lo que Nico estaba haciendo?`;
    } else {
      opening = `Valeria me dijo que intentaste que Nico no mandara la captura. Gracias, ${name()}.`;
    }

    chat({
      contact: "Sofía",
      date: "SÁBADO",
      time: "10:15",
      title: "Lo que no <em>habías imaginado.</em>",
      description: "Ahora puedes conocer cómo se sintió Sofía. La situación ya no es solamente una broma entre amigos.",
      key: "third",
      messages: [
        message("Sofía", "Hola, podemos hablar?", "10:15"),
        message("Sofía", opening, "10:16"),
        message("Sofía", "Me da mucha vergüenza que todos sepan algo que era privado", "10:16")
      ],
      options: [
        {
          id: "listen",
          text: "Sí, sabía lo que pasó. Quiero escucharte",
          replies: [
            message("Sofía", "Gracias por no hacer como si no hubiera pasado nada", "10:18"),
            message("Sofía", "Solo quiero que dejen de compartirlo", "10:18")
          ]
        },
        {
          id: "minimize",
          text: "No creo que sea para tanto, ya va a pasar",
          replies: [
            message("Sofía", "Para ti tal vez no sea importante", "10:18"),
            message("Sofía", "Pero era algo mío", "10:19")
          ]
        },
        {
          id: "escape",
          text: "Mejor habla con Nico, él lo hizo",
          replies: [
            message("Sofía", "Sí, pero quería saber si podía confiar en ti también", "10:18")
          ]
        }
      ]
    });
  },

  () => {

    const first = state.choices.first;
    const third = state.choices.third;

    const effect = first === "encourage"
      ? "Tu respuesta animó a Nico a continuar."
      : first === "stop"
      ? "Tu respuesta mostró que no todos estaban de acuerdo con compartir el secreto."
      : "Tu silencio evitó una discusión, pero no ayudó a detener la difusión.";

    const extra = third === "listen"
      ? "Escuchar a Sofía abrió una posibilidad de recuperar la confianza."
      : "Sofía sigue sintiendo que su preocupación no fue comprendida.";

    narrative(
      "Una decisión. <em>Muchas consecuencias.</em>",
      `${effect} ${extra}`,
      `
        <div class="ripple-art">
          <span></span><span></span><span></span>
          <b>✧</b>
        </div>

        <p class="highlight">
          Lo que decides no termina solamente en ti.
        </p>
      `
    );
  }
];

/* REFLEJO */

const FIRST_TEXT = {
  encourage: "JAJAJA a ver cuenta pues",
  stop: "No la mandes, te lo contó en confianza",
  avoid: "No sé, mejor no me meto"
};

const SECOND_TEXT = {
  promise: "Ya, no le voy a decir nada",
  honest: "Creo que deberías hablar con ella y decirle la verdad",
  distance: "No quiero estar en medio de esto"
};

const reflection = [

  () => narrative(
    "Mira más allá <em>del reflejo.</em>",
    `Antes de comenzar elegiste defender la/el ${safe(state.choices.value || "honestidad")}. Ahora observa algunas de las decisiones que tomaste.`,
    `
      <div class="mirror">
        <div class="ornament">✧</div>
        <p>“${safe(FIRST_TEXT[state.choices.first] || "")}”</p>
        <p>“${safe(SECOND_TEXT[state.choices.second] || "")}”</p>
      </div>
    `
  ),

  () => {

    const options = [
      { id: "coherent", text: "Creo que actué de acuerdo con mis valores." },
      { id: "pressure", text: "La presión de mis amigos influyó en mis decisiones." },
      { id: "change", text: "Hay decisiones que ahora tomaría de otra manera." }
    ];

    narrative(
      "¿La persona que estás siendo se parece a <em>quien quieres ser?</em>",
      "No se trata de juzgarte. Se trata de reconocer qué influyó en tus decisiones.",
      optionList("self", options)
    );

    bindOptions("self");
  },

  () => {

    narrative(
      "Tu identidad está <em>en construcción.</em>",
      "Una sola decisión no define todo lo que eres. Sin embargo, las acciones que repetimos pueden convertirse en hábitos y formar nuestro carácter.",
      `
        <textarea id="reflectionInput"
          maxlength="300"
          placeholder="¿Qué aprendiste de tus propias decisiones?">${safe(state.reflection)}</textarea>
      `
    );

    setReady(state.reflection.trim().length > 0);

    $("reflectionInput").oninput = e => {
      state.reflection = e.target.value;
      save();
      setReady(state.reflection.trim().length > 0);
    };
  }
];

/* REPARA */

const repair = [

  () => chat({
    contact: "Nico",
    title: "Todavía puedes <em>elegir.</em>",
    description: "Nico se da cuenta de que Sofía está molesta. Te escribe porque no sabe cómo solucionar lo ocurrido.",
    key: "fourth",
    messages: [
      message("Nico", `Oe ${name()}, Sofía ya no me habla`, "17:10"),
      message("Nico", "Creo que sí la fregué", "17:11"),
      message("Nico", "Pero no sé qué hacer ahora", "17:11")
    ],
    options: [
      {
        id: "repair",
        text: "Habla con ella, reconoce lo que hiciste y respeta lo que decida",
        replies: [
          message("Nico", "Sí, creo que tienes razón"),
          message("Nico", "Voy a borrar todo y hablar con ella")
        ]
      },
      {
        id: "ignore",
        text: "Déjalo así, seguro se le pasa",
        replies: [
          message("Nico", "No sé, creo que esta vez sí la lastimé")
        ]
      },
      {
        id: "excuse",
        text: "Dile que era una broma y ya",
        replies: [
          message("Nico", "Pero creo que eso no arregla lo que hice")
        ]
      }
    ]
  }),

  () => {

    const first = state.choices.first;
    const third = state.choices.third;

    const responsibility =
      first === "encourage" ||
      first === "avoid" ||
      third !== "listen";

    chat({
      contact: "Sofía",
      title: "Lo que haces <em>después.</em>",
      description: responsibility
        ? "Tienes la oportunidad de reconocer cómo actuaste y ofrecer ayuda sin exigir que Sofía te perdone."
        : "Aunque intentaste ayudar, todavía puedes escuchar a Sofía y respetar sus límites.",
      key: "last",
      messages: [
        message("Sofía", "Gracias por hablar conmigo", "18:20"),
        message("Sofía", "Solo quiero que esto no vuelva a pasar", "18:21")
      ],
      options: [
        {
          id: "accept",
          text: responsibility
            ? "Reconozco que pude actuar mejor. Lo siento. Voy a respetar tus límites"
            : "Voy a respetar tus límites y ayudarte si lo necesitas",
          replies: [
            message("Sofía", "Gracias por entender"),
            message("Sofía", "Necesito un poco de tiempo todavía")
          ]
        },
        {
          id: "pressure",
          text: "Pero ya pasó, podemos olvidarnos de todo?",
          replies: [
            message("Sofía", "No puedo olvidarlo así de rápido"),
            message("Sofía", "Necesito que respetes eso")
          ]
        },
        {
          id: "space",
          text: "Entiendo. Tómate el tiempo que necesites",
          replies: [
            message("Sofía", "Gracias por respetarlo")
          ]
        }
      ]
    });
  },

  () => narrative(
    "Reparar no significa <em>borrar el pasado.</em>",
    "Significa reconocer lo ocurrido, asumir sus consecuencias y elegir actuar de una manera diferente. No podemos exigir que otros recuperen su confianza inmediatamente.",
    `
      <div class="repair-art">
        <span>✧</span><i></i><span>✦</span>
      </div>

      <p class="highlight">
        La manera en que afrontas tus errores también construye quién eres.
      </p>
    `
  )
];

/* PROGRESO DE LA HISTORIA */

const EXPERIENCES = [
  origin,
  choice,
  echo,
  reflection,
  repair
];

function renderStory() {

  const pages = EXPERIENCES[state.stage];

  if (!pages) {
    showFinal();
    return;
  }

  state.page = Math.min(state.page, pages.length - 1);

  $("storyCounter").textContent =
    `${STAGES[state.stage]} · ${state.page + 1} / ${pages.length}`;

  dots($("storyDots"), pages.length, state.page);

  $("storyNext").textContent =
    state.page === pages.length - 1
      ? state.stage === 4
        ? "Revelar mi huella ✦"
        : "Iluminar mi estrella ✦"
      : "Continuar →";

  setReady(false);

  pages[state.page]();
}

$("storyNext").onclick = () => {

  if (!ready) return;

  const pages = EXPERIENCES[state.stage];

  if (!pages) return;

  if (state.page < pages.length - 1) {
    state.page++;
    save();
    renderStory();
    tone(580);
    return;
  }

  state.stage++;
  state.page = 0;

  save();

  if (state.stage === 5) {
    showFinal();
  } else {
    openUniverse();
    toast("Una nueva estrella ha despertado ✦");
  }
};

/* GENERACIÓN DE LA HUELLA */

function seedFromChoices() {
  const text = JSON.stringify({
    name: state.name,
    choices: state.choices,
    reflection: state.reflection
  });

  let seed = 2166136261;

  for (let i = 0; i < text.length; i++) {
    seed ^= text.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  return seed >>> 0;
}

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function fingerprintMarkup(animated = true) {

  const random = seededRandom(seedFromChoices());

  const colors = [
    "#fff9d7",
    "#ffffff",
    "#d5b5ff",
    "#b5f5ff",
    "#ffd1e9",
    "#b7ffdc"
  ];

  let html = "";

  for (let i = 0; i < 19; i++) {

    const rx = 17 + i * 7.5;
    const ry = 28 + i * 8.5;

    const shift = (random() - .5) * 10;
    const start = .2 + random() * .7;
    const end = Math.PI * 2 - .2 - random() * .6;

    let d = "";

    for (let j = 0; j <= 120; j++) {

      const a = start + (end - start) * j / 120;

      const x = 200 + shift + rx * Math.cos(a)
        + 6 * Math.sin(a * 2);

      const y = 200 + ry * Math.sin(a);

      d += `${j === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
    }

    html += `
      <path
        d="${d}"
        fill="none"
        stroke="${colors[i % colors.length]}"
        stroke-width="2.1"
        stroke-linecap="round"
        class="${animated ? "fingerprint-line" : ""}"
        ${animated ? `style="animation-delay:${i * .07}s"` : ""}
      />
    `;
  }

  for (let i = 0; i < 65; i++) {

    const a = random() * Math.PI * 2;
    const r = 30 + random() * 145;

    const x = 200 + Math.cos(a) * r * .85;
    const y = 200 + Math.sin(a) * r;

    html += `
      <circle
        cx="${x}"
        cy="${y}"
        r="${.8 + random() * 2.5}"
        fill="${colors[i % colors.length]}"
        opacity=".9"
      />
    `;
  }

  return html;
}

function showFinal() {

  if (state.stage < 5) return;

  showScene("final", "final", "LEGADO · TU IDENTIDAD");

  $("finalTitle").innerHTML =
    `${safe(name())}, esta es <em>tu huella.</em>`;

  $("fingerprint").innerHTML = fingerprintMarkup(true);
}

/* COMPROMISO */

$("legacyButton").onclick = () => {
  if (state.stage < 5) return;

  $("commitment").value = state.commitment;

  showScene("legacy", "final", "TU ÚLTIMA DECISIÓN");
};

$("commitment").oninput = e => {
  state.commitment = e.target.value;
  save();
};

$("finishButton").onclick = () => {

  if (!state.commitment.trim()) {
    toast("Escribe tu compromiso antes de continuar.");
    return;
  }

  state.finished = true;
  save();

  showEnding();
};

function showEnding() {

  $("finalCommitment").textContent =
    `“${state.commitment}” — ${name()}`;

  showScene("ending", "final", "TU HISTORIA CONTINÚA");
}

/* DESCARGAR HUELLA */

$("downloadButton").onclick = () => {

  const canvas = document.createElement("canvas");

  canvas.width = 1000;
  canvas.height = 1300;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 1000, 1300);

  gradient.addColorStop(0, "#9b8bdd");
  gradient.addColorStop(.5, "#d4a8e8");
  gradient.addColorStop(1, "#ffc9d9");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 1300);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 95px Georgia";
  ctx.fillText("HUELLA", 500, 140);

  ctx.fillStyle = "#513b78";
  ctx.font = "30px Georgia";
  ctx.fillText(name(), 500, 200);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="400" height="400" viewBox="0 0 400 400">
      ${fingerprintMarkup(false)}
    </svg>
  `;

  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml" })
  );

  const image = new Image();

  image.onload = () => {

    ctx.drawImage(image, 150, 235, 700, 700);
    URL.revokeObjectURL(url);

    ctx.fillStyle = "#513b78";
    ctx.font = "bold 28px Georgia";
    ctx.fillText("MI COMPROMISO", 500, 970);

    ctx.font = "24px Georgia";

    wrapText(ctx, state.commitment, 500, 1025, 820, 34);

    ctx.font = "20px Georgia";
    ctx.fillText("Cada decisión construye quién eres.", 500, 1245);

    canvas.toBlob(blob => {

      if (!blob) return;

      const downloadURL = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadURL;
      link.download = "Mi_Huella.png";
      link.click();

      setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);

    }, "image/png");
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);
    toast("No se pudo guardar la imagen.");
  };

  image.src = url;
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {

  const words = text.split(/\s+/);
  let line = "";

  for (const word of words) {

    const test = line ? line + " " + word : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = test;
    }
  }

  if (line) ctx.fillText(line, x, y);
}

/* REINICIAR */

$("restartButton").onclick = () => {

  if (!confirm("¿Quieres comenzar una nueva historia?")) return;

  state = newState();

  try {
    localStorage.removeItem(STORAGE);
  } catch {}

  showScene("cover", "cover", "UNA EXPERIENCIA INTERACTIVA");
};

/* INICIO */

showScene("cover", "cover", "UNA EXPERIENCIA INTERACTIVA");
