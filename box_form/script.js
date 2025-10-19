const stepsContainer = document.querySelector("#steps");
const nextBtn = document.querySelector("#next-btn");
const backBtn = document.querySelector("#back-btn");
const progressBar = document.querySelector("#progress-bar");
const card = document.querySelector("#card");
const form = document.querySelector("#box-form");
const WEBHOOK_URL = "https://hook.integromat.com/SEU_WEBHOOK"; // Substitua pelo seu webhook real

const stepsConfig = [
  {
    id: "fullName",
    question: "Qual é o seu nome completo?",
    type: "text",
    placeholder: "Digite seu nome",
    autocomplete: "name",
  },
  {
    id: "email",
    question: "Qual é o seu e-mail?",
    type: "email",
    placeholder: "voce@empresa.com",
    autocomplete: "email",
  },
  {
    id: "phone",
    question: "Qual é o seu telefone?",
    type: "tel",
    placeholder: "(00) 00000-0000",
    autocomplete: "tel",
  },
  {
    id: "state",
    question: "Qual é o seu estado?",
    type: "text",
    placeholder: "Ex.: São Paulo",
    autocomplete: "address-level1",
  },
  {
    id: "city",
    question: "Qual é a sua cidade?",
    type: "text",
    placeholder: "Ex.: Campinas",
    autocomplete: "address-level2",
  },
  {
    id: "cnpj",
    question: "Informe o CNPJ",
    type: "text",
    placeholder: "00.000.000/0000-00",
  },
];

let currentStep = 0;

const renderSteps = () => {
  stepsContainer.innerHTML = stepsConfig
    .map((step, index) => {
      return `
        <div class="step${index === 0 ? " active" : ""}" data-step="${index}">
          <h2>${step.question}</h2>
          <label for="${step.id}">Preencha o campo abaixo</label>
          <input
            id="${step.id}"
            name="${step.id}"
            type="${step.type}"
            placeholder="${step.placeholder ?? ""}"
            ${step.autocomplete ? `autocomplete="${step.autocomplete}"` : ""}
            required
          />
          <span class="error" aria-live="polite"></span>
        </div>
      `;
    })
    .join("");
};

const showStep = (index) => {
  const steps = stepsContainer.querySelectorAll(".step");
  steps.forEach((step) => step.classList.remove("active"));

  const target = steps[index];
  if (target) {
    target.classList.add("active");
    const input = target.querySelector("input, select");
    requestAnimationFrame(() => input?.focus());
  }

  backBtn.disabled = index === 0;
  nextBtn.textContent = index === steps.length - 1 ? "Enviar" : "Próximo";
  updateProgress(index);
};

const updateProgress = (index) => {
  const progress = ((index + 1) / stepsConfig.length) * 100;
  progressBar.style.width = `${progress}%`;
};

const validateCurrentStep = () => {
  const currentStepElement = stepsContainer.querySelector(
    `.step[data-step="${currentStep}"]`
  );
  const input = currentStepElement?.querySelector("input, select");
  const errorElement = currentStepElement?.querySelector(".error");

  if (!input) {
    return true;
  }

  if (!input.checkValidity()) {
    errorElement.textContent = input.validationMessage;
    input.focus();
    return false;
  }

  errorElement.textContent = "";
  return true;
};

nextBtn.addEventListener("click", async () => {
  if (!validateCurrentStep()) {
    return;
  }

  if (currentStep === stepsConfig.length - 1) {
    await submitForm();
    return;
  }

  currentStep += 1;
  showStep(currentStep);
});

backBtn.addEventListener("click", () => {
  if (currentStep === 0) return;

  currentStep -= 1;
  showStep(currentStep);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
});

const submitForm = async () => {
  const formData = Object.fromEntries(new FormData(form));

  try {
    await sendToWebhook(formData);
    card.innerHTML = `
      <div class="success-message">
        <h2>Cadastro concluído! 🎉</h2>
        <p>Recebemos suas respostas e entraremos em contato em breve.</p>
      </div>
    `;
  } catch (error) {
    alert(
      "Não foi possível enviar as informações no momento. Por favor, tente novamente."
    );
    console.error(error);
  }
};

const sendToWebhook = async (data) => {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar dados para o webhook");
  }
};

renderSteps();
showStep(currentStep);
