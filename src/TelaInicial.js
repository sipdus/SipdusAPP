import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { BLEContext } from "./hooks/BLEContext";

const DATA = [
  { id: "1", title: "Glicemia", image: require("../assets/glicemia.png") },
  { id: "2", title: "BPM", image: require("../assets/BPM.png") },
  { id: "3", title: "Oximetria", image: require("../assets/SP02.png") },
  { id: "4", title: "Refeições", image: require("../assets/refeicoes.png") },
];

export default function TelaInicial({ navigation }) {
  const { device, isConnected } = useContext(BLEContext);

  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(true);

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
    <View style={styles.container}>
      
      {/* TOPO */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={require("../assets/menu.png")} style={styles.iconLarge} />
        </TouchableOpacity>

        <Text style={styles.logo}></Text>

        <TouchableOpacity onPress={() => setMostrarNotificacao(true)}>
          <Image
            source={
              notificacaoAtiva
                ? require("../assets/notificacao.png")
                : require("../assets/notificacaodesligada.png")
            }
            style={
              notificacaoAtiva
                ? styles.socialIcon
                : styles.socialIconDesligado
            }
          />
        </TouchableOpacity>
      </View>

      {/* SAUDAÇÃO */}
      <View style={styles.greetingWhite}>
        <Text style={styles.helloText}>
          Olá, <Text style={{ fontWeight: "bold" }}>(User)</Text>
        </Text>
      </View>

      {/* STATUS BLE */}
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
      <View style={styles.blueContainer}>
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
          <Image source={require("../assets/inicio.png")} style={styles.footerIconLarge} />
          <Text style={styles.footerText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <Image source={require("../assets/servicos.png")} style={styles.footerIcon} />
          <Text style={styles.footerText}>Serviços</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}
        onPress={() => navigation.navigate("ConfiguracoesScreen")}>
          <Image source={require("../assets/configuracoes.png")} style={styles.footerIcon} />
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

              {/* DESLIGAR */}
              <TouchableOpacity
                onPress={() => {
                  setNotificacaoAtiva(false);
                  setMostrarNotificacao(false);
                }}
              >
                <Image
                  source={require("../assets/notificacaodesligada.png")}
                  style={styles.iconPopupDesligado}
                />
              </TouchableOpacity>

              {/* LIGAR */}
              <TouchableOpacity
                onPress={() => {
                  setNotificacaoAtiva(true);
                  setMostrarNotificacao(false);
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },

  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00BCD4",
  },

  iconLarge: {
    width: 150,
    height: 200,
    resizeMode: "contain",
    marginTop: -120,
  },

  socialIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginTop: -90,
  },

  socialIconDesligado: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginTop: -112,
    marginRight: -15,
  },

  greetingWhite: {
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginBottom: 10,
  },

  bleStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitleText: {
    color: "#000",
    fontSize: 20,
    marginLeft: 10,
    marginTop: 2,
  },

  blueContainer: {
    flex: 1,
    backgroundColor: "#00BCD4",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 0,
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  footerItem: {
    alignItems: "center",
  },

  footerIcon: {
    width: 45,
    height: 38,
    marginBottom: 4,
    resizeMode: "contain",
  },

  footerIconLarge: {
    width: 52,
    height: 40,
    marginBottom: 4,
    resizeMode: "contain",
  },

  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },

  /* POPUP */

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
    backgroundColor: "#00BCD4",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
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
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  iconPopupDesligado: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginTop: -20,
  },
});