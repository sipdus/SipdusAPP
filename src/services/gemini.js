import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/gemini';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Modelo a usar
const MODELO = 'gemini-flash-lite-latest';

// Contexto do Sipdus
const CONTEXTO_SISTEMA = `
Você é a Sip, assistente virtual do Sipdus, um dispositivo brasileiro 
não invasivo de monitoramento contínuo de glicose desenvolvido como TCC 
por três alunas da ETEC Bento Quirino: Giovana Gomes, Julia Rodrigues e Júlia Locatelli.

REGRAS IMPORTANTES:
- Você é uma IA FEMININA. Fale sempre no feminino ("estou pronta", "fui criada").
- Responda SEMPRE em português do Brasil.
- Seja clara, educativa e acolhedora.
- Respostas CURTAS: no máximo 3 frases.
- NUNCA dê diagnósticos médicos ou prescreva medicamentos.
- SEMPRE lembre que é um dispositivo em fase de testes.
- SEMPRE recomende consultar um profissional de saúde quando for sobre sintomas ou tratamento.
- Se a pergunta não for sobre saúde, diabetes ou o Sipdus, responda educadamente 
  que você só pode ajudar com esses assuntos.

Você pode ajudar com:
- Glicose, oximetria e batimentos cardíacos
- Diabetes tipo 1, tipo 2 e gestacional
- Hipoglicemia e hiperglicemia
- Alimentação para diabéticos
- Exercícios físicos
- Medicação (insulina, metformina)
- Emoções relacionadas ao diabetes
- Como usar o Sipdus
`;

// Função principal de consulta (com retry automático)
export const consultarGemini = async (pergunta, dadosVitais, tentativas = 3) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODELO,
      systemInstruction: CONTEXTO_SISTEMA,
    });

    // Monta contexto com dados atuais (se existirem)
    let contextoDados = '';
    if (dadosVitais) {
      contextoDados = `
DADOS ATUAIS DO PACIENTE (use se a pergunta for sobre eles):
- Glicose: ${dadosVitais.glicose || 'sem leitura'} mg/dL
- Oximetria: ${dadosVitais.oximetria || 'sem leitura'}%
- Batimentos: ${dadosVitais.batimentos || 'sem leitura'} bpm
`;
    }

    const promptFinal = `${contextoDados}\n\nPergunta do usuário: ${pergunta}`;

    const result = await model.generateContent(promptFinal);
    const response = await result.response;
    const texto = response.text();

    return texto.trim();
  } catch (erro) {
    console.error('Erro Gemini:', erro);

    // Se for 503 (servidor sobrecarregado), tenta de novo
    if (erro.message?.includes('503') && tentativas > 0) {
      console.log(`⏳ Servidor ocupado, tentando de novo... (${tentativas} restantes)`);
      await new Promise(r => setTimeout(r, 2000));
      return consultarGemini(pergunta, dadosVitais, tentativas - 1);
    }

    // Se for 429 (rate limit), espera mais e tenta de novo
    if (erro.message?.includes('429') && tentativas > 0) {
      console.log(`⏳ Muitas perguntas, aguardando... (${tentativas} restantes)`);
      await new Promise(r => setTimeout(r, 3000));
      return consultarGemini(pergunta, dadosVitais, tentativas - 1);
    }

    // DEBUG temporário (remover depois que estabilizar)
    return 'DEBUG: ' + (erro.message || JSON.stringify(erro));
  }
};