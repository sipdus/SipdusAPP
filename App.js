import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Telas
import Login from "./src/Login";
import Cadastro from "./src/Cadastro";
import TelaInicial from "./src/TelaInicial";
import BPMScreen from "./src/BPM";
import OximetriaScreen from "./src/Oximetria";
import GlicemiaScreen from "./src/Glicemia";

// Context
import { BLEProvider } from "./src/hooks/BLEContext";

const Stack = createStackNavigator();

export default function App() {
  return (
    <BLEProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
          <Stack.Screen name="TelaInicial" component={TelaInicial} />
          <Stack.Screen name="BPMScreen" component={BPMScreen} />
          <Stack.Screen name="OximetriaScreen" component={OximetriaScreen} />
          <Stack.Screen name="GlicemiaScreen" component={GlicemiaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BLEProvider>
  );
}
