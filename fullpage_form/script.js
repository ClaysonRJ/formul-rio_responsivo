const form = document.querySelector("#fullpage-form");
const formWrapper = document.querySelector(".form-wrapper");
const sections = Array.from(document.querySelectorAll(".question"));
const nextButtons = document.querySelectorAll(".next-btn");
const WEBHOOK_URL = "https://hook.integromat.com/SEU_WEBHOOK"; // Substitua pelo seu webhook real

let currentStep = 0;

const scrollToStep = (stepIndex) => {
  const section = sections[stepIndex];
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth" });
};

const validateInput = (section) => {
  const input = section.querySelector("input");
  if (!input) return true;
  return input.reportValidity();
};

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const section = button.closest(".question");
    if (!section || !validateInput(section)) return;

    currentStep = Math.min(currentStep + 1, sections.length - 1);
    scrollToStep(currentStep);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const lastSectionValid = validateInput(sections[sections.length - 1]);
  if (!lastSectionValid) {
    return;
  }

  const formData = Object.fromEntries(new FormData(form));

  try {
    await sendToWebhook(formData);
    formWrapper.classList.add("submitted");
    formWrapper.innerHTML = `
      <section class="question">
        <div class="question-content">
          <h2>Obrigado! ✅</h2>
          <p>Suas informações foram enviadas com sucesso.</p>
        </div>
      </section>
    `;
  } catch (error) {
    alert(
      "Não foi possível enviar as informações no momento. Por favor, tente novamente."
    );
    console.error(error);
  }
});

async function sendToWebhook(data) {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar dados para o webhook.");
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  const activeElement = document.activeElement;
  const currentSectionIndex = sections.findIndex((section) =>
    section.contains(activeElement)
  );

  if (currentSectionIndex === -1) return;

  event.preventDefault();

  if (currentSectionIndex === sections.length - 1) {
    form.requestSubmit();
  } else if (validateInput(sections[currentSectionIndex])) {
    currentStep = Math.min(currentSectionIndex + 1, sections.length - 1);
    scrollToStep(currentStep);
    const nextInput = sections[currentStep].querySelector("input");
    if (nextInput) {
      nextInput.focus({ preventScroll: true });
    }
  }
});
