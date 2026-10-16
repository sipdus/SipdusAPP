import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Alert, ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebaseConfig";

const FUNDO = "#F7F7F8";
const CIANO = "#00BCD4";

export default function CadastroMedico({ navigation }) {
  const [nome, setNome] = useState("");
  const [crm, setCrm] = useState("");
  const [uf, setUf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleCadastro = async () => {
    if (!nome.trim() || !crm.trim() || !uf.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert("Preencha todos os campos.");
      return;
    }
    if (uf.trim().length !== 2) {
      Alert.alert("UF inválida", "A UF deve ter 2 letras (ex: SP).");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Senha fraca", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("As senhas não coincidem.");
      return;
    }

    let credencial;
    try {
      credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Já existe uma conta com esse email.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Email inválido.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else {
        Alert.alert("Erro", "Não foi possível criar a conta. Tente novamente.");
      }
      return;
    }

    try {
      await set(ref(database, `medicos/${credencial.user.uid}`), {
        nome: nome.trim(),
        crm: crm.trim(),
        uf: uf.trim().toUpperCase(),
        email: email.trim(),
        aprovado: false,
      });

      await signOut(auth);

      Alert.alert(
        "Cadastro enviado!",
        "Seu acesso fica pendente até a validação do CRM. Você receberá uma resposta em breve.",
        [{ text: "OK", onPress: () => navigation.replace("LoginMedico") }]
      );
    } catch (error) {
      console.error("Falha ao salvar médico:", error);
      try { await credencial.user.delete(); } catch (e) {}
      await signOut(auth).catch(() => {});
      Alert.alert("Erro", "Não foi possível salvar seu cadastro. Tente novamente.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image
            source={require("../assets/sipdus_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.titulo}>Cadastro do Profissional</Text>
          <Text style={styles.subtitulo}>Seu acesso será liberado após validação do CRM</Text>

          <Text style={styles.label}>Nome completo:</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

          <View style={styles.linhaDupla}>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>CRM:</Text>
              <TextInput style={styles.input} value={crm} onChangeText={setCrm} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>UF:</Text>
              <TextInput
                style={styles.input}
                value={uf}
                onChangeText={setUf}
                maxLength={2}
                autoCapitalize="characters"
                placeholder="SP"
              />
            </View>
          </View>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar senha:</Text>
          <TextInput
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Criar cadastro</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("LoginMedico")}>
            <Text style={styles.voltarText}>Já tem cadastro? Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: FUNDO },
  container: { flex: 1, backgroundColor: FUNDO, alignItems: "center" },
  topContainer: {
    backgroundColor: FUNDO, width: "100%",
    paddingTop: 60, paddingBottom: 10, alignItems: "center",
  },
  logo: { width: 200, height: 150, resizeMode: "contain" },
  bottomContainer: {
    flex: 1, backgroundColor: FUNDO, width: "100%",
    paddingTop: 10, paddingHorizontal: 30, paddingBottom: 50,
  },
  titulo: {
    fontSize: 20, fontWeight: "bold", color: CIANO,
    textAlign: "center", marginBottom: 4,
  },
  subtitulo: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 15 },
  label: { fontSize: 14, color: "#000", marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc",
    borderRadius: 25, paddingVertical: 10, paddingHorizontal: 20,
    fontSize: 14, color: "#000",
  },
  linhaDupla: { flexDirection: "row" },
  button: {
    backgroundColor: CIANO, paddingVertical: 12, borderRadius: 25,
    alignItems: "center", marginTop: 25, width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  voltarText: {
    color: "#666", textAlign: "center", fontWeight: "bold",
    fontSize: 13, marginTop: 18,
  },
});