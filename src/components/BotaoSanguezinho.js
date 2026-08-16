import React, { useState, useContext } from 'react';
import {
  View, TouchableOpacity, Image, StyleSheet, Modal, Text,
  TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLEContext } from '../hooks/BLEContext';
import { falar, processarComando, configurarVoz, COMANDOS_RAPIDOS } from '../services/assistenteVoz';
import ReconhecimentoVoz from './ReconhecimentoVoz';

const CIANO = "#00BCD4";
const VERMELHO = "#E53935";

export default function BotaoSanguezinho() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [micVisivel, setMicVisivel] = useState(false);
  const [falando, setFalando] = useState(false);
  const [textoComando, setTextoComando] = useState('');
  const [ultimaResposta, setUltimaResposta] = useState('');
  const [historico, setHistorico] = useState([]);

  const { bpm, spo2, glucose, isConnected } = useContext(BLEContext);

  const dadosReais = {
    glicose: glucose ?? 0,
    oximetria: spo2 ?? 0,
    batimentos: bpm ?? 0,
    tendencia: 'estavel',
  };

  const classificarGlicose = (valor) => {
    if (valor < 70) return { nivel: 'hipoglicemia', cor: '#ff4444' };
    if (valor < 100) return { nivel: 'normal', cor: '#4CAF50' };
    if (valor < 126) return { nivel: 'pré-diabetes', cor: '#FFA726' };
    return { nivel: 'alto', cor: '#ff4444' };
  };

  const abrirAssistente = () => {
    configurarVoz();
    setModalVisivel(true);

    setTimeout(() => {
      const apresentacao = "Olá! Eu sou a Sip, assistente virtual do Sipdus. O que você quer saber?";
      setUltimaResposta(apresentacao);
      falar(apresentacao);
    }, 150);
  };

  const processarTextoRecebido = async (texto) => {
    const resposta = processarComando(texto, dadosReais, classificarGlicose);
    setUltimaResposta(resposta);
    setHistorico(prev => [
      { tipo: 'usuario', texto: texto, hora: new Date().toLocaleTimeString() },
      { tipo: 'sangue', texto: resposta, hora: new Date().toLocaleTimeString() },
      ...prev
    ].slice(0, 20));

    setTextoComando('');
    setFalando(true);
    await falar(resposta);
    setFalando(false);
  };

  const enviarComando = async () => {
    if (!textoComando.trim()) return;
    await processarTextoRecebido(textoComando.trim());
  };

  const executarRapido = async (comando) => {
    const resposta = processarComando(comando, dadosReais, classificarGlicose);
    setUltimaResposta(resposta);
    setHistorico(prev => [
      { tipo: 'usuario', texto: comando, hora: new Date().toLocaleTimeString() },
      { tipo: 'sangue', texto: resposta, hora: new Date().toLocaleTimeString() },
      ...prev
    ].slice(0, 20));

    setFalando(true);
    await falar(resposta);
    setFalando(false);
  };

  const classificacao = classificarGlicose(dadosReais.glicose);

  return (
    <>
      <TouchableOpacity style={styles.botaoFlutuante} onPress={abrirAssistente} activeOpacity={0.8}>
        <Image source={require("../../assets/sanguezinho.png")} style={styles.imagemBotao} resizeMode="contain" />
      </TouchableOpacity>

      <Modal visible={modalVisivel} animationType="slide" transparent={false} onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisivel(false)}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitulo}>🩸 Sip {isConnected ? '✅' : '⚠️'}</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.mascoteContainer}>
              <Image source={require("../../assets/sanguezinho.png")} style={styles.mascoteImagem} resizeMode="contain" />
            </View>

            {!isConnected && (
              <View style={styles.desconectadoBox}>
                <Text style={styles.desconectadoTexto}>⚠️ Sensor desconectado - mostrando dados simulados</Text>
              </View>
            )}

            <View style={styles.cardsRow}>
              <View style={styles.dataCard}>
                <Text style={styles.cardIcon}>🩸</Text>
                <Text style={styles.cardValue}>{dadosReais.glicose}</Text>
                <Text style={styles.cardUnit}>mg/dL</Text>
                <Text style={[styles.cardStatus, { color: classificacao.cor }]}>{classificacao.nivel}</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.cardIcon}>💨</Text>
                <Text style={styles.cardValue}>{dadosReais.oximetria}</Text>
                <Text style={styles.cardUnit}>% SpO2</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.cardIcon}>❤️</Text>
                <Text style={styles.cardValue}>{dadosReais.batimentos}</Text>
                <Text style={styles.cardUnit}>bpm</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.botaoMicrofone} onPress={() => setMicVisivel(true)} disabled={falando}>
              <Ionicons name="mic" size={28} color="#FFF" />
              <Text style={styles.botaoMicrofoneTexto}>Tocar e Falar</Text>
            </TouchableOpacity>

            <Text style={styles.ouTexto}>── ou ──</Text>

            <Text style={styles.sectionTitle}>Comandos rápidos:</Text>
            <View style={styles.botoesGrid}>
              {COMANDOS_RAPIDOS.map((cmd, index) => (
                <TouchableOpacity key={index} style={styles.botaoRapido} onPress={() => executarRapido(cmd.texto)} disabled={falando}>
                  <Text style={styles.botaoRapidoTexto}>{cmd.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder='Digite seu comando...'
                placeholderTextColor="#999"
                value={textoComando}
                onChangeText={setTextoComando}
                onSubmitEditing={enviarComando}
                returnKeyType="send"
                editable={!falando}
              />
              <TouchableOpacity
                style={[styles.botaoEnviar, { opacity: textoComando.trim() && !falando ? 1 : 0.4 }]}
                onPress={enviarComando}
                disabled={!textoComando.trim() || falando}
              >
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {falando && (
              <View style={styles.statusBox}>
                <Ionicons name="volume-high" size={18} color="#FFF" />
                <Text style={styles.statusText}>Sip está respondendo...</Text>
              </View>
            )}

            {ultimaResposta ? (
              <View style={styles.respostaBox}>
                <Text style={styles.respostaTitulo}>🩸 Sip:</Text>
                <Text style={styles.respostaTexto}>{ultimaResposta}</Text>
              </View>
            ) : null}

            <View style={styles.avisoBox}>
              <Ionicons name="flask-outline" size={14} color="#E67E22" />
              <Text style={styles.avisoText}>Dispositivo em fase de testes. {isConnected ? 'Dados do sensor.' : 'Dados simulados.'}</Text>
            </View>

            {historico.length > 0 && (
              <View style={styles.historicoContainer}>
                <Text style={styles.sectionTitle}>Conversa:</Text>
                {historico.map((item, index) => (
                  <View key={index} style={[styles.historicoItem, item.tipo === 'usuario' ? styles.historicoUsuario : styles.historicoSangue]}>
                    <Text style={styles.historicoHora}>{item.hora}</Text>
                    <Text style={styles.historicoTexto}>{item.tipo === 'usuario' ? '🎤 ' : '🩸 '}{item.texto}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <ReconhecimentoVoz
        visivel={micVisivel}
        onFechar={() => setMicVisivel(false)}
        onTexto={processarTextoRecebido}
      />
    </>
  );
}

const styles = StyleSheet.create({
  botaoFlutuante: {
    position: 'absolute', right: 20, bottom: 100,
    width: 75, height: 75, justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  imagemBotao: { width: 75, height: 75 },
  modalContainer: { flex: 1, backgroundColor: '#F7F7F8' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: VERMELHO, paddingHorizontal: 16, paddingTop: 55, paddingBottom: 15,
  },
  modalTitulo: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalContent: { flex: 1, padding: 15 },
  mascoteContainer: { alignItems: 'center', marginVertical: 10 },
  mascoteImagem: { width: 100, height: 120 },
  desconectadoBox: {
    backgroundColor: '#FFF3CD', padding: 8, borderRadius: 6,
    alignItems: 'center', marginBottom: 10,
  },
  desconectadoTexto: { fontSize: 11, color: '#856404' },
  cardsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 15 },
  dataCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 10,
    alignItems: 'center', flex: 1, elevation: 3,
  },
  cardIcon: { fontSize: 22 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  cardUnit: { fontSize: 10, color: '#7f8c8d' },
  cardStatus: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  botaoMicrofone: {
    flexDirection: 'row', backgroundColor: VERMELHO, padding: 15, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, elevation: 3,
  },
  botaoMicrofoneTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  ouTexto: { textAlign: 'center', color: '#999', fontSize: 13, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8, marginTop: 5 },
  botoesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  botaoRapido: {
    backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0',
  },
  botaoRapidoTexto: { color: '#2c3e50', fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 25,
    paddingHorizontal: 14, alignItems: 'center', elevation: 3, marginBottom: 15,
  },
  input: { flex: 1, height: 45, fontSize: 14, color: '#2c3e50' },
  botaoEnviar: {
    backgroundColor: VERMELHO, width: 36, height: 36,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  statusBox: {
    flexDirection: 'row', backgroundColor: VERMELHO, padding: 8, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 15,
  },
  statusText: { color: '#FFF', marginLeft: 6, fontWeight: '600', fontSize: 13 },
  respostaBox: {
    backgroundColor: '#FFF', padding: 12, borderRadius: 10,
    borderLeftWidth: 4, borderLeftColor: VERMELHO, marginBottom: 15, elevation: 2,
  },
  respostaTitulo: { fontWeight: 'bold', fontSize: 14, marginBottom: 4, color: '#2c3e50' },
  respostaTexto: { fontSize: 14, color: '#2c3e50', lineHeight: 20 },
  avisoBox: {
    flexDirection: 'row', backgroundColor: '#FEF9E7', padding: 8,
    borderRadius: 6, alignItems: 'center', marginBottom: 15,
  },
  avisoText: { flex: 1, fontSize: 10, color: '#E67E22', marginLeft: 6 },
  historicoContainer: { marginBottom: 30 },
  historicoItem: { padding: 8, borderRadius: 6, marginBottom: 4 },
  historicoUsuario: { backgroundColor: '#E3F2FD', borderLeftWidth: 3, borderLeftColor: CIANO },
  historicoSangue: { backgroundColor: '#FFEBEE', borderLeftWidth: 3, borderLeftColor: VERMELHO },
  historicoHora: { fontSize: 9, color: '#999', marginBottom: 1 },
  historicoTexto: { fontSize: 12, color: '#2c3e50' },
});