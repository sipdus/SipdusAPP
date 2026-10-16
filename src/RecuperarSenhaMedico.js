import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Alert,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

const FUNDO = "#F7F7F8";
const CIANO = "#00BCD4";

export default function RecuperarSenhaMedico({ navigation }) {
  const [email, setEmail] = useState("");

  const handleRecuperar = async () => {
    if (!email.trim()) {
      Alert.alert("Digite seu email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Email enviado!",
        "Enviamos um link de redefinição de senha para o seu email. Verifique sua caixa de entrada (e o spam).",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        Alert.alert("Email inválido.");
      } else if (error.code === "auth/user-not-found") {
        Alert.alert("Não existe conta cadastrada com esse email.");
      } else {
        Alert.alert("Erro", "Não foi possível enviar o email. Tente novamente.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image
          source={require("../assets/sipdus_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.titulo}>Recuperar Senha</Text>
        <Text style={styles.subtitulo}>
          Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
        </Text>

        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="Digite seu email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleRecuperar}>
          <Text style={styles.buttonText}>Enviar link</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltarText}>← Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  topContainer: {
    backgroundColor: FUNDO, alignItems: "center",
    justifyContent: "flex-start", height: 200, paddingBottom: 30,
  },
  logo: {
    width: 275, height: 3000, resizeMode: "contain",
    marginTop: -1380, alignItems: "center", marginLeft: 20,
  },
  bottomContainer: {
    flex: 1, backgroundColor: FUNDO,
    paddingTop: 20, paddingHorizontal: 25,
  },
  titulo: {
    fontSize: 20, fontWeight: "bold", color: CIANO,
    textAlign: "center", marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13, color: "#666", textAlign: "center", marginBottom: 20,
  },
  label: { color: "#000", fontSize: 16, marginBottom: 5, marginTop: 15, fontWeight: "500" },
  input: {
    backgroundColor: "#fff", borderRadius: 25,
    padding: 12, fontSize: 15, paddingHorizontal: 20,
  },
  button: {
    backgroundColor: CIANO, paddingVertical: 12, borderRadius: 25,
    alignItems: "center", marginTop: 30, width: 280,
    alignSelf: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  voltarText: { color: "#666", fontSize: 13, marginTop: 20, textAlign: "center" },
});