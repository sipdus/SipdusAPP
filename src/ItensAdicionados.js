import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";

export default function ItensAdicionadosScreen({
  navigation,
  route,
}) {

  const { itens } = route.params;

  const renderItem = ({ item }) => (

    <View style={styles.itemContainer}>

      <Text style={styles.itemNome}>
        {item.nome}
      </Text>

      <Text style={styles.info}>
        Energia: {item.energia} kcal
      </Text>

      <Text style={styles.info}>
        Carboidratos: {item.carboidratos}g
      </Text>

      <Text style={styles.info}>
        Proteínas: {item.proteinas}g
      </Text>

      <Text style={styles.info}>
        Gorduras: {item.gorduras}g
      </Text>

      <Text style={styles.info}>
        Fibras: {item.fibras}g
      </Text>

      <Text style={styles.info}>
        Açúcar: {item.acucar}g
      </Text>

   

    </View>
  );

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >

          <Image
            source={require("../assets/voltar.png")}
            style={styles.voltaIcon}
          />

        </TouchableOpacity>

      </View>

      {/* LOGO */}
      <View style={styles.logoContainer}>

        <Image
          source={require("../assets/sipdus_logo.png")}
          style={styles.logo}
        />

      </View>

      {/* CONTAINER */}
      <View style={styles.blueContainer}>

        <Text style={styles.titulo}>
          Itens Adicionados
        </Text>

        <FlatList
          data={itens}
          keyExtractor={(item, index) =>
            index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 50
          }}
        />

      </View>

    </View>
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
    width: 100,
    height: 70,
    resizeMode: "contain",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    width: 300,
    height: 140,
    resizeMode: "contain",
  },

  blueContainer: {
    flex: 1,
    backgroundColor: "#00BCD4",
    borderTopRightRadius: 60,
    padding: 20,
  },

  titulo: {
    fontSize: 18,
    marginBottom: 20,
    alignSelf: "center",
    fontWeight: "600",
  },

  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },

  itemNome: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  info: {
    fontSize: 14,
    marginBottom: 4,
  },

});

