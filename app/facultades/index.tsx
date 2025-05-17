import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ApiFacultad {
  facultadid: number;
  nombre: string;
  siglas?: string;
  telefono?: string;
  correo?: string;
  total_personas?: string;
}

interface DisplayFacultad extends ApiFacultad {
  id: string;
  displayName: string;
}

export default function FacultadesListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newFacultad?: string;
    updatedFacultad?: string;
  }>();

  const [facultades, setFacultades] = useState<DisplayFacultad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacultades = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/facultades");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiFacultad[] = await response.json();

        const mappedFacultades: DisplayFacultad[] = data.map((f) => ({
          ...f,
          id: String(f.facultadid),
          displayName: f.nombre,
        }));
        setFacultades(mappedFacultades);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar las facultades.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultades();
  }, []);

  useEffect(() => {
    if (params?.newFacultad) {
      try {
        const nuevaApiFacultad = JSON.parse(params.newFacultad) as ApiFacultad;
        setFacultades((prev) => [
          ...prev,
          {
            ...nuevaApiFacultad,
            id: String(nuevaApiFacultad.facultadid || Date.now()),
            displayName: nuevaApiFacultad.nombre,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nueva facultad:", e);
      }
    } else if (params?.updatedFacultad) {
      try {
        const facultadActualizadaApi = JSON.parse(
          params.updatedFacultad
        ) as ApiFacultad;
        setFacultades((prev) =>
          prev.map((f_display) =>
            f_display.facultadid === facultadActualizadaApi.facultadid
              ? {
                  ...f_display,
                  ...facultadActualizadaApi,
                  displayName: facultadActualizadaApi.nombre,
                }
              : f_display
          )
        );
      } catch (e) {
        console.error("Error procesando facultad actualizada:", e);
      }
    }
  }, [params?.newFacultad, params?.updatedFacultad]);

  const handleDeleteFacultad = async (facultadIdToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/facultades/${facultadIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setFacultades((prev) =>
        prev.filter((facultad) => facultad.facultadid !== facultadIdToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar la facultad.");
    }
  };

  const renderItem = ({ item }: { item: DisplayFacultad }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        {item.correo && <Text style={styles.itemSubtitle}>{item.correo}</Text>}
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/facultades/form",
            params: {
              facultadId: item.facultadid,
              facultadData: JSON.stringify(item),
            },
          }}
          asChild
        >
          <Pressable style={{ ...styles.actionButton, ...styles.editButton }}>
            <IconSymbol
              name="pencil"
              size={18}
              color={Colors.light.background}
            />
          </Pressable>
        </Link>
        <Pressable
          style={{ ...styles.actionButton, ...styles.deleteButton }}
          onPress={() => handleDeleteFacultad(item.facultadid)}
        >
          <IconSymbol name="trash" size={18} color={Colors.light.background} />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text>Cargando facultades...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (facultades.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay facultades registradas.</Text>
        <Link href="/facultades/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>Agregar Primera Facultad</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/facultades/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Facultad</Text>
        </Pressable>
      </Link>
      <FlatList
        data={facultades}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: Colors.light.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      backgroundColor: Colors.light.background,
    },
    errorText: {
      color: Colors.light.error,
      fontSize: 16,
      marginBottom: 10,
      textAlign: "center",
    },
    addButton: {
      backgroundColor: Colors.light.tint,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    addButtonText: {
      color: Colors.light.background,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    listContent: {
      paddingBottom: 20,
    },
    itemContainer: {
      backgroundColor: Colors.light.card,
      padding: 15,
      borderRadius: 8,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    itemTextContainer: {
      flex: 1,
      marginRight: 8,
    },
    itemTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: Colors.light.text,
    },
    itemSubtitle: {
      fontSize: 14,
      color: Colors.light.textMuted,
    },
    itemActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      borderRadius: 20,
      marginLeft: 8,
    },
    editButton: {
      backgroundColor: Colors.light.tint,
    },
    deleteButton: {
      backgroundColor: Colors.light.error,
    },
  });
