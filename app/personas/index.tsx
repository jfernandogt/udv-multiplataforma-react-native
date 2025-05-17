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

// 1. Interfaz para los datos de la API
interface ApiPersona {
  personaid: number;
  nombres: string;
  apellidos: string;
  telefono?: string;
  celular?: string;
  correo: string;
  direccion?: string;
  municipioidnacimiento?: number;
  fechanacimiento?: string; // ISO date string
  cui?: string;
  pasaporte?: string;
  tiporol?: string;
  municipio?: string;
  departamento?: string;
}

interface DisplayPersona extends ApiPersona {
  id: string;
  displayName: string;
}

export default function PersonasListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newPersona?: string;
    updatedPersona?: string;
  }>();

  const [personas, setPersonas] = useState<DisplayPersona[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/personas");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiPersona[] = await response.json();

        const mappedPersonas: DisplayPersona[] = data.map((p) => ({
          ...p,
          id: String(p.personaid),
          displayName: `${p.nombres} ${p.apellidos}`,
        }));
        setPersonas(mappedPersonas);
      } catch (e: any) {
        console.error("Failed to fetch personas:", e);
        setError(e.message || "No se pudieron cargar las personas.");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  useEffect(() => {
    if (params?.newPersona) {
      try {
        const nuevaApiPersona = JSON.parse(params.newPersona) as ApiPersona;
        setPersonas((prev) => [
          ...prev,
          {
            ...nuevaApiPersona,
            id: String(nuevaApiPersona.personaid || Date.now()),
            displayName: `${nuevaApiPersona.nombres} ${nuevaApiPersona.apellidos}`,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nueva persona:", e);
      }
    } else if (params?.updatedPersona) {
      try {
        const personaActualizadaApi = JSON.parse(
          params.updatedPersona
        ) as ApiPersona;
        setPersonas((prev) =>
          prev.map((p_display) =>
            p_display.personaid === personaActualizadaApi.personaid
              ? {
                  ...p_display,
                  ...personaActualizadaApi,
                  displayName: `${personaActualizadaApi.nombres} ${personaActualizadaApi.apellidos}`,
                }
              : p_display
          )
        );
      } catch (e) {
        console.error("Error procesando persona actualizada:", e);
      }
    }
  }, [params?.newPersona, params?.updatedPersona]);

  const handleDeletePersona = async (personIdToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/personas/${personIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setPersonas((prev) =>
        prev.filter((persona) => persona.personaid !== personIdToDelete)
      );
    } catch (e) {
      console.error("Error eliminando persona:", e);
      Alert.alert("Error", "No se pudo eliminar la persona.");
    }
  };

  const renderItem = ({ item }: { item: DisplayPersona }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        <Text style={styles.itemSubtitle}>{item.correo}</Text>
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/personas/form",
            params: {
              personaId: item.personaid,
              personaData: JSON.stringify(item),
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
          onPress={() => {
            console.log("Delete Pressable CLICKED for ID:", item.personaid);
            handleDeletePersona(item.personaid);
          }}
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
        <Text>Cargando personas...</Text>
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

  if (personas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay personas registradas.</Text>
        <Link href="/personas/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>Agregar Primera Persona</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/personas/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Persona</Text>
        </Pressable>
      </Link>
      <FlatList
        data={personas}
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
