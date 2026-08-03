import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { auth, database } from "../firebaseConfig";
import { ref, push, onValue, update, remove } from "firebase/database";

const CIANO = "#00BCD4";
const FUNDO = "#F7F7F8";

export default function MedicacoesScreen({ navigation }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");

  // Escuta em tempo real os medicamentos do usuário logado
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const medsRef = ref(database, "medicamentos");

    const unsubscribe = onValue(medsRef, (snapshot) => {
      const lista = [];
      snapshot.forEach((child) => {
        const item = child.val();
        if (item.usuario_id === uid) {
          lista.push({ id: child.key, ...item });
        }
      });
      setMedicamentos(lista);
    });

    return () => unsubscribe();
  }, []);

  const marcarTomado = async (med) => {
    try {
      await update(ref(database, "medicamentos/" + med.id), {
        tomadoHoje: !med.tomadoHoje,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  };

  const agendarNotificacaoMedicamento = async (nomeMed, horarioStr) => {
    const [hora, minuto] = horarioStr.split(":").map(Number);

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;

    const identificador = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Sipdus - Hora do remédio",
        body: `Hora de tomar: ${nomeMed}`,
      },
      trigger: {
        hour: hora,
        minute: minuto,
        repeats: true,
      },
    });

    return identificador;
  };

  const adicionarMedicamento = async () => {
    if (!nome || !dosagem || !horario) {
      Alert.alert("Preencha ao menos nome, dosagem e horário.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Erro", "Você precisa estar logado.");
      return;
    }

    try {
      const notifId = await agendarNotificacaoMedicamento(nome, horario);

      await push(ref(database, "medicamentos"), {
        usuario_id: uid,
        nome,
        dosagem,
        horarios: [horario],
        observacao,
        tomadoHoje: false,
        notificacao_id: notifId,
      });

      setNome("");
      setDosagem("");
      setHorario("");
      setObservacao("");
      setModalVisivel(false);
    } catch (error) {
      Alert.alert("Erro ao salvar", error.message);
    }
  };

  const excluirMedicamento = async (med) => {
    Alert.alert(
      "Excluir medicamento",
      `Deseja remover "${med.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (med.notificacao_id) {
                await Notifications.cancelScheduledNotificationAsync(med.notificacao_id);
              }
              await remove(ref(database, "medicamentos/" + med.id));
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/volta.png")} style={styles.voltaIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Medicações</Text>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {medicamentos.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Ionicons name="medkit-outline" size={60} color="#ccc" />
            <Text style={styles.vazioTexto}>
              Você ainda não tem medicamentos cadastrados
            </Text>
          </View>
        ) : (
          medicamentos.map((med) => (
            <TouchableOpacity
              key={med.id}
              style={styles.card}
              onLongPress={() => excluirMedicamento(med)}
            >
              <View style={styles.cardTopo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medNome}>{med.nome}</Text>
                  <Text style={styles.medDosagem}>{med.dosagem}</Text>
                </View>

                <TouchableOpacity onPress={() => marcarTomado(med)}>
                  <Ionicons
                    name={med.tomadoHoje ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={32}
                    color={med.tomadoHoje ? "#00C853" : "#ccc"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.horariosRow}>
                {(med.horarios || []).map((h, index) => (
                  <View key={index} style={styles.horarioBadge}>
                    <Ionicons name="time-outline" size={14} color={CIANO} />
                    <Text style={styles.horarioTexto}>{h}</Text>
                  </View>
                ))}
              </View>

              {med.observacao ? (
                <Text style={styles.observacao}>{med.observacao}</Text>
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalVisivel(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo medicamento</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do medicamento"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Dosagem (ex: 500mg)"
              value={dosagem}
              onChangeText={setDosagem}
            />

            <TextInput
              style={styles.input}
              placeholder="Horário (ex: 08:00)"
              value={horario}
              onChangeText={setHorario}
            />

            <TextInput
              style={styles.input}
              placeholder="Observação (opcional)"
              value={observacao}
              onChangeText={setObservacao}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoSalvar} onPress={adicionarMedicamento}>
                <Text style={styles.botaoSalvarTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 50, paddingHorizontal: 5 },
  voltaIcon: { width: 115, height: 60, resizeMode: "contain", marginLeft: 10 },
  titleContainer: { alignItems: "center", marginBottom: 15 },
  title: { fontSize: 20, fontWeight: "700", color: "#000" },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  vazioContainer: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  vazioTexto: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginTop: 15,
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopo: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  medNome: { fontSize: 17, fontWeight: "700", color: "#000" },
  medDosagem: { fontSize: 13, color: "#666", marginTop: 2 },
  horariosRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  horarioBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F7FA",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  horarioTexto: { fontSize: 12, color: CIANO, marginLeft: 4, fontWeight: "600" },
  observacao: { fontSize: 13, color: "#888", marginTop: 10, fontStyle: "italic" },
  botaoAdicionar: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: CIANO,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
  },
  modalTitulo: { fontSize: 18, fontWeight: "700", marginBottom: 20, color: "#000" },
  input: {
    backgroundColor: FUNDO,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalBotoes: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  botaoCancelarTexto: { color: "#666", fontWeight: "600" },
  botaoSalvar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: CIANO,
  },
  botaoSalvarTexto: { color: "#fff", fontWeight: "700" },
});