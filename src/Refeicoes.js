import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, database } from "../firebaseConfig";
import { ref, get } from "firebase/database";
import BotaoSanguezinho from "./components/BotaoSanguezinho";

const CIANO = "#00BCD4";
const VERMELHO = "#E53935";
const FUNDO = "#F7F7F8";

export default function RefeicoesScreen({ navigation }) {

  const [busca, setBusca] = useState("");
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itensAdicionados, setItensAdicionados] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("");

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

    buscarNome();
  }, []);

  const buscarAlimentos = async (texto) => {

    if (!texto || texto.length < 2) {
      setAlimentos([]);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1`
      );

      const data = await response.json();

      const produtos = (data.products || []).map((item, index) => ({
          id: index.toString(),
          nome:
            item.product_name_pt ||
            item.product_name ||
            item.generic_name_pt ||
            "Produto",
          energia: item.nutriments?.["energy-kcal_100g"] || 0,
          carboidratos: item.nutriments?.carbohydrates_100g || 0,
          proteinas: item.nutriments?.proteins_100g || 0,
          gorduras: item.nutriments?.fat_100g || 0,
          fibras: item.nutriments?.fiber_100g || 0,
          acucar: item.nutriments?.sugars_100g || 0,
        }))
        .filter(item => item.nome && item.energia > 0)
        .slice(0, 15);

      setAlimentos(produtos);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      buscarAlimentos(busca);
    }, 500);

    return () => clearTimeout(delay);
  }, [busca]);

  const adicionarItem = (item) => {
    setItensAdicionados((prev) => [...prev, item]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemText}>{item.nome}</Text>
        <Text style={styles.infoText}>
          {item.energia} kcal | Prot: {item.proteinas}g
        </Text>
      </View>

      <TouchableOpacity onPress={() => adicionarItem(item)}>
        <Ionicons name="add-circle-outline" size={28} color={CIANO} />
      </TouchableOpacity>
    </View>
  );

  return (
   <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/volta.png")} style={styles.voltaIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.userContainer}>
        <Text style={styles.userText}>{nomeUsuario || "usuário"}:</Text>
      </View>

      <View style={styles.contentContainer}>

        <Text style={styles.title}>Selecione a refeição:</Text>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Procure por um alimento"
            placeholderTextColor="#999"
            style={styles.input}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
            onSubmitEditing={() => buscarAlimentos(busca)}
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => buscarAlimentos(busca)}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color={CIANO} />}

        <FlatList
          data={alimentos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        <TouchableOpacity
          style={styles.addedButton}
          onPress={() =>
            navigation.navigate("ItensAdicionadosScreen", {
              itens: itensAdicionados,
            })
          }
        >
          <Ionicons name="bag-handle-outline" size={20} color={CIANO} />
          <Text style={styles.addedText}>
            Itens adicionados: {itensAdicionados.length}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
   <BotaoSanguezinho />
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 50, paddingHorizontal: 5 },
  voltaIcon: { width: 115, height: 60, resizeMode: "contain", marginLeft: 10 },
  userContainer: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  userText: { fontSize: 23, color: CIANO, fontWeight: "bold" },
  contentContainer: {
    backgroundColor: FUNDO,
    padding: 20,
    paddingBottom: 50,
    minHeight: 700,
  },
  title: { fontSize: 18, marginBottom: 15, color: "#000" },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  searchButton: { backgroundColor: VERMELHO, marginLeft: 10, padding: 10, borderRadius: 25 },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemText: { fontSize: 15, fontWeight: "600" },
  infoText: { fontSize: 12, color: "#555", marginTop: 4 },
  addedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: "86%",
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  addedText: { marginLeft: 8, fontWeight: "600" },
});