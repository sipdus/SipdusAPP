import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { auth, database } from "../firebaseConfig";
import { ref, get, update } from "firebase/database";

const CIANO = "#00BCD4";
const FUNDO = "#F7F7F8";

export default function PerfilScreen({ navigation }) {

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [email, setEmail] = useState("");
  const [mostrarGenero, setMostrarGenero] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Carrega os dados salvos no cadastro assim que a tela abre
  useEffect(() => {
    const carregarDados = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setCarregando(false);
        return;
      }

      try {
        const snapshot = await get(ref(database, "usuarios/" + uid));
        if (snapshot.exists()) {
          const dados = snapshot.val();
          setNome(dados.nome || "");
          setDataNascimento(dados.data_nascimento || "");
          setGenero(dados.genero || "");
          setEmail(dados.email || "");
        }
      } catch (error) {
        console.warn("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const formatarData = (texto) => {
    let numeros = texto.replace(/\D/g, "");

    if (numeros.length > 8) {
      numeros = numeros.slice(0, 8);
    }

    if (numeros.length >= 5) {
      return numeros.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    } else if (numeros.length >= 3) {
      return numeros.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }

    return numeros;
  };

  const handleSalvar = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Erro", "Você precisa estar logado para salvar o perfil.");
      return;
    }

    try {
      await update(ref(database, "usuarios/" + uid), {
        nome,
        data_nascimento: dataNascimento,
        genero,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro ao salvar", error.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >

      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/volta.png")} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {/* Nome da tela */}
      <View style={styles.greetingWhite}>
        <Text style={styles.logo}>Perfil:</Text>
      </View>

      {/* Container */}
      <View style={styles.contentContainer}>

        {/* Nome */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nome de usuário"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
          <Image source={require("../assets/user.png")} style={styles.icon}/>
        </View>

        {/* Data nascimento */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="DD/MM/AAAA"
            style={styles.input}
            value={dataNascimento}
            onChangeText={(texto) => setDataNascimento(formatarData(texto))}
            keyboardType="numeric"
          />
          <Image source={require("../assets/calendario.png")} style={styles.icon}/>
        </View>

        {/* Genero */}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setMostrarGenero(!mostrarGenero)}
        >
          <Text style={styles.input}>
            {genero ? genero : "Gênero (Opcional)"}
          </Text>
          <Image source={require("../assets/genero.png")} style={styles.icon}/>
        </TouchableOpacity>

        {mostrarGenero && (
          <View style={styles.opcoesGenero}>
            <TouchableOpacity
              style={styles.opcaoComLinha}
              onPress={() => {
                setGenero("Feminino");
                setMostrarGenero(false);
              }}
            >
              <Text style={styles.opcaoTexto}>Feminino</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.opcaoComLinha}
              onPress={() => {
                setGenero("Masculino");
                setMostrarGenero(false);
              }}
            >
              <Text style={styles.opcaoTexto}>Masculino</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setGenero("Prefiro não informar");
                setMostrarGenero(false);
              }}
            >
              <Text style={styles.opcaoTexto}>Prefiro não informar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Email (só exibição, não editável) */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email cadastrado"
            style={styles.input}
            value={email}
            editable={false}
          />
          <Image source={require("../assets/chave.png")} style={styles.icon}/>
        </View>

        {/* Link de esqueci a senha */}
        <TouchableOpacity onPress={() => navigation.navigate && navigation.navigate("PrivacidadeScreen")}>
          <Text style={styles.forgotText}>Esqueci minha senha...</Text>
        </TouchableOpacity>

        {/* Botão salvar */}
        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.textoSalvar}>Salvar</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
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
    paddingHorizontal: 5,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: FUNDO,
  },

  backIcon: {
    width: 115,
    height: 60,
    resizeMode: "contain",
    marginLeft: 10,
  },

  greetingWhite: {
    backgroundColor: FUNDO,
    alignItems: "center",
    paddingVertical: 5,
    marginBottom: 10,
  },

  logo: {
    fontSize: 22,
    color: "#000000",
    fontWeight: "bold",
  },

  contentContainer: {
    flex: 1,
    backgroundColor: FUNDO,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 50,
    marginTop: 10
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    width: "85%",
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  input: {
    flex: 1,
    fontSize: 14,
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginLeft: 5
  },

  opcoesGenero: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    marginTop: -5,
    overflow: "hidden",
  },

  opcaoComLinha: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  opcaoTexto: {
    paddingVertical: 12,
    textAlign: "center",
    fontSize: 14,
  },

  forgotText: {
    color: "#000",
    marginTop: -2,
    marginBottom: 20,
    textAlign: "right",
    fontSize: 13,
    textDecorationLine: "underline",
    marginLeft: 180,
  },

  botaoSalvar: {
    backgroundColor: CIANO,
    width: "90%",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },

  textoSalvar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});