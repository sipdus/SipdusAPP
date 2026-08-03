import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { ref, get, remove, query, orderByChild, limitToLast } from "firebase/database";
import { auth, database } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

const CIANO = "#00BCD4";
const VERMELHO = "#E53935";
const FUNDO = "#F7F7F8";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ConfiguracoesScreen({ navigation }) {

  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [tipoAcao, setTipoAcao] = useState("");
  const [mostrarSeletorHorario, setMostrarSeletorHorario] = useState(false);
  const [horarioLembrete, setHorarioLembrete] = useState(new Date());

  const agendarLembrete = async (hora, minuto) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão necessária", "Ative as notificações para receber lembretes.");
    return;
  }

  const uid = auth.currentUser?.uid;

  // Cancela só o lembrete de jejum anterior (não mexe nos de medicação)
  const snapshot = await get(ref(database, "usuarios/" + uid + "/lembrete_jejum_id"));
  if (snapshot.exists()) {
    await Notifications.cancelScheduledNotificationAsync(snapshot.val());
  }

  const novoId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Sipdus 🩸",
      body: "Hora de medir sua glicemia em jejum!",
    },
    trigger: {
      hour: hora,
      minute: minuto,
      repeats: true,
    },
  });

  if (uid) {
    await update(ref(database, "usuarios/" + uid), {
      lembrete_jejum_id: novoId,
    });
  }

  Alert.alert(
    "Lembrete ativado!",
    `Você receberá uma notificação todo dia às ${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}.`
  );
};

  const handleEscolherHorario = (event, dataEscolhida) => {
    setMostrarSeletorHorario(false);

    if (dataEscolhida) {
      setHorarioLembrete(dataEscolhida);
      agendarLembrete(dataEscolhida.getHours(), dataEscolhida.getMinutes());
    }
  };

  const handleSolicitarDados = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const snapshotUsuario = await get(ref(database, "usuarios/" + uid));
      const dados = snapshotUsuario.exists() ? snapshotUsuario.val() : {};

      const leiturasQuery = query(
        ref(database, "leituras"),
        orderByChild("timestamp"),
        limitToLast(2000)
      );
      const snapshotLeituras = await get(leiturasQuery);
      let leituraTexto = "Nenhuma leitura encontrada.";

      const refeicoesQuery = query(
        ref(database, "refeicoes"),
        orderByChild("timestamp"),
        limitToLast(500)
      );
      const snapshotRefeicoes = await get(refeicoesQuery);
      let refeicaoTexto = "Nenhuma refeição salva.";

      if (snapshotLeituras.exists()) {
        const todasLeituras = snapshotLeituras.val();
        const duasSemanasAtras = Date.now() - 14 * 24 * 60 * 60 * 1000;

        const leiturasFiltradas = Object.values(todasLeituras).filter((leitura) => {
          const ehDoUsuario = leitura.usuario_id === uid;
          const dentroDoPrazo = (leitura.timestamp || 0) >= duasSemanasAtras;
          const temValorValido = leitura.bpm > 0 || leitura.spo2 > 0 || leitura.glicemia > 0;
          return ehDoUsuario && dentroDoPrazo && temValorValido;
        });

        if (leiturasFiltradas.length > 0) {
          const ordenadasCrescente = leiturasFiltradas.sort(
            (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
          );

          const porDia = {};
          ordenadasCrescente.forEach((leitura) => {
            const chaveDia = new Date(leitura.timestamp || 0).toLocaleDateString("pt-BR");

            if (!porDia[chaveDia]) {
              porDia[chaveDia] = leitura;
            }
          });

          const leiturasUmaPorDia = Object.values(porDia).reverse().slice(0, 14);

          leituraTexto = leiturasUmaPorDia
            .map((l) => {
              const partes = [];
              if (l.bpm > 0) partes.push(`BPM: ${l.bpm}`);
              if (l.spo2 > 0) partes.push(`SpO2: ${l.spo2}`);
              if (l.glicemia > 0) partes.push(`Glicemia: ${l.glicemia}`);
              return `${l.data_hora} - ${partes.join(", ")}`;
            })
            .join("\n");
        } else {
          leituraTexto = "Nenhuma leitura válida encontrada nas últimas 2 semanas.";
        }
      }

      if (snapshotRefeicoes.exists()) {
        const todasRefeicoes = snapshotRefeicoes.val();
        const umaSemanaAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const refeicoesFiltradas = Object.values(todasRefeicoes).filter((refeicao) => {
          const ehDoUsuario = refeicao.usuario_id === uid;
          const dentroDoPrazo = (refeicao.timestamp || 0) >= umaSemanaAtras;
          return ehDoUsuario && dentroDoPrazo;
        });

        if (refeicoesFiltradas.length > 0) {
          const ordenadasCrescente = refeicoesFiltradas.sort(
            (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
          );

          refeicaoTexto = ordenadasCrescente
            .map((r) => {
              const t = r.totais || {};
              return (
                `${r.data_hora} - Energia: ${Number(t.energia || 0).toFixed(1)} kcal, ` +
                `Carboidratos: ${Number(t.carboidratos || 0).toFixed(1)}g, ` +
                `Proteínas: ${Number(t.proteinas || 0).toFixed(1)}g, ` +
                `Gorduras: ${Number(t.gorduras || 0).toFixed(1)}g, ` +
                `Fibras: ${Number(t.fibras || 0).toFixed(1)}g, ` +
                `Açúcar: ${Number(t.acucar || 0).toFixed(1)}g`
              );
            })
            .join("\n");
        } else {
          refeicaoTexto = "Nenhuma refeição encontrada na última semana.";
        }
      }

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: "service_6o5gqai",
          template_id: "template_agcktju",
          user_id: "8-XqNiN070z1-SXAn",
          template_params: {
            nome: dados.nome || "Usuário",
            email: dados.email || "",
            genero: dados.genero || "Não informado",
            data_nascimento: dados.data_nascimento || "Não informado",
            leituras: leituraTexto,
            refeicoes: refeicaoTexto,
          },
        }),
      });

      const respostaTexto = await response.text();

      if (response.ok) {
        Alert.alert("Enviado!", "Seus dados foram enviados para o seu email.");
      } else {
        Alert.alert("Erro ao enviar", `Status: ${response.status}\n${respostaTexto}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível buscar ou enviar seus dados.");
    }
  };

  const executarAcao = async () => {
    setMostrarPopup(false);
    const uid = auth.currentUser?.uid;

    try {
      if (tipoAcao === "sair") {
        await signOut(auth);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }

      else if (tipoAcao === "excluir") {
        if (uid) {
          await remove(ref(database, "usuarios/" + uid));
        }
        await deleteUser(auth.currentUser);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }

      else if (tipoAcao === "dados") {
        if (uid) {
          await remove(ref(database, "usuarios/" + uid));
        }
        Alert.alert("Pronto", "Seus dados foram apagados.");
      }
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Ação sensível",
          "Por segurança, faça login novamente antes de excluir sua conta."
        );
      } else {
        Alert.alert("Erro", error.message);
      }
    }
  };

  const renderOption = (titulo, icon, danger = false, privacidade = false) => (
    <TouchableOpacity
      style={styles.option}
      activeOpacity={0.7}
      onPress={() => {

        if (titulo === "Gerenciar Conta") {
          navigation.navigate("PerfilScreen");
        }

        if (titulo === "Privacidade") {
          navigation.navigate("PrivacidadeScreen");
        }

        if (titulo === "Solicitar seus dados") {
          handleSolicitarDados();
        }

        if (titulo === "Excluir a conta") {
          setTipoAcao("excluir");
          setMostrarPopup(true);
        }

        if (titulo === "Excluir seus dados") {
          setTipoAcao("dados");
          setMostrarPopup(true);
        }
      }}
    >

      <Text style={[styles.optionText, danger && styles.dangerText]}>
        {titulo}
      </Text>

      <View style={styles.iconBox}>
        <Image
          source={icon}
          style={[styles.icon, privacidade && styles.iconPrivacidade]}
        />
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>Configurações</Text>

        {renderOption("Gerenciar Conta", require("../assets/user.png"))}

        {renderOption("Solicitar seus dados", require("../assets/dados.png"))}

        {renderOption("Privacidade", require("../assets/privacidade.png"), false, true)}

        {/* LEMBRETE DE JEJUM */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => setMostrarSeletorHorario(true)}
        >
          <Text style={styles.optionText}>Lembrete de jejum</Text>
          <View style={styles.iconBox}>
            <Ionicons name="alarm-outline" size={26} color="#000" />
          </View>
        </TouchableOpacity>

        {mostrarSeletorHorario && (
          <DateTimePicker
            value={horarioLembrete}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleEscolherHorario}
          />
        )}

        {renderOption("Excluir a conta", require("../assets/excluirconta.png"), true)}

        {renderOption("Excluir seus dados", require("../assets/excluirdados.png"), true)}

        {/* BOTÃO SAIR */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            setTipoAcao("sair");
            setMostrarPopup(true);
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>

          <Image
            source={require("../assets/sair.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

      </ScrollView>

      {/* POPUP */}
      {mostrarPopup && (
        <View style={styles.overlay}>
          <View style={styles.popup}>

            <Text style={styles.popupText}>
              {tipoAcao === "sair"
                ? "Tem certeza que deseja sair?"
                : tipoAcao === "excluir"
                ? "Tem certeza que deseja encerrar sua conta?"
                : "Tem certeza que deseja apagar seus dados?"}
            </Text>

            <View style={styles.iconsContainer}>

              <TouchableOpacity onPress={executarAcao}>
                <Text style={styles.botaoTexto}>Sim</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMostrarPopup(false)}>
                <Text style={styles.botaoTexto}>Não</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 70,
  },

  voltaIcon: {
    width: 100,
    height: 60,
    resizeMode: "contain",
    marginLeft: 10,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginLeft: 20,
  },

  logo: {
    width: 240,
    height: 130,
    resizeMode: "contain",
  },

  contentContainer: {
    flex: 1,
    backgroundColor: FUNDO,
    padding: 20,
  },

  title: {
    fontSize: 18,
    marginBottom: 20,
    color: "#000",
    fontWeight: "700",
    alignSelf: "center",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    width: "85%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  optionText: {
    fontSize: 15,
    color: "#000",
  },

  dangerText: {
    color: VERMELHO,
  },

  iconBox: {
    backgroundColor: CIANO,
    padding: 6,
    borderRadius: 5,
  },

  icon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  iconPrivacidade: {
    width: 26,
    height: 26,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    backgroundColor: "#fff",
    width: "55%",
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  logoutText: {
    marginRight: 8,
    fontSize: 16,
    color: VERMELHO,
    fontWeight: "600",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  popup: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },

  popupText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },

  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  botaoTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: CIANO,
  },

});