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

interface ApiPersonaAreaCientifica {
  personaareacientificaid: number;
  personaid: number;
  areacientificaid: number;
  nombres?: string;
  apellidos?: string;
  area_cientifica?: string;
}

interface DisplayPersonaAreaCientifica extends ApiPersonaAreaCientifica {
  id: string;
  displayName: string;
}

export default function PersonaAreaCientificaListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newPersonaAreaCientifica?: string;
    updatedPersonaAreaCientifica?: string;
  }>();

  const [relaciones, setRelaciones] = useState<DisplayPersonaAreaCientifica[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "http://localhost:8000/personaareacientifica"
        );
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiPersonaAreaCientifica[] = await response.json();

        const mappedRelaciones: DisplayPersonaAreaCientifica[] = data.map(
          (r) => ({
            ...r,
            id: String(r.personaareacientificaid),
            displayName: `${r.nombres || "N/A"} ${r.apellidos || "N/A"} - ${
              r.area_cientifica || "N/A"
            }`,
          })
        );
        setRelaciones(mappedRelaciones);
      } catch (e: any) {
        setError(
          e.message ||
            "No se pudieron cargar las relaciones persona-área científica."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRelaciones();
  }, []);

  useEffect(() => {
    if (params?.newPersonaAreaCientifica) {
      try {
        const nuevaApiRelacion = JSON.parse(
          params.newPersonaAreaCientifica
        ) as ApiPersonaAreaCientifica;
        setRelaciones((prev) => [
          ...prev,
          {
            ...nuevaApiRelacion,
            id: String(nuevaApiRelacion.personaareacientificaid || Date.now()),
            displayName: `ID Persona: ${nuevaApiRelacion.personaid} - ID Área: ${nuevaApiRelacion.areacientificaid}`,
          },
        ]);
      } catch (e) {
        console.error(
          "Error procesando nueva relación persona-área científica:",
          e
        );
      }
    } else if (params?.updatedPersonaAreaCientifica) {
      try {
        const relacionActualizadaApi = JSON.parse(
          params.updatedPersonaAreaCientifica
        ) as ApiPersonaAreaCientifica;
        setRelaciones((prev) =>
          prev.map((r_display) =>
            r_display.personaareacientificaid ===
            relacionActualizadaApi.personaareacientificaid
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
                    relacionActualizadaApi.area_cientifica ||
                    r_display.area_cientifica ||
                    "N/A"
                  }`,
                }
              : r_display
          )
        );
      } catch (e) {
        console.error(
          "Error procesando relación persona-área científica actualizada:",
          e
        );
      }
    }
  }, [params?.newPersonaAreaCientifica, params?.updatedPersonaAreaCientifica]);

  const handleDeleteRelacion = async (idToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/personaareacientifica/${idToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setRelaciones((prev) =>
        prev.filter((r) => r.personaareacientificaid !== idToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar la relación.");
    }
  };

  const renderItem = ({ item }: { item: DisplayPersonaAreaCientifica }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        <Text style={styles.itemSubtitle}>
          Persona ID: {item.personaid} - Área ID: {item.areacientificaid}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/personaareacientifica/form",
            params: {
              personaAreaCientificaId: item.personaareacientificaid,
              personaAreaCientificaData: JSON.stringify(item),
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
          onPress={() => handleDeleteRelacion(item.personaareacientificaid)}
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
        <Link href="/personaareacientifica/form" asChild>
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
      <Link href="/personaareacientifica/form" asChild>
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
