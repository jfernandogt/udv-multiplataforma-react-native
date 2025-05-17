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

interface ApiInvestigacionPersona {
  investigacionpersonaid: number;
  investigacionid: number;
  personaid: number;
  rol: string;
  titulo_investigacion?: string;
  nombres?: string;
  apellidos?: string;
}

interface DisplayInvestigacionPersona extends ApiInvestigacionPersona {
  id: string;
  displayName: string;
}

export default function InvestigacionPersonasListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newInvestigacionPersona?: string;
    updatedInvestigacionPersona?: string;
  }>();

  const [investigacionPersonas, setInvestigacionPersonas] = useState<
    DisplayInvestigacionPersona[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestigacionPersonas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "http://localhost:8000/investigacionpersona"
        );
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiInvestigacionPersona[] = await response.json();

        const mappedInvestigacionPersonas: DisplayInvestigacionPersona[] =
          data.map((ip) => ({
            ...ip,
            id: String(ip.investigacionpersonaid),
            displayName: `${ip.nombres || "N/A"} ${ip.apellidos || "N/A"} - ${
              ip.titulo_investigacion || "N/A"
            }`,
          }));
        setInvestigacionPersonas(mappedInvestigacionPersonas);
      } catch (e: any) {
        setError(
          e.message ||
            "No se pudieron cargar las relaciones investigación-persona."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvestigacionPersonas();
  }, []);

  useEffect(() => {
    if (params?.newInvestigacionPersona) {
      try {
        const nuevaApiInvestigacionPersona = JSON.parse(
          params.newInvestigacionPersona
        ) as ApiInvestigacionPersona;
        // For new items, the API might not return all details like nombres, apellidos, titulo_investigacion
        // We might need a fresh fetch or make assumptions for the displayName
        setInvestigacionPersonas((prev) => [
          ...prev,
          {
            ...nuevaApiInvestigacionPersona,
            id: String(
              nuevaApiInvestigacionPersona.investigacionpersonaid || Date.now()
            ),
            displayName: `ID Persona: ${nuevaApiInvestigacionPersona.personaid} - ID Inv: ${nuevaApiInvestigacionPersona.investigacionid} (${nuevaApiInvestigacionPersona.rol})`,
          },
        ]);
      } catch (e) {
        console.error(
          "Error procesando nueva relación investigación-persona:",
          e
        );
      }
    } else if (params?.updatedInvestigacionPersona) {
      try {
        const relacionActualizadaApi = JSON.parse(
          params.updatedInvestigacionPersona
        ) as ApiInvestigacionPersona;
        setInvestigacionPersonas((prev) =>
          prev.map((ip_display) =>
            ip_display.investigacionpersonaid ===
            relacionActualizadaApi.investigacionpersonaid
              ? {
                  // Assume the updated object might not have all joined fields, refetch or update carefully
                  ...ip_display, // Keep existing joined fields if not present in update response
                  ...relacionActualizadaApi,
                  displayName: `${
                    relacionActualizadaApi.nombres ||
                    ip_display.nombres ||
                    "N/A"
                  } ${
                    relacionActualizadaApi.apellidos ||
                    ip_display.apellidos ||
                    "N/A"
                  } - ${
                    relacionActualizadaApi.titulo_investigacion ||
                    ip_display.titulo_investigacion ||
                    "N/A"
                  } (${relacionActualizadaApi.rol})`,
                }
              : ip_display
          )
        );
      } catch (e) {
        console.error(
          "Error procesando relación investigación-persona actualizada:",
          e
        );
      }
    }
  }, [params?.newInvestigacionPersona, params?.updatedInvestigacionPersona]);

  const handleDeleteInvestigacionPersona = async (idToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/investigacionpersona/${idToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setInvestigacionPersonas((prev) =>
        prev.filter((ip) => ip.investigacionpersonaid !== idToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar la relación.");
    }
  };

  const renderItem = ({ item }: { item: DisplayInvestigacionPersona }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        <Text style={styles.itemSubtitle}>Rol: {item.rol}</Text>
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/investigacionpersona/form",
            params: {
              investigacionPersonaId: item.investigacionpersonaid,
              investigacionPersonaData: JSON.stringify(item),
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
          onPress={() =>
            handleDeleteInvestigacionPersona(item.investigacionpersonaid)
          }
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

  if (investigacionPersonas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay relaciones registradas.</Text>
        <Link href="/investigacionpersona/form" asChild>
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
      <Link href="/investigacionpersona/form" asChild>
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
        data={investigacionPersonas}
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
