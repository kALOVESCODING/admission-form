const form = document.getElementById("admissionForm");
const steps = [...document.querySelectorAll(".form-step")];
const indicators = [...document.querySelectorAll("[data-step-indicator]")];
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const saveBtn = document.getElementById("saveBtn");
const fileInput = document.getElementById("receipt");
const fileName = document.getElementById("fileName");
const reviewCard = document.getElementById("reviewCard");
const toast = document.getElementById("toast");

const storageKey = "avj-admission-form-draft";
const labels = {
  fullName: "Full Name",
  courseYear: "Course / Year",
  fatherName: "Father Name",
  motherName: "Mother Name",
  bankAccountName: "Bank Account Name",
  transactionId: "Transaction Number / Reference ID",
  paymentDate: "Date of Payment",
  receipt: "Bank Receipt"
};

let currentStep = 1;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function setError(input, message) {
  const field = input.closest(".field");
  field.classList.add("has-error");
  field.querySelector(".error").textContent = message;
}

function clearError(input) {
  const field = input.closest(".field");
  field.classList.remove("has-error");
  field.querySelector(".error").textContent = "";
}

function validateTextInput(input) {
  if (!input.value.trim()) {
    setError(input, `${labels[input.name]} is required.`);
    return false;
  }

  clearError(input);
  return true;
}

function validateDateInput(input) {
  if (!input.value) {
    setError(input, "Payment date is required.");
    return false;
  }

  const selectedDate = new Date(input.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    setError(input, "Payment date cannot be in the future.");
    return false;
  }

  clearError(input);
  return true;
}

function validateFileInput(input) {
  const file = input.files[0];
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxSize = 2 * 1024 * 1024;

  if (!file) {
    setError(input, "Receipt upload is required.");
    return false;
  }

  if (!allowedTypes.includes(file.type)) {
    setError(input, "Only JPG, PNG, or PDF files are allowed.");
    return false;
  }

  if (file.size > maxSize) {
    setError(input, "File size must be 2 MB or less.");
    return false;
  }

  clearError(input);
  return true;
}

function validateCurrentStep() {
  const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  const inputs = [...activeStep.querySelectorAll("input")];

  return inputs.every((input) => {
    if (input.type === "file") {
      return validateFileInput(input);
    }

    if (input.type === "date") {
      return validateDateInput(input);
    }

    return validateTextInput(input);
  });
}

function renderReview() {
  const data = new FormData(form);
  const rows = Object.entries(labels).map(([key, label]) => {
    const rawValue = key === "receipt"
      ? (fileInput.files[0]?.name || "Not uploaded")
      : (data.get(key) || "Not provided");

    const value = key === "paymentDate" && rawValue !== "Not provided"
      ? new Date(rawValue).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : rawValue;

    return `
      <div class="review-row">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `;
  }).join("");

  reviewCard.innerHTML = `<dl>${rows}</dl>`;
}

function updateStepper() {
  steps.forEach((step) => {
    step.classList.toggle("is-active", Number(step.dataset.step) === currentStep);
  });

  indicators.forEach((indicator) => {
    const stepNumber = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("is-active", stepNumber === currentStep);
    indicator.classList.toggle("is-complete", stepNumber < currentStep);
  });

  prevBtn.hidden = currentStep === 1;
  nextBtn.hidden = currentStep === steps.length;
  submitBtn.hidden = currentStep !== steps.length;

  if (currentStep === steps.length) {
    renderReview();
  }
}

function persistDraft() {
  const draft = {};

  [...form.elements].forEach((element) => {
    if (!element.name || element.type === "file") {
      return;
    }

    draft[element.name] = element.value;
  });

  localStorage.setItem(storageKey, JSON.stringify(draft));
}

function hydrateDraft() {
  const rawDraft = localStorage.getItem(storageKey);

  if (!rawDraft) {
    return;
  }

  try {
    const draft = JSON.parse(rawDraft);
    Object.entries(draft).forEach(([name, value]) => {
      const input = form.elements.namedItem(name);
      if (input) {
        input.value = value;
      }
    });
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function bindFieldValidation() {
  [...form.querySelectorAll("input")].forEach((input) => {
    const eventName = input.type === "file" ? "change" : "input";
    input.addEventListener(eventName, () => {
      if (input.type === "file") {
        fileName.textContent = input.files[0]?.name || "No file selected";
        validateFileInput(input);
        return;
      }

      if (input.type === "date") {
        validateDateInput(input);
        persistDraft();
        return;
      }

      validateTextInput(input);
      persistDraft();
    });
  });
}

nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) {
    showToast("Please complete the required fields before continuing.");
    return;
  }

  currentStep += 1;
  persistDraft();
  updateStepper();
});

prevBtn.addEventListener("click", () => {
  currentStep -= 1;
  updateStepper();
});

saveBtn.addEventListener("click", () => {
  persistDraft();
  showToast("Draft saved on this device.");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const allValid = [...form.querySelectorAll("input")].every((input) => {
    if (input.type === "file") {
      return validateFileInput(input);
    }

    if (input.type === "date") {
      return validateDateInput(input);
    }

    return validateTextInput(input);
  });

  if (!allValid) {
    showToast("Please review the form and fix the highlighted fields.");
    return;
  }

  persistDraft();
  showToast("Admission form submitted successfully.");
  form.reset();
  fileName.textContent = "No file selected";
  localStorage.removeItem(storageKey);
  currentStep = 1;
  updateStepper();
  reviewCard.innerHTML = "";
});

hydrateDraft();
bindFieldValidation();
updateStepper();
