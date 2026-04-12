import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";

export default function ConfiguracoesScreen({ navigation }) {

  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [tipoAcao, setTipoAcao] = useState("");

  const renderOption = (titulo, icon, danger = false, privacidade = false) => (
    <TouchableOpacity
      style={styles.option}
      activeOpacity={0.7}
      onPress={() => {

         if (titulo === "Privacidade") {
        navigation.navigate("PrivacidadeScreen");
        }
        
        if (titulo === "Excluir a conta") {
          setTipoAcao("excluir");
          setMostrarPopup(true);
        }

        if (titulo === "Excluir seus dados") {
          setTipoAcao("dados");
          setMostrarPopup(true);
        }
      }}
    >

      <Text style={[styles.optionText, danger && styles.dangerText]}>
        {titulo}
      </Text>

      <View style={styles.iconBox}>
        <Image
          source={icon}
          style={[styles.icon, privacidade && styles.iconPrivacidade]}
        />
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/voltar.png")}
            style={styles.voltaIcon}
          />
        </TouchableOpacity>
      </View>

      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logosipdus.jpg")}
          style={styles.logo}
        />
      </View>

      {/* CONTAINER AZUL */}
      <ScrollView
        style={styles.blueContainer}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>Configurações</Text>

        {renderOption("Gerenciar Conta", require("../assets/user.png"))}

        {renderOption("Solicitar seus dados", require("../assets/dados.png"))}

        {renderOption("Privacidade", require("../assets/privacidade.png"), false, true)}

        {renderOption("Excluir a conta", require("../assets/excluirconta.png"), true)}

        {renderOption("Excluir seus dados", require("../assets/excluirdados.png"), true)}

        {/* BOTÃO SAIR */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            setTipoAcao("sair");
            setMostrarPopup(true);
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>

          <Image
            source={require("../assets/sair.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

      </ScrollView>

      {/* POPUP */}
      {mostrarPopup && (
        <View style={styles.overlay}>
          <View style={styles.popup}>

            <Text style={styles.popupText}>
              {tipoAcao === "sair"
                ? "Tem certeza que deseja sair?"
                : tipoAcao === "excluir"
                ? "Tem certeza que deseja encerrar sua conta?"
                : "Tem certeza que deseja apagar seus dados?"}
            </Text>

            <View style={styles.iconsContainer}>

              {/* NÃO */}
              <TouchableOpacity onPress={() => setMostrarPopup(false)}>
                <Text style={styles.botaoTexto}>Sim</Text>
              </TouchableOpacity>

              {/* SIM */}
              <TouchableOpacity
                onPress={() => {
                  setMostrarPopup(false);

                  if (tipoAcao === "sair") {
                    console.log("Saiu");
                  } else if (tipoAcao === "excluir") {
                    console.log("Conta excluída");
                  } else if (tipoAcao === "dados") {
                    console.log("Dados apagados");
                  }
                }}
              >
                <Text style={styles.botaoTexto}>Não</Text>
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
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 70,
  },

  voltaIcon: {
    width: 100,
    height: 70,
    resizeMode: "contain",
    marginLeft: -25,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginLeft: 20,
  },

  logo: {
    width: 240,
    height: 130,
    resizeMode: "contain",
  },

  blueContainer: {
    flex: 1,
    backgroundColor: "#00BCD4",
    borderTopRightRadius: 60,
    padding: 20,
  },

  title: {
    fontSize: 18,
    marginBottom: 20,
    color: "#000",
    alignSelf: "center",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F2F2",
    width: "85%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 12,
  },

  optionText: {
    fontSize: 15,
    color: "#000",
  },

  dangerText: {
    color: "#E53935",
  },

  iconBox: {
    backgroundColor: "#2DAEC1",
    padding: 6,
    borderRadius: 5,
  },

  icon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  iconPrivacidade: {
    width: 26,
    height: 26,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    backgroundColor: "#E5E5E5",
    width: "55%",
    paddingVertical: 12,
    borderRadius: 6,
  },

  logoutText: {
    marginRight: 8,
    fontSize: 16,
    color: "#E53935"
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

  botaoTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

});