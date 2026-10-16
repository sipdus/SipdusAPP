import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Dimensions } from "react-native";
import * as Notifications from "expo-notifications";

import Login from "./src/Login";
import LoginMedico from "./src/LoginMedico";
import Cadastro from "./src/Cadastro";
import CadastroMedico from "./src/CadastroMedico";
import RecuperarSenhaMedico from "./src/RecuperarSenhaMedico";
import TelaMedico from "./src/TelaMedico";
import TelaPaciente from "./src/TelaPaciente";
import TelaInicial from "./src/TelaInicial";
import BPMScreen from "./src/BPM";
import OximetriaScreen from "./src/Oximetria";
import GlicemiaScreen from "./src/Glicemia";
import RefeicoesScreen from "./src/Refeicoes";
import MenuLateral from "./src/MenuLateral";
import ItensAdicionadosScreen from "./src/ItensAdicionados";
import PrivacidadeScreen from "./src/Privacidade";
import ConfiguracoesScreen from "./src/Configuracoes";
import PerfilScreen from "./src/Perfil";
import MedicacoesScreen from "./src/Medicacoes";

import { WebSocketProvider } from "./src/hooks/WebSocketContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const { width } = Dimensions.get("window");

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <MenuLateral {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: width * 0.5,
        },
      }}
    >
      <Drawer.Screen name="Home" component={TelaInicial} />
    </Drawer.Navigator>
  );
}

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="LoginMedico" component={LoginMedico} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="CadastroMedico" component={CadastroMedico} />
        <Stack.Screen name="RecuperarSenhaMedico" component={RecuperarSenhaMedico} />
        <Stack.Screen name="TelaMedico" component={TelaMedico} />
        <Stack.Screen name="TelaPaciente" component={TelaPaciente} />
        <Stack.Screen name="TelaInicial" component={DrawerRoutes} />
        <Stack.Screen name="BPMScreen" component={BPMScreen} />
        <Stack.Screen name="OximetriaScreen" component={OximetriaScreen} />
        <Stack.Screen name="GlicemiaScreen" component={GlicemiaScreen} />
        <Stack.Screen name="RefeicoesScreen" component={RefeicoesScreen} />
        <Stack.Screen name="ItensAdicionadosScreen" component={ItensAdicionadosScreen} />
        <Stack.Screen name="PrivacidadeScreen" component={PrivacidadeScreen} />
        <Stack.Screen name="ConfiguracoesScreen" component={ConfiguracoesScreen} />
        <Stack.Screen name="PerfilScreen" component={PerfilScreen} />
        <Stack.Screen name="MedicacoesScreen" component={MedicacoesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
}