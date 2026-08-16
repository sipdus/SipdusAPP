import * as Speech from 'expo-speech';

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
// BASE DE CONHECIMENTO SUPER COMPLETA
// ============================================
const BASE_CONHECIMENTO = {

  // 🗣️ CONVERSA CASUAL
  saudacoes: [
    { p: ['oi', 'olá', 'ola', 'e aí', 'e ai', 'hey', 'oie', 'opa', 'oii', 'eai'], r: 'Olá! Eu sou a Sip, assistente virtual do Sipdus. Como posso ajudar?' },
    { p: ['tudo bem', 'como você está', 'como voce esta', 'como vai', 'como tá', 'como ta', 'tudo certo', 'beleza', 'de boa', 'suave', 'tranquilo', 'tranquila'], r: 'Estou aqui pronta para te ajudar! Em que posso ser útil?' },
    { p: ['bom dia', 'dia', 'manhã', 'manha'], r: 'Bom dia! Espero que esteja bem. Precisa de algo?' },
    { p: ['boa tarde', 'tarde'], r: 'Boa tarde! Como posso ajudar?' },
    { p: ['boa noite', 'noite'], r: 'Boa noite! Em que posso ser útil?' },
    { p: ['obrigado', 'obrigada', 'valeu', 'brigado', 'muito obrigado', 'muito obrigada', 'agradecido', 'agradecida', 'thanks', 'obg', 'obrigad'], r: 'Por nada! Estou aqui quando precisar.' },
    { p: ['tchau', 'até mais', 'ate mais', 'adeus', 'xau', 'flw', 'falou', 'até logo', 'ate logo', 'até amanhã', 'ate amanha', 'fui', 'vou nessa', 'até', 'ate'], r: 'Até mais! Cuide-se bem.' },
    { p: ['quem é você', 'quem e voce', 'o que você é', 'o que voce e', 'quem é vc', 'quem e vc', 'quem é você?', 'quem és tu'], r: 'Sou a Sip, assistente virtual do Sipdus, um dispositivo não invasivo de monitoramento de glicose.' },
    { p: ['você é real', 'voce e real', 'você existe', 'voce existe', 'você é humano', 'voce e humano', 'você é robô', 'voce e robo'], r: 'Sou uma inteligência artificial criada para ajudar pessoas com diabetes. Estou em fase de testes.' },
    { p: ['qual seu nome', 'como você chama', 'como voce chama', 'seu nome', 'qual é seu nome', 'qual e seu nome', 'como te chamam', 'teu nome'], r: 'Meu nome é Sip! Assistente virtual do Sipdus.' },
    { p: ['o que você faz', 'o que voce faz', 'o que você pode fazer', 'o que voce pode fazer', 'me ajuda', 'como funciona', 'o que sabe', 'o que você sabe', 'o que voce sabe', 'suas funções', 'suas funcoes'], r: 'Posso te ajudar com: glicose, oximetria, batimentos, diabetes, alimentação, exercícios, medicação e mais. Pergunte à vontade!' },
    { p: ['piada', 'conta piada', 'me faz rir'], r: 'Por que a diabética foi ao médico? Porque estava com açúcar demais no sangue! 😄' },
  ],

  // 🩺 DIABETES
  diabetes: [
    { p: ['o que é diabetes', 'o que e diabetes', 'definição de diabetes', 'definicao de diabetes', 'explica diabetes', 'conceito de diabetes', 'significado diabetes', 'diabetes o que é', 'diabetes o que e'], r: 'Diabetes é uma condição onde o corpo não produz ou não usa a insulina adequadamente, causando aumento da glicose no sangue.' },
    { p: ['tipo 1', 'diabetes tipo 1', 'o que é tipo 1', 'o que e tipo 1', 'diabetes infantil', 'diabetes juvenil', 'tipo um'], r: 'O tipo 1 ocorre quando o sistema imunológico ataca as células do pâncreas que produzem insulina. É mais comum em crianças e jovens.' },
    { p: ['tipo 2', 'diabetes tipo 2', 'o que é tipo 2', 'o que e tipo 2', 'diabetes adulto', 'tipo dois'], r: 'O tipo 2 é quando o corpo não usa bem a insulina que produz. Está ligado a hábitos alimentares e excesso de peso.' },
    { p: ['diferença entre tipo 1 e tipo 2', 'diferença tipo 1 tipo 2', 'diferenca tipo 1 tipo 2', 'diferença diabetes', 'diferenca diabetes', 'tipo 1 e tipo 2'], r: 'No tipo 1 o corpo não produz insulina. No tipo 2 o corpo produz mas não usa direito.' },
    { p: ['cura', 'diabetes tem cura', 'tem cura', 'cura diabetes', 'diabetes é curável', 'diabetes e curavel', 'dá pra curar', 'da pra curar'], r: 'Atualmente não tem cura, mas tem controle com tratamento adequado e hábitos saudáveis.' },
    { p: ['pré-diabetes', 'pre-diabetes', 'pré diabetes', 'pre diabetes', 'pré-diabético', 'pre diabetico', 'pré diabetica', 'pre diabetica'], r: 'É quando a glicose está entre 100 e 125 mg/dL em jejum. É um sinal de alerta.' },
    { p: ['diabetes é grave', 'diabetes e grave', 'diabetes é perigoso', 'diabetes e perigoso', 'diabetes mata', 'gravidade diabetes', 'diabetes é sério', 'diabetes e serio'], r: 'Pode ser se não controlada. Mas com monitoramento e tratamento, é possível ter uma vida normal.' },
    { p: ['causa diabetes', 'o que causa diabetes', 'por que diabetes', 'porque diabetes', 'origem diabetes', 'motivo diabetes', 'porque dá diabetes', 'porque da diabetes'], r: 'Fatores genéticos, alimentação inadequada, sedentarismo e obesidade estão entre as causas.' },
    { p: ['sintomas diabetes', 'sinais diabetes', 'como saber se tenho diabetes', 'sintomas de diabetes', 'sinais de diabetes', 'indícios diabetes', 'indicius diabetes'], r: 'Sede excessiva, vontade de urinar frequente, cansaço, visão turva e perda de peso sem motivo.' },
    { p: ['criança diabetes', 'crianca diabetes', 'bebê diabetes', 'bebe diabetes', 'criança pode ter diabetes', 'crianca pode ter diabetes'], r: 'Sim, principalmente o tipo 1. Mas o tipo 2 também está aumentando em crianças.' },
    { p: ['insulina', 'o que é insulina', 'o que e insulina', 'para que serve insulina', 'função da insulina', 'funcao da insulina', 'hormônio insulina', 'hormonio insulina'], r: 'É um hormônio que ajuda a glicose a entrar nas células. Diabéticos tipo 1 precisam tomar.' },
    { p: ['tratamento diabetes', 'como tratar diabetes', 'como é o tratamento', 'como e o tratamento', 'tratamento para diabetes', 'controlar diabetes'], r: 'Envolve monitoramento da glicose, alimentação saudável, exercícios e, quando necessário, medicamentos. Consulte seu médico.' },
    { p: ['diabetes gestacional', 'gravidez diabetes', 'grávida diabetes', 'gravida diabetes', 'diabetes na gravidez'], r: 'É o diabetes que aparece durante a gravidez. Precisa de acompanhamento médico especial.' },
    { p: ['diabetes contagioso', 'diabetes pega', 'diabetes transmite', 'pegar diabetes', 'transmissão diabetes', 'transmissao diabetes'], r: 'Não! Diabetes não é contagioso. Não se pega de outra pessoa.' },
    { p: ['complicações diabetes', 'complicacoes diabetes', 'consequências diabetes', 'consequencias diabetes', 'o que diabetes causa'], r: 'Se não controlada, pode causar problemas nos rins, olhos, coração e nervos. Por isso o monitoramento é importante.' },
  ],

  // ⚠️ HIPOGLICEMIA
  hipoglicemia: [
    { p: ['hipoglicemia', 'o que é hipoglicemia', 'o que e hipoglicemia', 'definição de hipoglicemia', 'definicao de hipoglicemia', 'explica hipoglicemia', 'hipoglicemia o que é', 'hipoglicemia o que e', 'glicose baixa', 'baixa glicose'], r: 'Hipoglicemia é quando a glicose está abaixo de 70 mg/dL. Pode causar tremores, suor frio e tontura.' },
    { p: ['sintomas hipoglicemia', 'sinais hipoglicemia', 'como saber hipoglicemia', 'sintomas glicose baixa', 'sinais glicose baixa', 'hipoglicemia sintomas'], r: 'Tremores, suor frio, tontura, fome intensa, visão turva e confusão mental.' },
    { p: ['causa hipoglicemia', 'por que hipoglicemia', 'porque hipoglicemia', 'o que provoca hipoglicemia', 'o que causa hipoglicemia', 'hipoglicemia causa'], r: 'Excesso de insulina, pouca alimentação, exercício intenso ou consumo de álcool.' },
    { p: ['glicose abaixo de 70', 'glicose baixa é perigoso', 'hipoglicemia é perigosa', 'glicose 70', 'hipoglicemia perigosa', 'risco hipoglicemia'], r: 'Sim, é considerado hipoglicemia. Valores muito baixos precisam de atenção imediata. Consulte um profissional de saúde.' },
    { p: ['o que fazer hipoglicemia', 'como tratar hipoglicemia', 'tratamento hipoglicemia', 'o que comer hipoglicemia', 'hipoglicemia o que fazer', 'agir hipoglicemia'], r: 'Consulte um profissional de saúde para orientações específicas. Este dispositivo está em fase de testes.' },
    { p: ['hipoglicemia noturna', 'glicose baixa de madrugada', 'hipoglicemia dormindo', 'glicose baixa noite', 'hipoglicemia à noite', 'hipoglicemia a noite'], r: 'É a queda de glicose durante o sono. Pode causar pesadelos, suor e dor de cabeça ao acordar. Monitore regularmente.' },
    { p: ['qual valor hipoglicemia', 'quando é hipoglicemia', 'qual nível hipoglicemia', 'qual nivel hipoglicemia', 'valor hipoglicemia'], r: 'Abaixo de 70 mg/dL é considerado hipoglicemia.' },
  ],

  // 🔴 HIPERGLICEMIA
  hiperglicemia: [
    { p: ['hiperglicemia', 'o que é hiperglicemia', 'o que e hiperglicemia', 'definição de hiperglicemia', 'definicao de hiperglicemia', 'explica hiperglicemia', 'hiperglicemia o que é', 'hiperglicemia o que e', 'glicose alta'], r: 'Hiperglicemia é quando a glicose está muito alta, geralmente acima de 180 mg/dL após refeições.' },
    { p: ['sintomas hiperglicemia', 'sinais hiperglicemia', 'sintomas glicose alta', 'sinais glicose alta', 'hiperglicemia sintomas'], r: 'Sede excessiva, boca seca, vontade frequente de urinar, cansaço e visão turva.' },
    { p: ['causa hiperglicemia', 'por que hiperglicemia', 'porque hiperglicemia', 'o que provoca hiperglicemia', 'o que causa hiperglicemia', 'hiperglicemia causa'], r: 'Falta de insulina, excesso de comida, estresse ou infecções.' },
    { p: ['glicose alta é perigoso', 'hiperglicemia é perigosa', 'glicose 200', 'hiperglicemia perigosa', 'risco hiperglicemia', 'glicose alta perigoso'], r: 'Sim, se mantida por muito tempo pode trazer complicações. Consulte seu médico.' },
    { p: ['o que fazer hiperglicemia', 'como tratar hiperglicemia', 'tratamento hiperglicemia', 'o que fazer glicose alta', 'hiperglicemia o que fazer', 'agir hiperglicemia'], r: 'Consulte um profissional de saúde para orientações específicas. Este dispositivo está em fase de testes.' },
    { p: ['qual valor hiperglicemia', 'quando é hiperglicemia', 'qual nível hiperglicemia', 'qual nivel hiperglicemia', 'valor hiperglicemia'], r: 'Acima de 180 mg/dL após refeições é considerado hiperglicemia.' },
  ],

  // 📱 SIPDUS
  sipdus: [
    { p: ['como funciona o sipdus', 'funciona sipdus', 'como o sipdus funciona', 'explica sipdus', 'o que é sipdus', 'o que e sipdus', 'sipdus como funciona', 'sipdus o que é', 'sipdus o que e'], r: 'O Sipdus usa um sensor óptico e inteligência artificial para estimar a glicose sem furar o dedo.' },
    { p: ['fura o dedo', 'o sipdus fura o dedo', 'precisa furar', 'precisa agulha', 'sipdus dói', 'sipdus doi', 'sipdus fura', 'dor sipdus'], r: 'Não! O Sipdus é totalmente não invasivo, não precisa de agulhas e não causa dor.' },
    { p: ['sipdus é confiável', 'sipdus confiavel', 'sipdus é confiavel', 'posso confiar no sipdus', 'sipdus é preciso', 'sipdus confiança', 'sipdus confianca', 'sipdus funciona mesmo'], r: 'Ela está em fase de testes. Os valores são estimativas e não substituem exames laboratoriais.' },
    { p: ['preciso de internet', 'funciona sem internet', 'sipdus precisa de wifi', 'sipdus internet', 'sipdus offline', 'sipdus sem internet'], r: 'O dispositivo funciona offline via Bluetooth com o aplicativo.' },
    { p: ['como conectar o sensor', 'conectar sensor', 'parear sipdus', 'conectar sipdus', 'ativar bluetooth', 'bluetooth sipdus', 'vincular sipdus', 'ligar sipdus'], r: 'Ative o Bluetooth no celular e aproxime do dispositivo Sipdus.' },
    { p: ['quanto custa o sipdus', 'preço sipdus', 'preco sipdus', 'valor sipdus', 'sipdus custa', 'sipdus preço', 'sipdus preco', 'sipdus é caro', 'sipdus e caro'], r: 'Ainda está em desenvolvimento. O objetivo é ser acessível para todos.' },
    { p: ['onde comprar o sipdus', 'comprar sipdus', 'sipdus à venda', 'sipdus a venda', 'sipdus vende', 'sipdus loja', 'sipdus compra'], r: 'Ainda não está à venda. É um projeto acadêmico em fase de testes.' },
    { p: ['bateria sipdus', 'precisa de bateria', 'sipdus carrega', 'sipdus bateria', 'carregar sipdus', 'bateria acaba'], r: 'Sim, o dispositivo tem bateria recarregável.' },
    { p: ['o sipdus substitui o glicosímetro', 'substitui glicosimetro', 'sipdus substitui', 'sipdus é melhor que glicosímetro', 'sipdus e melhor que glicosimetro'], r: 'Não, ela é um complemento para monitoramento. Consulte sempre seu médico.' },
    { p: ['como usar o sipdus', 'usar sipdus', 'como medir com sipdus', 'sipdus como usar', 'instruções sipdus', 'instrucoes sipdus', 'posicionar dedo sipdus'], r: 'Basta conectar via Bluetooth e posicionar o dedo no sensor. O aplicativo mostra os dados em tempo real.' },
  ],

  // 💨 OXIMETRIA
  oximetriaInfo: [
    { p: ['oximetria', 'o que é oximetria', 'o que e oximetria', 'definição oximetria', 'definicao oximetria', 'explica oximetria', 'spo2', 'spo 2', 'o que é spo2', 'o que e spo2', 'oxigenação', 'oxigenacao'], r: 'É a medição da quantidade de oxigênio no sangue.' },
    { p: ['oximetria normal', 'spo2 normal', 'valor normal oximetria', 'qual o normal da oximetria', 'oximetria boa', 'oximetria ideal'], r: 'O normal é entre 95% e 100%.' },
    { p: ['oximetria baixa', 'spo2 baixo', 'oximetria 90', 'oximetria baixa é perigoso', 'oximetria baixa perigoso', 'oximetria ruim', 'oxigenação baixa', 'oxigenacao baixa'], r: 'Abaixo de 92% é considerado grave. Procure atendimento médico.' },
    { p: ['por que medir oximetria', 'para que serve oximetria', 'importância oximetria', 'importancia oximetria', 'pra que oximetria', 'função oximetria', 'funcao oximetria'], r: 'Ela indica se seu corpo está recebendo oxigênio suficiente.' },
    { p: ['como medir oximetria', 'medir oximetria', 'como funciona oximetria', 'oximetria como mede', 'oximetria dedo'], r: 'O sensor óptico do Sipdus mede através da pele usando luz. É indolor.' },
  ],

  // ❤️ BATIMENTOS
  batimentosInfo: [
    { p: ['batimento normal', 'bpm normal', 'frequência normal', 'frequencia normal', 'batimento cardíaco normal', 'batimento cardiaco normal', 'qual o batimento normal', 'batimento ideal', 'bpm ideal'], r: 'Em repouso, entre 60 e 100 bpm para adultos.' },
    { p: ['batimento alto', 'bpm alto', 'coração acelerado', 'coracao acelerado', 'taquicardia', 'batimento alto é ruim', 'batimento alto ruim', 'coração rápido', 'coracao rapido'], r: 'Pode indicar estresse ou esforço. Se persistir, consulte um médico.' },
    { p: ['batimento baixo', 'bpm baixo', 'coração lento', 'coracao lento', 'bradicardia', 'batimento baixo é ruim', 'batimento baixo ruim', 'coração devagar', 'coracao devagar'], r: 'Abaixo de 60 bpm em repouso pode ser normal em atletas. Mas convém monitorar.' },
    { p: ['o que é bpm', 'o que e bpm', 'significa bpm', 'bpm significa', 'o que significa bpm'], r: 'BPM significa Batimentos Por Minuto. É a medida da frequência cardíaca.' },
    { p: ['como medir batimentos', 'medir batimentos', 'como funciona bpm', 'batimentos como mede', 'bpm como mede'], r: 'O sensor do Sipdus detecta os batimentos através da luz que atravessa a pele.' },
  ],

  // 🍎 ALIMENTAÇÃO
  alimentacao: [
    { p: ['o que posso comer', 'que posso comer', 'o que eu posso comer', 'dieta diabetes', 'cardápio diabetes', 'cardapio diabetes', 'alimentação diabetes', 'alimentacao diabetes', 'comida diabetes', 'o que comer diabetes'], r: 'Prefira alimentos integrais, legumes, verduras e proteínas magras. Evite açúcares e farinhas brancas.' },
    { p: ['frutas', 'quais frutas posso comer', 'frutas diabetes', 'fruta para diabético', 'fruta para diabetico', 'melhor fruta diabetes', 'frutas permitidas', 'fruta pode'], r: 'Todas com moderação. Prefira frutas com mais fibra como maçã, pera e morango.' },
    { p: ['doce', 'pode comer doce', 'comer doce', 'diabético pode comer doce', 'diabetico pode comer doce', 'açúcar pode', 'acucar pode', 'chocolate', 'bolo', 'sobremesa'], r: 'Deve-se evitar. Caso consuma, que seja em pequena quantidade e monitorando a glicose.' },
    { p: ['contagem de carboidratos', 'contar carboidratos', 'como contar carboidratos', 'carboidratos', 'carboídratos', 'contagem carbo'], r: 'É uma técnica para calcular a quantidade de insulina baseada nos carboidratos da refeição.' },
    { p: ['arroz', 'arroz integral', 'arroz branco', 'arroz integral ou branco', 'qual arroz', 'arroz diabetes', 'melhor arroz diabetes'], r: 'O integral é melhor pois tem mais fibras e libera glicose mais devagar.' },
    { p: ['suco', 'suco de fruta', 'suco pode', 'suco natural', 'suco diabetes', 'beber suco'], r: 'É melhor comer a fruta inteira. O suco concentra o açúcar e perde as fibras.' },
    { p: ['adoçante', 'adocante', 'adoçante pode', 'adocante pode', 'adoçante diabetes', 'adocante diabetes', 'açúcar artificial', 'acucar artificial', 'açúcar de dieta', 'acucar de dieta'], r: 'Alguns são permitidos. Consulte um nutricionista para saber qual o melhor para você.' },
    { p: ['álcool', 'alcool', 'beber álcool', 'beber alcool', 'cerveja', 'vinho', 'cachaça', 'cachaca', 'bebida alcoólica', 'bebida alcoolica'], r: 'Deve ser evitado ou consumido com muita moderação. Pode causar hipoglicemia.' },
    { p: ['quantas refeições', 'quantas refeicoes', 'quantas vezes comer', 'refeições por dia', 'refeicoes por dia', 'quantas refeições por dia', 'comer quantas vezes'], r: 'O ideal é fazer de 5 a 6 pequenas refeições ao longo do dia.' },
    { p: ['comer antes de dormir', 'lanche antes dormir', 'comer à noite', 'comer a noite', 'lanche noturno', 'comer de madrugada'], r: 'Um lanche leve pode ajudar a evitar hipoglicemia noturna. Consulte seu médico.' },
    { p: ['pão', 'pao', 'pão integral', 'pao integral', 'pão diabetes', 'pao diabetes', 'pão francês', 'pao frances'], r: 'Prefira pães integrais ou de grãos. São digeridos mais devagar.' },
    { p: ['leite', 'laticínios', 'laticinios', 'leite diabetes', 'leite pode', 'iogurte', 'queijo'], r: 'Leite desnatado ou semidesnatado pode ser consumido com moderação.' },
    { p: ['café', 'cafe', 'café diabetes', 'cafe diabetes', 'café pode', 'cafe pode', 'cafezinho'], r: 'O café sem açúcar pode ser consumido. Evite adoçar com açúcar.' },
    { p: ['ovo', 'ovos', 'ovo diabetes', 'ovos diabetes', 'ovo pode'], r: 'Ovos são ótimas fontes de proteína e podem ser consumidos normalmente.' },
    { p: ['carne', 'carnes', 'carne vermelha', 'frango', 'peixe'], r: 'Prefira carnes magras como frango e peixe. Carne vermelha com moderação.' },
  ],

  // 🏃 EXERCÍCIOS
  exercicios: [
    { p: ['posso fazer exercícios', 'posso fazer exercicios', 'exercício diabetes', 'exercicio diabetes', 'atividade física diabetes', 'atividade fisica diabetes', 'posso me exercitar', 'posso treinar', 'exercício', 'exercicio'], r: 'Sim! Exercícios ajudam a controlar a glicose. Mas monitore antes e depois.' },
    { p: ['qual melhor exercício', 'qual melhor exercicio', 'melhor exercício diabetes', 'melhor exercicio diabetes', 'que exercício fazer', 'que exercicio fazer', 'melhor treino'], r: 'Caminhada, natação e bicicleta são ótimos. O importante é se movimentar.' },
    { p: ['exercício baixa a glicose', 'exercicio baixa glicose', 'exercício ajuda diabetes', 'exercicio ajuda diabetes', 'exercício reduz glicose', 'exercicio reduz glicose', 'treino baixa glicose'], r: 'Sim, o exercício ajuda a reduzir a glicose no sangue.' },
    { p: ['quanto tempo de exercício', 'quanto tempo de exercicio', 'tempo exercício', 'tempo exercicio', 'quanto devo caminhar', 'quantos minutos exercício', 'quantos minutos exercicio', 'duração treino', 'duracao treino'], r: 'O ideal são 30 minutos por dia, 5 vezes por semana. Comece aos poucos.' },
    { p: ['correr', 'corrida', 'corrida diabetes', 'correr diabetes', 'corrida de rua', 'jogging'], r: 'Sim, corrida é ótima! Mas monitore a glicose antes e depois do treino.' },
    { p: ['musculação', 'musculacao', 'levantar peso', 'academia', 'malhar', 'treino de força', 'treino de forca', 'musculação diabetes', 'musculacao diabetes'], r: 'Musculação ajuda a controlar a glicose. Consulte um educador físico.' },
    { p: ['exercício em jejum', 'exercicio em jejum', 'treinar em jejum', 'jejum treino', 'treino jejum', 'exercício jejum', 'exercicio jejum'], r: 'Pode ser arriscado. Consulte seu médico antes de treinar em jejum.' },
    { p: ['hipoglicemia exercício', 'hipoglicemia exercicio', 'exercício causa hipoglicemia', 'exercicio causa hipoglicemia', 'glicose cai treino', 'glicose baixa treino'], r: 'Sim, exercício intenso pode baixar a glicose. Monitore antes e depois.' },
    { p: ['natação', 'natacao', 'nadar', 'natação diabetes', 'natacao diabetes', 'nadar diabetes', 'piscina'], r: 'Natação é excelente! É um exercício completo e seguro.' },
    { p: ['bicicleta', 'pedalar', 'bike', 'ciclismo', 'pedalar diabetes', 'bicicleta diabetes', 'andar de bicicleta', 'pedal'], r: 'Pedalar é ótimo para o coração e ajuda a controlar a glicose.' },
    { p: ['caminhada', 'caminhar', 'andar a pé', 'andar a pe', 'caminhada leve', 'passear', 'caminhada diabetes'], r: 'Caminhar 30 minutos por dia é uma das melhores atividades para diabetes.' },
    { p: ['dança', 'danca', 'dançar', 'dancar', 'dança diabetes', 'danca diabetes', 'zumba'], r: 'Dançar é uma ótima forma de exercício! Além de divertido, ajuda a controlar a glicose.' },
  ],

  // 💊 MEDICAÇÃO
  medicacao: [
    { p: ['metformina', 'o que é metformina', 'o que e metformina', 'metformina para que serve', 'remédio metformina', 'remedio metformina'], r: 'É um medicamento comum para diabetes tipo 2. Consulte seu médico sobre seu uso.' },
    { p: ['insulina engorda', 'insulina faz engordar', 'insulina ganho de peso', 'engorda insulina', 'insulina peso'], r: 'Pode causar ganho de peso. Uma alimentação equilibrada ajuda a controlar.' },
    { p: ['esqueci de tomar insulina', 'esqueci insulina', 'não tomei insulina', 'nao tomei insulina', 'esqueci o remédio', 'esqueci o remedio', 'pulei a insulina', 'esqueci a medicação', 'esqueci a medicacao'], r: 'Consulte seu médico para orientação. Não tome dose dupla sem orientação.' },
    { p: ['como tomar insulina', 'aplicar insulina', 'aplicação de insulina', 'aplicacao de insulina', 'como aplicar insulina', 'como usar insulina', 'insulina como toma'], r: 'A aplicação deve ser orientada por um profissional de saúde. Não se automedique.' },
    { p: ['onde aplicar insulina', 'local aplicação insulina', 'local aplicacao insulina', 'lugar aplicar insulina', 'insulina onde aplica', 'onde aplicar'], r: 'Barriga, coxa e braço são locais comuns. Consulte seu médico.' },
    { p: ['insulina dói', 'insulina doi', 'aplicação dói', 'aplicacao doi', 'insulina dor', 'aplicação de insulina dói', 'aplicacao de insulina doi'], r: 'Com técnica correta, a dor é mínima. Agulhas modernas são bem finas.' },
    { p: ['tipos de insulina', 'quais insulinas', 'insulina rápida', 'insulina rapida', 'insulina lenta', 'tipos insulina', 'insulina regular', 'insulina basal'], r: 'Existem insulinas de ação rápida, intermediária e lenta. Cada caso é único.' },
    { p: ['parar de tomar remédio', 'parar de tomar remedio', 'parar medicação', 'parar medicacao', 'parar o tratamento', 'suspender remédio', 'suspender remedio', 'parar insulina'], r: 'Nunca pare a medicação sem orientação médica!' },
    { p: ['remédio diabetes emagrece', 'remedio diabetes emagrece', 'metformina emagrece', 'emagrecer com remédio', 'emagrecer com remedio', 'remédio emagrece', 'remedio emagrece'], r: 'Alguns medicamentos podem causar perda de peso. Consulte seu médico.' },
    { p: ['beber com remédio', 'beber com remedio', 'álcool com remédio', 'alcool com remedio', 'remédio e álcool', 'remedio e alcool', 'bebida com remédio', 'bebida com remedio'], r: 'Não é recomendado. Álcool pode interagir com medicamentos e causar hipoglicemia.' },
    { p: ['horário do remédio', 'horario do remedio', 'hora do remédio', 'hora do remedio', 'que horas tomar remédio', 'que horas tomar remedio', 'horário medicação', 'horario medicacao'], r: 'Siga o horário prescrito pelo seu médico. A Sip pode te ajudar a lembrar.' },
    { p: ['remédio diabetes', 'remedio diabetes', 'medicamento diabetes', 'quais remédios diabetes', 'quais remedios diabetes', 'medicação diabetes', 'medicacao diabetes'], r: 'Existem vários medicamentos. O médico escolhe o ideal para cada caso.' },
  ],

  // 😰 EMOÇÕES
  emocoes: [
    { p: ['estou triste', 'triste', 'estou deprimido', 'deprimido', 'depressão', 'depressao', 'tristeza', 'para baixo', 'desanimado', 'desanimada'], r: 'Sinto muito que esteja assim. Conviver com diabetes não é fácil. Converse com alguém de confiança.' },
    { p: ['ansioso', 'ansiosa', 'ansiedade', 'estou ansioso', 'estou ansiosa', 'diabetes me deixa ansioso', 'nervoso', 'nervosa', 'preocupado', 'preocupada'], r: 'É normal sentir ansiedade. Tente respirar fundo e focar no que está sob seu controle.' },
    { p: ['ninguém me entende', 'ninguem me entende', 'não me entendem', 'nao me entendem', 'estou sozinho', 'estou sozinha', 'sozinho', 'sozinha', 'solidão', 'solidao'], r: 'Infelizmente muitas pessoas não entendem. Mas você não está sozinho. Busque grupos de apoio.' },
    { p: ['cansado de me cuidar', 'cansado de cuidar', 'cansada de cuidar', 'cansaço diabetes', 'cansaco diabetes', 'cuidar cansa', 'exausto', 'exausta', 'esgotado', 'esgotada'], r: 'É compreensível. O autocuidado diário é desgastante. Que tal conversar com seu médico sobre isso?' },
    { p: ['não aguento mais', 'nao aguento mais', 'desisto', 'não consigo mais', 'nao consigo mais', 'vou desistir', 'sem forças', 'sem forcas'], r: 'Entendo seu cansaço. Lembre-se que você não está sozinho nessa jornada. Busque apoio.' },
    { p: ['tenho medo', 'medo diabetes', 'medo de complicações', 'medo de complicacoes', 'com medo', 'assustado', 'assustada', 'medo de morrer'], r: 'É normal ter medo. O acompanhamento médico regular ajuda a prevenir complicações.' },
    { p: ['estou com raiva', 'raiva diabetes', 'por que eu', 'porque eu', 'raiva', 'revoltado', 'revoltada', 'injusto'], r: 'Sentir raiva é normal. Tente canalizar essa energia para cuidar ainda melhor de você.' },
    { p: ['me sinto culpado', 'culpa diabetes', 'culpado diabetes', 'culpada diabetes', 'culpa', 'me sinto culpada', 'me sinto culpado'], r: 'Diabetes não é culpa sua. Muitos fatores influenciam. O importante é seguir com o tratamento.' },
  ],
};

// ============================================
// COMANDOS RÁPIDOS
// ============================================
export const COMANDOS_RAPIDOS = [
  { label: '🩸 Glicose', texto: 'qual minha glicose' },
  { label: '💨 Oximetria', texto: 'qual minha oximetria' },
  { label: '❤️ Batimentos', texto: 'quais meus batimentos' },
  { label: '📊 Resumo', texto: 'como estou' },
];

// ============================================
// PROCESSADOR DE COMANDOS
// ============================================
export const processarComando = (texto, dados, classificarGlicose) => {
  const textoLimpo = texto.toLowerCase().trim();

  // 1. Saudacoes
  for (const item of BASE_CONHECIMENTO.saudacoes) {
    for (const palavra of item.p) {
      if (textoLimpo.includes(palavra)) {
        return item.r;
      }
    }
  }

  // 2. Base de conhecimento
  for (const categoria of Object.values(BASE_CONHECIMENTO)) {
    if (categoria === BASE_CONHECIMENTO.saudacoes) continue;
    for (const item of categoria) {
      if (item.r === null) continue;
      for (const palavra of item.p) {
        if (textoLimpo.includes(palavra)) {
          return item.r;
        }
      }
    }
  }

  // 3. Dados dinâmicos
  const respostaDinamica = processarDinamico(textoLimpo, dados, classificarGlicose);
  if (respostaDinamica) return respostaDinamica;

  // 4. Não entendeu
  return 'Não entendi. Você pode perguntar sobre sua glicose, oximetria, batimentos, diabetes, alimentação, exercícios, medicação ou dizer "ajuda".';
};

// ============================================
// PROCESSADOR DE COMANDOS DINÂMICOS
// ============================================
function processarDinamico(texto, dados, classificarGlicose) {
  // Glicose (leitura)
  if (
    texto.includes('qual minha glicose') ||
    texto.includes('quanto tá a glicose') ||
    texto.includes('quanto ta a glicose') ||
    texto.includes('medir glicose') ||
    texto.includes('minha glicose está') ||
    texto.includes('minha glicose esta') ||
    texto.includes('glicose atual') ||
    texto.includes('glicemia agora') ||
    texto.includes('leitura glicose')
  ) {
    const classificacao = classificarGlicose(dados.glicose);
    let resposta = `Sua glicose está ${dados.glicose} miligramas por decilitro. `;

    if (dados.glicose < 70) {
      resposta += 'Valor abaixo de 70. Classificação: hipoglicemia.';
    } else if (dados.glicose > 180) {
      resposta += 'Valor acima de 180. Classificação: hiperglicemia.';
    } else if (dados.glicose >= 70 && dados.glicose <= 100) {
      resposta += 'Valor dentro da faixa de normalidade em jejum.';
    } else if (dados.glicose > 100 && dados.glicose <= 125) {
      resposta += 'Valor alterado. Classificação: pré-diabetes.';
    } else {
      resposta += 'Valor acima do normal.';
    }

    resposta += ` Tendência: ${dados.tendencia}. Lembre-se: dispositivo em fase de testes. Consulte um profissional de saúde.`;
    return resposta;
  }

  // Oximetria (leitura)
  if (
    texto.includes('qual minha oximetria') ||
    texto.includes('minha oximetria') ||
    texto.includes('quanto tá a oximetria') ||
    texto.includes('quanto ta a oximetria') ||
    texto.includes('saturação atual') ||
    texto.includes('saturacao atual') ||
    texto.includes('leitura oximetria') ||
    texto.includes('meu spo2')
  ) {
    let resposta = `Sua oximetria está ${dados.oximetria} por cento. `;
    if (dados.oximetria >= 95) resposta += 'Valor dentro da faixa normal.';
    else if (dados.oximetria >= 90) resposta += 'Valor entre 90 e 94%.';
    else resposta += 'Valor abaixo de 90%.';
    resposta += ' Dispositivo em fase de testes.';
    return resposta;
  }

  // Batimentos (leitura)
  if (
    texto.includes('quais meus batimentos') ||
    texto.includes('meus batimentos') ||
    texto.includes('quanto tá o batimento') ||
    texto.includes('quanto ta o batimento') ||
    texto.includes('batimento atual') ||
    texto.includes('frequência cardíaca atual') ||
    texto.includes('frequencia cardiaca atual') ||
    texto.includes('leitura batimento') ||
    texto.includes('meu bpm')
  ) {
    let resposta = `Seus batimentos estão ${dados.batimentos} por minuto. `;
    if (dados.batimentos >= 60 && dados.batimentos <= 100) resposta += 'Valor dentro da faixa normal de repouso.';
    else resposta += 'Valor fora da faixa de repouso.';
    resposta += ' Dispositivo em fase de testes.';
    return resposta;
  }

  // Resumo
  if (
    texto.includes('resumo') ||
    texto.includes('como estou') ||
    texto.includes('meus dados') ||
    texto.includes('dados completos') ||
    texto.includes('todas as leituras') ||
    texto.includes('leitura completa') ||
    texto.includes('tudo de uma vez')
  ) {
    return `Resumo: Glicose ${dados.glicose} mg/dL. Oximetria ${dados.oximetria}%. Batimentos ${dados.batimentos} por minuto. Tendência da glicose: ${dados.tendencia}. Dispositivo em fase de testes.`;
  }

  // Ajuda
  if (
    texto.includes('ajuda') ||
    texto.includes('comandos') ||
    texto.includes('o que você faz') ||
    texto.includes('o que voce faz') ||
    texto.includes('o que você sabe') ||
    texto.includes('o que voce sabe')
  ) {
    return 'Posso ajudar com: glicose, oximetria, batimentos, diabetes, hipoglicemia, hiperglicemia, alimentação, exercícios, medicação, emoções e mais. Pergunte à vontade!';
  }

  return null;
}