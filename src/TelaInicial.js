import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import { WebSocketContext } from "./hooks/WebSocketContext";
import { auth, database } from "../firebaseConfig";
import { ref, get } from "firebase/database";
import * as Notifications from "expo-notifications";
import BotaoSanguezinho from "./components/BotaoSanguezinho";

const DATA = [
  { id: "1", title: "Glicemia", image: require("../assets/glicemia.png") },
  { id: "2", title: "BPM", image: require("../assets/BPM.png") },
  { id: "3", title: "Oximetria", image: require("../assets/SP02.png") },
  { id: "4", title: "Refeições", image: require("../assets/refeicoes.png") },
];

const CIANO = "#00BCD4";
const FUNDO = "#F7F7F8";

export default function TelaInicial({ navigation }) {
  const { isConnected } = useContext(WebSocketContext);

  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    const buscarNome = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const snapshot = await get(ref(database, "usuarios/" + uid));
        if (snapshot.exists()) {
          const nomeCompleto = snapshot.val().nome || "";
          const primeiroNome = nomeCompleto.split(" ")[0];
          setNomeUsuario(primeiroNome);
        }
      } catch (error) {
        console.warn("Erro ao buscar nome do usuário:", error);
      }
    };

    buscarNome();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.title === "Glicemia") {
          navigation.navigate("GlicemiaScreen");
        } else if (item.title === "BPM") {
          navigation.navigate("BPMScreen");
        } else if (item.title === "Oximetria") {
          navigation.navigate("OximetriaScreen");
        } else if (item.title === "Refeições") {
          navigation.navigate("RefeicoesScreen");
        }
      }}
    >
      <Image source={item.image} style={styles.cardImage} />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
   <View style={{ flex: 1 }}>
    <View style={styles.container}>
      
      {/* TOPO */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={require("../assets/menu.png")} style={styles.iconMenu} />
        </TouchableOpacity>

        <Text style={styles.logo}></Text>

        <TouchableOpacity onPress={() => setMostrarNotificacao(true)} style={styles.notificacaoBox}>
          <Image
            source={
              notificacaoAtiva
                ? require("../assets/notificacao.png")
                : require("../assets/notificacaodesligada.png")
            }
            style={notificacaoAtiva ? styles.iconNotificacao : styles.iconNotificacaoDesligada}
          />
        </TouchableOpacity>
      </View>

      {/* SAUDAÇÃO */}
      <View style={styles.greetingWhite}>
        <Text style={styles.helloText}>
          Olá, <Text style={{ fontWeight: "bold", color: CIANO }}>{nomeUsuario || "usuário"}</Text>
        </Text>
      </View>

      {/* STATUS DO SENSOR */}
      <View style={styles.bleStatusContainer}>
        <Text
          style={[
            styles.bleStatusText,
            { color: isConnected ? "#00C853" : "#D32F2F" },
          ]}
        >
          {isConnected ? "Sensor conectado ✅" : "Nenhum sensor conectado"}
        </Text>
      </View>

      {/* CARDS */}
      <View style={styles.contentContainer}>
        <Text style={styles.subtitleText}>Suas informações:</Text>

        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}
        onPress={() => navigation.navigate("TelaInicial")}>
          <View style={styles.footerIconBox}>
            <Image source={require("../assets/inicio.png")} style={styles.footerIconGrande} />
          </View>
          <Text style={styles.footerText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <View style={styles.footerIconBox}>
            <Image source={require("../assets/servicos.png")} style={styles.footerIcon} />
          </View>
          <Text style={styles.footerText}>Serviços</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}
        onPress={() => navigation.navigate("ConfiguracoesScreen")}>
          <View style={styles.footerIconBox}>
            <Image source={require("../assets/configuracoes.png")} style={styles.footerIconGrande} />
          </View>
          <Text style={styles.footerText}>Config.</Text>
        </TouchableOpacity>
      </View>

      {/* POPUP DE NOTIFICAÇÃO */}
      {mostrarNotificacao && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>
              Gostaria de ativar / desativar suas notificações?
            </Text>

            <View style={styles.iconsContainer}>

              <TouchableOpacity
                onPress={async () => {
                  const uid = auth.currentUser?.uid;
                  const snapshot = await get(ref(database, "usuarios/" + uid + "/lembrete_jejum_id"));
                  if (snapshot.exists()) {
                    await Notifications.cancelScheduledNotificationAsync(snapshot.val());
                }
                setNotificacaoAtiva(false);
                setMostrarNotificacao(false);
               Alert.alert("Notificações desativadas", "Seu lembrete de jejum foi cancelado.");
              }}
              >
                <Image
                  source={require("../assets/notificacaodesligada.png")}
                  style={styles.iconPopupdesligada}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setNotificacaoAtiva(true);
                  setMostrarNotificacao(false);
                  Alert.alert(
                    "Notificações ativadas",
                    "Vá em Configurações para escolher o horário do lembrete."
                  );
                }}
              >
                <Image
                  source={require("../assets/notificacao.png")}
                  style={styles.iconPopup}
                />
              </TouchableOpacity>

            </View>
          </View>
        </View>
      )}
    </View>
   <BotaoSanguezinho />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 10,
    backgroundColor: FUNDO,
  },

  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: CIANO,
  },

  iconMenu: {
    width: 100,
    height: 50,
    resizeMode: "contain",
  },

  notificacaoBox: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  iconNotificacao: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  iconNotificacaoDesligada: {
    width: 54,
    height: 54,
    resizeMode: "contain",
    marginTop: -14,
    marginLeft: 7,
  },

  greetingWhite: {
    backgroundColor: FUNDO,
    paddingVertical: 10,
    alignItems: "center",
  },

  helloText: {
    color: "#000",
    fontSize: 22,
    fontWeight: "bold",
  },

  bleStatusContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FUNDO,
    paddingVertical: 10,
    marginBottom: 10,
  },

  bleStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  reconnectButton: {
    marginTop: 8,
    backgroundColor: CIANO,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },

  reconnectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  subtitleText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    marginTop: 2,
  },

  contentContainer: {
    flex: 1,
    backgroundColor: FUNDO,
    paddingTop: 20,
    marginTop: 10,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    marginTop: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 25,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  cardImage: {
    width: 55,
    height: 55,
    marginRight: 20,
    resizeMode: "contain",
  },

  cardText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: FUNDO,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  footerItem: {
    alignItems: "center",
  },

  footerIconBox: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  footerIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  footerIconGrande: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  popup: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },

  popupText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },

  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  iconPopup: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  iconPopupdesligada: {
    width: 52,
    height: 52,
    resizeMode: "contain",
    marginTop: -14,
  }
});