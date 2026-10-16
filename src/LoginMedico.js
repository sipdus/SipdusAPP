import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Alert,
} from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "../firebaseConfig";

const FUNDO = "#F7F7F8";
const CIANO = "#00BCD4";

export default function LoginMedico({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      Alert.alert("Preencha email e senha.");
      return;
    }

    try {
      const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
      const uid = credencial.user.uid;

      const snap = await get(ref(database, `medicos/${uid}`));

      if (!snap.exists()) {
        await signOut(auth);
        Alert.alert("Acesso negado", "Essa conta não está cadastrada como médico.");
        return;
      }

      const dados = snap.val();

      if (dados.aprovado !== true) {
        await signOut(auth);
        Alert.alert(
          "Cadastro em análise",
          "Seu cadastro ainda está em análise. Aguarde a aprovação do CRM."
        );
        return;
      }

      navigation.replace("TelaMedico", { medicoUid: uid, medicoNome: dados.nome });
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        Alert.alert("Email ou senha incorretos.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Email inválido.");
      } else {
        Alert.alert("Erro ao entrar", error.message);
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
        <Text style={styles.titulo}>Área do Profissional</Text>
        <Text style={styles.subtitulo}>Entre com sua conta de médico cadastrada</Text>

        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="Digite seu email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Senha:</Text>
        <TextInput
          placeholder="Digite sua senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
        />

        <TouchableOpacity onPress={() => navigation.navigate("RecuperarSenhaMedico")}>
          <Text style={styles.forgotText}>Esqueci minha senha...</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={styles.registerText}>
            Não tem cadastro?{" "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate("CadastroMedico")}
            >
              Cadastre-se
            </Text>
          </Text>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.voltarText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
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
  forgotText: {
    color: "#000", marginTop: 10, marginBottom: 20,
    textAlign: "right", fontSize: 13, textDecorationLine: "underline",
  },
  button: {
    backgroundColor: CIANO, paddingVertical: 12, borderRadius: 25,
    alignItems: "center", marginBottom: 30, width: 280,
    alignSelf: "center", marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  registerText: { color: "#000", textAlign: "center", fontSize: 14 },
  registerLink: { fontWeight: "bold", textDecorationLine: "underline" },
  voltarText: { color: "#666", fontSize: 13, marginTop: 15, textAlign: "center" },
});