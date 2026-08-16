import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { BLEContext } from "./hooks/BLEContext";
import { auth, database } from "../firebaseConfig";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import BotaoSanguezinho from "./components/BotaoSanguezinho";

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

const GraficoGlicemia = React.memo(function GraficoGlicemia({ historico, carregando }) {
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
        datasets: [{ data: historico.map((l) => Number(l.glicemia) || 0) }],
      }}
      width={larguraTela * 0.78}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{ borderRadius: 10 }}
    />
  );
});

export default function GlicemiaScreen({ navigation }) {
  const { glucose } = useContext(BLEContext);
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
            .filter((leitura) => leitura.usuario_id === uid && leitura.glicemia > 0)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

          const ultimasVinte = leiturasDoUsuario.slice(-20);
          setHistorico(ultimasVinte);
        }
      } catch (error) {
        console.warn("Erro ao buscar histórico de glicemia:", error);
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
  <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* TOPO */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/volta.png")} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      {/* USER */}
      <View style={styles.greetingWhite}>
        <Text style={styles.helloText}>
          <Text style={{ fontWeight: "bold", color: CIANO }}>{nomeUsuario || "usuário"}:</Text>
        </Text>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Glicemia:</Text>

        <View style={styles.glucoseRow}>
          <View style={styles.dataBox}>
            <Text style={styles.dataTitle}>Última leitura:</Text>
            <Text style={styles.dataValue}>{glucose != null ? glucose : "--"}</Text>
            <Text style={styles.dataSubtitle}>mg/dL</Text>
          </View>

          <Image source={require("../assets/açucar.png")} style={styles.glucoseIcon} />
        </View>

        <Text style={styles.subtitle}>Tabela de Classificação:</Text>
        <View style={styles.boxTransparente}>
          <Image
            source={require("../assets/tabela-glicemia.png")}
            style={styles.tabelaImage}
          />
        </View>

        <Text style={styles.subtitle}>Gráfico:</Text>
        <View style={styles.box}>
          <GraficoGlicemia historico={historico} carregando={carregandoHistorico} />
        </View>
      </View>
    </ScrollView>
    <BotaoSanguezinho />
  </View>
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
    marginBottom: 15,
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
  glucoseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "90%",
    marginBottom: 20,
  },
  glucoseIcon: {
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
    paddingHorizontal: 20,
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
    paddingVertical: 10,
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
  boxTransparente: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "85%",
    alignItems: "center",
    marginVertical: 5,
  },
  tabelaImage: {
    width: "100%",
    height: 350,
    resizeMode: "contain",
    alignSelf: "center",
  },
  semDadosText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
});