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

interface ApiPersonaFacultad {
  personafacultadid: number;
  personaid: number;
  facultadid: number;
  nombres?: string;
  apellidos?: string;
  facultad?: string;
}

interface DisplayPersonaFacultad extends ApiPersonaFacultad {
  id: string;
  displayName: string;
}

export default function PersonaFacultadListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newPersonaFacultad?: string;
    updatedPersonaFacultad?: string;
  }>();

  const [relaciones, setRelaciones] = useState<DisplayPersonaFacultad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/personafacultad");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiPersonaFacultad[] = await response.json();

        const mappedRelaciones: DisplayPersonaFacultad[] = data.map((r) => ({
          ...r,
          id: String(r.personafacultadid),
          displayName: `${r.nombres || "N/A"} ${r.apellidos || "N/A"} - ${
            r.facultad || "N/A"
          }`,
        }));
        setRelaciones(mappedRelaciones);
      } catch (e: any) {
        setError(
          e.message || "No se pudieron cargar las relaciones persona-facultad."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRelaciones();
  }, []);

  useEffect(() => {
    if (params?.newPersonaFacultad) {
      try {
        const nuevaApiRelacion = JSON.parse(
          params.newPersonaFacultad
        ) as ApiPersonaFacultad;
        setRelaciones((prev) => [
          ...prev,
          {
            ...nuevaApiRelacion,
            id: String(nuevaApiRelacion.personafacultadid || Date.now()),
            displayName: `ID Persona: ${nuevaApiRelacion.personaid} - ID Facultad: ${nuevaApiRelacion.facultadid}`,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nueva relación persona-facultad:", e);
      }
    } else if (params?.updatedPersonaFacultad) {
      try {
        const relacionActualizadaApi = JSON.parse(
          params.updatedPersonaFacultad
        ) as ApiPersonaFacultad;
        setRelaciones((prev) =>
          prev.map((r_display) =>
            r_display.personafacultadid ===
            relacionActualizadaApi.personafacultadid
              ? {
                  ...r_display,
                  ...relacionActualizadaApi,
                  displayName: `${
                    relacionActualizadaApi.nombres || r_display.nombres || "N/A"
                  } ${
                    relacionActualizadaApi.apellidos ||
                    r_display.apellidos ||
                    "N/A"
                  } - ${
                    relacionActualizadaApi.facultad ||
                    r_display.facultad ||
                    "N/A"
                  }`,
                }
              : r_display
          )
        );
      } catch (e) {
        console.error(
          "Error procesando relación persona-facultad actualizada:",
          e
        );
      }
    }
  }, [params?.newPersonaFacultad, params?.updatedPersonaFacultad]);

  const handleDeleteRelacion = async (idToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/personafacultad/${idToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setRelaciones((prev) =>
        prev.filter((r) => r.personafacultadid !== idToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar la relación.");
    }
  };

  const renderItem = ({ item }: { item: DisplayPersonaFacultad }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        <Text style={styles.itemSubtitle}>
          Persona ID: {item.personaid} - Facultad ID: {item.facultadid}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/personafacultad/form",
            params: {
              personaFacultadId: item.personafacultadid,
              personaFacultadData: JSON.stringify(item),
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
          onPress={() => handleDeleteRelacion(item.personafacultadid)}
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
        <Text>Cargando relaciones...</Text>
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

  if (relaciones.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay relaciones registradas.</Text>
        <Link href="/personafacultad/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>Agregar Primera Relación</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/personafacultad/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Relación</Text>
        </Pressable>
      </Link>
      <FlatList
        data={relaciones}
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
