const dialog = document.querySelector('#atendimento');
const form = document.querySelector('#wizard');
const fields = [...form.querySelectorAll('[data-step]')];
const title = document.querySelector('#atendimento-titulo');
const progress = document.querySelector('#wizard-progress');
const back = document.querySelector('#wizard-back');
const next = document.querySelector('#wizard-next');
const send = document.querySelector('#wizard-send');
const summary = document.querySelector('#wizard-summary');
const symptomLabel = document.querySelector('#symptom-label');
const { marca, modelo, problema, sintoma, observacao } = form.elements;
const titles = ['Qual é o seu celular?', 'O que aconteceu?', 'Revise seu pedido'];
const symptoms = {
  Tela: ['Tela trincada', 'A imagem falha', 'O toque falha'],
  Bateria: ['Descarrega rápido', 'Desliga sozinho', 'Não liga'],
  Carregamento: ['Não carrega', 'Só carrega em certa posição', 'Carrega lentamente'],
  'Áudio ou câmera': ['Problema no áudio', 'Problema na câmera'],
  'Contato com líquido': ['Molhou e funciona', 'Molhou e não liga']
};
let step = 0;

function setStep(index) {
  step = index;
  fields.forEach((field, fieldIndex) => {
    field.hidden = fieldIndex !== step;
    field.disabled = field.hidden;
  });
  title.textContent = titles[step];
  progress.textContent = `Etapa ${step + 1} de ${fields.length}`;
  back.hidden = step === 0;
  next.hidden = step === fields.length - 1;
  send.hidden = !next.hidden;
  title.focus();
}

function updateSymptoms() {
  const options = symptoms[problema.value] ?? [];
  symptomLabel.hidden = options.length === 0;
  sintoma.replaceChildren(new Option('Selecione, se souber', ''));
  for (const option of options) sintoma.add(new Option(option));
}

function updateSummary() {
  const device = [marca.value, modelo.value.trim()].filter(Boolean).join(' · ');
  const issue = [problema.value, sintoma.value].filter(Boolean).join(' · ');
  const notes = observacao.value.trim();
  const message = ['Olá, Saint’s! Gostaria de avaliar meu celular.', `Aparelho: ${device}`, `Problema: ${issue}`, notes].filter(Boolean).join('\n');
  summary.textContent = message;
  send.href = `https://wa.me/5515988120518?text=${encodeURIComponent(message)}`;
}

for (const trigger of document.querySelectorAll('[data-start]')) {
  trigger.addEventListener('click', (event) => {
    if (!dialog.showModal) return;
    event.preventDefault();
    form.reset();
    problema.value = trigger.dataset.start;
    updateSymptoms();
    dialog.showModal();
    setStep(0);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (step === 1) updateSummary();
  if (step < 2) setStep(step + 1);
});
problema.addEventListener('change', updateSymptoms);
back.addEventListener('click', () => setStep(step - 1));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
