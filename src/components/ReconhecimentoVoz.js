import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const VERMELHO = "#E53935";

const HTML_VOZ = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .status { font-size: 20px; color: #E53935; margin-bottom: 20px; text-align: center; }
    .btn {
      background: #E53935; color: white; border: none;
      padding: 20px 40px; font-size: 22px; border-radius: 50px;
      cursor: pointer; display: flex; align-items: center; gap: 10px;
    }
    .result {
      font-size: 16px; color: #333; margin-top: 20px; text-align: center;
      background: #f5f5f5; padding: 15px; border-radius: 10px;
      min-height: 50px; width: 100%;
    }
    .error { color: #999; font-size: 14px; margin-top: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="status" id="status">🎤 Iniciando...</div>
  <button class="btn" id="btnFalar" onclick="iniciar()">🎤 Falar agora</button>
  <div class="result" id="resultado">...</div>
  <div class="error">Fale em português. Se não funcionar, use o campo de texto.</div>

  <script>
    let recognition = null;

    function iniciar() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        document.getElementById('status').textContent = '❌ Não suportado';
        document.getElementById('resultado').textContent = 'Seu navegador não suporta reconhecimento de voz. Use o campo de texto.';
        return;
      }

      if (recognition) recognition.abort();

      recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = function() {
        document.getElementById('status').textContent = '🔴 Ouvindo... Fale agora!';
        document.getElementById('btnFalar').style.background = '#FF1744';
      };

      recognition.onresult = function(event) {
        const texto = event.results[0][0].transcript;
        document.getElementById('resultado').textContent = texto;
        document.getElementById('status').textContent = '✅ Reconhecido!';
        document.getElementById('btnFalar').style.background = '#E53935';
        window.ReactNativeWebView.postMessage(texto);
      };

      recognition.onerror = function(event) {
        document.getElementById('status').textContent = '❌ Erro: ' + event.error;
        document.getElementById('btnFalar').style.background = '#E53935';
      };

      recognition.onend = function() {
        document.getElementById('status').textContent = '🎤 Toque para falar';
        document.getElementById('btnFalar').style.background = '#E53935';
      };

      recognition.start();
    }

    // AUTO-INICIA MAIS RÁPIDO
    window.onload = function() {
      setTimeout(function() { iniciar(); }, 200);
    };
  </script>
</body>
</html>
`;

export default function ReconhecimentoVoz({ visivel, onFechar, onTexto }) {
  const [carregando, setCarregando] = useState(true);

  const receberMensagem = (event) => {
    const texto = event.nativeEvent.data;
    if (texto && texto.trim()) {
      // Fecha primeiro (mais rápido)
      onFechar();
      // Processa logo depois
      setTimeout(() => {
        onTexto(texto.trim());
      }, 50);
    }
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent={false} onRequestClose={onFechar}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onFechar}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.titulo}>🎤 Comando de Voz</Text>
          <View style={{ width: 28 }} />
        </View>

        {carregando && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={VERMELHO} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}

        <WebView
          source={{ html: HTML_VOZ }}
          onMessage={receberMensagem}
          onLoadEnd={() => setCarregando(false)}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: VERMELHO, paddingHorizontal: 16, paddingTop: 55, paddingBottom: 15,
  },
  titulo: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10 },
  loadingText: { color: '#666', fontSize: 13 },
  webview: { flex: 1, backgroundColor: '#F7F7F8' },
});