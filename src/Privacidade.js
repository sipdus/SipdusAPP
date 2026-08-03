import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

const CIANO = "#00BCD4";
const FUNDO = "#F7F7F8";

export default function PrivacidadeScreen({ navigation }) {

  const [email, setEmail] = useState("");

  const handleEnviar = async () => {
    if (!email) {
      Alert.alert("Digite seu email primeiro!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email enviado!",
        "Verifique sua caixa de entrada para redefinir sua senha."
      );
      navigation.goBack();
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Não existe usuário cadastrado com esse email.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Email inválido.");
      } else {
        Alert.alert("Erro ao enviar email", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/sipdus_logo.png")}
          style={styles.logo}
        />
      </View>

      {/* CONTAINER */}
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

          <TouchableOpacity style={styles.button} onPress={handleEnviar}>
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
    backgroundColor: FUNDO,
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 5,
  },

  logo: {
    width: 260,
    height: 150,
    resizeMode: "contain",
  },

  blueContainer: {
    flex: 1,
    backgroundColor: FUNDO,
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
    color: CIANO,
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
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  button: {
    backgroundColor: CIANO,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    width: "60%",
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },

});