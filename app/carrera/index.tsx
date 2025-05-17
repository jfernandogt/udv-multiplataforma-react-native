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

interface ApiCarrera {
  carreraid: number;
  nombre: string;
  facultadid: number;
  facultad?: string;
}

interface DisplayCarrera extends ApiCarrera {
  id: string;
  displayName: string;
}

export default function CarrerasListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newCarrera?: string;
    updatedCarrera?: string;
  }>();

  const [carreras, setCarreras] = useState<DisplayCarrera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/carrera");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiCarrera[] = await response.json();

        const mappedCarreras: DisplayCarrera[] = data.map((c) => ({
          ...c,
          id: String(c.carreraid),
          displayName: c.nombre,
        }));
        setCarreras(mappedCarreras);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar las carreras.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, []);

  useEffect(() => {
    if (params?.newCarrera) {
      try {
        const nuevaApiCarrera = JSON.parse(params.newCarrera) as ApiCarrera;
        setCarreras((prev) => [
          ...prev,
          {
            ...nuevaApiCarrera,
            id: String(nuevaApiCarrera.carreraid || Date.now()),
            displayName: nuevaApiCarrera.nombre,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nueva carrera:", e);
      }
    } else if (params?.updatedCarrera) {
      try {
        const carreraActualizadaApi = JSON.parse(
          params.updatedCarrera
        ) as ApiCarrera;
        setCarreras((prev) =>
          prev.map((c_display) =>
            c_display.carreraid === carreraActualizadaApi.carreraid
              ? {
                  ...c_display,
                  ...carreraActualizadaApi,
                  displayName: carreraActualizadaApi.nombre,
                }
              : c_display
          )
        );
      } catch (e) {
        console.error("Error procesando carrera actualizada:", e);
      }
    }
  }, [params?.newCarrera, params?.updatedCarrera]);

  const handleDeleteCarrera = async (carreraIdToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/carrera/${carreraIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setCarreras((prev) =>
        prev.filter((carrera) => carrera.carreraid !== carreraIdToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar la carrera.");
    }
  };

  const renderItem = ({ item }: { item: DisplayCarrera }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        {item.facultad && (
          <Text style={styles.itemSubtitle}>Facultad: {item.facultad}</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/carrera/form",
            params: {
              carreraId: item.carreraid,
              carreraData: JSON.stringify(item),
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
          onPress={() => handleDeleteCarrera(item.carreraid)}
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
        <Text>Cargando carreras...</Text>
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

  if (carreras.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay carreras registradas.</Text>
        <Link href="/carrera/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>Agregar Primera Carrera</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/carrera/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Carrera</Text>
        </Pressable>
      </Link>
      <FlatList
        data={carreras}
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
      marginTop: 2,
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
