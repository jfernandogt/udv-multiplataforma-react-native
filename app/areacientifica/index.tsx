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

interface ApiAreaCientifica {
  areacientificaid: number;
  nombre: string;
  descripcion?: string;
}

interface DisplayAreaCientifica extends ApiAreaCientifica {
  id: string;
  displayName: string;
}

export default function AreasCientificasListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newAreaCientifica?: string;
    updatedAreaCientifica?: string;
  }>();

  const [areasCientificas, setAreasCientificas] = useState<
    DisplayAreaCientifica[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreasCientificas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/areacientifica");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiAreaCientifica[] = await response.json();

        const mappedAreasCientificas: DisplayAreaCientifica[] = data.map(
          (a) => ({
            ...a,
            id: String(a.areacientificaid),
            displayName: a.nombre,
          })
        );
        setAreasCientificas(mappedAreasCientificas);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar las áreas científicas.");
      } finally {
        setLoading(false);
      }
    };

    fetchAreasCientificas();
  }, []);

  useEffect(() => {
    if (params?.newAreaCientifica) {
      try {
        const nuevaApiAreaCientifica = JSON.parse(
          params.newAreaCientifica
        ) as ApiAreaCientifica;
        setAreasCientificas((prev) => [
          ...prev,
          {
            ...nuevaApiAreaCientifica,
            id: String(nuevaApiAreaCientifica.areacientificaid || Date.now()),
            displayName: nuevaApiAreaCientifica.nombre,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nueva área científica:", e);
      }
    } else if (params?.updatedAreaCientifica) {
      try {
        const areaCientificaActualizadaApi = JSON.parse(
          params.updatedAreaCientifica
        ) as ApiAreaCientifica;
        setAreasCientificas((prev) =>
          prev.map((a_display) =>
            a_display.areacientificaid ===
            areaCientificaActualizadaApi.areacientificaid
              ? {
                  ...a_display,
                  ...areaCientificaActualizadaApi,
                  displayName: areaCientificaActualizadaApi.nombre,
                }
              : a_display
          )
        );
      } catch (e) {
        console.error("Error procesando área científica actualizada:", e);
      }
    }
  }, [params?.newAreaCientifica, params?.updatedAreaCientifica]);

  const handleDeleteAreaCientifica = async (
    areaCientificaIdToDelete: number
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8000/areacientifica/${areaCientificaIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setAreasCientificas((prev) =>
        prev.filter(
          (area) => area.areacientificaid !== areaCientificaIdToDelete
        )
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar el área científica.");
    }
  };

  const renderItem = ({ item }: { item: DisplayAreaCientifica }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        {item.descripcion && (
          <Text style={styles.itemSubtitle}>{item.descripcion}</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/areacientifica/form",
            params: {
              areaCientificaId: item.areacientificaid,
              areaCientificaData: JSON.stringify(item),
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
          onPress={() => handleDeleteAreaCientifica(item.areacientificaid)}
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
        <Text>Cargando áreas científicas...</Text>
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

  if (areasCientificas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>
          No hay áreas científicas registradas.
        </Text>
        <Link href="/areacientifica/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>
              Agregar Primera Área Científica
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/areacientifica/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Área Científica</Text>
        </Pressable>
      </Link>
      <FlatList
        data={areasCientificas}
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
