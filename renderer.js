// renderer.js
const { Chart } = require('chart.js');
let ecgData = { labels: [], data: [] };

const ctx = document.getElementById('ecgChart').getContext('2d');
const ecgChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ecgData.labels,
    datasets: [{
      label: 'ECG',
      data: ecgData.data,
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: false
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Tempo (ms)' }, min: 0, max: 10000 },
      y: { title: { display: true, text: 'Amplitude' } }
    },
    animation: { duration: 0 }
  }
});

// Simulação de dados recebidos (Isso é uma simulação, substitua no codigo real o renderer.js pelas Portas USB)
setInterval(() => {
  const timestamp = Date.now() % 10000; // Gera timestamps simulados
  const ecgValue = Math.floor(Math.random() * 1000); // Gera valores de ECG aleatórios

  ecgData.labels.push(timestamp);
  ecgData.data.push(ecgValue);
  if (ecgData.labels.length > 100) { // Limita os dados a 100 pontos
    ecgData.labels.shift();
    ecgData.data.shift();
  }

  ecgChart.update();
  document.getElementById('textOutput').innerText = `Últimos dados: ECG = ${ecgValue}, Tempo = ${timestamp}`;
}, 500);
