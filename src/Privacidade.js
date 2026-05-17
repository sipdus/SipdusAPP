import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from "react-native";

export default function PrivacidadeScreen({ navigation }) {

  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>

      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logosipdus.jpg")}
          style={styles.logo}
        />
      </View>

      {/* CONTAINER AZUL */}
      <View style={styles.blueContainer}>

        {/* VOLTAR */}
        <TouchableOpacity
          style={styles.voltarContainer}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets/voltar.png")}
            style={styles.voltarIcon}
          />
          <Text style={styles.voltarText}>Voltar</Text>
        </TouchableOpacity>

        {/* CONTEÚDO */}
        <View style={styles.content}>

          <Text style={styles.title}>Redefinição de Senha</Text>

          <Text style={styles.description}>
            Enviaremos um link de recuperação de senha.
          </Text>

          <Text style={styles.label}>Informe seu email:</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  /* 🔥 LOGO MAIOR */
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 5,
  },

  logo: {
    width: 260, // 🔥 aumentei
    height: 150,
    resizeMode: "contain",
  },

  /* 🔥 IGUAL CONFIGURAÇÕES */
  blueContainer: {
    flex: 1,
    backgroundColor: "#00BCD4",
    borderTopRightRadius: 60, // 🔥 só lado direito igual config
    borderTopLeftRadius: 0,
    padding: 20,
  },

  voltarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  voltarIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 8,
  },

  voltarText: {
    fontSize: 22,
    color: "#000",
    fontWeight: "600",
    marginLeft: -10,
    marginTop: -5,
  },

  content: {
    marginTop: 40,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: "#000",
    marginBottom: 25,
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 5,
    alignSelf: "flex-start",
    width: "100%",
  },

  input: {
    backgroundColor: "#E5E5E5",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    width: "100%",
  },

  button: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    width: "60%",
  },

  buttonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },

});