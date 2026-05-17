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

export default function RefeicoesScreen({ navigation }) {

  const [busca, setBusca] = useState("");
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itensAdicionados, setItensAdicionados] = useState([]);

  // BUSCAR ALIMENTOS
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

          energia:
            item.nutriments?.["energy-kcal_100g"] || 0,

          carboidratos:
            item.nutriments?.carbohydrates_100g || 0,

          proteinas:
            item.nutriments?.proteins_100g || 0,

          gorduras:
            item.nutriments?.fat_100g || 0,

          fibras:
            item.nutriments?.fiber_100g || 0,

          acucar:
            item.nutriments?.sugars_100g || 0,

          

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

  // BUSCA AUTOMÁTICA
  useEffect(() => {

    const delay = setTimeout(() => {
      buscarAlimentos(busca);
    }, 500);

    return () => clearTimeout(delay);

  }, [busca]);

  // ADICIONAR ITEM
  const adicionarItem = (item) => {

    setItensAdicionados((prev) => [...prev, item]);

  };

  // RENDER ITEM
  const renderItem = ({ item }) => (

    <View style={styles.itemContainer}>

      <View style={{ flex: 1 }}>

        <Text style={styles.itemText}>
          {item.nome}
        </Text>

        <Text style={styles.infoText}>
          {item.energia} kcal | Prot: {item.proteinas}g
        </Text>

      </View>

      <TouchableOpacity onPress={() => adicionarItem(item)}>

        <Ionicons
          name="add-circle-outline"
          size={28}
          color="#000"
        />

      </TouchableOpacity>

    </View>
  );

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity onPress={() => navigation.goBack()}>

          <Image
            source={require("../assets/volta.png")}
            style={styles.voltaIcon}
          />

        </TouchableOpacity>

      </View>

      {/* USER */}
      <View style={styles.userContainer}>

        <Text style={styles.userText}>
          (User):
        </Text>

      </View>

      {/* CONTAINER AZUL */}
      <View style={styles.blueContainer}>

        <Text style={styles.title}>
          Selecione a refeição:
        </Text>

        {/* BUSCA */}
        <View style={styles.searchContainer}>

          <TextInput
            placeholder="Procure por um alimento"
            placeholderTextColor="#999"
            style={styles.input}
            value={busca}
            onChangeText={setBusca}
          />

          <View style={styles.searchButton}>

            <Ionicons
              name="search"
              size={22}
              color="#fff"
            />

          </View>

        </View>

        {/* LOADING */}
        {loading && (

          <ActivityIndicator
            size="large"
            color="#000"
          />

        )}

        {/* LISTA */}
        <FlatList
          data={alimentos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        {/* BOTÃO ITENS ADICIONADOS */}
        <TouchableOpacity
          style={styles.addedButton}
          onPress={() =>
            navigation.navigate(
              "ItensAdicionadosScreen",
              {
                itens: itensAdicionados
              }
            )
          }
        >

          <Ionicons
            name="bag-handle-outline"
            size={20}
            color="#000"
          />

          <Text style={styles.addedText}>
            Itens adicionados: {itensAdicionados.length}
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 5,
  },

  voltaIcon: {
    width: 160,
    height: 70,
    resizeMode: "contain",
  },

  userContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  userText: {
    fontSize: 23,
    color: "#000",
  },

  blueContainer: {
    backgroundColor: "#00BCD4",
    borderTopRightRadius: 60,
    padding: 20,
    paddingBottom: 50,
    minHeight: 700,
  },

  title: {
    fontSize: 18,
    marginBottom: 15,
    color: "#000",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },

  searchButton: {
    backgroundColor: "#E53935",
    marginLeft: 10,
    padding: 10,
    borderRadius: 25,
  },

  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemText: {
    fontSize: 15,
    fontWeight: "600",
  },

  infoText: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },

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
  },

  addedText: {
    marginLeft: 8,
    fontWeight: "600",
  },

});