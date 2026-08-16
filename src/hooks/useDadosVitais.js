import { useState, useEffect, useCallback } from 'react';

export function useDadosVitais() {
  const [dados, setDados] = useState({
    glicose: 0,
    oximetria: 0,
    batimentos: 0,
    tendencia: 'estavel',
    ultimaLeitura: null
  });

  const [historico, setHistorico] = useState([]);

  // Simula leituras do sensor (depois conecta com Bluetooth real)
  useEffect(() => {
    const intervalo = setInterval(() => {
      const novaLeitura = {
        glicose: Math.floor(Math.random() * 80) + 80,
        oximetria: Math.floor(Math.random() * 5) + 95,
        batimentos: Math.floor(Math.random() * 30) + 60,
        timestamp: new Date().toISOString()
      };

      setDados(prev => ({
        ...novaLeitura,
        tendencia: novaLeitura.glicose > prev.glicose + 10 ? 'subindo' :
                   novaLeitura.glicose < prev.glicose - 10 ? 'caindo' : 'estavel',
        ultimaLeitura: novaLeitura.timestamp
      }));

      setHistorico(prev => [...prev.slice(-20), novaLeitura]);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const classificarGlicose = useCallback((valor) => {
    if (valor < 70) return { nivel: 'hipoglicemia', cor: '#ff4444', icone: '⚠️' };
    if (valor < 100) return { nivel: 'normal', cor: '#4CAF50', icone: '✅' };
    if (valor < 126) return { nivel: 'pré-diabetes', cor: '#FFA726', icone: '⚠️' };
    return { nivel: 'alto', cor: '#ff4444', icone: '🔴' };
  }, []);

  return { dados, historico, classificarGlicose };
}