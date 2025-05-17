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

interface ApiInvestigacion {
  investigacionid: number;
  facultadid: number;
  anio: number;
  titulo: string;
  duracion: number;
  facultad?: string;
}

interface DisplayInvestigacion extends ApiInvestigacion {
  id: string;
  displayName: string;
}

export default function InvestigacionesListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newInvestigacion?: string;
    updatedInvestigacion?: string;
  }>();

  const [investigaciones, setInvestigaciones] = useState<
    DisplayInvestigacion[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestigaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/investigaciones");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiInvestigacion[] = await response.json();

        const mappedInvestigaciones: DisplayInvestigacion[] = data.map((i) => ({
          ...i,
          id: String(i.investigacionid),
          displayName: i.titulo,
        }));
        setInvestigaciones(mappedInvestigaciones);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar las investigaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestigaciones();
  }, []);

  useEffect(() => {
    if (params?.newInvestigacion) {
      try {
        const nuevaApiInvestigacion = JSON.parse(
          params.newInvestigacion
        ) as ApiInvestigacion;
        setInvestigaciones((prev) => [
          ...prev,
          {
            ...nuevaApiInvestigacion,
            id: String(nuevaApiInvestigacion.investigacionid || Date.now()),
            displayName: nuevaApiInvestigacion.titulo,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nueva investigacion:", e);
      }
    } else if (params?.updatedInvestigacion) {
      try {
        const investigacionActualizadaApi = JSON.parse(
          params.updatedInvestigacion
        ) as ApiInvestigacion;
        setInvestigaciones((prev) =>
          prev.map((i_display) =>
            i_display.investigacionid ===
            investigacionActualizadaApi.investigacionid
              ? {
                  ...i_display,
                  ...investigacionActualizadaApi,
                  displayName: investigacionActualizadaApi.titulo,
                }
              : i_display
          )
        );
      } catch (e) {
        console.error("Error procesando investigacion actualizada:", e);
      }
    }
  }, [params?.newInvestigacion, params?.updatedInvestigacion]);

  const handleDeleteInvestigacion = async (investigacionIdToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/investigaciones/${investigacionIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setInvestigaciones((prev) =>
        prev.filter(
          (investigacion) =>
            investigacion.investigacionid !== investigacionIdToDelete
        )
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar la investigación.");
    }
  };

  const renderItem = ({ item }: { item: DisplayInvestigacion }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        <Text style={styles.itemSubtitle}>
          Año: {item.anio} - Duración: {item.duracion} meses
        </Text>
        {item.facultad && (
          <Text style={styles.itemSubtitle}>Facultad: {item.facultad}</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/investigaciones/form",
            params: {
              investigacionId: item.investigacionid,
              investigacionData: JSON.stringify(item),
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
          onPress={() => handleDeleteInvestigacion(item.investigacionid)}
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
        <Text>Cargando investigaciones...</Text>
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

  if (investigaciones.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>
          No hay investigaciones registradas.
        </Text>
        <Link href="/investigaciones/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>
              Agregar Primera Investigación
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/investigaciones/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Investigación</Text>
        </Pressable>
      </Link>
      <FlatList
        data={investigaciones}
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
