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

interface ApiMunicipio {
  municipioid: number;
  nombre: string;
  departamentoid: number;
  departamento?: string;
}

interface DisplayMunicipio extends ApiMunicipio {
  id: string;
  displayName: string;
}

export default function MunicipiosListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newMunicipio?: string;
    updatedMunicipio?: string;
  }>();

  const [municipios, setMunicipios] = useState<DisplayMunicipio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/municipio");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiMunicipio[] = await response.json();

        const mappedMunicipios: DisplayMunicipio[] = data.map((m) => ({
          ...m,
          id: String(m.municipioid),
          displayName: m.nombre,
        }));
        setMunicipios(mappedMunicipios);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar los municipios.");
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipios();
  }, []);

  useEffect(() => {
    if (params?.newMunicipio) {
      try {
        const nuevaApiMunicipio = JSON.parse(
          params.newMunicipio
        ) as ApiMunicipio;
        setMunicipios((prev) => [
          ...prev,
          {
            ...nuevaApiMunicipio,
            id: String(nuevaApiMunicipio.municipioid || Date.now()),
            displayName: nuevaApiMunicipio.nombre,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nuevo municipio:", e);
      }
    } else if (params?.updatedMunicipio) {
      try {
        const municipioActualizadoApi = JSON.parse(
          params.updatedMunicipio
        ) as ApiMunicipio;
        setMunicipios((prev) =>
          prev.map((m_display) =>
            m_display.municipioid === municipioActualizadoApi.municipioid
              ? {
                  ...m_display,
                  ...municipioActualizadoApi,
                  displayName: municipioActualizadoApi.nombre,
                }
              : m_display
          )
        );
      } catch (e) {
        console.error("Error procesando municipio actualizado:", e);
      }
    }
  }, [params?.newMunicipio, params?.updatedMunicipio]);

  const handleDeleteMunicipio = async (municipioIdToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/municipio/${municipioIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setMunicipios((prev) =>
        prev.filter((mun) => mun.municipioid !== municipioIdToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar el municipio.");
    }
  };

  const renderItem = ({ item }: { item: DisplayMunicipio }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        {item.departamento && (
          <Text style={styles.itemSubtitle}>
            Departamento: {item.departamento}
          </Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/municipio/form",
            params: {
              municipioId: item.municipioid,
              municipioData: JSON.stringify(item),
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
          onPress={() => handleDeleteMunicipio(item.municipioid)}
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
        <Text>Cargando municipios...</Text>
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

  if (municipios.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay municipios registrados.</Text>
        <Link href="/municipio/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>Agregar Primer Municipio</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/municipio/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Municipio</Text>
        </Pressable>
      </Link>
      <FlatList
        data={municipios}
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
