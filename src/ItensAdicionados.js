import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert } from "react-native";
import { auth, database } from "../firebaseConfig";
import { ref, push } from "firebase/database";

const CIANO = "#00BCD4";
const FUNDO = "#F7F7F8";

export default function ItensAdicionadosScreen({ navigation, route }) {

  const { itens } = route.params;

  const totais = itens.reduce(
    (acc, item) => {
      acc.energia += Number(item.energia) || 0;
      acc.carboidratos += Number(item.carboidratos) || 0;
      acc.proteinas += Number(item.proteinas) || 0;
      acc.gorduras += Number(item.gorduras) || 0;
      acc.fibras += Number(item.fibras) || 0;
      acc.acucar += Number(item.acucar) || 0;
      return acc;
    },
    { energia: 0, carboidratos: 0, proteinas: 0, gorduras: 0, fibras: 0, acucar: 0 }
  );

  const handleSalvarRefeicao = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Erro", "Você precisa estar logado para salvar a refeição.");
      return;
    }

    if (!itens || itens.length === 0) {
      Alert.alert("Nenhum item", "Adicione ao menos um item antes de salvar.");
      return;
    }

    try {
      await push(ref(database, "refeicoes"), {
        usuario_id: uid,
        itens,
        totais,
        timestamp: Date.now(),
        data_hora: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
      });

      Alert.alert("Salvo!", "Sua refeição foi salva com sucesso.");
    } catch (error) {
      Alert.alert("Erro ao salvar", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemNome}>{item.nome}</Text>
      <Text style={styles.info}>Energia: {item.energia} kcal</Text>
      <Text style={styles.info}>Carboidratos: {item.carboidratos}g</Text>
      <Text style={styles.info}>Proteínas: {item.proteinas}g</Text>
      <Text style={styles.info}>Gorduras: {item.gorduras}g</Text>
      <Text style={styles.info}>Fibras: {item.fibras}g</Text>
      <Text style={styles.info}>Açúcar: {item.acucar}g</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/voltar.png")} style={styles.voltaIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/sipdus_logo.png")} style={styles.logo} />
      </View>

      <View style={styles.contentContainer}>

        <Text style={styles.titulo}>Itens Adicionados</Text>

        <FlatList
          data={itens}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalTitulo}>Total da refeição:</Text>
          <Text style={styles.totalInfo}>Energia: {totais.energia.toFixed(1)} kcal</Text>
          <Text style={styles.totalInfo}>Carboidratos: {totais.carboidratos.toFixed(1)}g</Text>
          <Text style={styles.totalInfo}>Proteínas: {totais.proteinas.toFixed(1)}g</Text>
          <Text style={styles.totalInfo}>Gorduras: {totais.gorduras.toFixed(1)}g</Text>
          <Text style={styles.totalInfo}>Fibras: {totais.fibras.toFixed(1)}g</Text>
          <Text style={styles.totalInfo}>Açúcar: {totais.acucar.toFixed(1)}g</Text>
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvarRefeicao}>
          <Text style={styles.botaoSalvarTexto}>Salvar refeição</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 50, paddingHorizontal: 5 },
  voltaIcon: { width: 100, height: 60, resizeMode: "contain", marginLeft: -15 },
  logoContainer: { alignItems: "center", marginBottom: 10 },
  logo: { width: 260, height: 120, resizeMode: "contain" },
  contentContainer: { flex: 1, backgroundColor: FUNDO, padding: 20 },
  titulo: { fontSize: 18, marginBottom: 20, alignSelf: "center", fontWeight: "700", color: "#000" },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemNome: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: CIANO },
  info: { fontSize: 14, marginBottom: 4, color: "#000" },
  totalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 2,
    borderColor: CIANO,
  },
  totalTitulo: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#000" },
  totalInfo: { fontSize: 14, marginBottom: 4, fontWeight: "600", color: "#000" },
  botaoSalvar: {
    backgroundColor: CIANO,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  botaoSalvarTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});