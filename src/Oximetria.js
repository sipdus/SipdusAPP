import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { BLEContext } from "./hooks/BLEContext";
import { auth, database } from "../firebaseConfig";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";

const CIANO = "#00BCD4";
const VERMELHO = "#E53935";
const FUNDO = "#F7F7F8";

const larguraTela = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(229, 57, 53, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "3",
  },
};

const GraficoOximetria = React.memo(function GraficoOximetria({ historico, carregando }) {
  if (carregando) {
    return <Text style={styles.semDadosText}>Carregando gráfico...</Text>;
  }

  if (historico.length === 0) {
    return (
      <Text style={styles.semDadosText}>Ainda não há leituras suficientes para gerar o gráfico.</Text>
    );
  }

  return (
    <LineChart
      data={{
        labels: historico.map((_, index) =>
          index % Math.ceil(historico.length / 5) === 0 ? `${index + 1}` : ""
        ),
        datasets: [{ data: historico.map((l) => Number(l.spo2) || 0) }],
      }}
      width={larguraTela * 0.78}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{ borderRadius: 10 }}
    />
  );
});

export default function OximetriaScreen({ navigation }) {
  const { spo2 } = useContext(BLEContext);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);

  useEffect(() => {
    const buscarNome = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const snapshot = await get(ref(database, "usuarios/" + uid));
        if (snapshot.exists()) {
          const nomeCompleto = snapshot.val().nome || "";
          const primeiroNome = nomeCompleto.split(" ")[0];
          setNomeUsuario(primeiroNome);
        }
      } catch (error) {
        console.warn("Erro ao buscar nome do usuário:", error);
      }
    };

    const buscarHistorico = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setCarregandoHistorico(false);
        return;
      }

      try {
        const leiturasQuery = query(
          ref(database, "leituras"),
          orderByChild("timestamp"),
          limitToLast(300)
        );
        const snapshot = await get(leiturasQuery);
        if (snapshot.exists()) {
          const todasLeituras = Object.values(snapshot.val());

          const leiturasDoUsuario = todasLeituras
            .filter((leitura) => leitura.usuario_id === uid && leitura.spo2 > 0)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

          const ultimasVinte = leiturasDoUsuario.slice(-20);
          setHistorico(ultimasVinte);
        }
      } catch (error) {
        console.warn("Erro ao buscar histórico de oximetria:", error);
      } finally {
        setCarregandoHistorico(false);
      }
    };

    buscarNome();
    buscarHistorico();

    const unsubscribe = navigation.addListener("focus", () => {
      setCarregandoHistorico(true);
      buscarHistorico();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/volta.png")} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.greetingWhite}>
        <Text style={styles.helloText}>
          <Text style={{ fontWeight: "bold", color: CIANO }}>{nomeUsuario || "usuário"}:</Text>
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Oximetria:</Text>

        <View style={styles.oximeterRow}>
          <View style={styles.dataBox}>
            <Text style={styles.dataTitle}>Última leitura:</Text>
            <Text style={styles.dataValue}>{spo2 != null ? spo2 : "--"}</Text>
            <Text style={styles.dataSubtitle}>SpO₂</Text>
          </View>

          <Image source={require("../assets/oximetro.png")} style={styles.oximeterIcon} />
        </View>

        <Text style={styles.subtitle}>Tabela de porcentagens:</Text>

        <View style={[styles.box, { borderColor: "#4CAF50", borderWidth: 2 }]}>
          <Text style={styles.boxText}>Normal: <Text style={styles.highlightGreen}>95% - 100%</Text></Text>
        </View>

        <View style={[styles.box, { borderColor: "#FFEB3B", borderWidth: 2 }]}>
          <Text style={styles.boxText}>Risco Moderado: <Text style={styles.highlightYellow}>93% - 94%</Text></Text>
        </View>

        <View style={[styles.box, { borderColor: VERMELHO, borderWidth: 2 }]}>
          <Text style={styles.boxText}>Risco Gravíssimo: <Text style={styles.highlightRed}>Abaixo de 92%</Text></Text>
        </View>

        <Text style={styles.subtitle}>Gráfico:</Text>
        <View style={styles.box}>
          <GraficoOximetria historico={historico} carregando={carregandoHistorico} />
        </View>
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
    paddingBottom: 15,
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
    paddingVertical: 10,
    marginBottom: 10,
  },
  helloText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: FUNDO,
    alignItems: "center",
    paddingTop: 25,
  },
  title: {
    color: "#000",
    fontSize: 16,
    marginBottom: 10,
  },
  oximeterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "90%",
    marginBottom: 20,
  },
  oximeterIcon: {
    width: 150,
    height: 175,
    resizeMode: "contain",
  },
  dataBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  dataTitle: {
    fontSize: 14,
    color: "#555",
  },
  dataValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: VERMELHO,
  },
  dataSubtitle: {
    fontSize: 14,
    color: VERMELHO,
  },
  subtitle: {
    fontSize: 15,
    color: "#000",
    marginBottom: 10,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    width: "85%",
    alignItems: "center",
    marginVertical: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  boxText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  highlightGreen: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  highlightYellow: {
    color: "#FFB300",
    fontWeight: "bold",
  },
  highlightRed: {
    color: VERMELHO,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  footerItem: {
    alignItems: "center",
  },
  footerIcon: {
    width: 45,
    height: 38,
    marginBottom: 4,
    resizeMode: "contain",
  },
  footerIconLarge: {
    width: 52,
    height: 40,
    marginBottom: 4,
    resizeMode: "contain",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  semDadosText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
});