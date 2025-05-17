import { Colors } from "@/constants/Colors"; // Asumiendo que tienes tus colores aquí
import { useColorScheme } from "@/hooks/useColorScheme"; // Para estilos dinámicos
import { Link } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Define tus servicios y las rutas base para sus CRUDs
const servicesToManage = [
  { id: "personas", name: "Personas", path: "/personas" },
  { id: "facultades", name: "Facultades", path: "/facultades" },
  { id: "carreras", name: "Carreras", path: "/carreras" },
  { id: "departamentos", name: "Departamentos", path: "/departamentos" },
  {
    id: "areascientificas",
    name: "Áreas Científicas",
    path: "/areascientificas",
  },
  { id: "investigaciones", name: "Investigaciones", path: "/investigaciones" },
  { id: "municipios", name: "Municipios", path: "/municipios" },
  { id: "titulos", name: "Títulos", path: "/titulos" },
  // Para tablas de unión, podrías tener interfaces específicas o gestionarlas dentro de las entidades principales.
  // Por ahora, las listamos para considerar si necesitan su propio CRUD directo.
  {
    id: "investigacionpersona",
    name: "Investigación-Persona",
    path: "/investigacionpersona",
  },
  {
    id: "personaareacientifica",
    name: "Persona-Área Científica",
    path: "/personaareacientifica",
  },
  { id: "personafacultad", name: "Persona-Facultad", path: "/personafacultad" },
];

export default function ServicesTabScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  const renderItem = ({ item }: { item: (typeof servicesToManage)[0] }) => (
    <Link href={item.path as any} asChild>
      <Pressable style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemArrow}>&rarr;</Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gestión de Entidades</Text>
      <FlatList
        data={servicesToManage}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const getStyles = (colorScheme: "light" | "dark" | null | undefined) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 40 : 60, // Ajustar para evitar solapamiento con barra de estado/notch
      paddingHorizontal: 16,
      backgroundColor: Colors[colorScheme ?? "light"].background,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: Colors[colorScheme ?? "light"].text,
    },
    listContent: {
      paddingBottom: 20,
    },
    itemContainer: {
      backgroundColor: Colors[colorScheme ?? "light"].background,
      padding: 18,
      borderRadius: 8,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 2, // Sombra para Android
      shadowColor: "#000", // Sombra para iOS
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    itemText: {
      fontSize: 18,
      color: Colors[colorScheme ?? "light"].text,
    },
    itemArrow: {
      fontSize: 18,
      color: Colors[colorScheme ?? "light"].tint,
    },
  });
