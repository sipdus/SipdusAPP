import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";
import { auth, database } from "../firebaseConfig";

const { width } = Dimensions.get("window");
const FUNDO = "#F7F7F8";

export default function Cadastro({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [concordaTermos, setConcordaTermos] = useState(false);
  const [medicoId, setMedicoId] = useState("");
  const [medicosAprovados, setMedicosAprovados] = useState({});
  const [mostrarMedicos, setMostrarMedicos] = useState(false);

  // Carrega lista de médicos aprovados
  useEffect(() => {
    const medicosRef = ref(database, "medicos_publicos");
    const cancelar = onValue(medicosRef, (snap) => {
      setMedicosAprovados(snap.val() || {});
    });
    return () => cancelar();
  }, []);

  const formatarData = (texto) => {
    let apenasNumeros = texto.replace(/\D/g, "");
    apenasNumeros = apenasNumeros.slice(0, 8);

    if (apenasNumeros.length <= 2) {
      setDataNascimento(apenasNumeros);
    } else if (apenasNumeros.length <= 4) {
      setDataNascimento(
        `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`
      );
    } else {
      setDataNascimento(
        `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4)}`
      );
    }
  };

  const handleCadastro = async () => {
    if (!usuario || !email || !senha || !confirmarSenha) {
      Alert.alert("Por favor, preencha todos os campos!");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("As senhas não coincidem!");
      return;
    }

    if (!concordaTermos) {
      Alert.alert("Você deve concordar com os termos de uso.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      await set(ref(database, "usuarios/" + uid), {
        nome: usuario,
        data_nascimento: dataNascimento,
        email: email,
        medico_id: medicoId || null,
      });

      await sendEmailVerification(userCredential.user);

      Alert.alert(
        "Confirme seu email",
        "Enviamos um link de confirmação para o seu email. Confirme antes de fazer login."
      );

      navigation.navigate("Login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Esse email já está cadastrado.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Email inválido.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("A senha deve ter no mínimo 6 caracteres.");
      } else {
        Alert.alert("Erro ao cadastrar", error.message);
      }
    }
  };

  const medicosArray = Object.entries(medicosAprovados);
  const medicoSelecionado = medicosAprovados[medicoId];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* TOPO */}
        <View style={styles.topContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={require("../assets/sipdus_coracao.png")}
              style={styles.background}
              resizeMode="contain"
            />
            <Text style={styles.title}>Cadastro:</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome completo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            value={usuario}
            onChangeText={setUsuario}
          />

          <Text style={styles.label}>Data de nascimento:</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            value={dataNascimento}
            onChangeText={formatarData}
            maxLength={10}
          />

          <Text style={styles.label}>Médico responsável:</Text>
          {medicosArray.length === 0 ? (
            <Text style={styles.textoSemMedico}>
              Nenhum médico disponível ainda
            </Text>
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setMostrarMedicos(!mostrarMedicos)}
              >
                <Text style={medicoSelecionado ? styles.textoInput : styles.textoPlaceholder}>
                  {medicoSelecionado
                    ? `${medicoSelecionado.nome} — CRM ${medicoSelecionado.crm}/${medicoSelecionado.uf}`
                    : "Selecione um médico"}
                </Text>
              </TouchableOpacity>

              {mostrarMedicos && (
                <View style={styles.listaMedicos}>
                  <TouchableOpacity
                    style={styles.opcaoMedico}
                    onPress={() => {
                      setMedicoId("");
                      setMostrarMedicos(false);
                    }}
                  >
                    <Text style={styles.textoOpcao}>Nenhum médico</Text>
                  </TouchableOpacity>

                  {medicosArray.map(([uid, dados]) => (
                    <TouchableOpacity
                      key={uid}
                      style={styles.opcaoMedico}
                      onPress={() => {
                        setMedicoId(uid);
                        setMostrarMedicos(false);
                      }}
                    >
                      <Text style={styles.textoOpcao}>
                        {dados.nome} — CRM {dados.crm}/{dados.uf}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.label}>Confirme sua senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme sua senha"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setConcordaTermos(!concordaTermos)}
              style={[styles.checkboxBox, concordaTermos && styles.checkboxBoxAtivo]}
            />
            <Text style={styles.checkboxLabel}>
              Li e concordo com os termos de uso
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: FUNDO,
  },
  container: {
    flex: 1,
    backgroundColor: FUNDO,
    alignItems: "center",
  },
  topContainer: {
    backgroundColor: FUNDO,
    width: "100%",
    paddingTop: 60,
    paddingBottom: 10,
    alignItems: "center",
  },
  imageWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  background: {
    width: 200,
    height: 200,
    position: "absolute",
  },
  title: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "bold",
    zIndex: 10,
    marginLeft: 60,
  },
  formContainer: {
    flex: 1,
    backgroundColor: FUNDO,
    width: "100%",
    paddingTop: 2,
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  label: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 14,
    color: "#000",
    justifyContent: "center",
    minHeight: 45,
  },
  textoInput: {
    fontSize: 14,
    color: "#000",
  },
  textoPlaceholder: {
    fontSize: 14,
    color: "#999",
  },
  textoSemMedico: {
    fontSize: 13,
    color: "#999",
    marginBottom: 15,
    fontStyle: "italic",
  },
  listaMedicos: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    maxHeight: 150,
  },
  opcaoMedico: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  textoOpcao: {
    fontSize: 13,
    color: "#000",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#DC1429",
    backgroundColor: "#fff",
  },
  checkboxBoxAtivo: {
    backgroundColor: "#DC1429",
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#000000",
  },
  button: {
    borderWidth: 0,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
    backgroundColor: "#00bcd4",
    alignSelf: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});