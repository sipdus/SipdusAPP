import React, { createContext, useState, useEffect, useRef } from "react";
import { BleManager } from "react-native-ble-plx";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import { Buffer } from "buffer";

export const BLEContext = createContext({});

export const BLEProvider = ({ children }) => {
  const managerRef = useRef(new BleManager());

  const [device, setDevice] = useState(null);
  const [bpm, setBPM] = useState(null);
  const [spo2, setSpO2] = useState(null);
  const [glucose, setGlucose] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
  const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
  const DEVICE_NAME = "ESP32_MAX30102";

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        const allGranted = Object.values(result).every(
          (v) => v === PermissionsAndroid.RESULTS.GRANTED
        );
        if (!allGranted) {
          Alert.alert("Permissões BLE", "Permissões Bluetooth necessárias!");
          return false;
        }
      } else {
        const fine = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permissões", "Localização necessária para BLE!");
          return false;
        }
      }
    }
    return true;
  };

  const scanAndConnect = () => {
    const manager = managerRef.current;

    manager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        console.error("❌ Erro no scan:", error);
        return;
      }

      if (scannedDevice && scannedDevice.name === DEVICE_NAME) {
        console.log("🔍 Encontrado:", scannedDevice.name);
        manager.stopDeviceScan();

        try {
          const connectedDevice = await scannedDevice.connect();
          setDevice(connectedDevice);
          setIsConnected(true);

          await connectedDevice.discoverAllServicesAndCharacteristics();
          monitorData(connectedDevice);
        } catch (err) {
          console.error("Erro na conexão:", err);
          setTimeout(scanAndConnect, 3000);
        }
      }
    });
  };

  const monitorData = (connectedDevice) => {
    connectedDevice.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) return;
        if (!characteristic?.value) return;

        const rawData = Buffer.from(characteristic.value, "base64")
          .toString("utf-8")
          .trim();

        try {
          const [bpmStr, spo2Str, glucoseStr] = rawData.split(",");
          if (bpmStr && spo2Str && glucoseStr) {
            setBPM(parseInt(bpmStr));
            setSpO2(parseFloat(spo2Str));
            setGlucose(parseFloat(glucoseStr));
          }
        } catch (err) {
          console.warn("Erro ao processar:", rawData, err);
        }
      }
    );
  };

  const startBLE = async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    const manager = managerRef.current;

    const subscription = manager.onStateChange((state) => {
      if (state === "PoweredOn") {
        scanAndConnect();
        subscription.remove();
      }
    }, true);
  };

  useEffect(() => {
    startBLE();
  }, []);

  return (
    <BLEContext.Provider value={{ device, bpm, spo2, glucose, isConnected, startBLE }}>
      {children}
    </BLEContext.Provider>
  );
};