import React, { createContext, useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { auth, database } from "../../firebaseConfig";
import { ref, push } from "firebase/database";

export const WebSocketContext = createContext({});

// ⚠️ IP do ESP32 (muda se reconectar no Wi-Fi)
const ESP32_IP = "172.20.10.13";
const WS_URL = `ws://${ESP32_IP}/ws`;

export const WebSocketProvider = ({ children }) => {
  const wsRef = useRef(null);
  const ultimoEnvioRef = useRef(0);
  const reconectarRef = useRef(null);

  const [bpm, setBPM] = useState(null);
  const [spo2, setSpO2] = useState(null);
  const [glucose, setGlucose] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const conectar = () => {
    console.log("🔌 Conectando em:", WS_URL);
    Alert.alert("🔌 Debug", "Conectando em " + WS_URL);

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("✅ Conectado ao ESP32!");
        Alert.alert("✅ Debug", "Conectado ao ESP32!");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const dados = JSON.parse(event.data);
          console.log("📥 Recebi:", dados);

          if (dados.bpm !== undefined) setBPM(dados.bpm);
          if (dados.spo2 !== undefined) setSpO2(dados.spo2);
          if (dados.glicemia !== undefined) setGlucose(dados.glicemia);

          // Salva no Firebase a cada 3 segundos
          const agora = Date.now();
          if (agora - ultimoEnvioRef.current > 3000) {
            ultimoEnvioRef.current = agora;

            const uid = auth.currentUser?.uid;
            if (uid) {
              push(ref(database, "leituras"), {
                usuario_id: uid,
                bpm: dados.bpm,
                spo2: dados.spo2,
                glicemia: dados.glicemia,
                timestamp: agora,
                data_hora: new Date().toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                }),
              }).catch((erro) => {
                console.warn("Erro ao salvar no Firebase:", erro);
              });
            }
          }
        } catch (err) {
          console.warn("Erro ao processar mensagem:", err);
        }
      };

      ws.onerror = (err) => {
        console.warn("❌ Erro no WebSocket:", err.message || err);
        Alert.alert("❌ Debug", "Erro: " + (err.message || "sem detalhes"));
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log("⚠️ Desconectado. Código:", event.code, "Motivo:", event.reason);
        Alert.alert("⚠️ Debug", "Desconectado (código " + event.code + ")");
        setIsConnected(false);

        if (reconectarRef.current) {
          clearTimeout(reconectarRef.current);
        }

        reconectarRef.current = setTimeout(() => {
          conectar();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn("❌ Erro ao criar WebSocket:", err);
      Alert.alert("❌ Debug", "Erro ao criar WebSocket: " + err.message);
      setIsConnected(false);

      reconectarRef.current = setTimeout(() => {
        conectar();
      }, 3000);
    }
  };

  useEffect(() => {
    conectar();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconectarRef.current) {
        clearTimeout(reconectarRef.current);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ bpm, spo2, glucose, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};