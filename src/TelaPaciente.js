import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Clipboard, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, onValue } from "firebase/database";
import { database } from "../firebaseConfig";
import { LineChart } from "react-native-chart-kit";

const FUNDO = "#F7F7F8";
const CIANO = "#00BCD4";
const larguraTela = Dimensions.get("window").width;

// ============================================
// HELPERS
// ============================================
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

function partesDataHora(dataHoraStr) {
  if (!dataHoraStr) return null;
  const [dataParte, horaParte] = dataHoraStr.split(" ");
  return { dataParte, horaParte: horaParte || "--:--" };
}

function leituraValida(l) {
  const g = Number(l.glicemia) || 0;
  const s = Number(l.spo2) || 0;
  const b = Number(l.bpm) || 0;
  return g > 0 && s > 0 && b > 0;
}

function tempoDesde(timestamp) {
  if (!timestamp) return "--";
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

function classificarGlicemiaJejum(v) {
  if (v < 70) return { label: "Baixa", cor: "#E53935", bg: "#FFEBEE" };
  if (v <= 99) return { label: "Normal", cor: "#4CAF50", bg: "#E8F5E9" };
  if (v <= 125) return { label: "Atenção", cor: "#FFA726", bg: "#FFF3E0" };
  return { label: "Alta", cor: "#E53935", bg: "#FFEBEE" };
}

function classificarSpO2(v) {
  if (v >= 95) return { label: "Normal", cor: "#4CAF50", bg: "#E8F5E9" };
  if (v >= 90) return { label: "Atenção", cor: "#FFA726", bg: "#FFF3E0" };
  return { label: "Baixa", cor: "#E53935", bg: "#FFEBEE" };
}

function classificarBPM(v) {
  if (v >= 60 && v <= 100) return { label: "Normal", cor: "#4CAF50", bg: "#E8F5E9" };
  if (v >= 50 && v <= 110) return { label: "Atenção", cor: "#FFA726", bg: "#FFF3E0" };
  return { label: "Alterado", cor: "#E53935", bg: "#FFEBEE" };
}

function tipoRefeicaoPorHora(hora) {
  const h = Number((hora || "0").split(":")[0]);
  if (h < 11) return "Café da manhã";
  if (h < 16) return "Almoço";
  if (h < 19) return "Lanche";
  return "Jantar";
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: { r: "4" },
};

export default function TelaPaciente({ navigation, route }) {
  const pacienteId = route?.params?.pacienteId;

  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [leituras, setLeituras] = useState({});
  const [refeicoes, setRefeicoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("leituras");

  useEffect(() => {
    if (!pacienteId) {
      setCarregando(false);
      return;
    }

    let userOK = false, leiturasOK = false, refeicoesOK = false;
    const checar = () => {
      if (userOK && leiturasOK && refeicoesOK) setCarregando(false);
    };

    const c1 = onValue(ref(database, `usuarios/${pacienteId}`), (snap) => {
      setDadosUsuario(snap.val() || {});
      userOK = true; checar();
    }, () => { userOK = true; checar(); });

    const c2 = onValue(ref(database, "leituras"), (snap) => {
      setLeituras(snap.val() || {});
      leiturasOK = true; checar();
    }, () => { leiturasOK = true; checar(); });

    const c3 = onValue(ref(database, "refeicoes"), (snap) => {
      setRefeicoes(snap.val() || {});
      refeicoesOK = true; checar();
    }, () => { refeicoesOK = true; checar(); });

    return () => { c1(); c2(); c3(); };
  }, [pacienteId]);

  const leiturasPaciente = (() => {
    if (!leituras || !pacienteId) return [];
    const doPaciente = Object.values(leituras)
      .filter((l) => l.usuario_id === pacienteId && l.timestamp)
      .filter(leituraValida)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    const porDia = {};
    doPaciente.forEach((l) => {
      const dia = l.data_hora?.split(" ")[0];
      if (!dia) return;
      if (!porDia[dia]) porDia[dia] = l;
    });

    return Object.values(porDia)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 10);
  })();

  const refeicoesSemana = (() => {
    if (!refeicoes || !pacienteId) return [];
    const doPaciente = Object.values(refeicoes)
      .filter((r) => r.usuario_id === pacienteId && r.data_hora)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 20);

    const grupos = {};
    doPaciente.forEach((r) => {
      const { dataParte, horaParte } = partesDataHora(r.data_hora);
      if (!grupos[dataParte]) grupos[dataParte] = [];
      const nomes = (r.itens || []).map((i) => i.nome).filter(Boolean).join(", ") || "Sem itens";
      grupos[dataParte].push({
        hora: horaParte.slice(0, 5),
        tipo: tipoRefeicaoPorHora(horaParte),
        desc: nomes,
      });
    });

    return Object.entries(grupos)
      .slice(0, 7)
      .map(([data, itens]) => ({ data, itens }));
  })();

  const copiarEmail = () => {
    if (!dadosUsuario?.email) return;
    Clipboard.setString(dadosUsuario.email);
    Alert.alert("Copiado!", "Email copiado para a área de transferência.");
  };

  const ultima = leiturasPaciente[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Detalhes do Paciente</Text>
        <View style={{ width: 60 }} />
      </View>

      {carregando ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={CIANO} />
          <Text style={styles.loadingTexto}>Carregando dados...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* CARD DO PACIENTE */}
          <View style={styles.card}>
            <View style={styles.pacienteTopo}>
              <View style={styles.avatarGrande}>
                <Text style={styles.avatarGrandeTexto}>
                  {iniciaisPorNome(dadosUsuario?.nome)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.nomeGrande}>{dadosUsuario?.nome || "Sem nome"}</Text>
                <Text style={styles.idadeGrande}>
                  {calcularIdade(dadosUsuario?.data_nascimento)} anos
                </Text>
              </View>
            </View>

            {dadosUsuario?.email && (
              <View style={styles.emailBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emailLabel}>Email</Text>
                  <Text style={styles.emailTexto}>{dadosUsuario.email}</Text>
                </View>
                <TouchableOpacity style={styles.acaoBtn} onPress={copiarEmail}>
                  <Text style={styles.acaoBtnTexto}>Copiar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ÚLTIMA MEDIÇÃO - 3 CARDS */}
          <Text style={styles.secaoTitulo}>Última medição</Text>
          {ultima ? (
            <>
              <Text style={styles.tempoTexto}>
                Medida {tempoDesde(ultima.timestamp)} ·{" "}
                {partesDataHora(ultima.data_hora)?.dataParte} às{" "}
                {partesDataHora(ultima.data_hora)?.horaParte?.slice(0, 5)}
              </Text>

              <View style={styles.cardsRow}>
                {(() => {
                  const cl = classificarGlicemiaJejum(Number(ultima.glicemia));
                  return (
                    <View style={styles.dataCard}>
                      <Ionicons name="water" size={24} color={CIANO} style={{ marginBottom: 4 }} />
                      <Text style={styles.cardValue}>{ultima.glicemia}</Text>
                      <Text style={styles.cardUnit}>mg/dL</Text>
                      <View style={[styles.badge, { backgroundColor: cl.bg }]}>
                        <Text style={[styles.badgeTexto, { color: cl.cor }]}>
                          {cl.label}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {(() => {
                  const cl = classificarSpO2(Number(ultima.spo2));
                  return (
                    <View style={styles.dataCard}>
                      <Text style={styles.cardIcon}>SpO2</Text>
                      <Text style={styles.cardValue}>{ultima.spo2}</Text>
                      <Text style={styles.cardUnit}>%</Text>
                      <View style={[styles.badge, { backgroundColor: cl.bg }]}>
                        <Text style={[styles.badgeTexto, { color: cl.cor }]}>
                          {cl.label}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {(() => {
                  const cl = classificarBPM(Number(ultima.bpm));
                  return (
                    <View style={styles.dataCard}>
                      <Ionicons name="heart" size={24} color={CIANO} style={{ marginBottom: 4 }} />
                      <Text style={styles.cardValue}>{ultima.bpm}</Text>
                      <Text style={styles.cardUnit}>bpm</Text>
                      <View style={[styles.badge, { backgroundColor: cl.bg }]}>
                        <Text style={[styles.badgeTexto, { color: cl.cor }]}>
                          {cl.label}
                        </Text>
                      </View>
                    </View>
                  );
                })()}
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <Text style={styles.semLeitura}>Sem leituras registradas.</Text>
            </View>
          )}

          {/* GRÁFICO DE GLICEMIA */}
          {leiturasPaciente.length > 1 && (
            <>
              <Text style={styles.secaoTitulo}>Glicemia - últimos dias</Text>
              <View style={styles.card}>
                <LineChart
                  data={{
                    labels: leiturasPaciente
                      .slice()
                      .reverse()
                      .map((l) => partesDataHora(l.data_hora)?.dataParte?.slice(0, 5) || ""),
                    datasets: [
                      {
                        data: leiturasPaciente
                          .slice()
                          .reverse()
                          .map((l) => Number(l.glicemia) || 0),
                      },
                    ],
                  }}
                  width={larguraTela - 70}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={{ borderRadius: 10 }}
                />
              </View>
            </>
          )}

          {/* ABAS */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, abaAtiva === "leituras" && styles.tabAtiva]}
              onPress={() => setAbaAtiva("leituras")}
            >
              <Text style={[styles.tabTexto, abaAtiva === "leituras" && styles.tabTextoAtiva]}>
                Leituras
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, abaAtiva === "refeicoes" && styles.tabAtiva]}
              onPress={() => setAbaAtiva("refeicoes")}
            >
              <Text style={[styles.tabTexto, abaAtiva === "refeicoes" && styles.tabTextoAtiva]}>
                Refeições
              </Text>
            </TouchableOpacity>
          </View>

          {/* ABA LEITURAS */}
          {abaAtiva === "leituras" && (
            <>
              {leiturasPaciente.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.semLeitura}>Sem leituras registradas.</Text>
                </View>
              ) : (
                leiturasPaciente.map((l, i) => (
                  <View key={i} style={styles.cardLeitura}>
                    <Text style={styles.leituraData}>
                      {partesDataHora(l.data_hora)?.dataParte} às{" "}
                      {partesDataHora(l.data_hora)?.horaParte?.slice(0, 5)}
                    </Text>
                    <View style={styles.metricasRow}>
                      <View style={styles.metricaItem}>
                        <Ionicons name="water" size={18} color={CIANO} />
                        <Text style={styles.metricaValor}>{l.glicemia} mg/dL</Text>
                      </View>
                      <View style={styles.metricaItem}>
                        <Text style={styles.metricaLabel}>SpO2</Text>
                        <Text style={styles.metricaValor}>{l.spo2}%</Text>
                      </View>
                      <View style={styles.metricaItem}>
                        <Ionicons name="heart" size={18} color={CIANO} />
                        <Text style={styles.metricaValor}>{l.bpm}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* ABA REFEIÇÕES */}
          {abaAtiva === "refeicoes" && (
            <>
              {refeicoesSemana.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.semLeitura}>Sem refeições registradas.</Text>
                </View>
              ) : (
                refeicoesSemana.map((dia, i) => (
                  <View key={i} style={styles.cardLeitura}>
                    <Text style={styles.leituraData}>{dia.data}</Text>
                    {dia.itens.map((item, j) => (
                      <View key={j} style={styles.refeicaoLinha}>
                        <Text style={styles.refeicaoHora}>{item.hora}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.refeicaoTipo}>{item.tipo}</Text>
                          <Text style={styles.refeicaoDesc}>{item.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#fff", paddingTop: 55, paddingBottom: 15, paddingHorizontal: 20,
  },
  voltarTexto: { color: CIANO, fontSize: 14, fontWeight: "600" },
  headerTitulo: { fontSize: 18, fontWeight: "bold", color: "#000" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingTexto: { fontSize: 13, color: "#888" },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 18,
    marginBottom: 14, elevation: 2,
  },
  pacienteTopo: { flexDirection: "row", alignItems: "center" },
  avatarGrande: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: CIANO, justifyContent: "center", alignItems: "center",
  },
  avatarGrandeTexto: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  nomeGrande: { fontSize: 18, fontWeight: "bold", color: "#000" },
  idadeGrande: { fontSize: 13, color: "#888", marginTop: 4 },
  emailBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f7f9fc", borderRadius: 10,
    padding: 12, marginTop: 14, gap: 8,
  },
  emailLabel: { fontSize: 11, color: "#888", fontWeight: "600" },
  emailTexto: { fontSize: 12, color: "#000", fontWeight: "600", marginTop: 2 },
  acaoBtn: {
    backgroundColor: CIANO, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8,
  },
  acaoBtnTexto: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  secaoTitulo: {
    fontSize: 16, fontWeight: "bold", color: "#000",
    marginTop: 10, marginBottom: 8,
  },
  tempoTexto: { fontSize: 12, color: "#888", marginBottom: 10 },
  cardsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  dataCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12,
    padding: 12, alignItems: "center", elevation: 2,
  },
  cardIcon: { fontSize: 16, fontWeight: "bold", color: CIANO, marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  cardUnit: { fontSize: 10, color: "#7f8c8d", marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeTexto: { fontSize: 10, fontWeight: "bold" },
  cardLeitura: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
  },
  leituraData: {
    fontSize: 12, color: "#888", fontWeight: "600", marginBottom: 10,
  },
  metricasRow: { flexDirection: "row", justifyContent: "space-around" },
  metricaItem: { alignItems: "center", gap: 4 },
  metricaLabel: { fontSize: 14, fontWeight: "bold", color: CIANO },
  metricaValor: { fontSize: 14, fontWeight: "bold", color: "#000" },
  semLeitura: { fontSize: 13, color: "#888", textAlign: "center", padding: 10 },
  tabsRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 10 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: "#fff", alignItems: "center",
    borderWidth: 1, borderColor: "#e0e0e0",
  },
  tabAtiva: { backgroundColor: CIANO, borderColor: CIANO },
  tabTexto: { fontSize: 13, fontWeight: "600", color: "#666" },
  tabTextoAtiva: { color: "#fff" },
  refeicaoLinha: {
    flexDirection: "row", gap: 12, paddingVertical: 6,
  },
  refeicaoHora: { fontSize: 12, fontWeight: "600", color: "#888", width: 50 },
  refeicaoTipo: { fontSize: 13, fontWeight: "bold", color: "#000" },
  refeicaoDesc: { fontSize: 12, color: "#666", marginTop: 2 },
});