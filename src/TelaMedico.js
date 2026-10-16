import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Image,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../firebaseConfig";

const FUNDO = "#F7F7F8";
const CIANO = "#00BCD4";
const VERMELHO = "#E53935";

const CORES_AVATAR = ["#00BCD4", "#E53935", "#7B1FA2", "#F57C00", "#388E3C", "#1976D2"];

function corPorUid(uid) {
  let soma = 0;
  for (let i = 0; i < uid.length; i++) soma += uid.charCodeAt(i);
  return CORES_AVATAR[soma % CORES_AVATAR.length];
}

function iniciaisPorNome(nome) {
  if (!nome) return "??";
  const partes = nome.trim().split(" ").filter(Boolean);
  const p = partes[0]?.[0] || "";
  const u = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (p + u).toUpperCase();
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return "--";
  const partes = dataNascimento.split("/");
  if (partes.length !== 3) return "--";
  const [dia, mes, ano] = partes.map(Number);
  if (!dia || !mes || !ano) return "--";
  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const m = hoje.getMonth() + 1;
  if (m < mes || (m === mes && hoje.getDate() < dia)) idade--;
  return idade;
}

export default function TelaMedico({ navigation, route }) {
  const medicoUid = route?.params?.medicoUid;
  const medicoNome = route?.params?.medicoNome || "Doutor";

  const [usuarios, setUsuarios] = useState(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const cancel = onValue(ref(database, "usuarios"), (snap) => {
      setUsuarios(snap.val() || {});
    });
    return () => cancel();
  }, []);

  const pacientes = useMemo(() => {
    if (!usuarios) return [];
    return Object.entries(usuarios)
      .filter(([uid, dados]) => dados.medico_id === medicoUid)
      .map(([uid, dados]) => ({
        id: uid,
        nome: dados.nome || "Paciente sem nome",
        idade: calcularIdade(dados.data_nascimento),
        iniciais: iniciaisPorNome(dados.nome),
        email: dados.email || "",
        corAvatar: corPorUid(uid),
      }));
  }, [usuarios, medicoUid]);

  const pacientesFiltrados = useMemo(() => {
    if (!busca.trim()) return pacientes;
    const b = busca.toLowerCase();
    return pacientes.filter((p) => p.nome.toLowerCase().includes(b));
  }, [pacientes, busca]);

  const primeiroNome = medicoNome.split(" ")[0];

  const renderItem = ({ item: p }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("TelaPaciente", { pacienteId: p.id })}
    >
      <View style={[styles.avatar, { backgroundColor: p.corAvatar }]}>
        <Text style={styles.avatarTexto}>{p.iniciais}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardNome}>{p.nome}</Text>
        <Text style={styles.cardIdade}>{p.idade} anos</Text>
      </View>

      <View style={styles.setaBox}>
        <Text style={styles.seta}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* TOPO com menu */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Image
            source={require("../assets/volta.png")}
            style={styles.iconVoltar}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.logo}></Text>

        <View style={{ width: 40 }} />
      </View>

      {/* SAUDAÇÃO */}
      <View style={styles.greetingWhite}>
        <Text style={styles.helloText}>
          Olá, <Text style={{ color: CIANO, fontWeight: "bold" }}>{primeiroNome}</Text>
        </Text>
        <Text style={styles.subHelloText}>Seus pacientes monitorados</Text>
      </View>

      {/* STATUS */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTexto}>
          {usuarios === null
            ? "Carregando..."
            : `${pacientes.length} paciente${pacientes.length !== 1 ? "s" : ""} vinculado${pacientes.length !== 1 ? "s" : ""}`}
        </Text>
      </View>

      {/* BUSCA */}
      {pacientes.length > 0 && (
        <View style={styles.buscaBox}>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar paciente..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      )}

      {/* CONTEÚDO */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitulo}>Pacientes:</Text>

        {usuarios === null ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={CIANO} />
          </View>
        ) : pacientes.length === 0 ? (
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTexto}>
              Nenhum paciente vinculado a você ainda.
            </Text>
          </View>
        ) : pacientesFiltrados.length === 0 ? (
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTexto}>
              Nenhum paciente encontrado com "{busca}"
            </Text>
          </View>
        ) : (
          <FlatList
            data={pacientesFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 55, paddingBottom: 10,
    backgroundColor: FUNDO,
  },
  iconVoltar: { width: 100, height: 45 },
  logo: { fontSize: 24, fontWeight: "bold", color: CIANO },

  greetingWhite: {
    backgroundColor: FUNDO, paddingVertical: 8, alignItems: "center",
  },
  helloText: { color: "#000", fontSize: 22, fontWeight: "bold" },
  subHelloText: { color: "#666", fontSize: 13, marginTop: 4 },

  statusBox: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 10, marginBottom: 10,
  },
  statusTexto: { fontSize: 15, color: "#00C853", fontWeight: "bold" },

  buscaBox: { paddingHorizontal: 20, marginBottom: 12 },
  buscaInput: {
    backgroundColor: "#fff", borderRadius: 25,
    paddingVertical: 10, paddingHorizontal: 20,
    fontSize: 14, color: "#000",
    borderWidth: 1, borderColor: "#eee",
    elevation: 2,
  },

  contentContainer: { flex: 1, paddingTop: 4 },
  sectionTitulo: {
    fontSize: 18, fontWeight: "600", color: "#000",
    marginLeft: 20, marginBottom: 10,
  },

  lista: { paddingHorizontal: 20, paddingBottom: 40 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: "center", alignItems: "center",
  },
  avatarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cardNome: { fontSize: 17, fontWeight: "600", color: "#000" },
  cardIdade: { fontSize: 13, color: "#888", marginTop: 3 },
  setaBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#F0F9FB",
    justifyContent: "center", alignItems: "center",
  },
  seta: { fontSize: 22, color: CIANO, fontWeight: "bold", marginTop: -2 },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  vazioBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  vazioTexto: { fontSize: 14, color: "#888", textAlign: "center" },
});