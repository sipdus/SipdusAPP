import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const windowWidth = Dimensions.get("window").width;
const FUNDO = "#F7F7F8";

export default function Login({ navigation }) {
  const [Email, setEmail] = useState("");
  const [Senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!Email || !Senha) {
      Alert.alert("Preencha email e senha!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, Email, Senha);

      if (!userCredential.user.emailVerified) {
        Alert.alert(
          "Email não confirmado",
          "Verifique seu email e clique no link de confirmação antes de entrar."
        );
        return;
      }

      navigation.replace("TelaInicial");
    } catch (error) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        Alert.alert("Email ou senha incorretos.");
      } else if (error.code === "auth/user-not-found") {
        Alert.alert("Usuário não encontrado.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Email inválido.");
      } else {
        Alert.alert("Erro ao fazer login", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Topo com logo */}
      <View style={styles.topContainer}>
        <Image
          source={require("../assets/sipdus_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Parte de baixo */}
      <View style={styles.bottomContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="Digite seu email"
          keyboardType="email-address"
          value={Email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Senha:</Text>
        <TextInput
          placeholder="Digite sua senha"
          secureTextEntry
          value={Senha}
          onChangeText={setSenha}
          style={styles.input}
        />

        <TouchableOpacity onPress={() => navigation.navigate("PrivacidadeScreen")}>
          <Text style={styles.forgotText}>Esqueci minha senha...</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={styles.registerText}>
            Não tem uma conta?{" "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate("Cadastro")}
            >
              Cadastre-se
            </Text>
          </Text>

          {/* Link do médico */}
          <View style={styles.divisor} />
          <TouchableOpacity onPress={() => navigation.navigate("LoginMedico")}>
            <Text style={styles.linkMedico}>É médico? Acesse aqui</Text>
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
  topContainer: {
    backgroundColor: FUNDO,
    alignItems: "center",
    justifyContent: "flex-start",
    height: 200,
    paddingBottom: 30,
  },
  logo: {
    width: 275,
    height: 3000,
    resizeMode: "contain",
    marginTop: -1380,
    alignItems: "center",
    marginLeft: 20,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: FUNDO,
    paddingTop: 60,
    paddingHorizontal: 25,
  },
  label: {
    color: "#000",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 12,
    fontSize: 15,
    paddingHorizontal: 20,
  },
  forgotText: {
    color: "#000",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "right",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#00bcd4",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 30,
    width: 280,
    alignSelf: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerText: {
    color: "#000",
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
  },
  registerLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  divisor: {
    height: 1,
    backgroundColor: "#ddd",
    width: "80%",
    marginVertical: 18,
  },
  linkMedico: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});