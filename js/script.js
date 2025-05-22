// Состояние приложения
const state = {
    numVariables: 2,
    lastResult: null,
  };
  
  // DOM элементы
  const elements = {
    template: document.getElementById('template'),
    objectiveInputs: document.getElementById('objective-inputs'),
    numVariables: document.getElementById('num-variables'),
    updateObjective: document.getElementById('update-objective'),
    optimizeType: document.getElementById('optimize_type'),
    constraints: document.getElementById('constraints'),
    addConstraint: document.getElementById('add-constraint'),
    errorMessages: document.getElementById('error-messages'),
    solveBtn: document.getElementById('solve-btn'),
    output: document.getElementById('output'),
  };
  
  // Обновление полей целевой функции
  function updateObjectiveInputs() {
    state.numVariables = parseInt(elements.numVariables.value) || 2;
    if (state.numVariables < 1 || state.numVariables > 10) {
      showErrors(['Количество продуктов должно быть от 1 до 10']);
      elements.numVariables.classList.add('invalid');
      return;
    }
    elements.numVariables.classList.remove('invalid');
  
    elements.objectiveInputs.innerHTML = '';
    for (let i = 0; i < state.numVariables; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center gap-2';
      wrapper.innerHTML = `
        <input type="text" class="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Продукт ${i+1}" data-index="${i}">
        <input type="number" step="any" class="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Коэфф.">
      `;
      elements.objectiveInputs.appendChild(wrapper);
      if (i < state.numVariables - 1) {
        elements.objectiveInputs.appendChild(document.createTextNode(' + '));
      }
    }
    updateConstraints();
  }
  
  // Обновление ограничений
  function updateConstraints() {
    elements.constraints.innerHTML = '';
    addConstraint();
  }
  
  // Добавление нового ограничения
  function addConstraint() {
    const div = document.createElement('div');
    div.className = 'constraint bg-gray-50 p-4 rounded-lg flex flex-wrap items-center gap-3 fade-in';
  
    for (let i = 0; i < state.numVariables; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center gap-2';
      wrapper.innerHTML = `
        <input type="number" step="any" class="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 coeff" placeholder="x${i+1}">
        ${i < state.numVariables - 1 ? ' + ' : ''}
      `;
      div.appendChild(wrapper);
    }
  
    div.innerHTML += `
      <select class="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 type">
        <option value="<="><=</option>
        <option value=">=">>=</option>
        <option value="=">=</option>
      </select>
      <div class="flex items-center gap-2">
        <input type="number" step="any" class="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rhs" placeholder="Лимит">
        <input type="text" class="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ед. изм.">
      </div>
      <input type="text" class="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Название ресурса">
      <button type="button" class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;
    div.querySelector('button').onclick = () => div.remove();
    elements.constraints.appendChild(div);
  }
  
  // Загрузка шаблонов
  function loadTemplate() {
    const template = elements.template.value;
    if (template === 'production') {
      elements.numVariables.value = 2;
      updateObjectiveInputs();
      const inputs = elements.objectiveInputs.querySelectorAll('input[type="text"]');
      inputs[0].value = 'Продукт A';
      inputs[1].value = 'Продукт B';
      elements.objectiveInputs.querySelectorAll('input[type="number"]')[0].value = 50;
      elements.objectiveInputs.querySelectorAll('input[type="number"]')[1].value = 60;
      elements.optimizeType.value = 'max';
      elements.constraints.innerHTML = '';
      addConstraint();
      const c1 = elements.constraints.querySelector('.constraint');
      c1.querySelectorAll('.coeff')[0].value = 2;
      c1.querySelectorAll('.coeff')[1].value = 3;
      c1.querySelector('.type').value = '<=';
      c1.querySelector('.rhs').value = 100;
      c1.querySelector('input[placeholder="Название ресурса"]').value = 'Сырьё';
      c1.querySelector('input[placeholder="Ед. изм."]').value = 'кг';
      addConstraint();
      const c2 = elements.constraints.querySelectorAll('.constraint')[1];
      c2.querySelectorAll('.coeff')[0].value = 1;
      c2.querySelectorAll('.coeff')[1].value = 1;
      c2.querySelector('.type').value = '<=';
      c2.querySelector('.rhs').value = 40;
      c2.querySelector('input[placeholder="Название ресурса"]').value = 'Рабочие часы';
      c2.querySelector('input[placeholder="Ед. изм."]').value = 'часы';
    } else if (template === 'transport') {
      elements.numVariables.value = 2;
      updateObjectiveInputs();
      const inputs = elements.objectiveInputs.querySelectorAll('input[type="text"]');
      inputs[0].value = 'Маршрут 1';
      inputs[1].value = 'Маршрут 2';
      elements.objectiveInputs.querySelectorAll('input[type="number"]')[0].value = 5;
      elements.objectiveInputs.querySelectorAll('input[type="number"]')[1].value = 7;
      elements.optimizeType.value = 'min';
      elements.constraints.innerHTML = '';
      addConstraint();
      const c1 = elements.constraints.querySelector('.constraint');
      c1.querySelectorAll('.coeff')[0].value = 1;
      c1.querySelectorAll('.coeff')[1].value = 1;
      c1.querySelector('.type').value = '=';
      c1.querySelector('.rhs').value = 100;
      c1.querySelector('input[placeholder="Название ресурса"]').value = 'Объём груза';
      c1.querySelector('input[placeholder="Ед. изм."]').value = 'тонны';
    }
  }
  
  // Показ ошибок
  function showErrors(errors) {
    elements.errorMessages.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <ul class="list-disc pl-5">
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      </div>
    `;
    elements.errorMessages.classList.remove('hidden');
  }
  
  // Очистка ошибок
  function clearErrors() {
    elements.errorMessages.innerHTML = '';
    elements.errorMessages.classList.add('hidden');
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  }
  
  // Валидация входных данных
  function validateInputs() {
    const errors = [];
    const objectiveInputs = elements.objectiveInputs.querySelectorAll('input[type="number"]');
    const constraintElems = elements.constraints.querySelectorAll('.constraint');
  
    // Валидация целевой функции
    const objective = Array.from(objectiveInputs).map(input => input.value);
    objectiveInputs.forEach(input => input.classList.remove('invalid'));
    if (objective.length === 0) {
      errors.push('Цель оптимизации должна содержать хотя бы один продукт');
    } else {
      objective.forEach((val, i) => {
        if (val === '' || isNaN(parseFloat(val))) {
          errors.push(`Коэффициент для ${elements.objectiveInputs.querySelectorAll('input[type="text"]')[i].value || `x${i+1}`} должен быть числом`);
          objectiveInputs[i].classList.add('invalid');
        }
      });
    }
  
    // Валидация ограничений
    if (constraintElems.length === 0) {
      errors.push('Необходимо добавить хотя бы одно ограничение');
    }
    constraintElems.forEach((elem, idx) => {
      const coeffInputs = elem.querySelectorAll('.coeff');
      const coefficients = Array.from(coeffInputs).map(input => input.value);
      const type = elem.querySelector('.type').value;
      const rhs = elem.querySelector('.rhs').value;
      const resourceName = elem.querySelector('input[placeholder="Название ресурса"]').value || `Ресурс ${idx+1}`;
  
      coeffInputs.forEach(input => input.classList.remove('invalid'));
      elem.querySelector('.rhs').classList.remove('invalid');
  
      if (coefficients.length !== state.numVariables) {
        errors.push(`Ограничение "${resourceName}": количество коэффициентов (${coefficients.length}) не соответствует количеству продуктов (${state.numVariables})`);
      }
      coefficients.forEach((val, i) => {
        if (val === '' || isNaN(parseFloat(val))) {
          errors.push(`Ограничение "${resourceName}": коэффициент x${i+1} должен быть числом`);
          coeffInputs[i].classList.add('invalid');
        }
      });
      if (rhs === '' || isNaN(parseFloat(rhs))) {
        errors.push(`Ограничение "${resourceName}": лимит должен быть числом`);
        elem.querySelector('.rhs').classList.add('invalid');
      } else if (parseFloat(rhs) < 0) {
        errors.push(`Ограничение "${resourceName}": лимит должен быть неотрицательным`);
        elem.querySelector('.rhs').classList.add('invalid');
      }
    });
  
    return errors;
  }
  
  // Форматирование результата
  function formatResult(result) {
    const optimizeType = elements.optimizeType.value;
    const objectiveNames = Array.from(elements.objectiveInputs.querySelectorAll('input[type="text"]')).map(input => input.value || `x${parseInt(input.dataset.index)+1}`);
    const statusText = result.status === 'optimal' ? 'Оптимальное решение' : 'Решение не найдено';
    const objectiveText = optimizeType === 'max' ? 'Итоговая прибыль' : 'Минимальные затраты';
  
    let output = `
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Статус</h3>
          <p class="text-gray-600">${statusText}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${objectiveText}</h3>
          <p class="text-2xl font-bold text-blue-600">${result.objective_value.toFixed(2)}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Оптимальное решение</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${Object.entries(result.solution).map(([key, value], idx) => `
              <div class="flex items-center justify-between">
                <span class="text-gray-600 font-medium">${objectiveNames[idx] || key}:</span>
                <span class="text-gray-800 font-bold">${value.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  
    if (result.status === 'optimal') {
      output += `<div class="mt-6"><canvas id="solution-chart"></canvas></div>`;
      setTimeout(() => {
        const ctx = document.getElementById('solution-chart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(result.solution).map((_, idx) => objectiveNames[idx] || `x${idx+1}`),
            datasets: [{
              label: optimizeType === 'max' ? 'Производство' : 'Распределение',
              data: Object.values(result.solution),
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
              borderColor: ['#1e3a8a', '#047857', '#b45309', '#991b1b', '#6d28d9'],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Количество' } },
              x: { title: { display: true, text: optimizeType === 'max' ? 'Продукты' : 'Маршруты' } }
            },
            plugins: { title: { display: true, text: optimizeType === 'max' ? 'Распределение продукции' : 'Распределение затрат' } }
          }
        });
      }, 0);
      output += `<button onclick="exportToCSV()" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Экспорт в CSV</button>`;
    }
  
    return output;
  }
  
  // Экспорт в CSV
  function exportToCSV() {
    if (!state.lastResult) return;
    const objectiveNames = Array.from(elements.objectiveInputs.querySelectorAll('input[type="text"]')).map(input => input.value || `x${parseInt(input.dataset.index)+1}`);
    const optimizeType = elements.optimizeType.value;
    let csv = 'Переменная,Значение\n';
    Object.entries(state.lastResult.solution).forEach(([key, value], idx) => {
      csv += `${objectiveNames[idx] || key},${value.toFixed(2)}\n`;
    });
    csv += `${optimizeType === 'max' ? 'Прибыль' : 'Затраты'},${state.lastResult.objective_value.toFixed(2)}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'economic_solution.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Решение задачи
  async function solve() {
    clearErrors();
    elements.output.innerHTML = '<div class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Загрузка...</div>';
    elements.solveBtn.disabled = true;
    elements.solveBtn.classList.add('opacity-50', 'cursor-not-allowed');
  
    try {
      const objectiveInputs = elements.objectiveInputs.querySelectorAll('input[type="number"]');
      const objectiveNames = Array.from(elements.objectiveInputs.querySelectorAll('input[type="text"]')).map(input => input.value || `x${parseInt(input.dataset.index)+1}`);
      const objective = Array.from(objectiveInputs).map(input => parseFloat(input.value));
      const constraintElems = elements.constraints.querySelectorAll('.constraint');
      const constraints = Array.from(constraintElems).map(elem => ({
        coefficients: Array.from(elem.querySelectorAll('.coeff')).map(input => parseFloat(input.value)),
        type: elem.querySelector('.type').value,
        rhs: parseFloat(elem.querySelector('.rhs').value),
        resourceName: elem.querySelector('input[placeholder="Название ресурса"]').value || `Ресурс ${constraintElems.length}`,
        unit: elem.querySelector('input[placeholder="Ед. изм."]').value || '',
      }));
  
      const errors = validateInputs();
      if (errors.length > 0) {
        showErrors(errors);
        elements.output.innerHTML = '';
        return;
      }
  
      const method = constraints.some(c => c.type === '>=' || c.type === '=') ? 'artificial' : 'simplex';
      const payload = {
        objective,
        objectiveNames,
        constraints,
        method,
        optimize_type: elements.optimizeType.value,
      };
  
      const res = await fetch('http://localhost:5000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }
  
      state.lastResult = await res.json();
      elements.output.innerHTML = formatResult(state.lastResult);
    } catch (err) {
      elements.output.innerHTML = `
        <div class="bg-red-50 p-4 rounded-lg text-red-600 flex items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Ошибка: ${err.message}
        </div>
      `;
    } finally {
      elements.solveBtn.disabled = false;
      elements.solveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
  
  // Инициализация
  elements.updateObjective.onclick = updateObjectiveInputs;
  elements.addConstraint.onclick = addConstraint;
  elements.template.onchange = loadTemplate;
  elements.solveBtn.onclick = solve;
  updateObjectiveInputs();