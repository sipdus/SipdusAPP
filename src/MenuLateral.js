import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { auth, database } from "../firebaseConfig";
import { ref, get } from "firebase/database";

export default function MenuLateral({ navigation }) {

  const [primeiroNome, setPrimeiroNome] = useState("Usuário");

  useEffect(() => {
    const carregarNome = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const snapshot = await get(ref(database, "usuarios/" + uid));
        if (snapshot.exists()) {
          const dados = snapshot.val();
          const nomeCompleto = dados.nome || "";
          const primeiro = nomeCompleto.trim().split(" ")[0];
          if (primeiro) {
            setPrimeiroNome(primeiro);
          }
        }
      } catch (error) {
        console.warn("Erro ao carregar nome do usuário:", error);
      }
    };

    carregarNome();
  }, []);

  const irParaPerfil = () => {
    navigation.getParent().navigate("PerfilScreen");
  };

  const irParaConfiguracoes = () => {
    navigation.getParent().navigate("ConfiguracoesScreen");
  };

  const irParaMedicacoes = () => {
    navigation.getParent().navigate("MedicacoesScreen");
  };

  return (
    <View style={styles.container}>

      {/* TOPO */}
      <View style={styles.header}>

        {/* IMAGEM DO MENU NO LUGAR DO TEXTO SIPDUS */}
        <Image
          source={require("../assets/menu.png")}
          style={styles.logoImage}
        />

        <View style={styles.userContainer}>
          <Text style={styles.userText}>{primeiroNome}</Text>
        </View>

      </View>

      {/* BOTÕES */}
      <View style={styles.menuItems}>

        <TouchableOpacity style={styles.button} onPress={irParaPerfil}>
          <Text style={styles.buttonText}>Meu perfil</Text>
          <Image
            source={require("../assets/user.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={irParaConfiguracoes}>
          <Text style={styles.buttonText}>Configurações</Text>
          <Image
            source={require("../assets/config.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={irParaMedicacoes}>
          <Text style={styles.buttonText}>Medicações</Text>
          <Image
            source={require("../assets/star.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#EEEFEF",
paddingTop:50,
paddingHorizontal:20
},

header:{
marginBottom:40
},

logoImage:{
width:120,
height:60,
resizeMode:"contain",
marginBottom:20
},

userContainer:{
flexDirection:"row",
alignItems:"center"
},

userText:{
fontSize:18,
fontWeight:"bold",
color:"#00BCD4"
},

menuItems:{
gap:15
},

button:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
borderWidth:1,
borderColor:"#00BCD4",
padding:12,
borderRadius:6
},

buttonText:{
fontSize:16
},

icon:{
width:24,
height:24,
resizeMode:"contain"
}

});