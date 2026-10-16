import * as Speech from 'expo-speech';
import { consultarGemini } from './gemini';

// ============================================
// CONFIGURAÇÃO DE VOZ
// ============================================
export const configurarVoz = async () => {
  const vozes = await Speech.getAvailableVoicesAsync();
  const vozPT = vozes.find(v => v.language.includes('pt'));
  return vozPT;
};

export const falar = async (texto) => {
  try {
    await Speech.stop();
    await Speech.speak(texto, {
      language: 'pt-BR',
      pitch: 1.15,
      rate: 1.0,
      volume: 1.0,
    });
    return true;
  } catch (erro) {
    console.error('Erro ao falar:', erro);
    return false;
  }
};

export const pararFala = async () => {
  await Speech.stop();
};

// ============================================
// COMANDOS RÁPIDOS
// ============================================
export const COMANDOS_RAPIDOS = [
  { label: 'Glicose', texto: 'qual minha glicose' },
  { label: 'Oximetria', texto: 'qual minha oximetria' },
  { label: 'Batimentos', texto: 'quais meus batimentos' },
  { label: 'Resumo', texto: 'como estou' },
];

// ============================================
// BASE LOCAL (SÓ LEITURAS - SEM CLASSIFICAÇÃO)
// ============================================
const processarLeitura = (texto, dados, classificarGlicose) => {
    // Glicose (SEM classificação automática)
  if (
    texto.includes('qual minha glicose') ||
    texto.includes('quanto tá a glicose') ||
    texto.includes('quanto ta a glicose') ||
    texto.includes('minha glicose') ||
    texto.includes('glicose atual') ||
    texto.includes('glicemia agora') ||
    texto.includes('leitura glicose') ||
    texto.includes('medir glicose') ||
    texto.includes('ver glicose') ||
    texto.includes('mostrar glicose') ||
    texto.includes('checar glicose') ||
    texto.includes('testar glicose') ||
    texto.includes('resultado glicose') ||
    texto === 'glicose' ||
    texto === 'glicemia' ||
    texto === 'dextro' ||
    texto.includes('meu açúcar') ||
    texto.includes('meu acucar') ||
    texto.includes('nível de açúcar') ||
    texto.includes('nivel de acucar') ||
    texto.includes('taxa de açúcar') ||
    texto.includes('taxa de acucar') ||
    texto.includes('glicose no sangue') ||
    texto.includes('açúcar no sangue') ||
    texto.includes('acucar no sangue')
  ) {
    return `Sua glicose está ${dados.glicose} miligramas por decilitro. Lembre-se: dispositivo em fase de testes e o valor de referência depende se está em jejum ou não. Consulte um profissional de saúde.`;
  }

  // Oximetria
  if (
    texto.includes('qual minha oximetria') ||
    texto.includes('minha oximetria') ||
    texto.includes('oximetria') ||
    texto.includes('spo2') ||
    texto.includes('saturação') ||
    texto.includes('saturacao') ||
    texto.includes('oxigenação') ||
    texto.includes('oxigenacao')
  ) {
    let resposta = `Sua oximetria está ${dados.oximetria} por cento. `;
    if (dados.oximetria >= 95) resposta += 'Valor dentro da faixa normal.';
    else if (dados.oximetria >= 90) resposta += 'Valor entre 90 e 94%.';
    else resposta += 'Valor abaixo de 90%.';
    resposta += ' Dispositivo em fase de testes.';
    return resposta;
  }

  // Batimentos
  if (
    texto.includes('quais meus batimentos') ||
    texto.includes('meus batimentos') ||
    texto.includes('batimento') ||
    texto.includes('bpm') ||
    texto.includes('coração') ||
    texto.includes('coracao') ||
    texto.includes('pulsação') ||
    texto.includes('pulsacao')
  ) {
    let resposta = `Seus batimentos estão ${dados.batimentos} por minuto. `;
    if (dados.batimentos >= 60 && dados.batimentos <= 100) resposta += 'Valor dentro da faixa normal de repouso.';
    else resposta += 'Valor fora da faixa de repouso.';
    resposta += ' Dispositivo em fase de testes.';
    return resposta;
  }

  // Resumo (sem classificação da glicose)
  if (
    texto.includes('resumo') ||
    texto.includes('como estou') ||
    texto.includes('meus dados') ||
    texto.includes('visão geral') ||
    texto.includes('visao geral')
  ) {
    return `Resumo: Glicose ${dados.glicose} mg/dL. Oximetria ${dados.oximetria}%. Batimentos ${dados.batimentos} por minuto. Dispositivo em fase de testes.`;
  }

  return null;
};

// ============================================
// PROCESSADOR COM IA
// ============================================
export const processarComIA = async (texto, dados, classificarGlicose) => {
  // 1. Tenta leitura local (rápida)
  const respostaLocal = processarLeitura(texto.toLowerCase().trim(), dados, classificarGlicose);

  if (respostaLocal) {
    return respostaLocal;
  }

  // 2. Tudo o mais vai pra IA
  console.log('Chamando Gemini...');
  const respostaIA = await consultarGemini(texto, dados);
  return respostaIA;
};