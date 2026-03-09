import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Login from "./src/Login";
import Cadastro from "./src/Cadastro";
import TelaInicial from "./src/TelaInicial";
import BPMScreen from "./src/BPM";
import OximetriaScreen from "./src/Oximetria";
import GlicemiaScreen from "./src/Glicemia";
import RefeicoesScreen from "./src/Refeicoes";
import MenuLateral from "./src/MenuLateral";

import { BLEProvider } from "./src/hooks/BLEContext";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <MenuLateral {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: "#EEEFEF",
        },
        sceneContainerStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Drawer.Screen name="TelaInicial" component={TelaInicial} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <BLEProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
          <Stack.Screen name="TelaInicial" component={DrawerRoutes} />
          <Stack.Screen name="BPMScreen" component={BPMScreen} />
          <Stack.Screen name="OximetriaScreen" component={OximetriaScreen} />
          <Stack.Screen name="GlicemiaScreen" component={GlicemiaScreen} />
          <Stack.Screen name="RefeicoesScreen" component={RefeicoesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BLEProvider>
  );
}